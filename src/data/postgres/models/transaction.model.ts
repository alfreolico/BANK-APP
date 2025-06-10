import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.model';

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  sender_id!: string;

  @Column({ type: 'uuid' })
  receiver_id!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount!: number;

  @CreateDateColumn()
  transaction_date!: Date;

  @ManyToOne(() => User, (user) => user.sentTransactions)
  @JoinColumn({ name: 'sender_id' })
  sender!: User;

  @ManyToOne(() => User, (user) => user.receivedTransactions)
  @JoinColumn({ name: 'receiver_id' })
  receiver!: User;
}
