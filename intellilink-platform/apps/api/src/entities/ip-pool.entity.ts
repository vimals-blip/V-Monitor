import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';
@Entity('ip_pools')
export class IpPoolEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column('uuid') organizationId: string;
  @Column('uuid', { nullable: true }) tenantId: string;
  @Column() name: string;
  @Column() networkCidr: string;
  @Column({ nullable: true }) gateway: string;
  @Column({ default: 0 }) totalAddresses: number;
  @Column({ default: 0 }) allocatedAddresses: number;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
  @DeleteDateColumn() deletedAt: Date;
}
