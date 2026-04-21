import { Router } from 'express';
import { pool } from '../db';
import { authenticate, requireRole } from '../middleware/auth';
import { ok, err } from '../utils/responses';

const router = Router();

router.get('/external/auditoria', authenticate, requireRole('ADMIN', 'RRHH'), async (req, res) => {
  try {
    const { entidad, desde, hasta, limit = '100' } = req.query;
    let query = 'SELECT * FROM auditoria WHERE 1=1';
    const params: unknown[] = [];
    let idx = 1;
    if (entidad) { query += ` AND entidad = $${idx++}`; params.push(entidad); }
    if (desde) { query += ` AND timestamp >= $${idx++}`; params.push(desde); }
    if (hasta) { query += ` AND timestamp <= $${idx++}`; params.push(hasta); }
    query += ` ORDER BY timestamp DESC LIMIT $${idx++}`;
    params.push(Math.min(parseInt(String(limit)), 1000));
    const { rows } = await pool.query(query, params);
    return ok(res, rows);
  } catch (e) {
    return err(res, String(e), 500);
  }
});

export default router;
