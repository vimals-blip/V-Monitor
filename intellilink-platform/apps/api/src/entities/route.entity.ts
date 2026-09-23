import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';
@Entity('routes')
export class RouteEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column('uuid') tenantId: string;
  @Column('uuid') organizationId: string;
  @Column('uuid', { nullable: true }) siteId: string;
  @Column('uuid', { nullable: true }) popId: string;
  @Column('uuid', { nullable: true }) gatewayId: string;
  @Column() prefix: string;
  @Column() nextHop: string;
  @Column({ default: 'eth0' }) interfaceName: string;
  @Column({ type: 'enum', enum: ['STATIC','BGP','OSPF','CONNECTED'], default: 'STATIC' }) protocol: string;
  @Column({ default: 100 }) metric: number;
  @Column({ type: 'enum', enum: ['ACTIVE','INACTIVE','PENDING'], default: 'ACTIVE' }) status: string;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
  @DeleteDateColumn() deletedAt: Date;
}
