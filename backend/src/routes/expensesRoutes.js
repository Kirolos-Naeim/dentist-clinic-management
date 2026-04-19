import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { createExpense, deleteExpense, getExpenses, updateExpense } from '../controllers/expensesController.js';

const router = Router();

router.get('/', asyncHandler(getExpenses));
router.post('/', asyncHandler(createExpense));
router.put('/:id', asyncHandler(updateExpense));
router.delete('/:id', asyncHandler(deleteExpense));

export default router;
