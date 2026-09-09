import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { Order } from '../orders/orders.entity';
import { Profile } from '../profiles/profiles.entity';

export enum AssignmentStatus {
  Assigned = 'assigned',
  InProgress = 'in_progress',
  Completed = 'completed',
  Cancelled = 'cancelled',
}

@Entity({ name: 'order_assignments' })
export class OrderAssignment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Order, (order) => order.id)
  order_id: string;

  @ManyToOne(() => Profile, (profile) => profile.id)
  technician_id: string;

  @ManyToOne(() => Profile, (profile) => profile.id)
  assigned_by: string;

  @Column({ type: 'enum', enum: AssignmentStatus })
  assignment_status: AssignmentStatus;

  @Column({ nullable: true })
  assigned_at: Date;

  @Column({ nullable: true })
  completed_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}