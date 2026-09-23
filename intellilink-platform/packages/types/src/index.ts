// ============================================
// Intellilink NOG Platform — Shared Types
// ============================================

// --- Base ---
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

// --- Auth ---
export enum UserRole {
  PROVIDER = 'PROVIDER',
  PROVIDER_ADMIN = 'PROVIDER_ADMIN',
  NOC_OPERATOR = 'NOC_OPERATOR',
  TENANT_ADMIN = 'TENANT_ADMIN',
  TENANT_OPERATOR = 'TENANT_OPERATOR',
  AUDITOR = 'AUDITOR',
  READ_ONLY = 'READ_ONLY',
}

export interface User extends BaseEntity {
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  organizationId: string;
  tenantId?: string | null;
  isActive: boolean;
  lastLoginAt?: string | null;
  failedLoginAttempts: number;
  lockedUntil?: string | null;
  mfaEnabled: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: Omit<User, 'deletedAt'>;
}

export interface TokenPayload {
  sub: string;
  email: string;
  role: UserRole;
  organizationId: string;
  tenantId?: string | null;
  iat: number;
  exp: number;
}

// --- Organization ---
export interface Organization extends BaseEntity {
  name: string;
  slug: string;
  type: 'PROVIDER' | 'TENANT';
  isActive: boolean;
}

// --- Tenant ---
export enum TenantStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  PROVISIONING = 'PROVISIONING',
  ARCHIVED = 'ARCHIVED',
}

export enum TenantType {
  ENTERPRISE = 'ENTERPRISE',
  GOVERNMENT = 'GOVERNMENT',
  BANKING = 'BANKING',
  EDUCATION = 'EDUCATION',
  HEALTHCARE = 'HEALTHCARE',
  OTHER = 'OTHER',
}

export interface Tenant extends BaseEntity {
  organizationId: string;
  name: string;
  slug: string;
  type: TenantType;
  status: TenantStatus;
  contactEmail: string;
  contactPhone?: string;
  maxSites: number;
  maxGateways: number;
  slaProfileId?: string | null;
  metadata?: Record<string, unknown>;
}

export interface TenantSummary extends Tenant {
  siteCount: number;
  gatewayCount: number;
  tunnelCount: number;
  onlineSites: number;
  degradedSites: number;
  offlineSites: number;
  totalTrafficMbps: number;
  healthScore: number;
}

// --- PoP ---
export enum PopStatus {
  ONLINE = 'ONLINE',
  DEGRADED = 'DEGRADED',
  OFFLINE = 'OFFLINE',
  MAINTENANCE = 'MAINTENANCE',
}

export interface Pop extends BaseEntity {
  name: string;
  location: string;
  city: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
  ispName: string;
  status: PopStatus;
  maxCapacityGbps: number;
  maxTunnels: number;
}

export interface PopHealth {
  popId: string;
  cpuPercent: number;
  memoryPercent: number;
  diskPercent: number;
  currentThroughputMbps: number;
  peakThroughputMbps: number;
  activeTunnels: number;
  activeTenants: number;
  activeSites: number;
  uptimeSeconds: number;
  utilizationPercent: number;
  capacityStatus: 'NORMAL' | 'WARNING' | 'HIGH' | 'CRITICAL';
  timestamp: string;
}

// --- Aggregator ---
export enum AggregatorStatus {
  ONLINE = 'ONLINE',
  DEGRADED = 'DEGRADED',
  OFFLINE = 'OFFLINE',
  MAINTENANCE = 'MAINTENANCE',
}

export interface Aggregator extends BaseEntity {
  popId: string;
  hostname: string;
  ipAddress: string;
  version: string;
  status: AggregatorStatus;
  maxTunnels: number;
  maxBandwidthMbps: number;
}

export interface AggregatorHealth {
  aggregatorId: string;
  cpuPercent: number;
  memoryPercent: number;
  diskPercent: number;
  currentThroughputMbps: number;
  activeTunnels: number;
  activeTenants: number;
  activeSites: number;
  uptimeSeconds: number;
  currentCapacity: number;
  maximumCapacity: number;
  utilizationPercent: number;
  capacityStatus: 'NORMAL' | 'WARNING' | 'HIGH' | 'CRITICAL';
  timestamp: string;
}

// --- Site ---
export enum SiteStatus {
  ONLINE = 'ONLINE',
  DEGRADED = 'DEGRADED',
  OFFLINE = 'OFFLINE',
  PROVISIONING = 'PROVISIONING',
  DISABLED = 'DISABLED',
}

export interface Site extends BaseEntity {
  tenantId: string;
  organizationId: string;
  popId?: string | null;
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
  status: SiteStatus;
  subnetCidr?: string | null;
  slaProfileId?: string | null;
}

export interface SiteHealth {
  siteId: string;
  uptimePercent: number;
  latencyMs: number;
  jitterMs: number;
  packetLossPercent: number;
  trafficInMbps: number;
  trafficOutMbps: number;
  wanAvailabilityPercent: number;
  tunnelAvailabilityPercent: number;
  timestamp: string;
}

// --- Gateway ---
export enum GatewayStatus {
  REGISTERED = 'REGISTERED',
  PROVISIONING = 'PROVISIONING',
  CONNECTING = 'CONNECTING',
  ONLINE = 'ONLINE',
  DEGRADED = 'DEGRADED',
  OFFLINE = 'OFFLINE',
  DECOMMISSIONED = 'DECOMMISSIONED',
}

export interface Gateway extends BaseEntity {
  siteId: string;
  tenantId: string;
  organizationId: string;
  hostname: string;
  model?: string;
  firmwareVersion?: string;
  serialNumber?: string;
  status: GatewayStatus;
  enrollmentToken?: string; // never exposed to frontend
  lastHeartbeatAt?: string | null;
}

export interface GatewayHealth {
  gatewayId: string;
  cpuPercent: number;
  memoryPercent: number;
  diskPercent: number;
  uptimeSeconds: number;
  temperature?: number;
  timestamp: string;
}

// --- WAN ---
export enum WanType {
  SATELLITE = 'SATELLITE',
  FIBER = 'FIBER',
  BROADBAND = 'BROADBAND',
  CELLULAR_4G = '4G',
  CELLULAR_5G = '5G',
  OTHER = 'OTHER',
}

export enum WanStatus {
  ACTIVE = 'ACTIVE',
  DEGRADED = 'DEGRADED',
  DOWN = 'DOWN',
  DISABLED = 'DISABLED',
}

export interface WanLink extends BaseEntity {
  gatewayId: string;
  siteId: string;
  tenantId: string;
  organizationId: string;
  name: string;
  type: WanType;
  providerName: string;
  bandwidthUpMbps: number;
  bandwidthDownMbps: number;
  status: WanStatus;
  isPrimary: boolean;
  priority: number;
  healthThresholds: WanHealthThresholds;
}

export interface WanHealthThresholds {
  latencyWarningMs: number;
  latencyCriticalMs: number;
  jitterWarningMs: number;
  jitterCriticalMs: number;
  packetLossWarningPercent: number;
  packetLossCriticalPercent: number;
}

export interface WanMetrics {
  wanLinkId: string;
  bandwidthUtilizationPercent: number;
  latencyMs: number;
  jitterMs: number;
  packetLossPercent: number;
  availabilityPercent: number;
  trafficInMbps: number;
  trafficOutMbps: number;
  timestamp: string;
}

// --- Tunnel ---
export enum TunnelProtocol {
  WIREGUARD = 'WIREGUARD',
  IPSEC = 'IPSEC',
  OTHER = 'OTHER',
}

export enum TunnelStatus {
  PROVISIONING = 'PROVISIONING',
  HANDSHAKING = 'HANDSHAKING',
  UP = 'UP',
  DEGRADED = 'DEGRADED',
  DOWN = 'DOWN',
}

export interface Tunnel extends BaseEntity {
  siteId: string;
  tenantId: string;
  organizationId: string;
  gatewayId: string;
  aggregatorId: string;
  wanLinkId: string;
  protocol: TunnelProtocol;
  status: TunnelStatus;
  localEndpoint: string;
  remoteEndpoint: string;
  localSubnet?: string;
  remoteSubnet?: string;
}

export interface TunnelMetrics {
  tunnelId: string;
  latencyMs: number;
  jitterMs: number;
  packetLossPercent: number;
  bytesIn: number;
  bytesOut: number;
  lastHandshakeAt?: string;
  uptimeSeconds: number;
  lastStateChange: string;
  timestamp: string;
}

// --- Routing ---
export enum RouteProtocol {
  STATIC = 'STATIC',
  BGP = 'BGP',
  OSPF = 'OSPF',
  CONNECTED = 'CONNECTED',
}

export enum RouteStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING = 'PENDING',
}

export interface Route extends BaseEntity {
  tenantId: string;
  organizationId: string;
  siteId?: string;
  popId?: string;
  gatewayId?: string;
  prefix: string;
  nextHop: string;
  interfaceName: string;
  protocol: RouteProtocol;
  metric: number;
  status: RouteStatus;
}

// --- Firewall ---
export enum FirewallAction {
  ALLOW = 'ALLOW',
  DENY = 'DENY',
}

export interface FirewallRule extends BaseEntity {
  tenantId: string;
  organizationId: string;
  siteId?: string;
  name: string;
  source: string;
  destination: string;
  protocol: string;
  ports: string;
  action: FirewallAction;
  priority: number;
  enabled: boolean;
  version: number;
}

// --- NAT ---
export enum NatType {
  SOURCE = 'SOURCE',
  DESTINATION = 'DESTINATION',
  PORT_FORWARD = 'PORT_FORWARD',
}

export enum NatStatus {
  DRAFT = 'DRAFT',
  REVIEW = 'REVIEW',
  APPROVED = 'APPROVED',
  DEPLOYED = 'DEPLOYED',
  VERIFIED = 'VERIFIED',
}

export interface NatRule extends BaseEntity {
  tenantId: string;
  organizationId: string;
  siteId?: string;
  name: string;
  type: NatType;
  sourceAddress: string;
  destinationAddress: string;
  translatedAddress: string;
  protocol: string;
  sourcePort?: string;
  destinationPort?: string;
  translatedPort?: string;
  status: NatStatus;
  enabled: boolean;
}

// --- Policy ---
export interface Policy extends BaseEntity {
  tenantId?: string;
  organizationId: string;
  name: string;
  description: string;
  type: string;
  version: number;
  isActive: boolean;
  config: Record<string, unknown>;
}

// --- IPAM ---
export interface IpPool extends BaseEntity {
  organizationId: string;
  tenantId?: string;
  name: string;
  networkCidr: string;
  gateway?: string;
  totalAddresses: number;
  allocatedAddresses: number;
}

export interface IpAllocation extends BaseEntity {
  poolId: string;
  tenantId: string;
  organizationId: string;
  siteId?: string;
  subnetCidr: string;
  description?: string;
}

// --- Alerts ---
export enum AlertSeverity {
  INFO = 'INFO',
  WARNING = 'WARNING',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum AlertStatus {
  OPEN = 'OPEN',
  ACKNOWLEDGED = 'ACKNOWLEDGED',
  SUPPRESSED = 'SUPPRESSED',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
}

export interface Alert extends BaseEntity {
  tenantId?: string;
  organizationId: string;
  alertRuleId: string;
  resourceType: string;
  resourceId: string;
  resourceName: string;
  severity: AlertSeverity;
  status: AlertStatus;
  title: string;
  description: string;
  metricName?: string;
  metricValue?: number;
  threshold?: number;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
  incidentId?: string;
}

export interface AlertRule extends BaseEntity {
  organizationId: string;
  tenantId?: string;
  name: string;
  description: string;
  resourceType: string;
  metricName: string;
  operator: '>' | '<' | '>=' | '<=' | '==' | '!=';
  threshold: number;
  durationSeconds: number;
  severity: AlertSeverity;
  enabled: boolean;
  notificationChannels: string[];
}

// --- Incidents ---
export enum IncidentStatus {
  OPEN = 'OPEN',
  INVESTIGATING = 'INVESTIGATING',
  IDENTIFIED = 'IDENTIFIED',
  MONITORING = 'MONITORING',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
}

export enum IncidentPriority {
  P1 = 'P1',
  P2 = 'P2',
  P3 = 'P3',
  P4 = 'P4',
}

export interface Incident extends BaseEntity {
  organizationId: string;
  tenantId?: string;
  title: string;
  description: string;
  status: IncidentStatus;
  priority: IncidentPriority;
  assignedTo?: string;
  affectedSites: string[];
  affectedTenants: string[];
  rootCause?: string;
  resolution?: string;
  startedAt: string;
  resolvedAt?: string;
  detectedBy: 'SYSTEM' | 'MANUAL' | 'AI';
}

export interface IncidentEvent extends BaseEntity {
  incidentId: string;
  type: 'DETECTION' | 'ALERT' | 'DIAGNOSTIC' | 'AI_ANALYSIS' | 'OPERATOR_ACTION' | 'AUTOMATION' | 'RECOVERY' | 'RESOLUTION' | 'NOTE';
  description: string;
  actorId?: string;
  actorType: 'SYSTEM' | 'USER' | 'AI' | 'AUTOMATION';
  metadata?: Record<string, unknown>;
}

// --- Automation ---
export enum AutomationStatus {
  ACTIVE = 'ACTIVE',
  DISABLED = 'DISABLED',
  DRAFT = 'DRAFT',
}

export interface AutomationRule extends BaseEntity {
  organizationId: string;
  name: string;
  description: string;
  status: AutomationStatus;
  conditions: AutomationCondition[];
  actions: AutomationAction[];
  requiresApproval: boolean;
  cooldownSeconds: number;
  lastTriggeredAt?: string;
}

export interface AutomationCondition {
  field: string;
  operator: string;
  value: string | number;
  logicalOperator?: 'AND' | 'OR';
}

export interface AutomationAction {
  type: 'CREATE_ALERT' | 'CREATE_INCIDENT' | 'RUN_DIAGNOSTIC' | 'CHANGE_ROUTE' | 'FAILOVER_WAN' | 'SEND_NOTIFICATION' | 'RUN_WEBHOOK' | 'GENERATE_REPORT' | 'REQUEST_APPROVAL';
  config: Record<string, unknown>;
}

export interface AutomationRun extends BaseEntity {
  ruleId: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'AWAITING_APPROVAL';
  triggeredBy: string;
  startedAt: string;
  completedAt?: string;
  result?: Record<string, unknown>;
  error?: string;
}

// --- AI ---
export interface AiSession extends BaseEntity {
  userId: string;
  organizationId: string;
  tenantId?: string;
  title?: string;
}

export interface AiMessage {
  id: string;
  sessionId: string;
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  toolCalls?: AiToolCall[];
  timestamp: string;
}

export interface AiToolCall {
  id: string;
  messageId: string;
  toolName: string;
  arguments: Record<string, unknown>;
  result?: Record<string, unknown>;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  startedAt: string;
  completedAt?: string;
}

export interface AiRecommendation extends BaseEntity {
  sessionId?: string;
  incidentId?: string;
  organizationId: string;
  tenantId?: string;
  type: 'ROOT_CAUSE' | 'CONFIGURATION' | 'CAPACITY' | 'ANOMALY' | 'GENERAL';
  summary: string;
  evidence: AiEvidence[];
  affectedComponents: string[];
  likelyCause?: string;
  confidence: number;
  recommendedAction?: string;
  risk?: string;
  status: 'PROPOSED' | 'ACCEPTED' | 'REJECTED' | 'IMPLEMENTED';
}

export interface AiEvidence {
  type: 'FACT' | 'INFERENCE' | 'RECOMMENDATION';
  description: string;
  sourceType: string;
  sourceId: string;
  value?: string | number;
  timestamp?: string;
}

// --- Audit ---
export interface AuditLog extends BaseEntity {
  organizationId: string;
  tenantId?: string;
  actorId: string;
  actorEmail: string;
  actorRole: UserRole;
  action: string;
  resourceType: string;
  resourceId: string;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  result: 'SUCCESS' | 'FAILURE' | 'DENIED';
  sourceIp: string;
  requestId: string;
  userAgent?: string;
}

// --- Notifications ---
export enum NotificationChannel {
  EMAIL = 'EMAIL',
  WEBHOOK = 'WEBHOOK',
  IN_APP = 'IN_APP',
}

export interface Notification extends BaseEntity {
  organizationId: string;
  tenantId?: string;
  userId?: string;
  channel: NotificationChannel;
  title: string;
  body: string;
  severity: AlertSeverity;
  read: boolean;
  sentAt?: string;
  metadata?: Record<string, unknown>;
}

// --- Reports ---
export enum ReportType {
  DAILY_NOC = 'DAILY_NOC',
  WEEKLY_NOC = 'WEEKLY_NOC',
  TENANT_SLA = 'TENANT_SLA',
  SITE_UPTIME = 'SITE_UPTIME',
  WAN_PERFORMANCE = 'WAN_PERFORMANCE',
  INCIDENT = 'INCIDENT',
  POP_CAPACITY = 'POP_CAPACITY',
  AGGREGATOR_CAPACITY = 'AGGREGATOR_CAPACITY',
  AUDIT = 'AUDIT',
  CONFIGURATION_CHANGES = 'CONFIGURATION_CHANGES',
}

export interface Report extends BaseEntity {
  organizationId: string;
  tenantId?: string;
  type: ReportType;
  name: string;
  description?: string;
  schedule?: string; // cron
  lastRunAt?: string;
  config: Record<string, unknown>;
}

export interface ReportRun extends BaseEntity {
  reportId: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  startedAt: string;
  completedAt?: string;
  filePath?: string;
  format: 'CSV' | 'PDF' | 'JSON';
  error?: string;
  metadata?: Record<string, unknown>;
}

// --- Configuration ---
export enum ConfigDeploymentStatus {
  DRAFT = 'DRAFT',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  DEPLOYING = 'DEPLOYING',
  DEPLOYED = 'DEPLOYED',
  FAILED = 'FAILED',
  ROLLED_BACK = 'ROLLED_BACK',
}

export interface ConfigurationVersion extends BaseEntity {
  organizationId: string;
  tenantId?: string;
  resourceType: string;
  resourceId: string;
  version: number;
  desiredConfig: Record<string, unknown>;
  previousConfig?: Record<string, unknown>;
  appliedConfig?: Record<string, unknown>;
  status: ConfigDeploymentStatus;
  deployedBy?: string;
  deployedAt?: string;
  rollbackVersionId?: string;
}

// --- SLA ---
export interface SlaProfile extends BaseEntity {
  organizationId: string;
  name: string;
  availabilityTarget: number;
  latencyTargetMs: number;
  packetLossTargetPercent: number;
  incidentResponseMinutes: number;
  recoveryTimeMinutes: number;
}

export interface SlaReport {
  tenantId: string;
  siteId?: string;
  period: string;
  availabilityActual: number;
  availabilityTarget: number;
  latencyActual: number;
  latencyTarget: number;
  packetLossActual: number;
  packetLossTarget: number;
  incidentCount: number;
  status: 'COMPLIANT' | 'AT_RISK' | 'BREACHED';
}

// --- System Health ---
export interface SystemHealth {
  service: string;
  status: 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY';
  latencyMs?: number;
  message?: string;
  checkedAt: string;
}

// --- Telemetry ---
export interface TelemetryHeartbeat {
  gatewayId: string;
  timestamp: string;
  cpuPercent: number;
  memoryPercent: number;
  diskPercent: number;
  uptimeSeconds: number;
  temperature?: number;
}

export interface TelemetryMetricPayload {
  sourceId: string;
  sourceType: 'GATEWAY' | 'TUNNEL' | 'WAN' | 'POP' | 'AGGREGATOR';
  metrics: Record<string, number>;
  timestamp: string;
}

// --- Dashboard ---
export interface DashboardSummary {
  tenantCount: number;
  siteCount: number;
  gatewayCount: number;
  popCount: number;
  aggregatorCount: number;
  activeTunnels: number;
  onlineSites: number;
  degradedSites: number;
  offlineSites: number;
  totalTrafficMbps: number;
  criticalIncidents: number;
}

// --- Diagnostics ---
export enum DiagnosticType {
  PING = 'PING',
  TCP_CONNECTIVITY = 'TCP_CONNECTIVITY',
  DNS_RESOLUTION = 'DNS_RESOLUTION',
  ROUTE_INSPECTION = 'ROUTE_INSPECTION',
  TUNNEL_HEALTH = 'TUNNEL_HEALTH',
  GATEWAY_HEARTBEAT = 'GATEWAY_HEARTBEAT',
  WAN_REACHABILITY = 'WAN_REACHABILITY',
  POP_REACHABILITY = 'POP_REACHABILITY',
}

export interface DiagnosticRequest {
  type: DiagnosticType;
  targetId: string;
  targetType: string;
  parameters?: Record<string, unknown>;
}

export interface DiagnosticResult extends BaseEntity {
  organizationId: string;
  tenantId?: string;
  type: DiagnosticType;
  targetId: string;
  targetType: string;
  status: 'SUCCESS' | 'FAILURE' | 'TIMEOUT' | 'ERROR';
  result: Record<string, unknown>;
  executedBy: string;
  durationMs: number;
}

// --- API Pagination ---
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface PaginationQuery {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  search?: string;
}

// --- API Error ---
export interface ApiError {
  error: {
    code: string;
    message: string;
    requestId: string;
    details?: Record<string, unknown>;
  };
}

// --- WebSocket Events ---
export enum WsEvent {
  TELEMETRY_UPDATE = 'telemetry:update',
  GATEWAY_STATUS = 'gateway:status',
  TUNNEL_STATUS = 'tunnel:status',
  WAN_STATUS = 'wan:status',
  POP_HEALTH = 'pop:health',
  AGGREGATOR_HEALTH = 'aggregator:health',
  ALERT_CREATED = 'alert:created',
  ALERT_UPDATED = 'alert:updated',
  INCIDENT_CREATED = 'incident:created',
  INCIDENT_UPDATED = 'incident:updated',
  NOTIFICATION = 'notification',
  DASHBOARD_UPDATE = 'dashboard:update',
}

// --- Provider Interfaces ---
export interface TelemetryProvider {
  ingestHeartbeat(heartbeat: TelemetryHeartbeat): Promise<void>;
  ingestMetrics(payload: TelemetryMetricPayload): Promise<void>;
  getLatestMetrics(sourceId: string, sourceType: string): Promise<Record<string, number>>;
  getMetricsHistory(sourceId: string, sourceType: string, from: string, to: string): Promise<TelemetryMetricPayload[]>;
}

export interface GatewayProvider {
  getStatus(gatewayId: string): Promise<GatewayHealth>;
  getInterfaces(gatewayId: string): Promise<Record<string, unknown>[]>;
  restart(gatewayId: string): Promise<void>;
  applyConfiguration(gatewayId: string, config: Record<string, unknown>): Promise<void>;
  rollbackConfiguration(gatewayId: string, version: number): Promise<void>;
}

export interface TunnelProvider {
  getStatus(tunnelId: string): Promise<TunnelMetrics>;
  create(config: Record<string, unknown>): Promise<void>;
  destroy(tunnelId: string): Promise<void>;
  resetHandshake(tunnelId: string): Promise<void>;
}

export interface PopProvider {
  getHealth(popId: string): Promise<PopHealth>;
  getCapacity(popId: string): Promise<{ current: number; max: number; percent: number }>;
}

export interface AggregatorProvider {
  getHealth(aggregatorId: string): Promise<AggregatorHealth>;
  getCapacity(aggregatorId: string): Promise<{ current: number; max: number; percent: number }>;
}

export interface RoutingProvider {
  getRoutes(filter?: Record<string, unknown>): Promise<Route[]>;
  addRoute(route: Partial<Route>): Promise<Route>;
  removeRoute(routeId: string): Promise<void>;
  getRoutingTable(gatewayId: string): Promise<Route[]>;
}

export interface FirewallProvider {
  getRules(siteId: string): Promise<FirewallRule[]>;
  applyRules(siteId: string, rules: FirewallRule[]): Promise<void>;
  rollbackRules(siteId: string, version: number): Promise<void>;
}

export interface DiagnosticsProvider {
  ping(target: string): Promise<DiagnosticResult>;
  tcpConnect(target: string, port: number): Promise<DiagnosticResult>;
  dnsResolve(hostname: string): Promise<DiagnosticResult>;
  inspectRoutes(gatewayId: string): Promise<DiagnosticResult>;
  checkTunnelHealth(tunnelId: string): Promise<DiagnosticResult>;
  checkGatewayHeartbeat(gatewayId: string): Promise<DiagnosticResult>;
  checkWanReachability(wanLinkId: string): Promise<DiagnosticResult>;
  checkPopReachability(popId: string): Promise<DiagnosticResult>;
}

export interface NetworkExecutionProvider {
  getStatus(deviceId: string): Promise<Record<string, unknown>>;
  getInterfaces(deviceId: string): Promise<Record<string, unknown>[]>;
  getRoutes(deviceId: string): Promise<Route[]>;
  getTunnelStatus(tunnelId: string): Promise<TunnelMetrics>;
  getMetrics(deviceId: string): Promise<Record<string, number>>;
  runDiagnostics(request: DiagnosticRequest): Promise<DiagnosticResult>;
  applyConfiguration(deviceId: string, config: Record<string, unknown>): Promise<void>;
  rollbackConfiguration(deviceId: string, version: number): Promise<void>;
  failover(siteId: string, fromWan: string, toWan: string): Promise<void>;
}
