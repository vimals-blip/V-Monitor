export function isProviderRole(role: string): boolean {
  return ['PROVIDER', 'PROVIDER_ADMIN', 'NOC_OPERATOR', 'AUDITOR'].includes(role);
}

export function canManageTenants(role: string): boolean {
  return ['PROVIDER', 'PROVIDER_ADMIN'].includes(role);
}

export function canExecuteDiagnostics(role: string): boolean {
  return ['PROVIDER_ADMIN', 'NOC_OPERATOR', 'TENANT_ADMIN'].includes(role);
}

export function canDeployConfiguration(role: string): boolean {
  return ['PROVIDER_ADMIN', 'TENANT_ADMIN'].includes(role);
}
