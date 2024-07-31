import { AppDataSource } from '..';
import { OrderRepositoryPort } from '@/restaurant-manager/ports/postgres/order';
import { Order, OrderStatus } from '@/restaurant-manager/domain/entities/order';
import { OrderTable } from './tables';

export class OrderRepository implements OrderRepositoryPort {
  private repository = AppDataSource.getRepository(OrderTable);

  async save(order: Order): Promise<Order> {
    try{
      const insertOrder = await AppDataSource
      .createQueryBuilder()
      .insert()
      .into(OrderTable)
      .values([
        {
          customerId: order.customerId,
          paymentId: order.paymentId,
          command: order.command,
          orderStatus: order.orderStatus,
          totalPrice: order.totalPrice,
          items: order.items,
          orderUpdatedAt: order.orderUpdatedAt,
          createdAt: order.createdAt
        }
      ])
      .returning(['id', 'customerId', 'paymentId','command', 'orderStatus', 'totalPrice', 'items', 'orderUpdatedAt', 'createdAt' ])
      .execute()

      const orderRes = new Order(
        insertOrder.raw[0].command,
        insertOrder.raw[0].orderStatus,
        insertOrder.raw[0].totalPrice,
        insertOrder.raw[0].items,
        insertOrder.raw[0].orderUpdatedAt,
        insertOrder.raw[0].createdAt,
        insertOrder.raw[0].customerId,
        insertOrder.raw[0].id,
        order.qrCode,
        insertOrder.raw[0].paymentId
      )

      return orderRes

    } catch(error) {
      if(error instanceof Error)
        throw new Error(`Cannot insert the order. Details: ${error.message}`)
    throw new Error(`Cannot insert the order. Details: ${error}`)
    }
  }

  async retrieveById(id: number): Promise<Order | null> {
    const order = await this.repository
    .findOne({where: { id }})

    if (!order) {
      return null
    }

    return new Order(
      order.command,
      order.orderStatus,
      order.totalPrice,
      order.items,
      order.orderUpdatedAt,
      order.createdAt,
      order.customerId,
      order.id,
    );
  }

  async retrieveByFilters(orderStatus?: OrderStatus, customerId?: number): Promise<Order[] | null> {

    if (orderStatus && customerId) {
      var retriveredOrders = await AppDataSource.createQueryBuilder()
      .select('orders')
      .from(OrderTable, 'orders')
      .where('orders.orderStatus = :orderStatus', { orderStatus: orderStatus })
      .andWhere('orders.customerId = :customerId', { customerId: customerId })
      .getMany();

      var orders: Order[] = []
      retriveredOrders.forEach(element => {
        orders.push(new Order(
          element.command,
          element.orderStatus,
          element.totalPrice,
          element.items,
          element.orderUpdatedAt,
          element.createdAt,
          element.customerId,
          element.id
        ))
      });

      return orders
    }

    if(orderStatus){
      var retriveredOrders = await AppDataSource.createQueryBuilder()
      .select('orders')
        .from(OrderTable, 'orders')
        .where('orders.orderStatus = :orderStatus', { orderStatus: orderStatus })
        .getMany();

      var orders: Order[] = []
      retriveredOrders.forEach(element => {
        orders.push(new Order(
          element.command,
          element.orderStatus,
          element.totalPrice,
          element.items,
          element.orderUpdatedAt,
          element.createdAt,
          element.customerId,
          element.id
        ))
      });

      return orders
    }

    if(customerId){
      var retriveredOrders = await AppDataSource.createQueryBuilder()
      .select('orders')
      .from(OrderTable, 'orders')
      .where('orders.customerId = :customerId', { customerId: customerId })
      .getMany();

      var orders: Order[] = []
      retriveredOrders.forEach(element => {
        orders.push(new Order(
          element.command,
          element.orderStatus,
          element.totalPrice,
          element.items,
          element.orderUpdatedAt,
          element.createdAt,
          element.customerId,
          element.id
        ))
      });

      return orders
    }

    return null
  }

    async retrieveOrdersIDByOpenPayments(): Promise<number[]> {
      var retriveredOrdersID = await this.repository.find({
        select:['id'],
        where:{orderStatus: OrderStatus.WaitingPayment}
      })

      var ordersIDs: number[] = []
      retriveredOrdersID.forEach(element => {
        if(element.id != undefined) {
          ordersIDs.push(element.id)
        }
      });

      return ordersIDs
    }

    async retrieveAllOrders(): Promise<Order[]> {
      var retriveredOrders = await AppDataSource.createQueryBuilder()
      .select('orders')
        .from(OrderTable, 'orders')
        .where('orders.orderStatus != :orderStatus', { orderStatus: OrderStatus.WaitingPayment})
        .orderBy('orders.createdAt')
        .getMany();


      var ordersReady: Order[] = []
      var ordersPreparing: Order[] = []
      var ordersReceived: Order[] = []

      retriveredOrders.forEach(element => {
        if(element.orderStatus === OrderStatus.Ready) {
          ordersReady.push(new Order(
            element.command,
            element.orderStatus,
            element.totalPrice,
            element.items,
            element.orderUpdatedAt,
            element.createdAt,
            element.customerId,
            element.id
          ))
        }

        if(element.orderStatus === OrderStatus.Preparing) {
          ordersPreparing.push(new Order(
            element.command,
            element.orderStatus,
            element.totalPrice,
            element.items,
            element.orderUpdatedAt,
            element.createdAt,
            element.customerId,
            element.id
          ))
        }

        if(element.orderStatus === OrderStatus.Received) {
          ordersReceived.push(new Order(
            element.command,
            element.orderStatus,
            element.totalPrice,
            element.items,
            element.orderUpdatedAt,
            element.createdAt,
            element.customerId,
            element.id
          ))
        }
      });

      var orders = ordersReady.concat(ordersPreparing, ordersReceived)

      return orders
    }

  async update(order: Order): Promise<void> {
    try{
      await AppDataSource
      .createQueryBuilder()
      .update(OrderTable)
      .set({
        command: order.command,
        orderStatus: order.orderStatus,
        totalPrice: order.totalPrice,
        items: order.items,
        orderUpdatedAt: order.orderUpdatedAt})
        .where('orders.id = :id', { id: order.id })
        .execute();

    } catch(error) {
      if(error instanceof Error)
        throw new Error(`Cannot update the order. Details: ${error.message}`)
    throw new Error(`Cannot update the order. Details: ${error}`)
    }
  }

  async updatePayment(paymentId: string): Promise<void> {
    try{
      await AppDataSource
      .createQueryBuilder()
      .update(OrderTable)
      .set({
        orderStatus: OrderStatus.Received })
        .where('paymentId = :paymentId', { paymentId: paymentId })
        .execute();

    } catch(error) {
      if(error instanceof Error)
        throw new Error(`Cannot update the order. Details: ${error.message}`)
    throw new Error(`Cannot update the order. Details: ${error}`)
    }
  }
}

export const provideOrderRepository = new OrderRepository();
