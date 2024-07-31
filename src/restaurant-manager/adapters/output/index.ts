import { DATABASE_HOST, DATABASE_PORT, DATABASE_USER, DATABASE_PASSWORD, DATABASE } from 'env';
import { DataSource } from 'typeorm';
import { CustomerTable, OrderTable, ProductTable } from './postgres/tables';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: DATABASE_HOST,
  port: DATABASE_PORT,
  username: DATABASE_USER,
  password: DATABASE_PASSWORD,
  database: DATABASE,
  entities: [ProductTable, CustomerTable, OrderTable],
  synchronize: true,
  logging: ['log', 'error'],
});

AppDataSource.initialize()
  .then(() => {
    console.log('Data Source has been initialized!');
  })
  .catch((error) => console.log("aff", error));
