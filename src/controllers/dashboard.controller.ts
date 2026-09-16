import { Request, Response } from 'express';
import Incidencia from '../models/incidencia.js';

export const obtenerMetricasDashboard = async (_req: Request, res: Response): Promise<void> => {
  try {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    // Contadores para tarjetas
    const [registradas, enAtencion, atendidas, cerradas, totalHoy] = await Promise.all([
      Incidencia.countDocuments({ estado: 'REGISTRADA' }),
      Incidencia.countDocuments({ estado: 'EN_ATENCION' }),
      Incidencia.countDocuments({ estado: 'ATENDIDA' }),
      Incidencia.countDocuments({ estado: 'CERRADA' }),
      Incidencia.countDocuments({ fechaHora: { $gte: hoy } }),
    ]);

    // Agrupaciones para gráficos
    const porTipo = await Incidencia.aggregate([
      { $group: { _id: '$tipoDelito', total: { $sum: 1 } } }
    ]);

    const porSector = await Incidencia.aggregate([
      { $group: { _id: '$sector', total: { $sum: 1 } } },
      { $lookup: { from: 'sectors', localField: '_id', foreignField: '_id', as: 'infoSector' } }
    ]);

    res.json({
      kpis: { registradas, enAtencion, atendidas, cerradas, totalHoy },
      graficos: { porTipo, porSector }
    });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al cargar métricas', error });
  }
};