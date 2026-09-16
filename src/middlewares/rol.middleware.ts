import { Request, Response, NextFunction } from 'express';

export const esAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.usuario) {
    res.status(500).json({ mensaje: 'Se requiere verificar el token primero' });
    return;
  }

  if (req.usuario.rol !== 'ADMINISTRADOR') {
    res.status(403).json({ mensaje: 'Acceso denegado: Requiere rol de ADMINISTRADOR' });
    return;
  }

  next();
};