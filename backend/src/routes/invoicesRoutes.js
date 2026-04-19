import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { createInvoice, getInvoiceById, getInvoices } from '../controllers/invoicesController.js';

const router = Router();

router.get('/', asyncHandler(getInvoices));
router.get('/:id', asyncHandler(getInvoiceById));
router.post('/', asyncHandler(createInvoice));

export default router;
