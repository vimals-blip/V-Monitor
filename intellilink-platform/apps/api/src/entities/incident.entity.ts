import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, OneToMany } from 'typeorm';
import { IncidentEventEntity } from './incident-event.entity';
@Entity('incidents')
export class IncidentEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column('uuid') organizationId: string;
  @Column('uuid', { nullable: true }) tenantId: string;
  @Column() title: string;
  @Column({ type: 'text' }) description: string;
  @Column({ type: 'enum', enum: ['OPEN','INVESTIGATING','IDENTIFIED','MONITORING','RESOLVED','CLOSED'], default: 'OPEN' }) status: string;
  @Column({ type: 'enum', enum: ['P1','P2','P3','P4'], default: 'P3' }) priority: string;
  @Column('uuid', { nullable: true }) assignedTo: string;
  @Column({ type: 'simple-json', nullable: true }) affectedSites: string[];
  @Column({ type: 'simple-json', nullable: true }) affectedTenants: string[];
  @Column({ type: 'text', nullable: true }) rootCause: string;
  @Column({ type: 'text', nullable: true }) resolution: string;
  @Column({ type: 'timestamp' }) startedAt: Date;
  @Column({ type: 'timestamp', nullable: true }) resolvedAt: Date;
  @Column({ type: 'enum', enum: ['SYSTEM','MANUAL','AI'], default: 'SYSTEM' }) detectedBy: string;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
  @DeleteDateColumn() deletedAt: Date;
  @OneToMany(() => IncidentEventEntity, e => e.incident) events: IncidentEventEntity[];
}
