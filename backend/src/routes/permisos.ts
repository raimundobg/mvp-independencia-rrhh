import { Router } from 'express';
import { pool } from '../db';
import { authenticate, requireRole } from '../middleware/auth';
import { ok, err } from '../utils/responses';
import { auditLog } from '../utils/audit';

const router = Router();

function calcDiasHabiles(inicio: string, fin: string): number {
  const start = new Date(inicio);
  const end = new Date(fin);
  let count = 0;
  const curr = new Date(start);
  while (curr <= end) {
    const day = curr.getDay();
    if (day !== 0 && day !== 6) count++;
    curr.setDate(curr.getDate() + 1);
  }
  return count;
}

router.get('/external/permisos', authenticate, async (req, res) => {
  try {
    const { estado, funcionario_id } = req.query;
    let query = `SELECT p.*, f.nombres || ' ' || f.apellido_paterno as funcionario_nombre
                 FROM permisos p JOIN funcionarios f ON p.funcionario_id = f.id WHERE 1=1`;
    const params: unknown[] = [];
    let idx = 1;

    if (req.user!.rol === 'USUARIO') {
      const fRow = await pool.query('SELECT id FROM funcionarios WHERE email = $1', [req.user!.email]);
      if (!fRow.rows[0]) return ok(res, []);
      query += ` AND p.funcionario_id = $${idx++}`;
      params.push(fRow.rows[0].id);
    } else if (req.user!.rol === 'JEFATURA') {
      const jefe = await pool.query('SELECT id FROM funcionarios WHERE email = $1', [req.user!.email]);
      if (jefe.rows[0]) {
        query += ` AND p.funcionario_id IN (SELECT id FROM funcionarios WHERE jefe_directo_id = $${idx++})`;
        params.push(jefe.rows[0].id);
      }
    } else if (funcionario_id) {
      query += ` AND p.funcionario_id = $${idx++}`;
      params.push(funcionario_id);
    }

    if (estado) { query += ` AND p.estado = $${idx++}`; params.push(estado); }
    query += ' ORDER BY p.created_at DESC';
    const { rows } = await pool.query(query, params);
    return ok(res, rows);
  } catch (e) {
    return err(res, String(e), 500);
  }
});

router.get('/external/permisos/balance/:funcionarioId', authenticate, async (req, res) => {
  try {
    const anio = new Date().getFullYear();
    const { rows } = await pool.query(
      `SELECT * FROM balance_permisos WHERE funcionario_id = $1 AND anio = $2`,
      [req.params.funcionarioId, anio]
    );
    if (rows.length === 0) {
      const tipos = ['FERIADO_LEGAL', 'PERMISO_CON_GOCE', 'PERMISO_SIN_GOCE', 'DIA_ADMINISTRATIVO'];
      const balance = tipos.map(tipo => ({
        tipo, dias_disponibles: tipo === 'FERIADO_LEGAL' ? 15 : 5, dias_usados: 0, anio
      }));
      return ok(res, balance);
    }
    return ok(res, rows);
  } catch (e) {
    return err(res, String(e), 500);
  }
});

router.post('/external/permisos', authenticate, async (req, res) => {
  const { funcionario_id, tipo, fecha_inicio, fecha_fin, motivo, suplencia_id } = req.body;
  if (!funcionario_id || !tipo || !fecha_inicio || !fecha_fin) {
    return err(res, 'Campos requeridos: funcionario_id, tipo, fecha_inicio, fecha_fin', 400);
  }
  const dias_habiles = calcDiasHabiles(fecha_inicio, fecha_fin);
  try {
    const { rows } = await pool.query(
      `INSERT INTO permisos (funcionario_id, tipo, fecha_inicio, fecha_fin, dias_habiles, motivo, suplencia_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [funcionario_id, tipo, fecha_inicio, fecha_fin, dias_habiles, motivo, suplencia_id || null]
    );
    await auditLog({
      entidad: 'permiso', entidadId: rows[0].id, accion: 'CREATE',
      usuarioId: req.user!.uid, usuarioEmail: req.user!.email, usuarioRol: req.user!.rol, ip: req.ip,
    });
    return ok(res, rows[0], 201);
  } catch (e) {
    return err(res, String(e), 500);
  }
});

router.put('/external/permisos/:id/aprobar', authenticate, requireRole('ADMIN', 'RRHH', 'JEFATURA'), async (req, res) => {
  try {
    const { rows } = await pool.query(
      `UPDATE permisos SET estado='APROBADO', aprobado_por=$1, fecha_aprobacion=NOW(), observaciones=$2
       WHERE id=$3 RETURNING *`,
      [req.user!.email, req.body.observaciones, req.params.id]
    );
    if (!rows[0]) return err(res, 'Permiso no encontrado', 404);
    const p = rows[0];
    const anio = new Date(p.fecha_inicio).getFullYear();
    await pool.query(
      `INSERT INTO balance_permisos (funcionario_id, anio, tipo, dias_disponibles, dias_usados)
       VALUES ($1,$2,$3,CASE WHEN $3='FERIADO_LEGAL' THEN 15 ELSE 5 END,$4)
       ON CONFLICT (funcionario_id, anio, tipo) DO UPDATE
       SET dias_usados = balance_permisos.dias_usados + $4, updated_at = NOW()`,
      [p.funcionario_id, anio, p.tipo, p.dias_habiles]
    );
    await auditLog({
      entidad: 'permiso', entidadId: req.params.id, accion: 'APPROVE',
      usuarioId: req.user!.uid, usuarioEmail: req.user!.email, usuarioRol: req.user!.rol, ip: req.ip,
    });
    return ok(res, rows[0]);
  } catch (e) {
    return err(res, String(e), 500);
  }
});

router.put('/external/permisos/:id/rechazar', authenticate, requireRole('ADMIN', 'RRHH', 'JEFATURA'), async (req, res) => {
  try {
    const { rows } = await pool.query(
      `UPDATE permisos SET estado='RECHAZADO', aprobado_por=$1, fecha_aprobacion=NOW(), observaciones=$2
       WHERE id=$3 RETURNING *`,
      [req.user!.email, req.body.observaciones, req.params.id]
    );
    if (!rows[0]) return err(res, 'Permiso no encontrado', 404);
    await auditLog({
      entidad: 'permiso', entidadId: req.params.id, accion: 'REJECT',
      usuarioId: req.user!.uid, usuarioEmail: req.user!.email, usuarioRol: req.user!.rol, ip: req.ip,
    });
    return ok(res, rows[0]);
  } catch (e) {
    return err(res, String(e), 500);
  }
});

router.put('/external/permisos/:id/cancelar', authenticate, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `UPDATE permisos SET estado='CANCELADO' WHERE id=$1 AND estado='PENDIENTE' RETURNING *`,
      [req.params.id]
    );
    if (!rows[0]) return err(res, 'Permiso no encontrado o ya procesado', 404);
    return ok(res, rows[0]);
  } catch (e) {
    return err(res, String(e), 500);
  }
});

export default router;
