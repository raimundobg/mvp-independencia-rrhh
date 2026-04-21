import { Router, Request } from 'express';
import { pool } from '../db';
import { authenticate, requireRole } from '../middleware/auth';
import { ok, err } from '../utils/responses';
import { auditLog } from '../utils/audit';
import { validateRut } from '../utils/rut';
import { v4 as uuid } from 'uuid';

const router = Router();

router.get('/external/funcionarios', authenticate, async (req, res) => {
  try {
    const { estado, unidad, area, tipo_contrato, q } = req.query;
    let query = 'SELECT f.*, c.nombre as cargo_nombre FROM funcionarios f LEFT JOIN cargos c ON f.cargo_id = c.id WHERE 1=1';
    const params: unknown[] = [];
    let idx = 1;

    if (req.user!.rol === 'USUARIO') {
      query += ` AND f.email = $${idx++}`;
      params.push(req.user!.email);
    } else if (req.user!.rol === 'JEFATURA') {
      const jefe = await pool.query('SELECT id FROM funcionarios WHERE email = $1', [req.user!.email]);
      if (jefe.rows[0]) {
        query += ` AND (f.jefe_directo_id = $${idx++} OR f.email = $${idx++})`;
        params.push(jefe.rows[0].id, req.user!.email);
      }
    }

    if (estado) { query += ` AND f.estado = $${idx++}`; params.push(estado); }
    if (unidad) { query += ` AND f.unidad ILIKE $${idx++}`; params.push(`%${unidad}%`); }
    if (area) { query += ` AND f.area ILIKE $${idx++}`; params.push(`%${area}%`); }
    if (tipo_contrato) { query += ` AND f.tipo_contrato = $${idx++}`; params.push(tipo_contrato); }
    if (q) {
      query += ` AND (f.nombres ILIKE $${idx} OR f.apellido_paterno ILIKE $${idx} OR f.rut ILIKE $${idx} OR f.email ILIKE $${idx})`;
      params.push(`%${q}%`); idx++;
    }

    query += ' ORDER BY f.apellido_paterno, f.nombres';
    const { rows } = await pool.query(query, params);
    return ok(res, rows);
  } catch (e) {
    return err(res, String(e), 500);
  }
});

router.get('/external/funcionarios/:id', authenticate, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT f.*, c.nombre as cargo_nombre,
              j.nombres || ' ' || j.apellido_paterno as jefe_nombre
       FROM funcionarios f
       LEFT JOIN cargos c ON f.cargo_id = c.id
       LEFT JOIN funcionarios j ON f.jefe_directo_id = j.id
       WHERE f.id = $1`,
      [req.params.id]
    );
    if (!rows[0]) return err(res, 'Funcionario no encontrado', 404);

    if (req.user!.rol === 'USUARIO' && rows[0].email !== req.user!.email) {
      return err(res, 'Forbidden', 403);
    }
    return ok(res, rows[0]);
  } catch (e) {
    return err(res, String(e), 500);
  }
});

router.post('/external/funcionarios', authenticate, requireRole('ADMIN', 'RRHH'), async (req, res) => {
  const body = req.body;
  if (!body.rut || !body.nombres || !body.apellido_paterno || !body.email) {
    return err(res, 'Campos requeridos: rut, nombres, apellido_paterno, email', 400);
  }
  if (!validateRut(body.rut)) return err(res, 'RUT inválido', 400);
  try {
    const { rows } = await pool.query(
      `INSERT INTO funcionarios (
        rut, nombres, apellido_paterno, apellido_materno, email, email_personal, telefono,
        fecha_nacimiento, genero, nacionalidad, estado_civil, direccion, comuna, region,
        tipo_contrato, cargo, cargo_id, unidad, area, fecha_ingreso, fecha_termino,
        jefe_directo_id, sueldo_base, grado_escalaforma, jornada, afp, isapre, previred_codigo,
        estado, created_by
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30
      ) RETURNING *`,
      [
        body.rut, body.nombres, body.apellido_paterno, body.apellido_materno || '',
        body.email, body.email_personal, body.telefono,
        body.fecha_nacimiento, body.genero || 'NI', body.nacionalidad || 'Chilena',
        body.estado_civil, body.direccion, body.comuna, body.region,
        body.tipo_contrato, body.cargo, body.cargo_id || null, body.unidad, body.area,
        body.fecha_ingreso, body.fecha_termino || null,
        body.jefe_directo_id || null, body.sueldo_base || 0,
        body.grado_escalaforma, body.jornada || 44,
        body.afp, body.isapre, body.previred_codigo,
        body.estado || 'ACTIVO', req.user!.email,
      ]
    );
    await auditLog({
      entidad: 'funcionario', entidadId: rows[0].id, accion: 'CREATE',
      usuarioId: req.user!.uid, usuarioEmail: req.user!.email, usuarioRol: req.user!.rol, ip: req.ip,
    });
    return ok(res, rows[0], 201);
  } catch (e: any) {
    if (e.code === '23505') return err(res, 'RUT o email ya registrado', 409);
    return err(res, String(e), 500);
  }
});

router.put('/external/funcionarios/:id', authenticate, requireRole('ADMIN', 'RRHH'), async (req, res) => {
  const body = req.body;
  const { id } = req.params;
  try {
    const { rows } = await pool.query(
      `UPDATE funcionarios SET
        nombres=$1, apellido_paterno=$2, apellido_materno=$3, email_personal=$4, telefono=$5,
        direccion=$6, comuna=$7, region=$8, tipo_contrato=$9, cargo=$10, cargo_id=$11,
        unidad=$12, area=$13, fecha_ingreso=$14, fecha_termino=$15, jefe_directo_id=$16,
        sueldo_base=$17, grado_escalaforma=$18, jornada=$19, afp=$20, isapre=$21,
        previred_codigo=$22, estado=$23, updated_at=NOW()
       WHERE id=$24 RETURNING *`,
      [
        body.nombres, body.apellido_paterno, body.apellido_materno, body.email_personal, body.telefono,
        body.direccion, body.comuna, body.region, body.tipo_contrato, body.cargo, body.cargo_id,
        body.unidad, body.area, body.fecha_ingreso, body.fecha_termino, body.jefe_directo_id,
        body.sueldo_base, body.grado_escalaforma, body.jornada, body.afp, body.isapre,
        body.previred_codigo, body.estado, id,
      ]
    );
    if (!rows[0]) return err(res, 'Funcionario no encontrado', 404);
    await auditLog({
      entidad: 'funcionario', entidadId: id, accion: 'UPDATE',
      usuarioId: req.user!.uid, usuarioEmail: req.user!.email, usuarioRol: req.user!.rol, ip: req.ip,
    });
    return ok(res, rows[0]);
  } catch (e) {
    return err(res, String(e), 500);
  }
});

router.delete('/external/funcionarios/:id', authenticate, requireRole('ADMIN'), async (req, res) => {
  try {
    await pool.query('UPDATE funcionarios SET estado=$1, updated_at=NOW() WHERE id=$2', ['INACTIVO', req.params.id]);
    await auditLog({
      entidad: 'funcionario', entidadId: req.params.id, accion: 'DELETE',
      usuarioId: req.user!.uid, usuarioEmail: req.user!.email, usuarioRol: req.user!.rol, ip: req.ip,
    });
    return ok(res, { message: 'Funcionario desactivado' });
  } catch (e) {
    return err(res, String(e), 500);
  }
});

export default router;
