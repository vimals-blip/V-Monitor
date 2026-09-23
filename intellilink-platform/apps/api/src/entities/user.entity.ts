import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { OrganizationEntity } from './organization.entity';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ unique: true }) email: string;
  @Column() firstName: string;
  @Column() lastName: string;
  @Column() passwordHash: string;
  @Column({ type: 'enum', enum: ['PROVIDER','PROVIDER_ADMIN','NOC_OPERATOR','TENANT_ADMIN','TENANT_OPERATOR','AUDITOR','READ_ONLY'] }) role: string;
  @Column('uuid') organizationId: string;
  @Column('uuid', { nullable: true }) tenantId: string;
  @Column({ default: true }) isActive: boolean;
  @Column({ type: 'timestamp', nullable: true }) lastLoginAt: Date;
  @Column({ default: 0 }) failedLoginAttempts: number;
  @Column({ type: 'timestamp', nullable: true }) lockedUntil: Date | null;
  @Column({ default: false }) mfaEnabled: boolean;
  @Column({ type: 'varchar', nullable: true }) refreshToken: string | null;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
  @DeleteDateColumn() deletedAt: Date;
  @ManyToOne(() => OrganizationEntity, o => o.users) @JoinColumn({ name: 'organizationId' }) organization: OrganizationEntity;
}
