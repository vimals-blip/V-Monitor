import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
@Entity('configuration_versions')
export class ConfigurationVersionEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column('uuid') organizationId: string;
  @Column('uuid', { nullable: true }) tenantId: string;
  @Column() resourceType: string;
  @Column('uuid') resourceId: string;
  @Column({ default: 1 }) version: number;
  @Column({ type: 'simple-json' }) desiredConfig: Record<string, any>;
  @Column({ type: 'simple-json', nullable: true }) previousConfig: Record<string, any>;
  @Column({ type: 'simple-json', nullable: true }) appliedConfig: Record<string, any>;
  @Column({ type: 'enum', enum: ['DRAFT','PENDING_APPROVAL','APPROVED','DEPLOYING','DEPLOYED','FAILED','ROLLED_BACK'], default: 'DRAFT' }) status: string;
  @Column('uuid', { nullable: true }) deployedBy: string;
  @Column({ type: 'timestamp', nullable: true }) deployedAt: Date;
  @Column('uuid', { nullable: true }) rollbackVersionId: string;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
