import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';
@Entity('policies')
export class PolicyEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column('uuid', { nullable: true }) tenantId: string;
  @Column('uuid') organizationId: string;
  @Column() name: string;
  @Column({ default: '' }) description: string;
  @Column({ default: 'GENERAL' }) type: string;
  @Column({ default: 1 }) version: number;
  @Column({ default: true }) isActive: boolean;
  @Column({ type: 'simple-json', nullable: true }) config: Record<string, any>;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
  @DeleteDateColumn() deletedAt: Date;
}
