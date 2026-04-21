import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import AppShell from './components/Layout/AppShell'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import FuncionariosList from './pages/Funcionarios/FuncionariosList'
import FuncionarioDetail from './pages/Funcionarios/FuncionarioDetail'
import FuncionarioForm from './pages/Funcionarios/FuncionarioForm'
import PermisosList from './pages/Permisos/PermisosList'
import PermisosForm from './pages/Permisos/PermisosForm'
import DocumentosList from './pages/Documentos/DocumentosList'
import Organigrama from './pages/Organigrama'
import Directorio from './pages/Directorio'
import MiPerfil from './pages/MiPerfil'
import UsuariosAdmin from './pages/Admin/UsuariosAdmin'
import ReportesDashboard from './pages/Reportes/ReportesDashboard'
import AuditoriaList from './pages/Auditoria/AuditoriaList'
import Pending from './pages/Pending'
import { Box, Spinner } from '@chakra-ui/react'

function ProtectedRoute({ children, roles }: { children: React.ReactNode; roles?: string[] }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <Box minH="100vh" display="flex" alignItems="center" justifyContent="center" bg="#F5F3EE">
      <Spinner size="xl" color="#1B2B4B" />
    </Box>
  )
  if (!user) return <Navigate to="/login" replace />
  if (user.estado === 'PENDIENTE') return <Pending />
  if (roles && !roles.includes(user.rol)) return <Navigate to="/" replace />
  return <>{children}</>
}

function AppRoutes() {
  const { user, loading } = useAuth()
  if (loading) return (
    <Box minH="100vh" display="flex" alignItems="center" justifyContent="center" bg="#F5F3EE">
      <Spinner size="xl" color="#1B2B4B" />
    </Box>
  )
  if (!user) return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )

  return (
    <Routes>
      <Route path="/login" element={<Navigate to="/" replace />} />
      <Route element={<AppShell />}>
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/funcionarios" element={<ProtectedRoute><FuncionariosList /></ProtectedRoute>} />
        <Route path="/funcionarios/nuevo" element={<ProtectedRoute roles={['ADMIN','RRHH']}><FuncionarioForm /></ProtectedRoute>} />
        <Route path="/funcionarios/:id" element={<ProtectedRoute><FuncionarioDetail /></ProtectedRoute>} />
        <Route path="/funcionarios/:id/editar" element={<ProtectedRoute roles={['ADMIN','RRHH']}><FuncionarioForm /></ProtectedRoute>} />
        <Route path="/permisos" element={<ProtectedRoute><PermisosList /></ProtectedRoute>} />
        <Route path="/permisos/nuevo" element={<ProtectedRoute><PermisosForm /></ProtectedRoute>} />
        <Route path="/documentos" element={<ProtectedRoute><DocumentosList /></ProtectedRoute>} />
        <Route path="/organigrama" element={<ProtectedRoute><Organigrama /></ProtectedRoute>} />
        <Route path="/directorio" element={<ProtectedRoute><Directorio /></ProtectedRoute>} />
        <Route path="/mi-perfil" element={<ProtectedRoute><MiPerfil /></ProtectedRoute>} />
        <Route path="/reportes" element={<ProtectedRoute roles={['ADMIN','RRHH']}><ReportesDashboard /></ProtectedRoute>} />
        <Route path="/auditoria" element={<ProtectedRoute roles={['ADMIN','RRHH']}><AuditoriaList /></ProtectedRoute>} />
        <Route path="/admin/usuarios" element={<ProtectedRoute roles={['ADMIN']}><UsuariosAdmin /></ProtectedRoute>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
