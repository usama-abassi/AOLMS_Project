import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { Order } from '../orders/orders.entity';
import { Profile } from '../profiles/profiles.entity';

export enum DeliveryStatus {
  Draft = 'draft',
  Submitted = 'submitted',
  Locked = 'locked',
}

@Entity({ name: 'delivery_submissions' })
export class DeliverySubmission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Order, (order) => order.id)
  order_id: string;

  @ManyToOne(() => Profile, (profile) => profile.id)
  technician_id: string;

  @Column({ type: 'enum', enum: DeliveryStatus })
  status: DeliveryStatus;

  @Column()
  last_saved_at: Date;

  @Column({ nullable: true })
  submitted_at: Date;

  @Column({ nullable: true })
  edit_deadline: Date;

  @Column({ default: false })
  actioned: boolean;

  @Column({ nullable: true })
  sub_root_cause: string;

  @Column({ nullable: true })
  item_category: string;

  @Column({ nullable: true })
  ont_protection: string;

  @Column({ nullable: true })
  internal_wiring: string;

  @Column({ nullable: true })
  actual_actioned_item: string;

  @Column({ nullable: true })
  actual_actioned_sub_item: string;

  @Column({ nullable: true })
  cable_type: string;

  @Column({ nullable: true })
  cable_length: number;

  @Column({ nullable: true })
  conduit_clearance: string;

  @Column({ nullable: true })
  conduit_pipe: string;

  @Column({ nullable: true })
  pvc_trunk: string;

  @Column({ nullable: true })
  total_conduit: number;

  @Column({ nullable: true })
  mims_sn: string;

  @Column({ nullable: true })
  nce_sn: string;

  @Column({ nullable: true })
  ap1_sn: string;

  @Column({ nullable: true })
  ap2_sn: string;

  @Column({ nullable: true })
  ap3_sn: string;

  @Column({ nullable: true })
  ap4_sn: string;

  @Column({ nullable: true })
  retrieved_cpe: string;

  @Column({ nullable: true })
  remarks: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}