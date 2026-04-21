import { pool } from '../db';

interface AuditParams {
  entidad: string;
  entidadId: string;
  accion: string;
  camposModificados?: { campo: string; valorAnterior: unknown; valorNuevo: unknown }[];
  usuarioId: string;
  usuarioEmail: string;
  usuarioRol: string;
  ip?: string;
  metadata?: Record<string, unknown>;
}

export async function auditLog(params: AuditParams): Promise<void> {
  try {
    await pool.query(
      `INSERT INTO auditoria (entidad, entidad_id, accion, campos_modificados, usuario_id, usuario_email, usuario_rol, ip, metadata)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [
        params.entidad,
        params.entidadId,
        params.accion,
        params.camposModificados ? JSON.stringify(params.camposModificados) : null,
        params.usuarioId,
        params.usuarioEmail,
        params.usuarioRol,
        params.ip ?? 'unknown',
        params.metadata ? JSON.stringify(params.metadata) : null,
      ]
    );
  } catch (e) {
    console.error(JSON.stringify({ level: 'ERROR', event: 'audit_log_failed', error: String(e) }));
  }
}
