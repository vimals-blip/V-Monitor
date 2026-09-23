import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';
@Entity('automation_rules')
export class AutomationRuleEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column('uuid') organizationId: string;
  @Column() name: string;
  @Column({ default: '' }) description: string;
  @Column({ type: 'enum', enum: ['ACTIVE','DISABLED','DRAFT'], default: 'DRAFT' }) status: string;
  @Column({ type: 'simple-json', nullable: true }) conditions: any[];
  @Column({ type: 'simple-json', nullable: true }) actions: any[];
  @Column({ default: false }) requiresApproval: boolean;
  @Column({ default: 300 }) cooldownSeconds: number;
  @Column({ type: 'timestamp', nullable: true }) lastTriggeredAt: Date;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
  @DeleteDateColumn() deletedAt: Date;
}
