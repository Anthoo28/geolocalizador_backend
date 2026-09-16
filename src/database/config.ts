import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
  try {
    // Busca MONGODB_CNN o MONGODB_URI como alternativa
    const dbUri = process.env.MONGODB_CNN || process.env.MONGODB_URI;

    if (!dbUri) {
      throw new Error(
        'La variable de entorno MONGODB_CNN (o MONGODB_URI) no está configurada.'
      );
    }

    await mongoose.connect(dbUri);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

export default connectDB;