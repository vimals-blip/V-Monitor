import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { PopEntity } from './pop.entity';
@Entity('aggregators')
export class AggregatorEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column('uuid') popId: string;
  @Column() hostname: string;
  @Column() ipAddress: string;
  @Column({ default: '1.0.0' }) version: string;
  @Column({ type: 'enum', enum: ['ONLINE','DEGRADED','OFFLINE','MAINTENANCE'], default: 'ONLINE' }) status: string;
  @Column({ default: 2000 }) maxTunnels: number;
  @Column({ default: 10000 }) maxBandwidthMbps: number;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
  @DeleteDateColumn() deletedAt: Date;
  @ManyToOne(() => PopEntity, p => p.aggregators) @JoinColumn({ name: 'popId' }) pop: PopEntity;
}
