import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { IncidentEntity } from './incident.entity';
@Entity('incident_events')
export class IncidentEventEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column('uuid') incidentId: string;
  @Column({ type: 'enum', enum: ['DETECTION','ALERT','DIAGNOSTIC','AI_ANALYSIS','OPERATOR_ACTION','AUTOMATION','RECOVERY','RESOLUTION','NOTE'] }) type: string;
  @Column({ type: 'text' }) description: string;
  @Column('uuid', { nullable: true }) actorId: string;
  @Column({ type: 'enum', enum: ['SYSTEM','USER','AI','AUTOMATION'], default: 'SYSTEM' }) actorType: string;
  @Column({ type: 'simple-json', nullable: true }) metadata: Record<string, any>;
  @CreateDateColumn() createdAt: Date;
  @ManyToOne(() => IncidentEntity, i => i.events) @JoinColumn({ name: 'incidentId' }) incident: IncidentEntity;
}
