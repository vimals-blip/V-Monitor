import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';
@Entity('tunnels')
export class TunnelEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column('uuid') siteId: string;
  @Column('uuid') tenantId: string;
  @Column('uuid') organizationId: string;
  @Column('uuid') gatewayId: string;
  @Column('uuid') aggregatorId: string;
  @Column('uuid') wanLinkId: string;
  @Column({ type: 'enum', enum: ['WIREGUARD','IPSEC','OTHER'], default: 'WIREGUARD' }) protocol: string;
  @Column({ type: 'enum', enum: ['PROVISIONING','HANDSHAKING','UP','DEGRADED','DOWN'], default: 'PROVISIONING' }) status: string;
  @Column() localEndpoint: string;
  @Column() remoteEndpoint: string;
  @Column({ nullable: true }) localSubnet: string;
  @Column({ nullable: true }) remoteSubnet: string;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
  @DeleteDateColumn() deletedAt: Date;
}
