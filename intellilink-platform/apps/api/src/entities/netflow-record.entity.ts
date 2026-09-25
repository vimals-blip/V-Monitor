import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('netflow_records')
export class NetflowRecordEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ default: '127.0.0.1' })
  srcIp: string;

  @Index()
  @Column({ default: '127.0.0.1' })
  dstIp: string;

  @Column({ type: 'int', default: 0 })
  srcPort: number;

  @Column({ type: 'int', default: 0 })
  dstPort: number;

  @Column({ default: 'TCP' })
  protocol: string;

  @Column({ type: 'bigint', default: 0 })
  bytes: number;

  @Column({ type: 'int', default: 1 })
  packets: number;

  @Index()
  @Column({ default: 'HTTPS' })
  application: string;

  @Column({ default: '127.0.0.1' })
  deviceIp: string;

  @Index()
  @CreateDateColumn({ type: 'datetime', precision: 6 })
  createdAt: Date;
}
