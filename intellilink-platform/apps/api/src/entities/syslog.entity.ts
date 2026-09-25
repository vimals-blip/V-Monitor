import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('syslog_records')
export class SyslogEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: 'LOCAL0' })
  facility: string;

  @Index()
  @Column({ default: 'INFORMATIONAL' })
  severity: string;

  @Column({ type: 'int', default: 6 })
  severityCode: number;

  @Index()
  @Column({ default: 'unknown' })
  hostname: string;

  @Column({ default: 'SYSTEM' })
  tag: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'text', nullable: true })
  raw: string;

  @Column({ default: '127.0.0.1' })
  sourceIp: string;

  @Index()
  @CreateDateColumn({ type: 'datetime', precision: 6 })
  createdAt: Date;
}
