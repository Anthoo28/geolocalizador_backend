import { Request, Response } from 'express';
import Sector from '../models/sector.js';
import Comisaria from '../models/comisaria.js';

export const obtenerSectores = async (_req: Request, res: Response): Promise<void> => {
  try {
    const sectores = await Sector.find().sort({ nombre: 1 });
    res.json({ data: sectores });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener sectores', error });
  }
};

export const obtenerComisarias = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sectorId } = req.query;
    const filtro: Record<string, any> = {};

    if (sectorId) {
      filtro.sector = sectorId;
    }

    const comisarias = await Comisaria.find(filtro)
      .populate('sector', 'nombre')
      .sort({ nombre: 1 });

    res.json({ data: comisarias });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener comisarías', error });
  }
};