import { Customer } from "@/domain/entities/customer";


export interface CustomerServicePort {
    create(customer: Customer): Promise<Customer | string>
    searchByCpf(cpf: string): Promise<Customer | string>
    searchById(id: number): Promise<Customer | null>
}
