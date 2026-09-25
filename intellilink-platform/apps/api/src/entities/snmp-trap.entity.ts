import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('snmp_traps')
export class SnmpTrapEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ default: '127.0.0.1' })
  sourceIp: string;

  @Column({ default: 'public' })
  community: string;

  @Index()
  @Column({ default: '1.3.6.1.6.3.1.1.5.3' })
  trapOid: string;

  @Column({ default: 'linkDown' })
  trapType: string;

  @Column({ type: 'json', nullable: true })
  variables: any;

  @Column({ nullable: true })
  sysUpTime: string;

  @Column({ nullable: true })
  enterpriseOid: string;

  @Index()
  @CreateDateColumn({ type: 'datetime', precision: 6 })
  createdAt: Date;
}
