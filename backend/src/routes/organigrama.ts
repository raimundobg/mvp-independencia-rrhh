import { Router } from 'express';
import { pool } from '../db';
import { authenticate } from '../middleware/auth';
import { ok, err } from '../utils/responses';

const router = Router();

router.get('/external/organigrama', authenticate, async (_req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, nombres, apellido_paterno, cargo, unidad, area, jefe_directo_id, foto_perfil, estado
       FROM funcionarios WHERE estado = 'ACTIVO' ORDER BY apellido_paterno`
    );
    const byId: Record<string, any> = {};
    rows.forEach(f => { byId[f.id] = { ...f, children: [] }; });

    const roots: any[] = [];
    rows.forEach(f => {
      if (f.jefe_directo_id && byId[f.jefe_directo_id]) {
        byId[f.jefe_directo_id].children.push(byId[f.id]);
      } else {
        roots.push(byId[f.id]);
      }
    });
    return ok(res, roots);
  } catch (e) {
    return err(res, String(e), 500);
  }
});

router.get('/external/directorio', authenticate, async (req, res) => {
  try {
    const { q } = req.query;
    let query = `SELECT id, nombres, apellido_paterno, apellido_materno, cargo, unidad, area, email, telefono, foto_perfil
                 FROM funcionarios WHERE estado = 'ACTIVO'`;
    const params: unknown[] = [];
    if (q) {
      query += ` AND (nombres ILIKE $1 OR apellido_paterno ILIKE $1 OR cargo ILIKE $1 OR unidad ILIKE $1 OR email ILIKE $1)`;
      params.push(`%${q}%`);
    }
    query += ' ORDER BY apellido_paterno, nombres';
    const { rows } = await pool.query(query, params);
    return ok(res, rows);
  } catch (e) {
    return err(res, String(e), 500);
  }
});

export default router;
