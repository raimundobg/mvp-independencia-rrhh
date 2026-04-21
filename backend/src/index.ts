import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { initDB } from './db';
import usuariosRouter from './routes/usuarios';
import funcionariosRouter from './routes/funcionarios';
import permisosRouter from './routes/permisos';
import cargosRouter from './routes/cargos';
import documentosRouter from './routes/documentos';
import organigramaRouter from './routes/organigrama';
import reportesRouter from './routes/reportes';
import auditoriaRouter from './routes/auditoria';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), service: 'shelby-core-ms-independencia' });
});

app.use('/api/v1', usuariosRouter);
app.use('/api/v1', funcionariosRouter);
app.use('/api/v1', permisosRouter);
app.use('/api/v1', cargosRouter);
app.use('/api/v1', documentosRouter);
app.use('/api/v1', organigramaRouter);
app.use('/api/v1', reportesRouter);
app.use('/api/v1', auditoriaRouter);

const frontendDist = path.join(__dirname, '../../frontend/dist');
app.use(express.static(frontendDist));
app.get('*', (_req, res) => {
  res.sendFile(path.join(frontendDist, 'index.html'));
});

async function start() {
  console.log(JSON.stringify({ level: 'INFO', event: 'startup', DATABASE_URL_set: !!process.env.DATABASE_URL, NODE_ENV: process.env.NODE_ENV }));
  try {
    await initDB();
    app.listen(PORT, () => {
      console.log(JSON.stringify({ level: 'INFO', event: 'server_start', port: PORT }));
    });
  } catch (e: any) {
    console.error(JSON.stringify({
      level: 'ERROR',
      event: 'startup_failed',
      error: String(e),
      message: e?.message,
      errors: e?.errors?.map?.((x: any) => String(x)),
      stack: e?.stack,
    }));
    process.exit(1);
  }
}

start();
