import { Router } from 'express';
import { pool } from '../db';
import { authenticate, requireRole } from '../middleware/auth';
import { ok, err } from '../utils/responses';

const router = Router();

router.get('/external/cargos', authenticate, async (_req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM cargos WHERE activo = true ORDER BY nombre');
    return ok(res, rows);
  } catch (e) {
    return err(res, String(e), 500);
  }
});

router.post('/external/cargos', authenticate, requireRole('ADMIN'), async (req, res) => {
  const { nombre, descripcion, area, unidad, banda_salarial_min, banda_salarial_max, requisitos, dotacion_esperada } = req.body;
  if (!nombre || !area || !unidad) return err(res, 'nombre, area y unidad son requeridos', 400);
  try {
    const { rows } = await pool.query(
      `INSERT INTO cargos (nombre, descripcion, area, unidad, banda_salarial_min, banda_salarial_max, requisitos, dotacion_esperada)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [nombre, descripcion, area, unidad, banda_salarial_min || 0, banda_salarial_max || 0, requisitos || [], dotacion_esperada || 1]
    );
    return ok(res, rows[0], 201);
  } catch (e) {
    return err(res, String(e), 500);
  }
});

router.put('/external/cargos/:id', authenticate, requireRole('ADMIN'), async (req, res) => {
  const { nombre, descripcion, area, unidad, banda_salarial_min, banda_salarial_max, requisitos, dotacion_esperada, activo } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE cargos SET nombre=$1, descripcion=$2, area=$3, unidad=$4, banda_salarial_min=$5,
       banda_salarial_max=$6, requisitos=$7, dotacion_esperada=$8, activo=$9, updated_at=NOW()
       WHERE id=$10 RETURNING *`,
      [nombre, descripcion, area, unidad, banda_salarial_min, banda_salarial_max, requisitos, dotacion_esperada, activo ?? true, req.params.id]
    );
    if (!rows[0]) return err(res, 'Cargo no encontrado', 404);
    return ok(res, rows[0]);
  } catch (e) {
    return err(res, String(e), 500);
  }
});

export default router;
