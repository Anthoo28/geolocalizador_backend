import { Request, Response } from 'express';
import Incidencia from '../models/incidencia.js';

// Función auxiliar para generar un código de incidencia correlativo (ej: INC-2026-00001)
const generarCodigoIncidencia = async (): Promise<string> => {
  const anioActual = new Date().getFullYear();
  const total = await Incidencia.countDocuments();
  const correlativo = String(total + 1).padStart(5, '0');
  return `INC-${anioActual}-${correlativo}`;
};

// 1. Registrar una nueva incidencia
export const crearIncidencia = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      codigo,
      titulo,
      tipoDelito,
      descripcion,
      prioridad,
      estado = 'REGISTRADA',
      fechaHora,
      direccion,
      referencia,
      sector,
      comisaria,
      asignadoA,
      evidencias = [],
      latitud,
      longitud,
    } = req.body;

    if (latitud === undefined || longitud === undefined) {
      res.status(400).json({ mensaje: 'Las coordenadas (latitud y longitud) son obligatorias' });
      return;
    }

    if (!titulo || !tipoDelito || !descripcion) {
      res.status(400).json({ mensaje: 'Los campos título, tipoDelito y descripción son obligatorios' });
      return;
    }

    // Extrae el usuario desde el JWT (req.usuario) o fallback a req.body si aplica
    const usuarioId = req.usuario?.id || req.body.registradoPor || null;
    const codigoFinal = codigo || (await generarCodigoIncidencia());
    const fechaActual = fechaHora ? new Date(fechaHora) : new Date();

    const nuevaIncidencia = new Incidencia({
      codigo: codigoFinal,
      titulo,
      tipoDelito,
      descripcion,
      prioridad,
      estado,
      fechaHora: fechaActual,
      direccion,
      referencia,
      sector: sector || null,
      comisaria: comisaria || null,
      registradoPor: usuarioId,
      asignadoA: asignadoA || null,
      evidencias,
      historialEstados: [
        {
          estado,
          fecha: fechaActual,
          usuario: usuarioId,
          comentario: 'Incidencia registrada en el sistema',
        },
      ],
      ubicacion: {
        type: 'Point',
        coordinates: [Number(longitud), Number(latitud)],
      },
    });

    await nuevaIncidencia.save();
    res.status(201).json({ mensaje: 'Incidencia registrada correctamente', data: nuevaIncidencia });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al registrar la incidencia', error });
  }
};

// 2. Obtener incidencias con filtros y búsqueda (Listado / Mapa)
export const obtenerIncidencias = async (req: Request, res: Response): Promise<void> => {
  try {
    const { tipoDelito, estado, sector, comisaria, desde, hasta, busqueda } = req.query;

    const filtro: Record<string, any> = {};

    if (tipoDelito) filtro.tipoDelito = tipoDelito;
    if (estado) filtro.estado = estado;
    if (sector) filtro.sector = sector;
    if (comisaria) filtro.comisaria = comisaria;

    if (desde || hasta) {
      filtro.fechaHora = {};
      if (desde) filtro.fechaHora.$gte = new Date(desde as string);
      if (hasta) filtro.fechaHora.$lte = new Date(hasta as string);
    }

    if (busqueda) {
      filtro.$or = [
        { codigo: { $regex: busqueda, $options: 'i' } },
        { titulo: { $regex: busqueda, $options: 'i' } },
        { descripcion: { $regex: busqueda, $options: 'i' } },
      ];
    }

    const incidencias = await Incidencia.find(filtro)
      .populate('sector', 'nombre')
      .populate('comisaria', 'nombre')
      .populate('registradoPor', 'nombre apellido email')
      .populate('asignadoA', 'nombre apellido email')
      .sort({ fechaHora: -1 });

    res.json({ total: incidencias.length, data: incidencias });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener las incidencias', error });
  }
};

// 3. Obtener el detalle de una incidencia por ID
export const obtenerIncidenciaPorId = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const incidencia = await Incidencia.findById(id)
      .populate('sector')
      .populate('comisaria')
      .populate('registradoPor', 'nombre apellido email')
      .populate('asignadoA', 'nombre apellido email')
      .populate('historialEstados.usuario', 'nombre apellido');

    if (!incidencia) {
      res.status(404).json({ mensaje: 'Incidencia no encontrada' });
      return;
    }

    res.json({ data: incidencia });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener el detalle de la incidencia', error });
  }
};

// 4. Buscar incidencias cercanas por coordenada y radio
export const obtenerCercanas = async (req: Request, res: Response): Promise<void> => {
  try {
    const { lat, lng, radioMetros = 3000 } = req.query;

    if (!lat || !lng) {
      res.status(400).json({ mensaje: 'Coordenadas lat y lng requeridas' });
      return;
    }

    const cercanas = await Incidencia.find({
      ubicacion: {
        $near: {
          $geometry: { type: 'Point', coordinates: [Number(lng), Number(lat)] },
          $maxDistance: Number(radioMetros),
        },
      },
    })
      .populate('sector', 'nombre')
      .populate('comisaria', 'nombre');

    res.json({ total: cercanas.length, radioMetros: Number(radioMetros), data: cercanas });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al buscar incidencias cercanas', error });
  }
};

// 5. Cambiar el estado de la incidencia (y registrar entrada en el historial)
export const cambiarEstado = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { estado, comentario } = req.body;

    if (!estado) {
      res.status(400).json({ mensaje: 'El nuevo estado es obligatorio' });
      return;
    }

    const incidencia = await Incidencia.findById(id);

    if (!incidencia) {
      res.status(404).json({ mensaje: 'Incidencia no encontrada' });
      return;
    }

    // Usuario autenticado extraído automáticamente desde el middleware JWT
    const usuarioId = req.usuario?.id || req.body.usuarioId || null;

    incidencia.estado = estado;
    incidencia.historialEstados.push({
      estado,
      fecha: new Date(),
      usuario: usuarioId,
      comentario: comentario || `Estado cambiado a ${estado}`,
    });

    await incidencia.save();

    res.json({ mensaje: 'Estado actualizado correctamente', data: incidencia });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar el estado', error });
  }
};

// 6. Editar una incidencia existente
export const actualizarIncidencia = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { latitud, longitud, ...datosActualizar } = req.body;

    if (latitud !== undefined && longitud !== undefined) {
      datosActualizar.ubicacion = {
        type: 'Point',
        coordinates: [Number(longitud), Number(latitud)],
      };
    }

    const incidenciaActualizada = await Incidencia.findByIdAndUpdate(
      id,
      { $set: datosActualizar },
      { new: true, runValidators: true }
    );

    if (!incidenciaActualizada) {
      res.status(404).json({ mensaje: 'Incidencia no encontrada' });
      return;
    }

    res.json({ mensaje: 'Incidencia actualizada correctamente', data: incidenciaActualizada });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar la incidencia', error });
  }
};