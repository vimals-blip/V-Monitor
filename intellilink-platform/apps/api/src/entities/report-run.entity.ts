import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
@Entity('report_runs')
export class ReportRunEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column('uuid') reportId: string;
  @Column({ type: 'enum', enum: ['PENDING','RUNNING','COMPLETED','FAILED'], default: 'PENDING' }) status: string;
  @Column({ type: 'timestamp' }) startedAt: Date;
  @Column({ type: 'timestamp', nullable: true }) completedAt: Date;
  @Column({ nullable: true }) filePath: string;
  @Column({ type: 'enum', enum: ['CSV','PDF','JSON'], default: 'CSV' }) format: string;
  @Column({ type: 'text', nullable: true }) error: string;
  @Column({ type: 'simple-json', nullable: true }) metadata: Record<string, any>;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
