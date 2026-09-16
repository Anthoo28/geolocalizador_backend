import dotenv from 'dotenv';
import path from 'path';
import Server from './server.js'; // Importación actualizada desde la raíz de src

dotenv.config({ path: path.resolve(process.cwd(), 'src/env/dev.env') });

const server = new Server();
server.start();