import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';
@Entity('reports')
export class ReportEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column('uuid') organizationId: string;
  @Column('uuid', { nullable: true }) tenantId: string;
  @Column() type: string;
  @Column() name: string;
  @Column({ nullable: true }) description: string;
  @Column({ nullable: true }) schedule: string;
  @Column({ type: 'timestamp', nullable: true }) lastRunAt: Date;
  @Column({ type: 'simple-json', nullable: true }) config: Record<string, any>;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
  @DeleteDateColumn() deletedAt: Date;
}
