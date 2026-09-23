import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';
@Entity('audit_logs')
@Index(['organizationId', 'createdAt'])
@Index(['tenantId', 'createdAt'])
@Index(['actorId', 'createdAt'])
export class AuditLogEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column('uuid') organizationId: string;
  @Column('uuid', { nullable: true }) tenantId: string;
  @Column('uuid') actorId: string;
  @Column() actorEmail: string;
  @Column() actorRole: string;
  @Column() action: string;
  @Column() resourceType: string;
  @Column('uuid') resourceId: string;
  @Column({ type: 'simple-json', nullable: true }) before: Record<string, any>;
  @Column({ type: 'simple-json', nullable: true }) after: Record<string, any>;
  @Column({ type: 'enum', enum: ['SUCCESS','FAILURE','DENIED'], default: 'SUCCESS' }) result: string;
  @Column({ default: '' }) sourceIp: string;
  @Column({ default: '' }) requestId: string;
  @Column({ nullable: true }) userAgent: string;
  @CreateDateColumn() createdAt: Date;
}
