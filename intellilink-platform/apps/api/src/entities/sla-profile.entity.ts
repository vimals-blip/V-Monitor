import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';
@Entity('sla_profiles')
export class SlaProfileEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column('uuid') organizationId: string;
  @Column() name: string;
  @Column('decimal', { precision: 5, scale: 2, default: 99.9 }) availabilityTarget: number;
  @Column({ default: 100 }) latencyTargetMs: number;
  @Column('decimal', { precision: 5, scale: 2, default: 1 }) packetLossTargetPercent: number;
  @Column({ default: 15 }) incidentResponseMinutes: number;
  @Column({ default: 60 }) recoveryTimeMinutes: number;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
  @DeleteDateColumn() deletedAt: Date;
}
