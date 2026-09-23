import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
@Entity('diagnostic_results')
export class DiagnosticResultEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column('uuid') organizationId: string;
  @Column('uuid', { nullable: true }) tenantId: string;
  @Column() type: string;
  @Column('uuid') targetId: string;
  @Column() targetType: string;
  @Column({ type: 'enum', enum: ['SUCCESS','FAILURE','TIMEOUT','ERROR'], default: 'SUCCESS' }) status: string;
  @Column({ type: 'simple-json' }) result: Record<string, any>;
  @Column('uuid') executedBy: string;
  @Column({ default: 0 }) durationMs: number;
  @CreateDateColumn() createdAt: Date;
}
