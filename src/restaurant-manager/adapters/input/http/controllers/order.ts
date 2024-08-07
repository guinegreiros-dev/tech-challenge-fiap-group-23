import { UpdateOrderRequest, validateOrderStatus, validatePaymentStatus } from '@/restaurant-manager/domain/entities/order';
import { provideOrderService } from '@/restaurant-manager/domain/services/order';
import { OrderControllerPort } from '@/restaurant-manager/ports/controllers/order';
import { OrderServicePort } from '@/restaurant-manager/ports/services/order';
import { Request, Response } from 'express';

export class OrderController implements OrderControllerPort {
  private orderService: OrderServicePort;

  constructor() {
    this.orderService = provideOrderService;
  }

  async createOrder(req: Request, res: Response): Promise<Response> {
    try {
      const response = await this.orderService.create(req.body);
      if (response.erros != null && response.erros.length > 0) {
        return res.status(400).json(response.erros);
      }

      return res.status(201).json(response.order);
    } catch (error) {
      console.error('Error creating order: ', error);
      return res.status(500).send('Failed to save the request.');
    }
  }

  async getOrderById(req: Request, res: Response): Promise<Response> {
    try {
      const orderId = Number(req.params.id);
      const response = await this.orderService.getById(orderId);

      if (!response) {
        return res.status(404).send('Order id was not found');
      }

      return res.status(200).send(response);
    } catch (error) {
      console.error('Error fetching order by id: ', error);
      return res.status(500).send('Internal Server Error');
    }
  }

  async getOrdersByStatusAndCustomer(req: Request, res: Response): Promise<Response> {
    try {
      const { order_status, customer_id } = req.query;

      const orderStatus: string | undefined = order_status ? (order_status as string) : undefined;
      const customerId: number | undefined = customer_id
        ? parseInt(customer_id as string)
        : undefined;

      const response = await this.orderService.findByFilters(orderStatus, customerId);
      if (response.erros && response.erros.length > 0) {
        return res.status(400).json({ messages: response.message });
      }

      if (!response) {
        return res.status(404).send('Orders was not found');
      }

      return res.status(200).json(response);
    } catch (error) {
      console.error('Error fetching orders:', error);
      return res.status(500).send('Internal Server Error');
    }
  }

  async updateStatus(req: Request, res: Response): Promise<Response> {
    try {
      const orderRequest: UpdateOrderRequest = {
        order_id: Number(req.params.id),
        order_status: req.body.order_status,
      };

      const validationError = validateOrderStatus(orderRequest.order_status);

      if (validationError.length > 0) {
        return res.status(400).json({ messages: validationError });
      }

      await this.orderService.updateStatus(orderRequest);
      return res.status(200).send({ message: 'Order status was updated' });
    } catch (error) {
      console.error('Error updating order:', error);
      return res.status(500).send({ message: 'Internal Server Error' });
    }
  }

  async getOrdersIDOpenPayments(req: Request, res: Response): Promise<Response> {
    try {
      const response = await this.orderService.findOrdersIDOpenPayments();

      return res.status(200).json(response);
    } catch (error) {
      console.error('Error fetching orders:', error);
      return res.status(500).send('Internal Server Error');
    }
  }

  async getAllOrders(req: Request, res: Response): Promise<Response> {
    try {
      const response = await this.orderService.findAllOrders();

      return res.status(200).json(response);
    } catch (error) {
      console.error('Error fetching orders:', error);
      return res.status(500).send('Internal Server Error');
    }
  }

  async updatePaymentStatus(req: Request, res: Response): Promise<Response> {
    try {
      const paymentId = req.params.id

      const validationError = validatePaymentStatus(paymentId);

      if (validationError.length > 0) {
        return res.status(400).json({ messages: validationError });
      }

      await this.orderService.updatePaymentStatus(paymentId);
      return res.status(200).send({ message: 'Payment status was updated' });
    } catch (error) {
      console.error('Error updating payment:', error);
      return res.status(500).send({ message: 'Internal Server Error' });
    }
  }
}

export const provideOrderController = new OrderController();
