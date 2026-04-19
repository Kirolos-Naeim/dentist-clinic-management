import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  addPatientVisit,
  createPatient,
  deletePatient,
  getPatientById,
  getPatients,
  updatePatient,
} from '../controllers/patientsController.js';

const router = Router();

router.get('/', asyncHandler(getPatients));
router.get('/:id', asyncHandler(getPatientById));
router.post('/', asyncHandler(createPatient));
router.put('/:id', asyncHandler(updatePatient));
router.delete('/:id', asyncHandler(deletePatient));
router.post('/:id/visits', asyncHandler(addPatientVisit));

export default router;
