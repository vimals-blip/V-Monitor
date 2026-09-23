import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';
@Entity('alert_rules')
export class AlertRuleEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column('uuid') organizationId: string;
  @Column('uuid', { nullable: true }) tenantId: string;
  @Column() name: string;
  @Column({ default: '' }) description: string;
  @Column() resourceType: string;
  @Column() metricName: string;
  @Column({ default: '>' }) operator: string;
  @Column('decimal', { precision: 15, scale: 4 }) threshold: number;
  @Column({ default: 30 }) durationSeconds: number;
  @Column({ type: 'enum', enum: ['INFO','WARNING','HIGH','CRITICAL'], default: 'WARNING' }) severity: string;
  @Column({ default: true }) enabled: boolean;
  @Column({ type: 'simple-json', nullable: true }) notificationChannels: string[];
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
  @DeleteDateColumn() deletedAt: Date;
}
