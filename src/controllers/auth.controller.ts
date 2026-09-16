import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Usuario from '../models/usuario.js';

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // 1. Verificar si el usuario existe
    const usuario = await Usuario.findOne({ email });
    if (!usuario) {
      res.status(400).json({ mensaje: 'Usuario o contraseña incorrectos' });
      return;
    }

    // 2. Verificar si el usuario está activo
    if (!usuario.estado) {
      res.status(403).json({ mensaje: 'El usuario se encuentra inactivo' });
      return;
    }

    // 3. Validar la contraseña
    const passwordValido = bcrypt.compareSync(password, usuario.password);
    if (!passwordValido) {
      res.status(400).json({ mensaje: 'Usuario o contraseña incorrectos' });
      return;
    }

    // 4. Generar el JWT
    const secret = process.env.JWT_SECRET || 'secret_key_default';
    const token = jwt.sign(
      { id: usuario._id, rol: usuario.rol },
      secret,
      { expiresIn: '8h' }
    );

    res.json({
      mensaje: 'Inicio de sesión exitoso',
      usuario: {
        id: usuario._id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email,
        rol: usuario.rol,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al iniciar sesión', error });
  }
};