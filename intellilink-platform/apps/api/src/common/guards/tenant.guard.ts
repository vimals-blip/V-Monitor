import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(), context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user) return true;
    
    // Provider roles can access all tenants
    const providerRoles = ['PROVIDER', 'PROVIDER_ADMIN', 'NOC_OPERATOR', 'AUDITOR'];
    if (providerRoles.includes(user.role)) return true;
    
    // Tenant users must have a tenantId and can only access their own
    const requestTenantId = request.params?.tenantId || request.body?.tenantId || request.query?.tenantId;
    if (requestTenantId && user.tenantId && requestTenantId !== user.tenantId) {
      throw new ForbiddenException('Cross-tenant access denied');
    }
    return true;
  }
}
