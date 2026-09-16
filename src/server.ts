import express, { Express } from 'express';
import cors from 'cors';
import path from 'path';
import conectarDB from './database/config.js';

import incidenciaRoutes from './routes/incidencia.routes.js';
import catalogoRoutes from './routes/catalogo.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import authRoutes from './routes/auth.routes.js';
import usuarioRoutes from './routes/usuario.routes.js';

class Server {
  private app: Express;
  private port: number;
  private apiPaths = {
    incidencias: '/api/incidencias',
    catalogos: '/api/catalogos',
    dashboard: '/api/dashboard',
    auth: '/api/auth',
    usuarios: '/api/usuarios'
  };

  constructor() {
    this.app = express();
    this.port = Number(process.env.PORT) || 8080;

    this.conectarBaseDatos();
    this.middlewares();
    this.routes();
  }

  async conectarBaseDatos(): Promise<void> {
    await conectarDB();
  }

  middlewares(): void {
    // Configuración limpia de CORS
    this.app.use(cors({ origin: '*' }));
    this.app.use(express.json());
    this.app.use('/uploads', express.static(path.join(process.cwd(), 'public/uploads')));
  }

  routes(): void {
    this.app.use(this.apiPaths.incidencias, incidenciaRoutes);
    this.app.use(this.apiPaths.catalogos, catalogoRoutes);
    this.app.use(this.apiPaths.dashboard, dashboardRoutes);
    this.app.use(this.apiPaths.auth, authRoutes);
    this.app.use(this.apiPaths.usuarios, usuarioRoutes);
  }

  start(): void {
    // '0.0.0.0' permite aceptar tráfico externo desde el proxy de Render
    this.app.listen(this.port, '0.0.0.0', () => {
      console.log(`Servidor corriendo en el puerto ${this.port}`);
    });
  }
}

export default Server;