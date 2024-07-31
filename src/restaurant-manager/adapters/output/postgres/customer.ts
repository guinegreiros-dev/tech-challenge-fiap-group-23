import { AppDataSource } from '..';
import { CustomerRepositoryPort } from '@/restaurant-manager/ports/postgres/customer';
import { Customer } from '@/restaurant-manager/domain/entities/customer';
import { CustomerTable } from './tables';

export class CustomerRepository implements CustomerRepositoryPort {
  async save(customer: Customer): Promise<Customer> {
    try {
      const insertCustomer = await AppDataSource.createQueryBuilder()
        .insert()
        .into(CustomerTable)
        .values([{ name: customer.name, cpf: customer.cpf, email: customer.email }])
        .returning(['id', 'name', 'cpf', 'email', 'createdAt'])
        .execute();

      const customerRes = new Customer(
        insertCustomer.raw[0].name,
        insertCustomer.raw[0].cpf,
        insertCustomer.raw[0].email,
        insertCustomer.raw[0].created_at,
        insertCustomer.raw[0].id,
      )

      return customerRes
    } catch (error) {
      console.log(error)
      if (error instanceof Error)
        throw new Error(`Error adding customer: ${error.message}`);
      throw new Error(`Error adding customer: ${error}`);
    }
  }

  async searchByCpf(paramCpf: string): Promise<Customer | undefined> {
    try {
      const searchCustomer = await AppDataSource.createQueryBuilder()
        .select('customers')
        .from(CustomerTable, 'customers')
        .where('customers.cpf = :cpf', { cpf: paramCpf })
        .getOne();

      if (searchCustomer == null) {
        return undefined;
      }

      return new Customer(
        searchCustomer!.name,
        searchCustomer!.cpf,
        searchCustomer!.email,
        searchCustomer!.created_at,
        searchCustomer!.id,
      )
    } catch (error) {
      console.log(error)
      if (error instanceof Error) throw new Error(`Error when searching for cpf: ${error.message}`);
      throw new Error(`Error when searching for cpf: ${error}`);
    }
  }

  async searchById(id: number): Promise<Customer | undefined> {
    const searchCustomer = await AppDataSource.getRepository(CustomerTable)
    .findOne({where: { id }})
    if (searchCustomer === null) {
      return undefined;
    }

    return new Customer(
      searchCustomer!.name,
      searchCustomer!.cpf,
      searchCustomer!.email,
      searchCustomer!.created_at,
      searchCustomer!.id,
    );
  }
}

export const provideCustomerRepository = new CustomerRepository();
