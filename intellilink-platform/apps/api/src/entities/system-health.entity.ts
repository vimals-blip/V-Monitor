import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
@Entity('system_health')
export class SystemHealthEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() service: string;
  @Column({ type: 'enum', enum: ['HEALTHY','DEGRADED','UNHEALTHY'], default: 'HEALTHY' }) status: string;
  @Column({ nullable: true }) latencyMs: number;
  @Column({ nullable: true }) message: string;
  @CreateDateColumn() checkedAt: Date;
}
