import { Router } from 'express';
import { pool } from '../db';
import { authenticate, requireRole } from '../middleware/auth';
import { ok, err } from '../utils/responses';
import { auditLog } from '../utils/audit';

const router = Router();

router.get('/internal/me', authenticate, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM usuarios WHERE firebase_uid = $1', [req.user!.uid]);
    if (!rows[0]) return err(res, 'User not found', 404);
    return ok(res, rows[0]);
  } catch (e) {
    return err(res, String(e), 500);
  }
});

router.get('/internal/usuarios', authenticate, requireRole('ADMIN'), async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM usuarios ORDER BY created_at DESC');
    return ok(res, rows);
  } catch (e) {
    return err(res, String(e), 500);
  }
});

router.put('/internal/usuarios/:id/rol', authenticate, requireRole('ADMIN'), async (req, res) => {
  const { id } = req.params;
  const { rol } = req.body;
  const roles = ['ADMIN', 'RRHH', 'JEFATURA', 'USUARIO', 'PENDIENTE'];
  if (!roles.includes(rol)) return err(res, 'Rol inválido', 400);
  try {
    const { rows } = await pool.query(
      `UPDATE usuarios SET rol = $1, estado = CASE WHEN $1 = 'PENDIENTE' THEN 'PENDIENTE' ELSE 'ACTIVO' END, updated_at = NOW()
       WHERE id = $2 RETURNING *`,
      [rol, id]
    );
    if (!rows[0]) return err(res, 'Usuario no encontrado', 404);
    await auditLog({
      entidad: 'usuario',
      entidadId: id,
      accion: 'UPDATE',
      camposModificados: [{ campo: 'rol', valorAnterior: null, valorNuevo: rol }],
      usuarioId: req.user!.uid,
      usuarioEmail: req.user!.email,
      usuarioRol: req.user!.rol,
      ip: req.ip,
    });
    return ok(res, rows[0]);
  } catch (e) {
    return err(res, String(e), 500);
  }
});

export default router;
