import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { TenantEntity } from './tenant.entity';
import { GatewayEntity } from './gateway.entity';
@Entity('sites')
export class SiteEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column('uuid') tenantId: string;
  @Column('uuid') organizationId: string;
  @Column('uuid', { nullable: true }) popId: string;
  @Column() name: string;
  @Column({ default: '' }) address: string;
  @Column({ default: '' }) city: string;
  @Column({ default: '' }) state: string;
  @Column({ default: 'IN' }) country: string;
  @Column('decimal', { precision: 10, scale: 7, default: 0 }) latitude: number;
  @Column('decimal', { precision: 10, scale: 7, default: 0 }) longitude: number;
  @Column({ type: 'enum', enum: ['ONLINE','DEGRADED','OFFLINE','PROVISIONING','DISABLED'], default: 'PROVISIONING' }) status: string;
  @Column({ nullable: true }) subnetCidr: string;
  @Column('uuid', { nullable: true }) slaProfileId: string;
  @Column({ type: 'simple-json', nullable: true }) metadata: Record<string, any>;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
  @DeleteDateColumn() deletedAt: Date;
  @ManyToOne(() => TenantEntity, t => t.sites) @JoinColumn({ name: 'tenantId' }) tenant: TenantEntity;
  @OneToMany(() => GatewayEntity, g => g.site) gateways: GatewayEntity[];
}
