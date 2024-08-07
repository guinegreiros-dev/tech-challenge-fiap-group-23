import express, { Request, Response } from 'express';
import multer from 'multer';
import { provideProductController } from '../controllers/product';

export const productRoutes = express.Router();

const upload = multer();

productRoutes.post('/', upload.single('image'), (req: Request, res: Response) => {
  provideProductController.createProduct(req, res);
});
productRoutes.delete('/:id', (req: Request, res: Response) => {
  provideProductController.deleteProduct(req, res);
});
productRoutes.put(
  '/:id',
  upload.single('image'),
  (req: Request, res: Response) => {
    provideProductController.editProduct(req, res);
  },
);
productRoutes.get('/categories/:id', (req: Request, res: Response) => {
  provideProductController.listProductsByCategory(req, res);
});
