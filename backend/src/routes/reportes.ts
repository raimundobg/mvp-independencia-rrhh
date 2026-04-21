import { Router } from 'express';
import { pool } from '../db';
import { authenticate, requireRole } from '../middleware/auth';
import { err } from '../utils/responses';
import * as XLSX from 'xlsx';

const router = Router();

function sendExcel(res: any, data: any[], sheetName: string, filename: string) {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(data);
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.send(buf);
}

router.get('/external/reportes/dotacion', authenticate, requireRole('ADMIN', 'RRHH'), async (_req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT rut, nombres, apellido_paterno, apellido_materno, email, cargo, unidad, area,
              tipo_contrato, fecha_ingreso, fecha_termino, sueldo_base, jornada, afp, isapre, estado
       FROM funcionarios ORDER BY unidad, apellido_paterno`
    );
    const data = rows.map(r => ({
      'RUT': r.rut,
      'Nombres': r.nombres,
      'Apellido Paterno': r.apellido_paterno,
      'Apellido Materno': r.apellido_materno,
      'Email': r.email,
      'Cargo': r.cargo,
      'Unidad': r.unidad,
      'Área': r.area,
      'Tipo Contrato': r.tipo_contrato,
      'Fecha Ingreso': r.fecha_ingreso,
      'Fecha Término': r.fecha_termino || '',
      'Sueldo Base': r.sueldo_base,
      'Jornada (hrs)': r.jornada,
      'AFP': r.afp || '',
      'Isapre/Fonasa': r.isapre || '',
      'Estado': r.estado,
    }));
    sendExcel(res, data, 'Dotación', 'dotacion_completa.xlsx');
  } catch (e) {
    return err(res, String(e), 500);
  }
});

router.get('/external/reportes/permisos', authenticate, requireRole('ADMIN', 'RRHH'), async (req, res) => {
  try {
    const { desde, hasta } = req.query;
    let query = `SELECT p.*, f.nombres || ' ' || f.apellido_paterno as funcionario,
                        f.rut, f.unidad, f.cargo
                 FROM permisos p JOIN funcionarios f ON p.funcionario_id = f.id WHERE 1=1`;
    const params: unknown[] = [];
    let idx = 1;
    if (desde) { query += ` AND p.fecha_inicio >= $${idx++}`; params.push(desde); }
    if (hasta) { query += ` AND p.fecha_fin <= $${idx++}`; params.push(hasta); }
    query += ' ORDER BY p.fecha_inicio DESC';
    const { rows } = await pool.query(query, params);
    const data = rows.map(r => ({
      'Funcionario': r.funcionario,
      'RUT': r.rut,
      'Unidad': r.unidad,
      'Cargo': r.cargo,
      'Tipo Permiso': r.tipo,
      'Fecha Inicio': r.fecha_inicio,
      'Fecha Fin': r.fecha_fin,
      'Días Hábiles': r.dias_habiles,
      'Estado': r.estado,
      'Aprobado Por': r.aprobado_por || '',
      'Observaciones': r.observaciones || '',
    }));
    sendExcel(res, data, 'Permisos', 'permisos.xlsx');
  } catch (e) {
    return err(res, String(e), 500);
  }
});

router.get('/external/reportes/previred', authenticate, requireRole('ADMIN', 'RRHH'), async (_req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT rut, sueldo_base, afp, isapre, previred_codigo, jornada
       FROM funcionarios WHERE estado = 'ACTIVO'`
    );
    const RUT_EMPLEADOR = process.env.RUT_EMPLEADOR || '00.000.000-0';
    const lines = rows.map(f => {
      const afpCod = f.afp?.toUpperCase().replace(/\s/g, '').substring(0, 3) || 'HAB';
      const isaCod = f.isapre?.toUpperCase().includes('FONASA') ? 'FON' : 'ISA';
      return [RUT_EMPLEADOR, f.rut, f.sueldo_base, afpCod, isaCod, '0', f.jornada].join('|');
    });
    const txt = lines.join('\n');
    res.setHeader('Content-Disposition', 'attachment; filename="previred.txt"');
    res.setHeader('Content-Type', 'text/plain');
    res.send(txt);
  } catch (e) {
    return err(res, String(e), 500);
  }
});

router.get('/external/reportes/auditoria', authenticate, requireRole('ADMIN'), async (req, res) => {
  try {
    const { desde, hasta } = req.query;
    let query = 'SELECT * FROM auditoria WHERE 1=1';
    const params: unknown[] = [];
    let idx = 1;
    if (desde) { query += ` AND timestamp >= $${idx++}`; params.push(desde); }
    if (hasta) { query += ` AND timestamp <= $${idx++}`; params.push(hasta); }
    query += ' ORDER BY timestamp DESC LIMIT 5000';
    const { rows } = await pool.query(query, params);
    const data = rows.map(r => ({
      'Timestamp': r.timestamp,
      'Entidad': r.entidad,
      'Entidad ID': r.entidad_id,
      'Acción': r.accion,
      'Usuario': r.usuario_email,
      'Rol': r.usuario_rol,
      'IP': r.ip,
    }));
    sendExcel(res, data, 'Auditoría', 'auditoria.xlsx');
  } catch (e) {
    return err(res, String(e), 500);
  }
});

router.get('/external/reportes/dashboard', authenticate, requireRole('ADMIN', 'RRHH', 'JEFATURA'), async (_req, res) => {
  try {
    const [totalActivos, porContrato, porUnidad, permisosPendientes, docsPendientes, recientes] = await Promise.all([
      pool.query(`SELECT COUNT(*) as total FROM funcionarios WHERE estado = 'ACTIVO'`),
      pool.query(`SELECT tipo_contrato, COUNT(*) as total FROM funcionarios WHERE estado='ACTIVO' GROUP BY tipo_contrato`),
      pool.query(`SELECT unidad, COUNT(*) as total FROM funcionarios WHERE estado='ACTIVO' GROUP BY unidad ORDER BY total DESC LIMIT 10`),
      pool.query(`SELECT COUNT(*) as total FROM permisos WHERE estado='PENDIENTE'`),
      pool.query(`SELECT COUNT(*) as total FROM documentos WHERE estado='PENDIENTE_FIRMA'`),
      pool.query(`SELECT nombres, apellido_paterno, cargo, unidad, fecha_ingreso FROM funcionarios ORDER BY fecha_ingreso DESC LIMIT 5`),
    ]);
    return res.json({
      success: true,
      data: {
        total_activos: parseInt(totalActivos.rows[0].total),
        por_contrato: porContrato.rows,
        por_unidad: porUnidad.rows,
        permisos_pendientes: parseInt(permisosPendientes.rows[0].total),
        documentos_pendientes: parseInt(docsPendientes.rows[0].total),
        recientes: recientes.rows,
      }
    });
  } catch (e) {
    return err(res, String(e), 500);
  }
});

export default router;
