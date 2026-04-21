import { Router } from 'express';
import { pool } from '../db';
import { authenticate, requireRole } from '../middleware/auth';
import { ok, err } from '../utils/responses';
import { auditLog } from '../utils/audit';

const router = Router();

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

router.get('/external/documentos', authenticate, async (req, res) => {
  try {
    const { funcionario_id, estado } = req.query;
    let query = `SELECT d.*, f.nombres || ' ' || f.apellido_paterno as funcionario_nombre
                 FROM documentos d JOIN funcionarios f ON d.funcionario_id = f.id WHERE 1=1`;
    const params: unknown[] = [];
    let idx = 1;

    if (req.user!.rol === 'USUARIO') {
      const fRow = await pool.query('SELECT id FROM funcionarios WHERE email = $1', [req.user!.email]);
      if (!fRow.rows[0]) return ok(res, []);
      query += ` AND d.funcionario_id = $${idx++}`;
      params.push(fRow.rows[0].id);
    } else if (funcionario_id) {
      query += ` AND d.funcionario_id = $${idx++}`;
      params.push(funcionario_id);
    }

    if (estado) { query += ` AND d.estado = $${idx++}`; params.push(estado); }
    query += ' ORDER BY d.created_at DESC';
    const { rows } = await pool.query(query, params);
    return ok(res, rows);
  } catch (e) {
    return err(res, String(e), 500);
  }
});

router.get('/external/documentos/:id', authenticate, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM documentos WHERE id = $1', [req.params.id]);
    if (!rows[0]) return err(res, 'Documento no encontrado', 404);
    return ok(res, rows[0]);
  } catch (e) {
    return err(res, String(e), 500);
  }
});

router.post('/external/documentos/generar', authenticate, requireRole('ADMIN', 'RRHH'), async (req, res) => {
  const { funcionario_id, tipo, nombre } = req.body;
  if (!funcionario_id || !tipo || !nombre) return err(res, 'funcionario_id, tipo y nombre requeridos', 400);
  try {
    const { rows } = await pool.query(
      `INSERT INTO documentos (funcionario_id, tipo, nombre, estado, generado_por)
       VALUES ($1,$2,$3,'PENDIENTE_FIRMA',$4) RETURNING *`,
      [funcionario_id, tipo, nombre, req.user!.email]
    );
    await auditLog({
      entidad: 'documento', entidadId: rows[0].id, accion: 'CREATE',
      usuarioId: req.user!.uid, usuarioEmail: req.user!.email, usuarioRol: req.user!.rol, ip: req.ip,
    });
    return ok(res, rows[0], 201);
  } catch (e) {
    return err(res, String(e), 500);
  }
});

router.post('/external/documentos/firma/solicitar/:id', authenticate, async (req, res) => {
  try {
    const codigo = generateCode();
    const expira = new Date(Date.now() + 10 * 60 * 1000);
    await pool.query(
      'UPDATE documentos SET codigo_firma=$1, codigo_expira=$2 WHERE id=$3',
      [codigo, expira, req.params.id]
    );
    console.log(JSON.stringify({ level: 'INFO', event: 'firma_codigo_generado', id: req.params.id, codigo }));
    return ok(res, { message: 'Código enviado al email registrado', expires_at: expira });
  } catch (e) {
    return err(res, String(e), 500);
  }
});

router.post('/external/documentos/firma/confirmar/:id', authenticate, async (req, res) => {
  const { codigo } = req.body;
  if (!codigo) return err(res, 'Código requerido', 400);
  try {
    const { rows } = await pool.query('SELECT * FROM documentos WHERE id=$1', [req.params.id]);
    if (!rows[0]) return err(res, 'Documento no encontrado', 404);
    const doc = rows[0];
    if (doc.codigo_firma !== codigo) return err(res, 'Código inválido', 400);
    if (new Date(doc.codigo_expira) < new Date()) return err(res, 'Código vencido', 400);

    await pool.query(
      `UPDATE documentos SET estado='FIRMADO', firmado_en=NOW(), firma_email=$1, firma_ip=$2, codigo_firma=NULL, codigo_expira=NULL
       WHERE id=$3`,
      [req.user!.email, req.ip, req.params.id]
    );
    await auditLog({
      entidad: 'documento', entidadId: req.params.id, accion: 'SIGN',
      usuarioId: req.user!.uid, usuarioEmail: req.user!.email, usuarioRol: req.user!.rol, ip: req.ip,
    });
    return ok(res, { message: 'Documento firmado exitosamente' });
  } catch (e) {
    return err(res, String(e), 500);
  }
});

router.post('/external/documentos/upload', authenticate, requireRole('ADMIN', 'RRHH'), async (req, res) => {
  const { funcionario_id, tipo, nombre, url } = req.body;
  if (!funcionario_id || !tipo || !nombre) return err(res, 'funcionario_id, tipo y nombre requeridos', 400);
  try {
    const { rows } = await pool.query(
      `INSERT INTO documentos (funcionario_id, tipo, nombre, url, estado, generado_por)
       VALUES ($1,$2,$3,$4,'ACTIVO',$5) RETURNING *`,
      [funcionario_id, tipo, nombre, url || null, req.user!.email]
    );
    return ok(res, rows[0], 201);
  } catch (e) {
    return err(res, String(e), 500);
  }
});

export default router;
