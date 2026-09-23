import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';
@Entity('nat_rules')
export class NatRuleEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column('uuid') tenantId: string;
  @Column('uuid') organizationId: string;
  @Column('uuid', { nullable: true }) siteId: string;
  @Column() name: string;
  @Column({ type: 'enum', enum: ['SOURCE','DESTINATION','PORT_FORWARD'], default: 'SOURCE' }) type: string;
  @Column() sourceAddress: string;
  @Column() destinationAddress: string;
  @Column() translatedAddress: string;
  @Column({ default: 'tcp' }) protocol: string;
  @Column({ nullable: true }) sourcePort: string;
  @Column({ nullable: true }) destinationPort: string;
  @Column({ nullable: true }) translatedPort: string;
  @Column({ type: 'enum', enum: ['DRAFT','REVIEW','APPROVED','DEPLOYED','VERIFIED'], default: 'DRAFT' }) status: string;
  @Column({ default: true }) enabled: boolean;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
  @DeleteDateColumn() deletedAt: Date;
}
