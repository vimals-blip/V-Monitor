import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
@Entity('notifications')
export class NotificationEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column('uuid') organizationId: string;
  @Column('uuid', { nullable: true }) tenantId: string;
  @Column('uuid', { nullable: true }) userId: string;
  @Column({ type: 'enum', enum: ['EMAIL','WEBHOOK','IN_APP'], default: 'IN_APP' }) channel: string;
  @Column() title: string;
  @Column({ type: 'text' }) body: string;
  @Column({ type: 'enum', enum: ['INFO','WARNING','HIGH','CRITICAL'], default: 'INFO' }) severity: string;
  @Column({ default: false }) read: boolean;
  @Column({ type: 'timestamp', nullable: true }) sentAt: Date;
  @Column({ type: 'simple-json', nullable: true }) metadata: Record<string, any>;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
