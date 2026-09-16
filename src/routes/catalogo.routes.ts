import { Router } from 'express';
import { obtenerSectores, obtenerComisarias } from '../controllers/catalogo.controller.js';

const router = Router();

router.get('/sectores', obtenerSectores);
router.get('/comisarias', obtenerComisarias);

export default router;