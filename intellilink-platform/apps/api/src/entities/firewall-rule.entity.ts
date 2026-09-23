import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';
@Entity('firewall_rules')
export class FirewallRuleEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column('uuid') tenantId: string;
  @Column('uuid') organizationId: string;
  @Column('uuid', { nullable: true }) siteId: string;
  @Column() name: string;
  @Column({ default: '0.0.0.0/0' }) source: string;
  @Column({ default: '0.0.0.0/0' }) destination: string;
  @Column({ default: 'tcp' }) protocol: string;
  @Column({ default: 'any' }) ports: string;
  @Column({ type: 'enum', enum: ['ALLOW','DENY'], default: 'ALLOW' }) action: string;
  @Column({ default: 100 }) priority: number;
  @Column({ default: true }) enabled: boolean;
  @Column({ default: 1 }) version: number;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
  @DeleteDateColumn() deletedAt: Date;
}
