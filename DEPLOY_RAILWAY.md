# Deploy a Railway — MVP RRHH Independencia Ciudadana

## Pasos para deploy en Railway

### 1. Crear proyecto en Railway

1. Ve a [railway.app](https://railway.app) e inicia sesión
2. Crea un nuevo proyecto: **New Project**
3. Selecciona **Deploy from GitHub repo** (o sube el código directo)

### 2. Agregar PostgreSQL

En tu proyecto Railway:
1. Click en **+ Add Service**
2. Selecciona **Database → PostgreSQL**
3. Railway creará la base de datos y agregará `DATABASE_URL` automáticamente al entorno

### 3. Configurar Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com)
2. Crea un proyecto (o usa uno existente)
3. **Authentication** → Activa **Email/Password** y **Google**
4. Agrega tu dominio Railway a los dominios autorizados: `tu-app.railway.app`
5. **Configuración del proyecto** → **Cuentas de servicio** → **Generar nueva clave privada**
   - Descarga el JSON y úsalo para `FIREBASE_SERVICE_ACCOUNT`
6. Copia la configuración del SDK web para las variables `VITE_FIREBASE_*`

### 4. Variables de entorno en Railway

En tu servicio Railway, ve a **Variables** y agrega:

```env
# Base de datos (Railway lo agrega automáticamente si usas el plugin PostgreSQL)
DATABASE_URL=postgresql://...

# Firebase Admin (service account JSON completo como string)
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"..."}

# Entorno
NODE_ENV=production
PORT=3000

# Opcional: RUT de la corporación para PreviRed
RUT_EMPLEADOR=XX.XXX.XXX-X
```

Para el frontend (si deploys separado):
```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

> **Nota:** En producción (Railway), el backend sirve el frontend compilado, por lo que `VITE_API_URL` debe estar vacío (mismo origen).

### 5. Deploy

Railway detecta automáticamente el `package.json` raíz y ejecuta:
- **Build:** `npm run build` (compila frontend + backend)
- **Start:** `npm start` (inicia el servidor Express)

El servidor Express sirve el frontend compilado en todas las rutas no-API.

### 6. Primer uso

1. Accede a tu URL Railway (ej: `https://independencia-rrhh.railway.app`)
2. Inicia sesión con tu email corporativo o Google
3. El primer usuario que inicie sesión quedará en estado **PENDIENTE**
4. Para activar el primer ADMIN, ejecuta este SQL en Railway → PostgreSQL → Data:

```sql
UPDATE usuarios SET rol = 'ADMIN', estado = 'ACTIVO' WHERE email = 'tu-email@independencia.cl';
```

5. Luego desde la UI (**Usuarios** en el menú), puedes asignar roles a los demás usuarios

---

## Estructura del proyecto

```
mvp-independencia-rrhh/
├── package.json          ← Build y start scripts (Railway usa este)
├── railway.json          ← Configuración Railway
├── backend/
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── index.ts      ← Express server + static files
│       ├── db.ts         ← PostgreSQL + schema auto-migración
│       ├── middleware/auth.ts
│       └── routes/       ← todos los endpoints API
└── frontend/
    ├── package.json
    ├── vite.config.ts
    └── src/
        └── ...           ← React app (compilada dentro de backend)
```

## Módulos implementados

| Módulo | Estado |
|--------|--------|
| Auth Firebase (Email + Google) | ✅ |
| 4 roles (ADMIN, RRHH, JEFATURA, USUARIO) | ✅ |
| Ficha de funcionarios (CRUD completo) | ✅ |
| Organigrama jerárquico interactivo | ✅ |
| Directorio de contactos | ✅ |
| Permisos y vacaciones (flujo completo) | ✅ |
| Balance de días por funcionario | ✅ |
| Gestión documental | ✅ |
| Firma digital OTP por email | ✅ |
| Dashboard con gráficos | ✅ |
| Reportes Excel descargables | ✅ |
| Exportable PreviRed (TXT) | ✅ |
| Auditoría de cambios | ✅ |
| Admin de usuarios/roles | ✅ |
| Responsive (mobile-first) | ✅ |

## Costos Railway estimados

| Servicio | Plan | Costo |
|----------|------|-------|
| Railway Starter | Incluido | $0/mes |
| PostgreSQL (Railway) | ~500MB | ~$5 USD/mes |
| **Total estimado** | | **~$5–10 USD/mes** |

---

*Shelby Dev Co · MVP RRHH Independencia Ciudadana · Abril 2026*
