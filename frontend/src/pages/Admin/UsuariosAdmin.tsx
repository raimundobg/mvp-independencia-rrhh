import { useEffect, useState } from 'react'
import { Box, Flex, Text, Button, Spinner } from '@chakra-ui/react'
import { api } from '../../services/api'

const NAVY = '#1B2B4B'
const PINK = '#E91E7B'
const ROL_COLORS: Record<string, string> = { ADMIN: '#7C3AED', RRHH: PINK, JEFATURA: '#1B2B4B', USUARIO: '#3D8B37', PENDIENTE: '#F4C430' }

const ROLES = ['ADMIN', 'RRHH', 'JEFATURA', 'USUARIO', 'PENDIENTE']

export default function UsuariosAdmin() {
  const [usuarios, setUsuarios] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    try {
      const data = await api.get('/api/v1/internal/usuarios')
      setUsuarios(data || [])
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  async function handleRol(id: string, rol: string) {
    setSaving(id)
    try {
      await api.put(`/api/v1/internal/usuarios/${id}/rol`, { rol })
      setUsuarios(us => us.map(u => u.id === id ? { ...u, rol, estado: rol === 'PENDIENTE' ? 'PENDIENTE' : 'ACTIVO' } : u))
    } catch (err: any) { alert(err.message) } finally { setSaving(null) }
  }

  return (
    <Box>
      <Box mb={6}>
        <Text fontSize="1.5rem" fontWeight={800} color={NAVY}>Administración de Usuarios</Text>
        <Text fontSize="0.85rem" color="gray.500">Gestiona los roles y permisos de acceso al sistema</Text>
      </Box>

      <Box bg="#FFF8E1" border="1px solid #F4C43040" borderRadius="12px" p={4} mb={5}>
        <Text fontSize="0.85rem" color="#92400E" fontWeight={500}>
          💡 Los usuarios que se registran por primera vez quedan en estado <strong>PENDIENTE</strong>. Asigna el rol correspondiente para darles acceso.
        </Text>
      </Box>

      {loading ? (
        <Flex justify="center" p={12}><Spinner color={NAVY} size="xl" /></Flex>
      ) : (
        <Box bg="white" borderRadius="14px" boxShadow="0 1px 6px rgba(0,0,0,0.05)" overflow="hidden">
          <Box overflowX="auto">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                  {['Usuario', 'Email', 'Rol Actual', 'Estado', 'Registrado', 'Cambiar Rol'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '12px 16px', color: '#6B7280', fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {usuarios.map(u => (
                  <tr key={u.id} style={{ borderBottom: '1px solid #F3F4F6', background: u.rol === 'PENDIENTE' ? '#FFFBEB' : '' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <Flex align="center" gap={2}>
                        <Box w="32px" h="32px" borderRadius="full" bg={ROL_COLORS[u.rol] || '#6B7280'} display="flex" alignItems="center" justifyContent="center" color="white" fontWeight={700} fontSize="0.75rem">
                          {(u.nombre || u.email)[0].toUpperCase()}
                        </Box>
                        <Text fontWeight={600} color={NAVY}>{u.nombre || '—'}</Text>
                      </Flex>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#374151' }}>{u.email}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <Box display="inline-block" px={2} py={0.5} borderRadius="full" fontSize="0.7rem" fontWeight={700} color="white" bg={ROL_COLORS[u.rol] || '#6B7280'}>
                        {u.rol}
                      </Box>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <Box display="inline-block" px={2} py={0.5} borderRadius="full" fontSize="0.7rem" fontWeight={700}
                        bg={u.estado === 'ACTIVO' ? '#3D8B3718' : '#F4C43018'}
                        color={u.estado === 'ACTIVO' ? '#3D8B37' : '#92400E'}
                      >
                        {u.estado}
                      </Box>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#6B7280', fontSize: '0.8rem' }}>
                      {new Date(u.created_at).toLocaleDateString('es-CL')}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <select
                        value={u.rol}
                        onChange={e => handleRol(u.id, e.target.value)}
                        disabled={saving === u.id}
                        style={{
                          border: '1.5px solid #E5E7EB', borderRadius: '6px', padding: '4px 8px',
                          fontSize: '0.82rem', background: 'white', color: '#374151', outline: 'none',
                          cursor: 'pointer', opacity: saving === u.id ? 0.5 : 1,
                        }}
                      >
                        {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Box>
        </Box>
      )}
    </Box>
  )
}
