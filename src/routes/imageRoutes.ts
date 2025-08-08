import { Router } from 'express';
import {
    createPixelImage,
} from '../controllers/imageController';

const router = Router();

router.post('/pixels', createPixelImage);

export default router;