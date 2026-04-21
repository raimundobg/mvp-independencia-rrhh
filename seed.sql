-- ============================================================
-- SEED DATA — Municipalidad Independencia Ciudadana
-- Ejecutar en Railway Postgres console
-- ============================================================

-- 1. CARGOS
INSERT INTO cargos (id, nombre, descripcion, area, unidad, banda_salarial_min, banda_salarial_max, dotacion_esperada, activo) VALUES
  ('c0000001-0000-0000-0000-000000000001', 'Director de Administración y Finanzas', 'Dirección general de recursos administrativos y financieros', 'Administración', 'Dirección', 1800000, 2500000, 1, true),
  ('c0000001-0000-0000-0000-000000000002', 'Jefe de Recursos Humanos', 'Gestión del personal municipal', 'Administración', 'Recursos Humanos', 1400000, 1900000, 1, true),
  ('c0000001-0000-0000-0000-000000000003', 'Profesional RRHH', 'Apoyo técnico en gestión de personas', 'Administración', 'Recursos Humanos', 900000, 1300000, 3, true),
  ('c0000001-0000-0000-0000-000000000004', 'Jefe de Finanzas', 'Gestión financiera y presupuestaria', 'Administración', 'Finanzas', 1400000, 1900000, 1, true),
  ('c0000001-0000-0000-0000-000000000005', 'Contador', 'Gestión contable municipal', 'Administración', 'Finanzas', 900000, 1300000, 2, true),
  ('c0000001-0000-0000-0000-000000000006', 'Director de Obras', 'Dirección de obras municipales y urbanismo', 'Obras', 'Dirección de Obras', 1800000, 2500000, 1, true),
  ('c0000001-0000-0000-0000-000000000007', 'Inspector Municipal', 'Fiscalización y control urbano', 'Obras', 'Inspección', 750000, 1100000, 5, true),
  ('c0000001-0000-0000-0000-000000000008', 'Asistente Social', 'Atención social a vecinos', 'Social', 'DIDECO', 850000, 1200000, 4, true),
  ('c0000001-0000-0000-0000-000000000009', 'Director DIDECO', 'Dirección de Desarrollo Comunitario', 'Social', 'DIDECO', 1800000, 2400000, 1, true),
  ('c0000001-0000-0000-0000-000000000010', 'Secretaria Municipal', 'Apoyo administrativo a Alcaldía', 'Alcaldía', 'Secretaría Municipal', 800000, 1100000, 2, true),
  ('c0000001-0000-0000-0000-000000000011', 'Profesional TIC', 'Gestión tecnológica municipal', 'Administración', 'TIC', 950000, 1400000, 2, true),
  ('c0000001-0000-0000-0000-000000000012', 'Auxiliar de Servicios', 'Servicios generales y aseo', 'Administración', 'Servicios Generales', 500000, 750000, 8, true)
ON CONFLICT DO NOTHING;

-- 2. FUNCIONARIOS (20 funcionarios con RUTs válidos chilenos)
INSERT INTO funcionarios (
  id, rut, nombres, apellido_paterno, apellido_materno, email, email_personal, telefono,
  fecha_nacimiento, genero, nacionalidad, estado_civil, direccion, comuna, region,
  tipo_contrato, cargo, cargo_id, unidad, area, fecha_ingreso, sueldo_base,
  grado_escalaforma, jornada, afp, isapre, previred_codigo, estado
) VALUES

-- Director DAF (jefe máximo, sin jefe directo)
('f0000001-0000-0000-0000-000000000001',
 '12.345.678-9', 'Carlos Alberto', 'Morales', 'Vega',
 'c.morales@independencia.cl', 'camorales@gmail.com', '+56912345001',
 '1972-03-15', 'M', 'Chilena', 'Casado', 'Av. Independencia 1234', 'Independencia', 'Metropolitana',
 'PLANTA', 'Director de Administración y Finanzas', 'c0000001-0000-0000-0000-000000000001',
 'Dirección', 'Administración', '2010-01-04', 2100000,
 'G-8', 44, 'Habitat', 'Fonasa', 'PRE001', 'ACTIVO'),

-- Jefe RRHH
('f0000001-0000-0000-0000-000000000002',
 '13.456.789-0', 'María José', 'Fuentes', 'Rodríguez',
 'm.fuentes@independencia.cl', 'mjfuentes@gmail.com', '+56912345002',
 '1979-07-22', 'F', 'Chilena', 'Casada', 'Calle Recoleta 567', 'Independencia', 'Metropolitana',
 'PLANTA', 'Jefe de Recursos Humanos', 'c0000001-0000-0000-0000-000000000002',
 'Recursos Humanos', 'Administración', '2013-03-01', 1650000,
 'G-10', 44, 'Cuprum', 'Banmédica', 'PRE002', 'ACTIVO'),

-- Profesional RRHH 1
('f0000001-0000-0000-0000-000000000003',
 '14.567.890-1', 'Valentina', 'Soto', 'Pérez',
 'v.soto@independencia.cl', 'vsoto@gmail.com', '+56912345003',
 '1990-11-08', 'F', 'Chilena', 'Soltera', 'Pasaje Los Pinos 23', 'Independencia', 'Metropolitana',
 'CONTRATA', 'Profesional RRHH', 'c0000001-0000-0000-0000-000000000003',
 'Recursos Humanos', 'Administración', '2019-06-10', 1050000,
 'G-14', 44, 'ProVida', 'Fonasa', 'PRE003', 'ACTIVO'),

-- Profesional RRHH 2
('f0000001-0000-0000-0000-000000000004',
 '15.678.901-2', 'Diego Andrés', 'Castillo', 'Muñoz',
 'd.castillo@independencia.cl', 'dacastillo@gmail.com', '+56912345004',
 '1992-04-30', 'M', 'Chilena', 'Soltero', 'Calle Loreto 890', 'Recoleta', 'Metropolitana',
 'CONTRATA', 'Profesional RRHH', 'c0000001-0000-0000-0000-000000000003',
 'Recursos Humanos', 'Administración', '2021-02-15', 980000,
 'G-15', 44, 'Capital', 'Isapre Cruz Blanca', 'PRE004', 'ACTIVO'),

-- Jefe Finanzas
('f0000001-0000-0000-0000-000000000005',
 '10.234.567-8', 'Roberto', 'Navarro', 'Sepúlveda',
 'r.navarro@independencia.cl', 'rnavarro@gmail.com', '+56912345005',
 '1975-09-12', 'M', 'Chilena', 'Casado', 'Av. El Salto 1122', 'Huechuraba', 'Metropolitana',
 'PLANTA', 'Jefe de Finanzas', 'c0000001-0000-0000-0000-000000000004',
 'Finanzas', 'Administración', '2008-07-21', 1720000,
 'G-9', 44, 'Habitat', 'Consalud', 'PRE005', 'ACTIVO'),

-- Contador 1
('f0000001-0000-0000-0000-000000000006',
 '11.345.678-0', 'Claudia', 'Herrera', 'González',
 'c.herrera@independencia.cl', 'cherrera@gmail.com', '+56912345006',
 '1983-02-19', 'F', 'Chilena', 'Divorciada', 'Calle Santa Filomena 334', 'Providencia', 'Metropolitana',
 'CONTRATA', 'Contador', 'c0000001-0000-0000-0000-000000000005',
 'Finanzas', 'Administración', '2016-08-01', 1050000,
 'G-13', 44, 'Uno', 'Fonasa', 'PRE006', 'ACTIVO'),

-- Contador 2
('f0000001-0000-0000-0000-000000000007',
 '16.789.012-3', 'Sebastián', 'Torres', 'Araya',
 's.torres@independencia.cl', 'storres@gmail.com', '+56912345007',
 '1995-06-25', 'M', 'Chilena', 'Soltero', 'Av. Matta 456', 'Santiago', 'Metropolitana',
 'CONTRATA', 'Contador', 'c0000001-0000-0000-0000-000000000005',
 'Finanzas', 'Administración', '2022-04-01', 920000,
 'G-16', 44, 'ProVida', 'Fonasa', 'PRE007', 'ACTIVO'),

-- Director de Obras
('f0000001-0000-0000-0000-000000000008',
 '9.123.456-7', 'Andrés Felipe', 'Ramírez', 'López',
 'a.ramirez@independencia.cl', 'aframirez@gmail.com', '+56912345008',
 '1968-12-03', 'M', 'Chilena', 'Casado', 'Calle Bellavista 78', 'Independencia', 'Metropolitana',
 'PLANTA', 'Director de Obras', 'c0000001-0000-0000-0000-000000000006',
 'Dirección de Obras', 'Obras', '2005-03-14', 2200000,
 'G-7', 44, 'Cuprum', 'Isapre Vida Tres', 'PRE008', 'ACTIVO'),

-- Inspector 1
('f0000001-0000-0000-0000-000000000009',
 '17.890.123-4', 'Felipe', 'Contreras', 'Villanueva',
 'f.contreras@independencia.cl', 'fcontreras@gmail.com', '+56912345009',
 '1988-08-14', 'M', 'Chilena', 'Casado', 'Pasaje Arauco 12', 'Independencia', 'Metropolitana',
 'CONTRATA', 'Inspector Municipal', 'c0000001-0000-0000-0000-000000000007',
 'Inspección', 'Obras', '2018-01-15', 820000,
 'G-17', 44, 'Capital', 'Fonasa', 'PRE009', 'ACTIVO'),

-- Inspector 2
('f0000001-0000-0000-0000-000000000010',
 '18.901.234-5', 'Luis Miguel', 'Espinoza', 'Rojas',
 'l.espinoza@independencia.cl', 'lmespinoza@gmail.com', '+56912345010',
 '1991-01-27', 'M', 'Chilena', 'Soltero', 'Calle Dieciocho 567', 'Santiago', 'Metropolitana',
 'CONTRATA', 'Inspector Municipal', 'c0000001-0000-0000-0000-000000000007',
 'Inspección', 'Obras', '2020-09-01', 790000,
 'G-17', 44, 'Habitat', 'Fonasa', 'PRE010', 'ACTIVO'),

-- Inspector 3
('f0000001-0000-0000-0000-000000000011',
 '19.012.345-6', 'Rodrigo', 'Méndez', 'Figueroa',
 'r.mendez@independencia.cl', 'rmendez@gmail.com', '+56912345011',
 '1985-05-09', 'M', 'Chilena', 'Casado', 'Av. Presidente Balmaceda 890', 'Independencia', 'Metropolitana',
 'HONORARIOS', 'Inspector Municipal', 'c0000001-0000-0000-0000-000000000007',
 'Inspección', 'Obras', '2023-01-03', 750000,
 NULL, 44, NULL, NULL, 'PRE011', 'ACTIVO'),

-- Director DIDECO
('f0000001-0000-0000-0000-000000000012',
 '8.234.567-6', 'Patricia', 'Valenzuela', 'Castro',
 'p.valenzuela@independencia.cl', 'pvalenzuela@gmail.com', '+56912345012',
 '1971-10-18', 'F', 'Chilena', 'Casada', 'Calle Ecuador 123', 'Independencia', 'Metropolitana',
 'PLANTA', 'Director DIDECO', 'c0000001-0000-0000-0000-000000000009',
 'DIDECO', 'Social', '2007-06-01', 2050000,
 'G-8', 44, 'ProVida', 'Banmédica', 'PRE012', 'ACTIVO'),

-- Asistente Social 1
('f0000001-0000-0000-0000-000000000013',
 '20.123.456-7', 'Camila', 'Rojas', 'Ibáñez',
 'c.rojas@independencia.cl', 'cmrojas@gmail.com', '+56912345013',
 '1993-03-07', 'F', 'Chilena', 'Soltera', 'Pasaje Las Flores 45', 'Independencia', 'Metropolitana',
 'CONTRATA', 'Asistente Social', 'c0000001-0000-0000-0000-000000000008',
 'DIDECO', 'Social', '2020-03-16', 900000,
 'G-15', 44, 'Uno', 'Fonasa', 'PRE013', 'ACTIVO'),

-- Asistente Social 2
('f0000001-0000-0000-0000-000000000014',
 '20.234.567-8', 'Ana Belén', 'Flores', 'Vidal',
 'a.flores@independencia.cl', 'abflores@gmail.com', '+56912345014',
 '1989-07-31', 'F', 'Chilena', 'Casada', 'Calle Toesca 234', 'Santiago', 'Metropolitana',
 'CONTRATA', 'Asistente Social', 'c0000001-0000-0000-0000-000000000008',
 'DIDECO', 'Social', '2017-11-01', 930000,
 'G-14', 44, 'Capital', 'Fonasa', 'PRE014', 'ACTIVO'),

-- Asistente Social 3
('f0000001-0000-0000-0000-000000000015',
 '20.345.678-9', 'Javiera', 'Guzmán', 'Moreno',
 'j.guzman@independencia.cl', 'jguzman@gmail.com', '+56912345015',
 '1996-09-14', 'F', 'Chilena', 'Soltera', 'Av. La Paz 678', 'Independencia', 'Metropolitana',
 'HONORARIOS', 'Asistente Social', 'c0000001-0000-0000-0000-000000000008',
 'DIDECO', 'Social', '2023-07-01', 850000,
 NULL, 44, NULL, NULL, 'PRE015', 'ACTIVO'),

-- Secretaria Municipal 1
('f0000001-0000-0000-0000-000000000016',
 '12.456.789-1', 'Sandra', 'Martínez', 'Donoso',
 's.martinez@independencia.cl', 'smartinez@gmail.com', '+56912345016',
 '1980-04-05', 'F', 'Chilena', 'Casada', 'Calle Vivaceta 901', 'Independencia', 'Metropolitana',
 'PLANTA', 'Secretaria Municipal', 'c0000001-0000-0000-0000-000000000010',
 'Secretaría Municipal', 'Alcaldía', '2012-02-14', 860000,
 'G-15', 44, 'Habitat', 'Fonasa', 'PRE016', 'ACTIVO'),

-- Secretaria Municipal 2
('f0000001-0000-0000-0000-000000000017',
 '20.456.789-0', 'Francisca', 'Pizarro', 'Salinas',
 'f.pizarro@independencia.cl', 'fpizarro@gmail.com', '+56912345017',
 '1997-12-20', 'F', 'Chilena', 'Soltera', 'Pasaje Cumming 56', 'Santiago', 'Metropolitana',
 'CONTRATA', 'Secretaria Municipal', 'c0000001-0000-0000-0000-000000000010',
 'Secretaría Municipal', 'Alcaldía', '2022-08-01', 780000,
 'G-17', 44, 'ProVida', 'Fonasa', 'PRE017', 'ACTIVO'),

-- Profesional TIC 1
('f0000001-0000-0000-0000-000000000018',
 '20.567.890-1', 'Nicolás', 'Vargas', 'Reyes',
 'n.vargas@independencia.cl', 'nvargas@gmail.com', '+56912345018',
 '1994-08-03', 'M', 'Chilena', 'Soltero', 'Av. Irarrázaval 234', 'Ñuñoa', 'Metropolitana',
 'CONTRATA', 'Profesional TIC', 'c0000001-0000-0000-0000-000000000011',
 'TIC', 'Administración', '2021-10-01', 1200000,
 'G-14', 44, 'Cuprum', 'Consalud', 'PRE018', 'ACTIVO'),

-- Profesional TIC 2
('f0000001-0000-0000-0000-000000000019',
 '20.678.901-2', 'Ignacio', 'Saavedra', 'Ríos',
 'i.saavedra@independencia.cl', 'isaavedra@gmail.com', '+56912345019',
 '1998-02-11', 'M', 'Chilena', 'Soltero', 'Calle San Diego 890', 'Santiago', 'Metropolitana',
 'CONTRATA', 'Profesional TIC', 'c0000001-0000-0000-0000-000000000011',
 'TIC', 'Administración', '2023-03-01', 1050000,
 'G-15', 44, 'Capital', 'Fonasa', 'PRE019', 'ACTIVO'),

-- Auxiliar de Servicios 1
('f0000001-0000-0000-0000-000000000020',
 '11.567.890-2', 'Jorge', 'Gallardo', 'Núñez',
 'j.gallardo@independencia.cl', 'jgallardo@gmail.com', '+56912345020',
 '1977-06-16', 'M', 'Chilena', 'Casado', 'Calle Maipú 1234', 'Independencia', 'Metropolitana',
 'PLANTA', 'Auxiliar de Servicios', 'c0000001-0000-0000-0000-000000000012',
 'Servicios Generales', 'Administración', '2003-11-03', 580000,
 'G-20', 44, 'Uno', 'Fonasa', 'PRE020', 'ACTIVO')

ON CONFLICT DO NOTHING;

-- 3. JERARQUÍA (jefe_directo_id)
UPDATE funcionarios SET jefe_directo_id = 'f0000001-0000-0000-0000-000000000001' WHERE id IN (
  'f0000001-0000-0000-0000-000000000002',
  'f0000001-0000-0000-0000-000000000005'
);
UPDATE funcionarios SET jefe_directo_id = 'f0000001-0000-0000-0000-000000000002' WHERE id IN (
  'f0000001-0000-0000-0000-000000000003',
  'f0000001-0000-0000-0000-000000000004'
);
UPDATE funcionarios SET jefe_directo_id = 'f0000001-0000-0000-0000-000000000005' WHERE id IN (
  'f0000001-0000-0000-0000-000000000006',
  'f0000001-0000-0000-0000-000000000007'
);
UPDATE funcionarios SET jefe_directo_id = 'f0000001-0000-0000-0000-000000000008' WHERE id IN (
  'f0000001-0000-0000-0000-000000000009',
  'f0000001-0000-0000-0000-000000000010',
  'f0000001-0000-0000-0000-000000000011'
);
UPDATE funcionarios SET jefe_directo_id = 'f0000001-0000-0000-0000-000000000012' WHERE id IN (
  'f0000001-0000-0000-0000-000000000013',
  'f0000001-0000-0000-0000-000000000014',
  'f0000001-0000-0000-0000-000000000015'
);

-- 4. PERMISOS
INSERT INTO permisos (funcionario_id, tipo, fecha_inicio, fecha_fin, dias_habiles, motivo, estado, aprobado_por, fecha_aprobacion) VALUES
  ('f0000001-0000-0000-0000-000000000003', 'VACACIONES', '2025-01-13', '2025-01-24', 10, 'Vacaciones anuales', 'APROBADO', 'm.fuentes@independencia.cl', '2024-12-20 10:00:00+00'),
  ('f0000001-0000-0000-0000-000000000004', 'VACACIONES', '2025-02-03', '2025-02-07', 5, 'Vacaciones pendientes 2024', 'APROBADO', 'm.fuentes@independencia.cl', '2025-01-29 09:30:00+00'),
  ('f0000001-0000-0000-0000-000000000006', 'ENFERMEDAD', '2025-03-10', '2025-03-12', 3, 'Licencia médica por gripe', 'APROBADO', 'r.navarro@independencia.cl', '2025-03-10 08:00:00+00'),
  ('f0000001-0000-0000-0000-000000000009', 'ADMINISTRATIVO', '2025-04-07', '2025-04-07', 1, 'Trámite notarial', 'APROBADO', 'a.ramirez@independencia.cl', '2025-04-03 11:00:00+00'),
  ('f0000001-0000-0000-0000-000000000013', 'VACACIONES', '2025-07-14', '2025-07-25', 10, 'Vacaciones invierno', 'APROBADO', 'p.valenzuela@independencia.cl', '2025-06-30 10:00:00+00'),
  ('f0000001-0000-0000-0000-000000000016', 'PERMISO_SIN_GOCE', '2025-05-02', '2025-05-02', 1, 'Asunto personal', 'APROBADO', 'admin', '2025-04-28 09:00:00+00'),
  ('f0000001-0000-0000-0000-000000000018', 'VACACIONES', '2026-01-05', '2026-01-16', 10, 'Vacaciones anuales 2025', 'PENDIENTE', NULL, NULL),
  ('f0000001-0000-0000-0000-000000000003', 'VACACIONES', '2026-02-02', '2026-02-13', 10, 'Vacaciones 2026', 'PENDIENTE', NULL, NULL),
  ('f0000001-0000-0000-0000-000000000010', 'ADMINISTRATIVO', '2026-04-25', '2026-04-25', 1, 'Control médico', 'PENDIENTE', NULL, NULL),
  ('f0000001-0000-0000-0000-000000000014', 'ENFERMEDAD', '2026-03-03', '2026-03-05', 3, 'Reposo médico', 'APROBADO', 'p.valenzuela@independencia.cl', '2026-03-03 08:30:00+00')
ON CONFLICT DO NOTHING;

-- 5. DOCUMENTOS
INSERT INTO documentos (funcionario_id, tipo, nombre, url, estado, generado_por) VALUES
  ('f0000001-0000-0000-0000-000000000001', 'CONTRATO', 'Contrato de trabajo Carlos Morales', NULL, 'FIRMADO', 'admin'),
  ('f0000001-0000-0000-0000-000000000002', 'CONTRATO', 'Contrato de trabajo María Fuentes', NULL, 'FIRMADO', 'admin'),
  ('f0000001-0000-0000-0000-000000000003', 'CONTRATO', 'Contrato Valentina Soto 2024', NULL, 'FIRMADO', 'admin'),
  ('f0000001-0000-0000-0000-000000000004', 'CONTRATO', 'Contrato Diego Castillo 2021', NULL, 'FIRMADO', 'admin'),
  ('f0000001-0000-0000-0000-000000000005', 'CONTRATO', 'Contrato Roberto Navarro', NULL, 'FIRMADO', 'admin'),
  ('f0000001-0000-0000-0000-000000000006', 'ANEXO', 'Anexo contrato Claudia Herrera 2023', NULL, 'FIRMADO', 'admin'),
  ('f0000001-0000-0000-0000-000000000009', 'CONTRATO', 'Contrato Felipe Contreras 2018', NULL, 'FIRMADO', 'admin'),
  ('f0000001-0000-0000-0000-000000000013', 'CONTRATO', 'Contrato Camila Rojas 2020', NULL, 'FIRMADO', 'admin'),
  ('f0000001-0000-0000-0000-000000000018', 'CONTRATO', 'Contrato Nicolás Vargas 2021', NULL, 'FIRMADO', 'admin'),
  ('f0000001-0000-0000-0000-000000000019', 'CONTRATO', 'Contrato Ignacio Saavedra 2023', NULL, 'PENDIENTE_FIRMA', 'admin'),
  ('f0000001-0000-0000-0000-000000000015', 'CONTRATO', 'Contrato Honorarios Javiera Guzmán 2023', NULL, 'PENDIENTE_FIRMA', 'admin'),
  ('f0000001-0000-0000-0000-000000000017', 'ANEXO', 'Anexo jornada Francisca Pizarro', NULL, 'PENDIENTE_FIRMA', 'admin'),
  ('f0000001-0000-0000-0000-000000000020', 'FINIQUITO', 'Finiquito anterior Jorge Gallardo', NULL, 'FIRMADO', 'admin'),
  ('f0000001-0000-0000-0000-000000000003', 'CERTIFICADO', 'Certificado antigüedad Valentina Soto', NULL, 'FIRMADO', 'admin'),
  ('f0000001-0000-0000-0000-000000000012', 'CONTRATO', 'Contrato Patricia Valenzuela', NULL, 'FIRMADO', 'admin')
ON CONFLICT DO NOTHING;

-- 6. BALANCE DE PERMISOS 2026
INSERT INTO balance_permisos (funcionario_id, anio, tipo, dias_disponibles, dias_usados) VALUES
  ('f0000001-0000-0000-0000-000000000001', 2026, 'VACACIONES', 20, 0),
  ('f0000001-0000-0000-0000-000000000002', 2026, 'VACACIONES', 18, 0),
  ('f0000001-0000-0000-0000-000000000003', 2026, 'VACACIONES', 15, 10),
  ('f0000001-0000-0000-0000-000000000004', 2026, 'VACACIONES', 15, 0),
  ('f0000001-0000-0000-0000-000000000005', 2026, 'VACACIONES', 20, 0),
  ('f0000001-0000-0000-0000-000000000006', 2026, 'VACACIONES', 15, 0),
  ('f0000001-0000-0000-0000-000000000007', 2026, 'VACACIONES', 15, 0),
  ('f0000001-0000-0000-0000-000000000008', 2026, 'VACACIONES', 20, 0),
  ('f0000001-0000-0000-0000-000000000009', 2026, 'VACACIONES', 15, 0),
  ('f0000001-0000-0000-0000-000000000010', 2026, 'VACACIONES', 15, 0),
  ('f0000001-0000-0000-0000-000000000011', 2026, 'VACACIONES', 15, 0),
  ('f0000001-0000-0000-0000-000000000012', 2026, 'VACACIONES', 18, 0),
  ('f0000001-0000-0000-0000-000000000013', 2026, 'VACACIONES', 15, 10),
  ('f0000001-0000-0000-0000-000000000014', 2026, 'VACACIONES', 15, 0),
  ('f0000001-0000-0000-0000-000000000015', 2026, 'VACACIONES', 15, 0),
  ('f0000001-0000-0000-0000-000000000016', 2026, 'VACACIONES', 18, 0),
  ('f0000001-0000-0000-0000-000000000017', 2026, 'VACACIONES', 15, 0),
  ('f0000001-0000-0000-0000-000000000018', 2026, 'VACACIONES', 15, 10),
  ('f0000001-0000-0000-0000-000000000019', 2026, 'VACACIONES', 15, 0),
  ('f0000001-0000-0000-0000-000000000020', 2026, 'VACACIONES', 20, 0)
ON CONFLICT DO NOTHING;
