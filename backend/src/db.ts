import { Pool } from 'pg';

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

export async function initDB(): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE EXTENSION IF NOT EXISTS "pgcrypto";

      CREATE TABLE IF NOT EXISTS usuarios (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        firebase_uid TEXT UNIQUE NOT NULL,
        email TEXT NOT NULL,
        nombre TEXT,
        rol TEXT NOT NULL DEFAULT 'PENDIENTE',
        estado TEXT NOT NULL DEFAULT 'PENDIENTE',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS cargos (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        nombre TEXT NOT NULL,
        descripcion TEXT,
        area TEXT NOT NULL,
        unidad TEXT NOT NULL,
        banda_salarial_min NUMERIC DEFAULT 0,
        banda_salarial_max NUMERIC DEFAULT 0,
        requisitos TEXT[],
        dotacion_esperada INTEGER DEFAULT 1,
        activo BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS funcionarios (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        rut TEXT UNIQUE NOT NULL,
        nombres TEXT NOT NULL,
        apellido_paterno TEXT NOT NULL,
        apellido_materno TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        email_personal TEXT,
        telefono TEXT,
        fecha_nacimiento DATE NOT NULL,
        genero TEXT NOT NULL DEFAULT 'NI',
        nacionalidad TEXT NOT NULL DEFAULT 'Chilena',
        estado_civil TEXT,
        direccion TEXT,
        comuna TEXT,
        region TEXT,
        foto_perfil TEXT,
        tipo_contrato TEXT NOT NULL DEFAULT 'CONTRATA',
        cargo TEXT NOT NULL,
        cargo_id UUID REFERENCES cargos(id),
        unidad TEXT NOT NULL,
        area TEXT NOT NULL,
        fecha_ingreso DATE NOT NULL,
        fecha_termino DATE,
        jefe_directo_id UUID REFERENCES funcionarios(id),
        sueldo_base NUMERIC NOT NULL DEFAULT 0,
        grado_escalaforma TEXT,
        jornada INTEGER NOT NULL DEFAULT 44,
        afp TEXT,
        isapre TEXT,
        previred_codigo TEXT,
        estado TEXT NOT NULL DEFAULT 'ACTIVO',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        created_by TEXT
      );

      CREATE TABLE IF NOT EXISTS permisos (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        funcionario_id UUID NOT NULL REFERENCES funcionarios(id),
        tipo TEXT NOT NULL,
        fecha_inicio DATE NOT NULL,
        fecha_fin DATE NOT NULL,
        dias_habiles INTEGER NOT NULL DEFAULT 0,
        motivo TEXT,
        suplencia_id UUID REFERENCES funcionarios(id),
        estado TEXT NOT NULL DEFAULT 'PENDIENTE',
        aprobado_por TEXT,
        fecha_aprobacion TIMESTAMPTZ,
        observaciones TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS documentos (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        funcionario_id UUID NOT NULL REFERENCES funcionarios(id),
        tipo TEXT NOT NULL,
        nombre TEXT NOT NULL,
        url TEXT,
        estado TEXT NOT NULL DEFAULT 'PENDIENTE_FIRMA',
        firmado_en TIMESTAMPTZ,
        firma_email TEXT,
        firma_ip TEXT,
        codigo_firma TEXT,
        codigo_expira TIMESTAMPTZ,
        generado_por TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS auditoria (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        entidad TEXT NOT NULL,
        entidad_id TEXT NOT NULL,
        accion TEXT NOT NULL,
        campos_modificados JSONB,
        usuario_id TEXT NOT NULL,
        usuario_email TEXT NOT NULL,
        usuario_rol TEXT NOT NULL,
        ip TEXT,
        timestamp TIMESTAMPTZ DEFAULT NOW(),
        metadata JSONB
      );

      CREATE TABLE IF NOT EXISTS balance_permisos (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        funcionario_id UUID NOT NULL REFERENCES funcionarios(id),
        anio INTEGER NOT NULL,
        tipo TEXT NOT NULL,
        dias_disponibles INTEGER NOT NULL DEFAULT 15,
        dias_usados INTEGER NOT NULL DEFAULT 0,
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(funcionario_id, anio, tipo)
      );

      CREATE INDEX IF NOT EXISTS idx_funcionarios_estado ON funcionarios(estado);
      CREATE INDEX IF NOT EXISTS idx_funcionarios_unidad ON funcionarios(unidad);
      CREATE INDEX IF NOT EXISTS idx_permisos_funcionario ON permisos(funcionario_id);
      CREATE INDEX IF NOT EXISTS idx_permisos_estado ON permisos(estado);
      CREATE INDEX IF NOT EXISTS idx_documentos_funcionario ON documentos(funcionario_id);
      CREATE INDEX IF NOT EXISTS idx_auditoria_entidad ON auditoria(entidad, entidad_id);
    `);
    console.log(JSON.stringify({ level: 'INFO', event: 'db_init_success' }));
  } finally {
    client.release();
  }
}
