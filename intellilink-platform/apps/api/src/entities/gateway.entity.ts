import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { SiteEntity } from './site.entity';
import { WanLinkEntity } from './wan-link.entity';
@Entity('gateways')
export class GatewayEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column('uuid') siteId: string;
  @Column('uuid') tenantId: string;
  @Column('uuid') organizationId: string;
  @Column() hostname: string;
  @Column({ nullable: true }) model: string;
  @Column({ nullable: true }) firmwareVersion: string;
  @Column({ nullable: true }) serialNumber: string;
  @Column({ nullable: true }) publicKey: string;
  @Column({ type: 'enum', enum: ['REGISTERED','PROVISIONING','CONNECTING','ONLINE','DEGRADED','OFFLINE','DECOMMISSIONED'], default: 'REGISTERED' }) status: string;
  @Column({ nullable: true, select: false }) enrollmentToken: string;
  @Column({ type: 'timestamp', nullable: true }) lastHeartbeatAt: Date;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
  @DeleteDateColumn() deletedAt: Date;
  @ManyToOne(() => SiteEntity, s => s.gateways) @JoinColumn({ name: 'siteId' }) site: SiteEntity;
  @OneToMany(() => WanLinkEntity, w => w.gateway) wanLinks: WanLinkEntity[];
}
