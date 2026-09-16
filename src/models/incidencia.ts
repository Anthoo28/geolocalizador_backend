import { Schema, model, Document, Types } from 'mongoose';

export const TIPOS_DELITO = [
  'ROBO',
  'HURTO',
  'ACCIDENTE_TRANSITO',
  'VIOLENCIA_FAMILIAR',
  'DISTURBIOS',
  'OTRO'
] as const;

export const ESTADOS_INCIDENCIA = [
  'REGISTRADA',
  'EN_ATENCION',
  'ATENDIDA',
  'CERRADA'
] as const;

export const PRIORIDADES = ['BAJA', 'MEDIA', 'ALTA'] as const;

export type TipoDelito = typeof TIPOS_DELITO[number];
export type EstadoIncidencia = typeof ESTADOS_INCIDENCIA[number];
export type Prioridad = typeof PRIORIDADES[number];

export interface IHistorialEstado {
  estado: EstadoIncidencia;
  fecha: Date;
  usuario?: Types.ObjectId;
  comentario?: string;
}

export interface IIncidencia extends Document {
  codigo: string;
  titulo: string;
  tipoDelito: TipoDelito;
  descripcion: string;
  prioridad: Prioridad;
  estado: EstadoIncidencia;
  fechaHora: Date;
  direccion?: string;
  referencia?: string;
  sector?: Types.ObjectId;
  comisaria?: Types.ObjectId;
  registradoPor?: Types.ObjectId;
  asignadoA?: Types.ObjectId;
  evidencias?: string[];
  historialEstados: IHistorialEstado[];
  ubicacion: {
    type: 'Point';
    coordinates: [number, number]; // [LONGITUD, LATITUD]
  };
  createdAt: Date;
  updatedAt: Date;
}

const HistorialEstadoSchema = new Schema<IHistorialEstado>(
  {
    estado: { type: String, enum: ESTADOS_INCIDENCIA, required: true },
    fecha: { type: Date, default: Date.now },
    usuario: { type: Schema.Types.ObjectId, ref: 'Usuario' },
    comentario: { type: String, trim: true },
  },
  { _id: false }
);

const IncidenciaSchema = new Schema<IIncidencia>(
  {
    codigo: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    titulo: {
      type: String,
      required: true,
      trim: true,
    },
    tipoDelito: {
      type: String,
      required: true,
      enum: TIPOS_DELITO,
    },
    descripcion: {
      type: String,
      required: true,
      trim: true,
    },
    prioridad: {
      type: String,
      enum: PRIORIDADES,
      default: 'MEDIA',
    },
    estado: {
      type: String,
      enum: ESTADOS_INCIDENCIA,
      default: 'REGISTRADA',
    },
    fechaHora: {
      type: Date,
      default: Date.now,
    },
    direccion: {
      type: String,
      trim: true,
    },
    referencia: {
      type: String,
      trim: true,
    },
    sector: {
      type: Schema.Types.ObjectId,
      ref: 'Sector',
    },
    comisaria: {
      type: Schema.Types.ObjectId,
      ref: 'Comisaria',
    },
    registradoPor: {
      type: Schema.Types.ObjectId,
      ref: 'Usuario',
    },
    asignadoA: {
      type: Schema.Types.ObjectId,
      ref: 'Usuario',
    },
    evidencias: [{
      type: String,
    }],
    historialEstados: [HistorialEstadoSchema],
    ubicacion: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true },
    },
  },
  { timestamps: true }
);

IncidenciaSchema.index({ ubicacion: '2dsphere' });
IncidenciaSchema.index({ estado: 1, sector: 1, fechaHora: -1 });

export default model<IIncidencia>('Incidencia', IncidenciaSchema);