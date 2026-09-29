import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD, APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';

import configuration from './config/configuration';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { TenantGuard } from './common/guards/tenant.guard';
import { AuditInterceptor } from './common/interceptors/audit.interceptor';
import { GlobalExceptionFilter } from './common/filters/http-exception.filter';

import * as Entities from './entities';

import { AuthModule } from './auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { TenantsModule } from './modules/tenants/tenants.module';
import { SitesModule } from './modules/sites/sites.module';
import { PopsModule } from './modules/pops/pops.module';
import { AggregatorsModule } from './modules/aggregators/aggregators.module';
import { GatewaysModule } from './modules/gateways/gateways.module';
import { WanLinksModule } from './modules/wan-links/wan-links.module';
import { TunnelsModule } from './modules/tunnels/tunnels.module';
import { RoutingModule } from './modules/routing/routing.module';
import { FirewallModule } from './modules/firewall/firewall.module';
import { NatModule } from './modules/nat/nat.module';
import { PoliciesModule } from './modules/policies/policies.module';
import { AlertsModule } from './modules/alerts/alerts.module';
import { IncidentsModule } from './modules/incidents/incidents.module';
import { AutomationModule } from './modules/automation/automation.module';
import { ReportsModule } from './modules/reports/reports.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { IpamModule } from './modules/ipam/ipam.module';
import { SlaModule } from './modules/sla/sla.module';
import { ConfigurationModule } from './modules/configuration/configuration.module';
import { TelemetryModule } from './modules/telemetry/telemetry.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { AuditModule } from './modules/audit/audit.module';
import { DiagnosticsModule } from './modules/diagnostics/diagnostics.module';
import { SystemHealthModule } from './modules/system-health/system-health.module';
import { WebsocketModule } from './websocket/websocket.module';
import { ProvidersModule } from './providers/providers.module';
import { ProvisioningModule } from './modules/provisioning/provisioning.module';
import { AiModule } from './modules/ai/ai.module';
import { NetworkDiscoveryModule } from './modules/network-discovery/network-discovery.module';
import { SnmpModule } from './modules/snmp/snmp.module';
import { SyslogModule } from './modules/syslog/syslog.module';
import { NetflowModule } from './modules/netflow/netflow.module';
import { DeviceAutomationModule } from './modules/device-automation/device-automation.module';
import { ComplianceBridgeModule } from './modules/compliance-bridge/compliance-bridge.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (cfg: ConfigService) => {
        const dbType = (cfg.get<string>('database.type') || 'mysql') as any;
        const dbUrl = cfg.get<string>('database.url');
        const dbSsl = cfg.get<any>('database.ssl');

        const baseOpts: any = {
          type: dbType,
          entities: Object.values(Entities),
          synchronize: true,
          logging: false,
        };

        if (dbType === 'postgres' && dbSsl) {
          baseOpts.ssl = dbSsl;
          baseOpts.extra = { ssl: dbSsl };
        }

        if (dbUrl) {
          baseOpts.url = dbUrl;
        } else {
          baseOpts.host = cfg.get<string>('database.host');
          baseOpts.port = cfg.get<number>('database.port');
          baseOpts.username = cfg.get<string>('database.user');
          baseOpts.password = cfg.get<string>('database.password');
          baseOpts.database = cfg.get<string>('database.name');
        }

        return baseOpts;
      },
      dataSourceFactory: async (options) => {
        if (process.env.DATABASE_TYPE === 'memory') {
          const { getOrCreateMemoryDataSource } = await import('./database/in-memory-db');
          const { runSeed } = await import('./seed/run-seed');
          const ds = await getOrCreateMemoryDataSource();
          await runSeed(ds);
          return ds;
        }
        const { DataSource } = await import('typeorm');
        const ds = new DataSource(options!);
        await ds.initialize();
        if (process.env.AUTO_SEED === 'true' || process.env.RUN_SEED === 'true') {
          try {
            const { runSeed } = await import('./seed/run-seed');
            await runSeed(ds);
          } catch (seedErr) {
            console.warn('Auto-seed check/execution:', seedErr);
          }
        }
        return ds;
      },
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([Entities.AuditLogEntity]),
    WebsocketModule,
    AuthModule,
    UsersModule,
    OrganizationsModule,
    TenantsModule,
    SitesModule,
    PopsModule,
    AggregatorsModule,
    GatewaysModule,
    WanLinksModule,
    TunnelsModule,
    RoutingModule,
    FirewallModule,
    NatModule,
    PoliciesModule,
    AlertsModule,
    IncidentsModule,
    AutomationModule,
    ReportsModule,
    NotificationsModule,
    IpamModule,
    SlaModule,
    ConfigurationModule,
    TelemetryModule,
    DashboardModule,
    AuditModule,
    DiagnosticsModule,
    SystemHealthModule,
    ProvidersModule,
    ProvisioningModule,
    AiModule,
    NetworkDiscoveryModule,
    SnmpModule,
    SyslogModule,
    NetflowModule,
    DeviceAutomationModule,
    ComplianceBridgeModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_GUARD, useClass: TenantGuard },
    { provide: APP_INTERCEPTOR, useClass: AuditInterceptor },
    { provide: APP_FILTER, useClass: GlobalExceptionFilter },
  ],
})
export class AppModule {}
