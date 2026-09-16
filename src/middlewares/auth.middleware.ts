import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface IPayload {
  id: string;
  rol: string;
  iat: number;
  exp: number;
}

export const validarJWT = (req: Request, res: Response, next: NextFunction): void => {
  const token = req.header('Authorization')?.replace('Bearer ', '') || req.header('x-token');

  if (!token) {
    res.status(401).json({ mensaje: 'Acceso denegado. No se proporcionó un token válido.' });
    return;
  }

  try {
    const secret = process.env.JWT_SECRET || 'secret_key_default';
    const payload = jwt.verify(token, secret) as IPayload;

    req.usuario = {
      id: payload.id,
      rol: payload.rol,
    };

    next();
  } catch (error) {
    res.status(401).json({ mensaje: 'Token no válido o expirado' });
  }
};