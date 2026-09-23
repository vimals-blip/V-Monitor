import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, OneToMany } from 'typeorm';
import { AggregatorEntity } from './aggregator.entity';
@Entity('pops')
export class PopEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() name: string;
  @Column() location: string;
  @Column({ default: '' }) city: string;
  @Column({ default: '' }) state: string;
  @Column({ default: 'IN' }) country: string;
  @Column('decimal', { precision: 10, scale: 7, default: 0 }) latitude: number;
  @Column('decimal', { precision: 10, scale: 7, default: 0 }) longitude: number;
  @Column() ispName: string;
  @Column({ type: 'enum', enum: ['ONLINE','DEGRADED','OFFLINE','MAINTENANCE'], default: 'ONLINE' }) status: string;
  @Column('decimal', { precision: 10, scale: 2, default: 10 }) maxCapacityGbps: number;
  @Column({ default: 5000 }) maxTunnels: number;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
  @DeleteDateColumn() deletedAt: Date;
  @OneToMany(() => AggregatorEntity, a => a.pop) aggregators: AggregatorEntity[];
}
