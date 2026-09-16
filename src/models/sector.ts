import { Schema, model} from 'mongoose';
import { IIncidencia } from './incidencia.js';

// Sector.ts

const SectorSchema = new Schema({
  nombre: { type: String, required: true, unique: true } // ej: "Sector Centro", "Sector San Isidro"
});
export const Sector = model('Sector', SectorSchema);

export default model('Sector', SectorSchema);