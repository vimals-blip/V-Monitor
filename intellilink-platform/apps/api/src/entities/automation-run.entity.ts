import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
@Entity('automation_runs')
export class AutomationRunEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column('uuid') ruleId: string;
  @Column({ type: 'enum', enum: ['PENDING','RUNNING','COMPLETED','FAILED','CANCELLED','AWAITING_APPROVAL'], default: 'PENDING' }) status: string;
  @Column() triggeredBy: string;
  @Column({ type: 'timestamp' }) startedAt: Date;
  @Column({ type: 'timestamp', nullable: true }) completedAt: Date;
  @Column({ type: 'simple-json', nullable: true }) result: Record<string, any>;
  @Column({ type: 'text', nullable: true }) error: string;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
