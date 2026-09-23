import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';
@Entity('metric_samples')
@Index(['sourceId', 'sourceType', 'createdAt'])
export class MetricSampleEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() sourceId: string;
  @Column() sourceType: string;
  @Column({ type: 'simple-json' }) metrics: Record<string, number>;
  @Column({ type: 'timestamp' }) timestamp: Date;
  @CreateDateColumn() createdAt: Date;
}
