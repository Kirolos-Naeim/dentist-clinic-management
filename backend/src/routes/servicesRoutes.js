import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { createService, deleteService, getServices, updateService } from '../controllers/servicesController.js';

const router = Router();

router.get('/', asyncHandler(getServices));
router.post('/', asyncHandler(createService));
router.put('/:id', asyncHandler(updateService));
router.delete('/:id', asyncHandler(deleteService));

export default router;
