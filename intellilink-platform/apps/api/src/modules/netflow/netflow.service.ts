import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NetflowRecordEntity } from '../../entities/netflow-record.entity';
import { AppEventsGateway } from '../../websocket/events.gateway';
import * as dgram from 'dgram';

@Injectable()
export class NetflowService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(NetflowService.name);
  private udpServer: dgram.Socket | null = null;
  private readonly port = parseInt(process.env.NETFLOW_PORT || '2055', 10);

  constructor(
    @InjectRepository(NetflowRecordEntity)
    private readonly flowRepo: Repository<NetflowRecordEntity>,
    private readonly eventsGateway: AppEventsGateway,
  ) {}

  async onModuleInit() {
    this.startFlowCollector();
    await this.seedDemoFlowsIfEmpty();
  }

  onModuleDestroy() {
    if (this.udpServer) {
      try {
        this.udpServer.close();
      } catch {}
    }
  }

  private startFlowCollector() {
    try {
      this.udpServer = dgram.createSocket('udp4');

      this.udpServer.on('error', (err) => {
        this.logger.warn(`NetFlow collector warning: ${err.message}`);
      });

      this.udpServer.on('message', async (msg, rinfo) => {
        await this.parseNetFlowPacket(msg, rinfo.address);
      });

      this.udpServer.bind(this.port, () => {
        this.logger.log(`NetFlow v5/v9 & IPFIX Flow Collector listening on UDP 0.0.0.0:${this.port}`);
      });
    } catch (e: any) {
      this.logger.warn(`Could not bind NetFlow collector socket: ${e.message}`);
    }
  }

  private async parseNetFlowPacket(buf: Buffer, sourceIp: string) {
    try {
      if (buf.length < 24) return;
      const version = buf.readUInt16BE(0);

      if (version === 5) {
        const count = buf.readUInt16BE(2);
        let offset = 24;
        for (let i = 0; i < Math.min(count, 30); i++) {
          if (offset + 48 > buf.length) break;
          const srcIp = `${buf.readUInt8(offset)}.${buf.readUInt8(offset + 1)}.${buf.readUInt8(offset + 2)}.${buf.readUInt8(offset + 3)}`;
          const dstIp = `${buf.readUInt8(offset + 4)}.${buf.readUInt8(offset + 5)}.${buf.readUInt8(offset + 6)}.${buf.readUInt8(offset + 7)}`;
          const packets = buf.readUInt32BE(offset + 16);
          const bytes = buf.readUInt32BE(offset + 20);
          const srcPort = buf.readUInt16BE(offset + 32);
          const dstPort = buf.readUInt16BE(offset + 34);
          const protoNum = buf.readUInt8(offset + 38);
          const protocol = protoNum === 6 ? 'TCP' : protoNum === 17 ? 'UDP' : 'OTHER';

          const app = this.resolveApplication(srcPort, dstPort, protocol);
          await this.saveFlow({ srcIp, dstIp, srcPort, dstPort, protocol, bytes, packets, application: app, deviceIp: sourceIp });
          offset += 48;
        }
      }
    } catch (e: any) {
      this.logger.warn(`Failed to parse NetFlow packet: ${e.message}`);
    }
  }

  private resolveApplication(srcPort: number, dstPort: number, proto: string): string {
    const port = dstPort || srcPort;
    if (port === 51820) return 'WireGuard-Mesh';
    if (port === 443 || port === 8443) return 'HTTPS';
    if (port === 80 || port === 8080) return 'HTTP';
    if (port === 53) return 'DNS';
    if (port === 5060 || port === 5061) return 'VoIP-SIP';
    if (port === 22) return 'SSH';
    if (port === 179) return 'BGP-Routing';
    if (port === 9200 || port === 9201) return 'Starlink-Telemetry';
    return `${proto}/${port}`;
  }

  public async saveFlow(dto: Partial<NetflowRecordEntity>) {
    const entity = this.flowRepo.create(dto);
    const saved = await this.flowRepo.save(entity);
    this.eventsGateway.broadcast('netflow:record', saved);
    return saved;
  }

  async getRecentFlows(limit = 50) {
    return this.flowRepo.find({
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async getTopTalkers() {
    // Group by srcIp
    const topSources = await this.flowRepo
      .createQueryBuilder('f')
      .select('f.srcIp', 'ip')
      .addSelect('SUM(f.bytes)', 'totalBytes')
      .addSelect('SUM(f.packets)', 'totalPackets')
      .groupBy('f.srcIp')
      .orderBy('totalBytes', 'DESC')
      .limit(10)
      .getRawMany();

    // Group by application
    const topApps = await this.flowRepo
      .createQueryBuilder('f')
      .select('f.application', 'application')
      .addSelect('SUM(f.bytes)', 'totalBytes')
      .addSelect('COUNT(*)', 'flowCount')
      .groupBy('f.application')
      .orderBy('totalBytes', 'DESC')
      .limit(8)
      .getRawMany();

    // Total bandwidth
    const totalResult = await this.flowRepo
      .createQueryBuilder('f')
      .select('SUM(f.bytes)', 'totalBytes')
      .addSelect('COUNT(*)', 'totalFlows')
      .getRawMany();

    return {
      topSources: topSources.map((s) => ({ ip: s.ip, totalBytes: Number(s.totalBytes || 0), totalPackets: Number(s.totalPackets || 0) })),
      topApplications: topApps.map((a) => ({ application: a.application, totalBytes: Number(a.totalBytes || 0), flowCount: Number(a.flowCount || 0) })),
      summary: {
        totalBytes: Number(totalResult[0]?.totalBytes || 0),
        totalFlows: Number(totalResult[0]?.totalFlows || 0),
      },
    };
  }

  private async seedDemoFlowsIfEmpty() {
    try {
      const count = await this.flowRepo.count();
      if (count > 0) return;

      const samples = [
        { srcIp: '192.168.0.12', dstIp: '10.244.0.1', srcPort: 54120, dstPort: 51820, protocol: 'UDP', bytes: 48920150, packets: 34120, application: 'WireGuard-Mesh', deviceIp: '192.168.0.1' },
        { srcIp: '192.168.0.50', dstIp: '142.250.190.46', srcPort: 49201, dstPort: 443, protocol: 'TCP', bytes: 32104500, packets: 21900, application: 'HTTPS', deviceIp: '192.168.0.50' },
        { srcIp: '192.168.100.1', dstIp: '192.168.0.1', srcPort: 9200, dstPort: 41200, protocol: 'TCP', bytes: 14820100, packets: 18400, application: 'Starlink-Telemetry', deviceIp: '192.168.100.1' },
        { srcIp: '10.244.10.5', dstIp: '10.244.0.2', srcPort: 5060, dstPort: 5060, protocol: 'UDP', bytes: 8450100, packets: 12400, application: 'VoIP-SIP', deviceIp: '192.168.0.1' },
        { srcIp: '192.168.0.100', dstIp: '8.8.8.8', srcPort: 60124, dstPort: 53, protocol: 'UDP', bytes: 1420100, packets: 3200, application: 'DNS', deviceIp: '192.168.0.1' },
        { srcIp: '192.168.0.50', dstIp: '10.244.0.1', srcPort: 179, dstPort: 179, protocol: 'TCP', bytes: 980100, packets: 1500, application: 'BGP-Routing', deviceIp: '192.168.0.50' },
      ];

      for (const s of samples) {
        await this.flowRepo.save(this.flowRepo.create(s));
      }
      this.logger.log('Seeded representative NetFlow records.');
    } catch {}
  }
}
