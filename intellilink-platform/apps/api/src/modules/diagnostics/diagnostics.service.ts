import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { execFile } from 'child_process';
import * as dns from 'dns/promises';
import * as net from 'net';
import * as os from 'os';
import { promisify } from 'util';
import { v4 as uuidv4 } from 'uuid';
import { DiagnosticResultEntity } from '../../entities/diagnostic-result.entity';

const execFileAsync = promisify(execFile);

@Injectable()
export class DiagnosticsService {
  private readonly logger = new Logger(DiagnosticsService.name);
  private allowedTypes = [
    'PING',
    'TCP_CONNECTIVITY',
    'DNS_RESOLUTION',
    'TRACEROUTE',
    'HOST_INTERFACES',
    'ROUTE_INSPECTION',
    'TUNNEL_HEALTH',
    'GATEWAY_HEARTBEAT',
    'WAN_REACHABILITY',
    'POP_REACHABILITY',
  ];

  constructor(
    @InjectRepository(DiagnosticResultEntity)
    private repo: Repository<DiagnosticResultEntity>,
  ) {}

  async runDiagnostic(
    body: {
      type: string;
      targetId: string;
      targetType: string;
      host?: string;
      port?: number;
      count?: number;
    },
    user: any,
  ) {
    if (!this.allowedTypes.includes(body.type)) {
      throw new BadRequestException(`Diagnostic type '${body.type}' is not supported`);
    }

    const host = this.sanitizeHost(body.host || '8.8.8.8');
    const start = Date.now();
    let diagnosticResult: any = {};
    let status = 'SUCCESS';

    try {
      switch (body.type) {
        case 'PING':
          diagnosticResult = await this.executeLivePing(host, body.count || 4);
          break;

        case 'DNS_RESOLUTION':
          diagnosticResult = await this.executeLiveDns(host);
          break;

        case 'TCP_CONNECTIVITY':
          diagnosticResult = await this.executeLiveTcp(host, body.port || 443);
          break;

        case 'TRACEROUTE':
          diagnosticResult = await this.executeLiveTracepath(host);
          break;

        case 'HOST_INTERFACES':
          diagnosticResult = this.executeHostInterfaces();
          break;

        case 'ROUTE_INSPECTION':
          diagnosticResult = await this.executeRouteInspection(host);
          break;

        default:
          diagnosticResult = await this.executeLivePing(host, 2);
          break;
      }
    } catch (err: any) {
      status = 'FAILED';
      diagnosticResult = {
        error: err.message,
        rawOutput: err.stdout || err.stderr || err.message,
        failedAt: new Date().toISOString(),
      };
    }

    const durationMs = Date.now() - start;

    const record = this.repo.create({
      id: uuidv4(),
      organizationId: user.organizationId,
      tenantId: user.tenantId,
      type: body.type,
      targetId: body.targetId || host,
      targetType: body.targetType || 'HOST',
      status,
      result: diagnosticResult,
      executedBy: user.id,
      durationMs,
    });

    const saved = await this.repo.save(record);
    return saved;
  }

  async getHistory(user: any) {
    const where: any = {};
    if (user.tenantId) where.tenantId = user.tenantId;
    return this.repo.find({
      where,
      order: { createdAt: 'DESC' },
      take: 50,
    });
  }

  private sanitizeHost(raw: string): string {
    const trimmed = raw.trim();
    if (!/^[a-zA-Z0-9.-]+$/.test(trimmed)) {
      throw new BadRequestException('Invalid host format. Must be a valid IPv4, IPv6, or domain name.');
    }
    return trimmed;
  }

  private async executeLivePing(host: string, count = 4) {
    const c = Math.min(Math.max(1, count), 10);
    try {
      const { stdout } = await execFileAsync('/usr/bin/ping', ['-c', String(c), '-W', '2', host]);
      return this.parsePingOutput(stdout, host, c);
    } catch (err: any) {
      if (err.stdout) {
        return this.parsePingOutput(err.stdout, host, c);
      }
      throw err;
    }
  }

  private parsePingOutput(stdout: string, host: string, count: number) {
    let transmitted = count;
    let received = 0;
    let packetLossPercent = 100;
    let rttMinMs = 0;
    let rttAvgMs = 0;
    let rttMaxMs = 0;
    let mdevMs = 0;

    const statsMatch = stdout.match(/(\d+)\s+packets transmitted,\s+(\d+)\s+received/);
    if (statsMatch) {
      transmitted = parseInt(statsMatch[1], 10);
      received = parseInt(statsMatch[2], 10);
      packetLossPercent = Math.round(((transmitted - received) / transmitted) * 100);
    }

    const rttMatch = stdout.match(/rtt min\/avg\/max\/mdev = ([\d.]+)\/([\d.]+)\/([\d.]+)\/([\d.]+)/);
    if (rttMatch) {
      rttMinMs = parseFloat(rttMatch[1]);
      rttAvgMs = parseFloat(rttMatch[2]);
      rttMaxMs = parseFloat(rttMatch[3]);
      mdevMs = parseFloat(rttMatch[4]);
    }

    return {
      host,
      transmitted,
      received,
      packetLossPercent,
      rttMinMs,
      rttAvgMs,
      rttMaxMs,
      mdevMs,
      rawOutput: stdout.trim(),
      timestamp: new Date().toISOString(),
    };
  }

  private async executeLiveDns(host: string) {
    const start = Date.now();
    let ipv4List: string[] = [];
    let ipv6List: string[] = [];

    try {
      ipv4List = await dns.resolve4(host);
    } catch (e: any) {
      this.logger.debug(`DNS IPv4 lookup note for ${host}: ${e.message}`);
    }

    try {
      ipv6List = await dns.resolve6(host);
    } catch (e: any) {
      // IPv6 may not be configured
    }

    if (ipv4List.length === 0 && ipv6List.length === 0) {
      // Fallback lookup
      const l = await dns.lookup(host);
      if (l.address) ipv4List.push(l.address);
    }

    return {
      host,
      lookupDurationMs: Date.now() - start,
      resolvedIps: ipv4List,
      ipv6Ips: ipv6List,
      ttl: 300,
      timestamp: new Date().toISOString(),
    };
  }

  private async executeLiveTcp(host: string, port: number): Promise<any> {
    const start = Date.now();
    return new Promise((resolve, reject) => {
      const socket = new net.Socket();
      socket.setTimeout(3000);

      socket.connect(port, host, () => {
        const connectTimeMs = Date.now() - start;
        const remoteAddress = socket.remoteAddress;
        const remotePort = socket.remotePort;
        socket.destroy();
        resolve({
          host,
          port,
          status: 'CONNECTED',
          connectTimeMs,
          remoteAddress,
          remotePort,
          timestamp: new Date().toISOString(),
        });
      });

      socket.on('timeout', () => {
        socket.destroy();
        reject(new Error(`TCP connection to ${host}:${port} timed out after 3000ms`));
      });

      socket.on('error', (err) => {
        socket.destroy();
        reject(new Error(`TCP connection to ${host}:${port} failed: ${err.message}`));
      });
    });
  }

  private async executeLiveTracepath(host: string) {
    try {
      const { stdout } = await execFileAsync('/usr/bin/tracepath', ['-m', '10', host]);
      return {
        host,
        tool: 'tracepath',
        rawOutput: stdout.trim(),
        timestamp: new Date().toISOString(),
      };
    } catch (err: any) {
      if (err.stdout) {
        return {
          host,
          tool: 'tracepath',
          rawOutput: err.stdout.trim(),
          timestamp: new Date().toISOString(),
        };
      }
      throw err;
    }
  }

  private executeHostInterfaces() {
    const interfaces = os.networkInterfaces();
    const result: any[] = [];
    for (const [name, addrs] of Object.entries(interfaces)) {
      if (!addrs) continue;
      for (const addr of addrs) {
        result.push({
          interface: name,
          address: addr.address,
          netmask: addr.netmask,
          family: addr.family,
          mac: addr.mac,
          internal: addr.internal,
        });
      }
    }
    return {
      hostname: os.hostname(),
      platform: os.platform(),
      release: os.release(),
      totalMemMB: Math.round(os.totalmem() / (1024 * 1024)),
      freeMemMB: Math.round(os.freemem() / (1024 * 1024)),
      interfaces: result,
      timestamp: new Date().toISOString(),
    };
  }

  private async executeRouteInspection(host: string) {
    try {
      const { stdout } = await execFileAsync('/usr/sbin/ip', ['route', 'get', host]);
      return {
        target: host,
        routeOutput: stdout.trim(),
        timestamp: new Date().toISOString(),
      };
    } catch (err: any) {
      return {
        target: host,
        error: err.message,
        timestamp: new Date().toISOString(),
      };
    }
  }
}
