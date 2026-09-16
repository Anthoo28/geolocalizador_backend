import { Schema, model} from 'mongoose';


const ComisariaSchema = new Schema({
  nombre: { type: String, required: true }, // ej: "Comisaría PNP Ica"
  sector: { type: Schema.Types.ObjectId, ref: 'Sector' }
});
export const Comisaria = model('Comisaria', ComisariaSchema);

export default model('Comisaria', ComisariaSchema);