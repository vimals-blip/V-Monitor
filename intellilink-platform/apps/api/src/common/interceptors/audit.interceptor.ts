import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLogEntity } from '../../entities/audit-log.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(@InjectRepository(AuditLogEntity) private auditRepo: Repository<AuditLogEntity>) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;
    
    // Only audit mutations
    if (['GET', 'HEAD', 'OPTIONS'].includes(method)) return next.handle();
    
    const requestId = uuidv4();
    request.requestId = requestId;
    const user = request.user;
    
    return next.handle().pipe(
      tap(async (response) => {
        if (!user) return;
        try {
          await this.auditRepo.save(this.auditRepo.create({
            organizationId: user.organizationId,
            tenantId: user.tenantId,
            actorId: user.id,
            actorEmail: user.email,
            actorRole: user.role,
            action: `${method} ${request.route?.path || request.url}`,
            resourceType: context.getClass().name.replace('Controller', '').toLowerCase(),
            resourceId: request.params?.id || response?.id || '',
            after: method === 'DELETE' ? null : (typeof response === 'object' ? response : null),
            result: 'SUCCESS',
            sourceIp: request.ip,
            requestId,
            userAgent: request.headers['user-agent'],
          }));
        } catch (e) { /* audit failure should not break the request */ }
      }),
    );
  }
}
