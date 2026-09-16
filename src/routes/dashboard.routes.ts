import { Router } from 'express';
import { obtenerMetricasDashboard } from '../controllers/dashboard.controller.js';
import { validarJWT } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/metricas',validarJWT, obtenerMetricasDashboard);

export default router;