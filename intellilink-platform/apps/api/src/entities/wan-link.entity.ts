import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { GatewayEntity } from './gateway.entity';
@Entity('wan_links')
export class WanLinkEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column('uuid') gatewayId: string;
  @Column('uuid') siteId: string;
  @Column('uuid') tenantId: string;
  @Column('uuid') organizationId: string;
  @Column() name: string;
  @Column({ type: 'enum', enum: ['SATELLITE','FIBER','BROADBAND','4G','5G','OTHER'], default: 'FIBER' }) type: string;
  @Column({ default: '' }) providerName: string;
  @Column('decimal', { precision: 10, scale: 2, default: 100 }) bandwidthUpMbps: number;
  @Column('decimal', { precision: 10, scale: 2, default: 100 }) bandwidthDownMbps: number;
  @Column({ type: 'enum', enum: ['ACTIVE','DEGRADED','DOWN','DISABLED'], default: 'ACTIVE' }) status: string;
  @Column({ default: true }) isPrimary: boolean;
  @Column({ default: 1 }) priority: number;
  @Column({ type: 'simple-json', nullable: true }) healthThresholds: Record<string, number>;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
  @DeleteDateColumn() deletedAt: Date;
  @ManyToOne(() => GatewayEntity, g => g.wanLinks) @JoinColumn({ name: 'gatewayId' }) gateway: GatewayEntity;
}
