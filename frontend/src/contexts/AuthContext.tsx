import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, onAuthStateChanged, signOut } from 'firebase/auth'
import { auth } from '../firebase'
import { api } from '../services/api'

interface AuthUser {
  firebaseUser: User
  uid: string
  email: string
  nombre?: string
  rol: string
  estado: string
}

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: async () => {},
  refreshUser: async () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  async function fetchMe(firebaseUser: User) {
    try {
      const token = await firebaseUser.getIdToken()
      const data = await api.get('/api/v1/internal/me', token)
      setUser({
        firebaseUser,
        uid: firebaseUser.uid,
        email: data.email,
        nombre: data.nombre,
        rol: data.rol,
        estado: data.estado,
      })
    } catch {
      setUser({
        firebaseUser,
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        rol: 'PENDIENTE',
        estado: 'PENDIENTE',
      })
    }
  }

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        await fetchMe(firebaseUser)
      } else {
        setUser(null)
      }
      setLoading(false)
    })
    return unsub
  }, [])

  async function refreshUser() {
    if (user?.firebaseUser) await fetchMe(user.firebaseUser)
  }

  async function logout() {
    await signOut(auth)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
