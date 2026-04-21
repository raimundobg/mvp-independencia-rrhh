import { Request, Response, NextFunction } from 'express';
import admin from 'firebase-admin';
import { pool } from '../db';

let initialized = false;

function ensureFirebase() {
  if (initialized) return;
  const sa = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (sa) {
    admin.initializeApp({ credential: admin.credential.cert(JSON.parse(sa)) });
  } else {
    admin.initializeApp({ projectId: process.env.FIREBASE_PROJECT_ID || 'demo-project' });
  }
  initialized = true;
}

export interface AuthUser {
  uid: string;
  email: string;
  rol: string;
  nombre?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export async function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    ensureFirebase();
    const token = req.headers.authorization?.split('Bearer ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });

    const decoded = await admin.auth().verifyIdToken(token);
    const { rows } = await pool.query(
      'SELECT * FROM usuarios WHERE firebase_uid = $1',
      [decoded.uid]
    );

    let user = rows[0];
    if (!user) {
      const insert = await pool.query(
        `INSERT INTO usuarios (firebase_uid, email, nombre, rol, estado)
         VALUES ($1, $2, $3, 'PENDIENTE', 'PENDIENTE')
         ON CONFLICT (firebase_uid) DO UPDATE SET email = EXCLUDED.email
         RETURNING *`,
        [decoded.uid, decoded.email, decoded.name || decoded.email]
      );
      user = insert.rows[0];
    }

    req.user = {
      uid: decoded.uid,
      email: user.email,
      rol: user.rol,
      nombre: user.nombre,
    };
    next();
  } catch (e) {
    console.error(JSON.stringify({ level: 'ERROR', event: 'auth_failed', error: String(e) }));
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    if (!roles.includes(req.user.rol)) {
      return res.status(403).json({ error: 'Forbidden: insufficient permissions' });
    }
    next();
  };
}
