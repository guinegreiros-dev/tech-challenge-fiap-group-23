import { Product, ProductServiceResponse } from '@/domain/entities/product';

export interface ProductServicePort {
    create(product: Product): Promise<ProductServiceResponse>
    delete(productId: number): Promise<ProductServiceResponse>
    listByCategory(categoryId: number): Promise<ProductServiceResponse>
}