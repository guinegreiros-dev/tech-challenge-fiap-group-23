import { OrderItem, OrderStatus, OrderUpdateInfo } from "@/restaurant-manager/domain/entities/order";
import { TableName } from "@/restaurant-manager/ports/utils/enums";
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity({ name: TableName.ORDER })
export class OrderTable {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ nullable: true })
  customerId?: number;

  @Column({ name: 'paymentId', nullable: false })
  paymentId?: string;

  @Column()
  command!: number;

  @Column({ type: 'enum', enum: OrderStatus })
  orderStatus!: OrderStatus;

  @Column('decimal', { precision: 10, scale: 2 })
  totalPrice!: number;

  @Column("jsonb")
  items!: OrderItem[];

  @Column("jsonb")
  orderUpdatedAt!: OrderUpdateInfo[];

  @Column()
  createdAt!: Date;
}

@Entity({ name: TableName.PRODUCT })
export class ProductTable {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column()
  categoryId!: number;

  @Column({
    unique: true,
  })
  name!: string;

  @Column({
    nullable: true,
    type: 'text',
  })
  description?: string;

  @Column('numeric', {
    scale: 2,
    transformer: {
      from: (value) => (value === null ? null : Number(value)),
      to: (value) => value,
    },
  })
  price!: number;

  @Column('bytea', { nullable: true })
  image?: Buffer;

  @CreateDateColumn()
  createdAt?: Date;

  @UpdateDateColumn()
  updatedAt?: Date;
}

@Entity({ name: TableName.CUSTOMER })
export class CustomerTable {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column()
  name!: string;

  @Column({
    length: 11,
    unique: true
  })
  cpf!: string;

  @Column('text')
  email!: string;

  @CreateDateColumn()
  created_at?: Date;
}
