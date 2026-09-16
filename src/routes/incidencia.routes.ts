import { Router } from 'express';
import { validarJWT } from '../middlewares/auth.middleware.js';
import { uploadEvidencias } from '../middlewares/upload.middleware.js';
import {
  crearIncidencia,
  obtenerIncidencias,
  obtenerIncidenciaPorId,
  obtenerCercanas,
  cambiarEstado,
  actualizarIncidencia,
} from '../controllers/incidencia.js';

const router = Router();

// Rutas de lectura pública/operativa
router.get('/', obtenerIncidencias);
router.get('/cercanas', obtenerCercanas);
router.get('/:id', obtenerIncidenciaPorId);

// Rutas protegidas
router.post('/', validarJWT, crearIncidencia);
router.patch('/:id/estado', validarJWT, cambiarEstado);
router.put('/:id', validarJWT, actualizarIncidencia);

// Subida de evidencias (imágenes)
router.post('/upload', validarJWT, uploadEvidencias.array('evidencias', 5), (req, res) => {
  try {
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      res.status(400).json({ mensaje: 'No se ha adjuntado ningún archivo' });
      return;
    }

    const urls = files.map((file) => `/uploads/${file.filename}`);

    res.json({
      mensaje: 'Imágenes subidas correctamente',
      urls,
    });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al subir las imágenes', error });
  }
});

export default router;