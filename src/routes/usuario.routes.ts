import { Router } from 'express';
import { validarJWT } from '../middlewares/auth.middleware.js';
import { esAdmin } from '../middlewares/rol.middleware.js';
import {
  obtenerUsuarios,
  obtenerUsuarioPorId,
  crearUsuario,
  actualizarUsuario,
  cambiarEstadoUsuario,
} from '../controllers/usuario.controller.js';

const router = Router();

// Aplicar middlewares globales a todas las rutas de este módulo
router.use(validarJWT, esAdmin);

router.get('/', obtenerUsuarios);
router.get('/:id', obtenerUsuarioPorId);
router.post('/', crearUsuario);
router.put('/:id', actualizarUsuario);
router.patch('/:id/estado', cambiarEstadoUsuario);

export default router;