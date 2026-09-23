import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
@Entity('ai_sessions')
export class AiSessionEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column('uuid') userId: string;
  @Column('uuid') organizationId: string;
  @Column('uuid', { nullable: true }) tenantId: string;
  @Column({ nullable: true }) title: string;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
