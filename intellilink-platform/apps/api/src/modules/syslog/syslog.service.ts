import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere } from 'typeorm';
import { SyslogEntity } from '../../entities/syslog.entity';
import { AppEventsGateway } from '../../websocket/events.gateway';
import * as dgram from 'dgram';

const FACILITY_MAP: Record<number, string> = {
  0: 'KERN', 1: 'USER', 2: 'MAIL', 3: 'DAEMON', 4: 'AUTH', 5: 'SYSLOG',
  16: 'LOCAL0', 17: 'LOCAL1', 18: 'LOCAL2', 19: 'LOCAL3', 20: 'LOCAL4', 21: 'LOCAL5', 22: 'LOCAL6', 23: 'LOCAL7'
};

const SEVERITY_MAP: Record<number, string> = {
  0: 'EMERGENCY', 1: 'ALERT', 2: 'CRITICAL', 3: 'ERROR',
  4: 'WARNING', 5: 'NOTICE', 6: 'INFORMATIONAL', 7: 'DEBUG'
};

@Injectable()
export class SyslogService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(SyslogService.name);
  private udpServer: dgram.Socket | null = null;
  private readonly port = parseInt(process.env.SYSLOG_UDP_PORT || '5140', 10);

  constructor(
    @InjectRepository(SyslogEntity)
    private readonly syslogRepo: Repository<SyslogEntity>,
    private readonly eventsGateway: AppEventsGateway,
  ) {}

  async onModuleInit() {
    this.startSyslogServer();
    await this.seedDemoLogsIfEmpty();
  }

  onModuleDestroy() {
    if (this.udpServer) {
      try {
        this.udpServer.close();
      } catch {}
    }
  }

  private startSyslogServer() {
    try {
      this.udpServer = dgram.createSocket('udp4');

      this.udpServer.on('error', (err) => {
        this.logger.warn(`Syslog UDP socket warning: ${err.message}`);
      });

      this.udpServer.on('message', async (msg, rinfo) => {
        const raw = msg.toString('utf-8');
        await this.parseAndIngestLog(raw, rinfo.address);
      });

      this.udpServer.bind(this.port, () => {
        this.logger.log(`RFC-5424/3164 Syslog Ingestion Daemon listening on UDP 0.0.0.0:${this.port}`);
      });
    } catch (e: any) {
      this.logger.warn(`Could not bind Syslog UDP socket: ${e.message}`);
    }
  }

  public async parseAndIngestLog(raw: string, sourceIp: string): Promise<SyslogEntity> {
    let facility = 'LOCAL0';
    let severity = 'INFORMATIONAL';
    let severityCode = 6;
    let message = raw.trim();
    let hostname = sourceIp;
    let tag = 'SYSTEM';

    // Parse RFC 3164 / 5424 <PRI> header: <189>...
    const priMatch = raw.match(/^<(\d{1,3})>(.*)$/s);
    if (priMatch) {
      const pri = parseInt(priMatch[1], 10);
      const facCode = Math.floor(pri / 8);
      severityCode = pri % 8;
      facility = FACILITY_MAP[facCode] || `FAC_${facCode}`;
      severity = SEVERITY_MAP[severityCode] || 'INFORMATIONAL';
      message = priMatch[2].trim();
    }

    // Try extracting Cisco/Standard Tag format: %LINK-3-UPDOWN: ...
    const ciscoMatch = message.match(/%([A-Z0-9_-]+)-(\d)-([A-Z0-9_-]+):\s*(.*)$/);
    if (ciscoMatch) {
      tag = `${ciscoMatch[1]}-${ciscoMatch[3]}`;
      severityCode = parseInt(ciscoMatch[2], 10);
      severity = SEVERITY_MAP[severityCode] || severity;
    } else {
      // Try space delimited tokens: TIMESTAMP HOSTNAME TAG: MSG
      const spaceParts = message.split(' ');
      if (spaceParts.length >= 3 && spaceParts[1].includes('.')) {
        hostname = spaceParts[1];
        if (spaceParts[2].endsWith(':')) {
          tag = spaceParts[2].replace(':', '');
        }
      }
    }

    const entity = this.syslogRepo.create({
      facility,
      severity,
      severityCode,
      hostname,
      tag,
      message,
      raw,
      sourceIp,
    });

    const saved = await this.syslogRepo.save(entity);
    this.eventsGateway.broadcast('syslog:event', saved);
    return saved;
  }

  async getLogs(params: {
    page?: number;
    pageSize?: number;
    severity?: string;
    hostname?: string;
    search?: string;
  }) {
    const page = params.page || 1;
    const pageSize = params.pageSize || 25;
    const where: FindOptionsWhere<SyslogEntity> = {};

    if (params.severity && params.severity !== 'ALL') {
      where.severity = params.severity;
    }
    if (params.hostname) {
      where.hostname = Like(`%${params.hostname}%`);
    }
    if (params.search) {
      where.message = Like(`%${params.search}%`);
    }

    const [data, total] = await this.syslogRepo.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return {
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async getStats() {
    const total = await this.syslogRepo.count();
    const emergency = await this.syslogRepo.count({ where: { severityCode: 0 } });
    const alert = await this.syslogRepo.count({ where: { severityCode: 1 } });
    const critical = await this.syslogRepo.count({ where: { severityCode: 2 } });
    const error = await this.syslogRepo.count({ where: { severityCode: 3 } });
    const warning = await this.syslogRepo.count({ where: { severityCode: 4 } });
    const info = total - (emergency + alert + critical + error + warning);

    return {
      total,
      breakdown: { emergency, alert, critical, error, warning, info },
      listeningPort: this.port,
      protocol: 'RFC-5424 / RFC-3164 UDP',
    };
  }

  private async seedDemoLogsIfEmpty() {
    try {
      const count = await this.syslogRepo.count();
      if (count > 0) return;

      const samples = [
        {
          raw: '<187>Sep 25 18:30:12 cisco-isr-mumbai %BGP-5-ADJCHANGE: neighbor 10.244.0.1 Up',
          sourceIp: '192.168.0.50',
        },
        {
          raw: '<189>Sep 25 18:31:04 starlink-dish-01 %SATELLITE-4-HANDOVER: Beam transitioned to SVN-714, latency +12ms',
          sourceIp: '192.168.100.1',
        },
        {
          raw: '<190>Sep 25 18:31:45 mikrotik-ccr %INTERFACE-3-STATE: sfp-sfpplus2 (5G Backup) state changed to connected',
          sourceIp: '192.168.0.1',
        },
        {
          raw: '<188>Sep 25 18:32:10 wireguard-pop-delhi %TUNNEL-6-HANDSHAKE: Peer [z9q4..] authenticated, dynamic MTU 1420 clamped',
          sourceIp: '10.244.0.2',
        },
        {
          raw: '<186>Sep 25 18:32:55 core-firewall-01 %SECURITY-2-DROP: SYN flood mitigated on interface eno1 from 203.0.113.88',
          sourceIp: '192.168.0.254',
        },
      ];

      for (const s of samples) {
        await this.parseAndIngestLog(s.raw, s.sourceIp);
      }
      this.logger.log('Seeded initial enterprise syslog messages.');
    } catch {}
  }
}
