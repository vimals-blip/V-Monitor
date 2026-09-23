import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, OneToMany } from 'typeorm';
import { TenantEntity } from './tenant.entity';
import { UserEntity } from './user.entity';

@Entity('organizations')
export class OrganizationEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ unique: true }) name: string;
  @Column({ unique: true }) slug: string;
  @Column({ type: 'enum', enum: ['PROVIDER', 'TENANT'] }) type: string;
  @Column({ default: true }) isActive: boolean;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
  @DeleteDateColumn() deletedAt: Date;
  @OneToMany(() => TenantEntity, t => t.organization) tenants: TenantEntity[];
  @OneToMany(() => UserEntity, u => u.organization) users: UserEntity[];
}
