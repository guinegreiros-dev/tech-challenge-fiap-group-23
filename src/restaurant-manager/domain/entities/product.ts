import { TableName } from '@/restaurant-manager/ports/utils/enums';
import { isNull, isInt, isString, validation } from 'aux/helpers/validation';
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export class Product {
  id?: number;
  categoryId!: number;
  name!: string;
  description?: string;
  price!: number;
  image?: Buffer;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(
    categoryId: number,
    name: string,
    price: number,
    description?: string,
    image?: Buffer,
    id?: number,
    createdAt?: Date,
    updatedAt?: Date,
  ) {
    this.id = id;
    this.categoryId = categoryId;
    this.name = name;
    this.description = description;
    this.price = price;
    this.image = image;
    this.createdAt = createdAt,
    this.updatedAt = updatedAt
  }

  validateProduct(product: Product): validation {
    try {

      if (!isInt(product.categoryId) || product.name == null) {
        return {
          isValid: false,
          message: 'invalid categoryId',
        };
      }
      if (!isString(product.name) || product.name == null) {
        return {
          isValid: false,
          message: 'invalid name',
        };
      }
      if (product.description !== undefined) {
        if (!isString(product.description)) {
          return {
            isValid: false,
            message: 'invalid description',
          };
        }
      }

      if (!isFinite(product.price) || !isNull(product.price) || product.price < 0) {
        return {
          isValid: false,
          message: 'invalid price',
        };
      }

      return { isValid: true };
    } catch (error) {
      if (error instanceof Error) {
        return { errorMessage: error.message };
      }
      throw error;
    }
  }
}

export type ProductServiceResponse = {
  created?: boolean;
  isValid?: boolean;
  wasFound?: boolean;
  products?: Product[];
  message?: string;
  error?: string;
};
