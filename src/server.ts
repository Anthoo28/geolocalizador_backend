import express, { Express } from 'express';
import cors from 'cors';
import conectarDB  from './database/config.js'; // Ajusta la ruta a tu conexión de Mongoose

import incidenciaRoutes from './routes/incidencia.routes.js';
import catalogoRoutes from './routes/catalogo.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import authRoutes from './routes/auth.routes.js';
import path from 'path';
import usuarioRoutes from './routes/usuario.routes.js';

class Server {
  private app: Express;
  private port: string | number;
  private apiPaths = {
    incidencias: '/api/incidencias',
    catalogos: '/api/catalogos',
    dashboard: '/api/dashboard',
    auth: '/api/auth',
    usuarios: '/api/usuarios'
  };

  constructor() {
    this.app = express();
    this.port = process.env.PORT || 8080;

    this.conectarBaseDatos();
    this.middlewares();
    this.routes();
  }

  async conectarBaseDatos(): Promise<void> {
    await conectarDB();
  }

  middlewares(): void {
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use('/uploads', express.static(path.join(process.cwd(), 'public/uploads')));
    this.app.use(cors());
    this.app.use(cors({ origin: '*' })); 
  }

  routes(): void {
    this.app.use(this.apiPaths.incidencias, incidenciaRoutes);
    this.app.use(this.apiPaths.catalogos, catalogoRoutes);
    this.app.use(this.apiPaths.dashboard, dashboardRoutes);
    this.app.use(this.apiPaths.auth, authRoutes);
    this.app.use(this.apiPaths.usuarios, usuarioRoutes);
  }

  start(): void {
    this.app.listen(this.port, () => {
      console.log(`Servidor corriendo en el puerto ${this.port}`);
    });
  }
}

export default Server;