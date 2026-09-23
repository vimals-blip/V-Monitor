import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';
@Entity('alerts')
export class AlertEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column('uuid', { nullable: true }) tenantId: string;
  @Column('uuid') organizationId: string;
  @Column('uuid') alertRuleId: string;
  @Column() resourceType: string;
  @Column('uuid') resourceId: string;
  @Column() resourceName: string;
  @Column({ type: 'enum', enum: ['INFO','WARNING','HIGH','CRITICAL'], default: 'WARNING' }) severity: string;
  @Column({ type: 'enum', enum: ['OPEN','ACKNOWLEDGED','SUPPRESSED','RESOLVED','CLOSED'], default: 'OPEN' }) status: string;
  @Column() title: string;
  @Column({ type: 'text' }) description: string;
  @Column({ nullable: true }) metricName: string;
  @Column('decimal', { precision: 15, scale: 4, nullable: true }) metricValue: number;
  @Column('decimal', { precision: 15, scale: 4, nullable: true }) threshold: number;
  @Column('uuid', { nullable: true }) acknowledgedBy: string;
  @Column({ type: 'timestamp', nullable: true }) acknowledgedAt: Date;
  @Column({ type: 'timestamp', nullable: true }) resolvedAt: Date;
  @Column('uuid', { nullable: true }) incidentId: string;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
  @DeleteDateColumn() deletedAt: Date;
}
