import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';
@Entity('ip_allocations')
export class IpAllocationEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column('uuid') poolId: string;
  @Column('uuid') tenantId: string;
  @Column('uuid') organizationId: string;
  @Column('uuid', { nullable: true }) siteId: string;
  @Column() subnetCidr: string;
  @Column({ nullable: true }) description: string;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
  @DeleteDateColumn() deletedAt: Date;
}
