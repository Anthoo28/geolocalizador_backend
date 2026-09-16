import dotenv from 'dotenv';
import path from 'path';
import bcrypt from 'bcryptjs';
import  conectarDB  from './config.js';
import Usuario from '../models/usuario.js';
import Sector from '../models/sector.js';
import Comisaria from '../models/comisaria.js';

dotenv.config({ path: path.resolve(process.cwd(), 'src/env/dev.env') });

const cargarDatosIniciales = async () => {
  await conectarDB();

  // Limpiar colecciones
  await Promise.all([
    Usuario.deleteMany({}),
    Sector.deleteMany({}),
    Comisaria.deleteMany({}),
  ]);

  // 1. Crear Sectores
  const sectorCentro = await Sector.create({ nombre: 'Sector Centro' });
  const sectorSanIsidro = await Sector.create({ nombre: 'Sector San Isidro' });

  // 2. Crear Comisarías
  await Comisaria.create({ nombre: 'Comisaría PNP Ica', sector: sectorCentro._id });
  await Comisaria.create({ nombre: 'Comisaría PNP San Isidro', sector: sectorSanIsidro._id });

  // 3. Crear Usuario Admin por defecto
  const passwordHasheado = bcrypt.hashSync('admin123', 10);
  await Usuario.create({
    nombre: 'Cesar',
    apellido: 'Andia',
    email: 'admin@ica.gob.pe',
    password: passwordHasheado,
    rol: 'ADMINISTRADOR',
    estado: true,
  });

  console.log('✅ Datos de prueba cargados exitosamente.');
  process.exit(0);
};

cargarDatosIniciales();