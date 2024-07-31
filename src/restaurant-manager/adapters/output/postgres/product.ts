import { AppDataSource } from '..';
import { ProductRepositoryPort } from '@/restaurant-manager/ports/postgres/product';
import { Product } from '@/restaurant-manager/domain/entities/product';
import { ProductTable } from './tables';

export class ProductRepository implements ProductRepositoryPort {
  async save(product: Product): Promise<number | undefined> {
    try {
      const insertProduct = await AppDataSource.createQueryBuilder()
        .insert()
        .into(ProductTable)
        .values([
          {
            categoryId: product.categoryId,
            name: product.name,
            description: product.description,
            price: product.price,
            image: product.image,
          },
        ])
        .returning(['id'])
        .execute();

      return insertProduct.raw[0].id;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Error saving product: ${error.message}`);
      }
      throw new Error(`Error saving product: ${error}`);
    }
  }

  async delete(productId: number): Promise<boolean> {
    try {
      const deleteProduct = await AppDataSource.createQueryBuilder()
        .delete()
        .from(ProductTable)
        .where('id = :id', { id: productId })
        .execute();

      if (deleteProduct.affected === 0) {
        return false;
      }

      return true;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Error deleting product: ${error.message}`);
      }
      throw new Error(`Error deleting product: ${error}`);
    }
  }

  async edit(product: Product): Promise<void> {
    try {
      const productRepository = AppDataSource.getRepository(ProductTable);
      await productRepository.update({ id: product.id }, product);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Error when trying to update product: ${error.message}`);
      }
      throw new Error(`Error updating product: ${error}`);
    }
  }

  async listByCategory(categoryId: number): Promise<Product[]> {
    try {
      const listProductByCategory = await AppDataSource.createQueryBuilder()
        .select('products')
        .from(ProductTable, 'products')
        .where('products.categoryId = :categoryId', { categoryId: categoryId })
        .getMany();

        var products: Product[] = []
        listProductByCategory.forEach(element => {

          products.push(new Product(
            element.categoryId,
            element.name,
            element.price,
            element.description,
            element.image,
            element.id,
            element.createdAt,
            element.updatedAt
          ))
        });

      return products;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Error listing product: ${error.message}`);
      }
      throw new Error(`Error listing product: ${error}`);
    }
  }

  async existsProduct(name: string): Promise<boolean> {
    try {
      const product = await AppDataSource.createQueryBuilder()
        .select('products')
        .from(ProductTable, 'products')
        .where('products.name = :name', { name: name })
        .getOne();

      if (product === null) {
        return false;
      }

      return true;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Error checking existence product: ${error.message}`);
      }
      throw new Error(`Error checking existence product: ${error}`);
    }
  }

  async existsProductID(id: number): Promise<boolean> {
    try {
      const productRepository = AppDataSource.getRepository(ProductTable);

      const product = await productRepository.findOneBy({ id });

      if (!product) {
          return false
      }

      return true;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Error getting product by id: ${error.message}`);
      }
      throw new Error(`Error getting product by id: ${error}`);
    }
  }
}

export const provideProductRepository = new ProductRepository();
