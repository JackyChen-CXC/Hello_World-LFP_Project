import { uploadStateTaxMiddleware, uploadStateTaxFile } from '../controllers/stateTaxUploadController';
import { Router } from 'express';

const stateTaxRouter = Router();
stateTaxRouter.post('/upload-state-tax', uploadStateTaxMiddleware, uploadStateTaxFile);

export default stateTaxRouter;