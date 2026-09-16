import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import Usuario from '../models/usuario.js';

// 1. Listar todos los usuarios (con búsqueda opcional por nombre o email)
export const obtenerUsuarios = async (req: Request, res: Response): Promise<void> => {
  try {
    const { busqueda, rol, estado } = req.query;
    const filtro: Record<string, any> = {};

    if (rol) filtro.rol = rol;
    if (estado !== undefined) filtro.estado = estado === 'true';

    if (busqueda) {
      filtro.$or = [
        { nombre: { $regex: busqueda, $options: 'i' } },
        { apellido: { $regex: busqueda, $options: 'i' } },
        { email: { $regex: busqueda, $options: 'i' } },
      ];
    }

    const usuarios = await Usuario.find(filtro)
      .select('-password') // Excluye la contraseña de la respuesta
      .sort({ createdAt: -1 });

    res.json({ total: usuarios.length, data: usuarios });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener usuarios', error });
  }
};

// 2. Obtener un usuario por ID
export const obtenerUsuarioPorId = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const usuario = await Usuario.findById(id).select('-password');

    if (!usuario) {
      res.status(404).json({ mensaje: 'Usuario no encontrado' });
      return;
    }

    res.json({ data: usuario });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener el usuario', error });
  }
};

// 3. Crear un nuevo usuario (Operador o Administrador)
export const crearUsuario = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nombre, apellido, email, password, rol = 'OPERADOR' } = req.body;

    if (!nombre || !apellido || !email || !password) {
      res.status(400).json({ mensaje: 'Todos los campos obligatorios deben ser completados' });
      return;
    }

    // Validar si el correo ya existe
    const existeEmail = await Usuario.findOne({ email });
    if (existeEmail) {
      res.status(400).json({ mensaje: 'El correo electrónico ya está registrado' });
      return;
    }

    // Hashear contraseña
    const salt = bcrypt.genSaltSync(10);
    const passwordHasheado = bcrypt.hashSync(password, salt);

    const nuevoUsuario = new Usuario({
      nombre,
      apellido,
      email,
      password: passwordHasheado,
      rol,
      estado: true,
    });

    await nuevoUsuario.save();

    const usuarioRespuesta = nuevoUsuario.toObject();
    delete (usuarioRespuesta as any).password;

    res.status(201).json({ mensaje: 'Usuario creado exitosamente', data: usuarioRespuesta });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al crear el usuario', error });
  }
};

// 4. Actualizar datos de un usuario
export const actualizarUsuario = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { password, email, ...datosActualizar } = req.body;

    // Si se envía contraseña nueva, se hashea
    if (password) {
      const salt = bcrypt.genSaltSync(10);
      datosActualizar.password = bcrypt.hashSync(password, salt);
    }

    const usuarioActualizado = await Usuario.findByIdAndUpdate(
      id,
      { $set: datosActualizar },
      { new: true, runValidators: true }
    ).select('-password');

    if (!usuarioActualizado) {
      res.status(404).json({ mensaje: 'Usuario no encontrado' });
      return;
    }

    res.json({ mensaje: 'Usuario actualizado correctamente', data: usuarioActualizado });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar el usuario', error });
  }
};

// 5. Cambiar el estado (Activar / Desactivar)
export const cambiarEstadoUsuario = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    if (typeof estado !== 'boolean') {
      res.status(400).json({ mensaje: 'El valor de estado debe ser un booleano (true/false)' });
      return;
    }

    const usuario = await Usuario.findByIdAndUpdate(
      id,
      { $set: { estado } },
      { new: true }
    ).select('-password');

    if (!usuario) {
      res.status(404).json({ mensaje: 'Usuario no encontrado' });
      return;
    }

    res.json({ mensaje: `Usuario ${estado ? 'activado' : 'desactivado'} correctamente`, data: usuario });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al cambiar estado del usuario', error });
  }
};