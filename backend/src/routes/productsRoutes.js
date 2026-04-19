import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { createProduct, deleteProduct, getProducts, updateProduct } from '../controllers/productsController.js';

const router = Router();

router.get('/', asyncHandler(getProducts));
router.post('/', asyncHandler(createProduct));
router.put('/:id', asyncHandler(updateProduct));
router.delete('/:id', asyncHandler(deleteProduct));

export default router;
