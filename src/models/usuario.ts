import { Schema, model } from 'mongoose';

const UsuarioSchema = new Schema({
  nombre: { type: String, required: true },
  apellido: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  rol: { 
    type: String, 
    enum: ['ADMINISTRADOR', 'OPERADOR', 'CONSULTOR', 'CIUDADANO'], 
    default: 'OPERADOR' 
  },
  estado: { type: Boolean, default: true }
}, { timestamps: true });

export default model('Usuario', UsuarioSchema);