import { AxiosResponse } from "axios";

export interface PaymentStatusServicePort {
  updatePaymentStatus(paymentId: string): Promise<AxiosResponse>
}
