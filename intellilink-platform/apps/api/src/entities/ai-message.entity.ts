import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
@Entity('ai_messages')
export class AiMessageEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column('uuid') sessionId: string;
  @Column({ type: 'enum', enum: ['user','assistant','system','tool'] }) role: string;
  @Column({ type: 'text' }) content: string;
  @Column({ type: 'simple-json', nullable: true }) toolCalls: any[];
  @CreateDateColumn({ name: 'timestamp' }) timestamp: Date;
}
