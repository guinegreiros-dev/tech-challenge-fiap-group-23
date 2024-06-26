import { Product } from '@/domain/entities/product';
import { ProductRepositoryPort } from '@/ports/postgres/product';
import { AppDataSource } from '@/adapters/output/index';

export class ProductRepository implements ProductRepositoryPort {
  async save(product: Product): Promise<number | undefined> {
    try {
      const insertProduct = await AppDataSource.createQueryBuilder()
        .insert()
        .into(Product)
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
        .from(Product)
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

  async edit(productId: number, product: Partial<Product>): Promise<void> {
    try {
      const productRepository = AppDataSource.getRepository(Product);
      await productRepository.update({ id: productId }, product);
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
        .from(Product, 'products')
        .where('products.categoryId = :categoryId', { categoryId: categoryId })
        .getMany();

      return listProductByCategory;
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
        .from(Product, 'products')
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

  async getById(id: number): Promise<Product | null> {
    try {
      const productRepository = AppDataSource.getRepository(Product);

      const product = await productRepository.findOneBy({ id });

      !product && console.info(`[INFO] Product id ${id} was not found in the database`);

      return product;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Error getting product by id: ${error.message}`);
      }
      throw new Error(`Error getting product by id: ${error}`);
    }
  }
}

export const provideProductRepository = new ProductRepository();
