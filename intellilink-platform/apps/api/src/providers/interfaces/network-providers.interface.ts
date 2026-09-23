export interface IGatewayProvider {
  getStatus(gatewayId: string): Promise<any>;
  restart(gatewayId: string): Promise<void>;
  applyConfiguration(gatewayId: string, config: Record<string, any>): Promise<void>;
}

export interface ITunnelProvider {
  getStatus(tunnelId: string): Promise<any>;
  resetHandshake(tunnelId: string): Promise<void>;
}

export interface IPopProvider {
  getHealth(popId: string): Promise<any>;
}

export interface IAggregatorProvider {
  getHealth(aggId: string): Promise<any>;
}

export interface IRoutingProvider {
  getRoutes(filter?: any): Promise<any[]>;
  applyRoute(route: any): Promise<void>;
}

export interface IFirewallProvider {
  applyRules(siteId: string, rules: any[]): Promise<void>;
}

export interface IDiagnosticsProvider {
  ping(target: string): Promise<any>;
  dnsResolve(host: string): Promise<any>;
}
