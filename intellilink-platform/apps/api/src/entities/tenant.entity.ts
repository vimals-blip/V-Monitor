import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { OrganizationEntity } from './organization.entity';
import { SiteEntity } from './site.entity';

@Entity('tenants')
export class TenantEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column('uuid') organizationId: string;
  @Column() name: string;
  @Column({ unique: true }) slug: string;
  @Column({ type: 'enum', enum: ['ENTERPRISE','GOVERNMENT','BANKING','EDUCATION','HEALTHCARE','OTHER'], default: 'ENTERPRISE' }) type: string;
  @Column({ type: 'enum', enum: ['ACTIVE','SUSPENDED','PROVISIONING','ARCHIVED'], default: 'PROVISIONING' }) status: string;
  @Column() contactEmail: string;
  @Column({ nullable: true }) contactPhone: string;
  @Column({ default: 100 }) maxSites: number;
  @Column({ default: 200 }) maxGateways: number;
  @Column('uuid', { nullable: true }) slaProfileId: string;
  @Column({ type: 'simple-json', nullable: true }) metadata: Record<string, any>;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
  @DeleteDateColumn() deletedAt: Date;
  @ManyToOne(() => OrganizationEntity, o => o.tenants) @JoinColumn({ name: 'organizationId' }) organization: OrganizationEntity;
  @OneToMany(() => SiteEntity, s => s.tenant) sites: SiteEntity[];
}
