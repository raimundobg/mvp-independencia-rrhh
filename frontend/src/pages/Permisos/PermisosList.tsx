import { useEffect, useState } from 'react'
import { Box, Flex, Text, Button, Spinner } from '@chakra-ui/react'
import { Plus, CheckCircle, XCircle } from 'lucide-react'
import { api } from '../../services/api'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

const NAVY = '#1B2B4B'
const PINK = '#E91E7B'

const ESTADO_BG: Record<string, string> = {
  PENDIENTE: '#F4C430', APROBADO: '#3D8B37', RECHAZADO: '#EF4444', CANCELADO: '#6B7280'
}

export default function PermisosList() {
  const [permisos, setPermisos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [estado, setEstado] = useState('')
  const navigate = useNavigate()
  const { user } = useAuth()
  const canApprove = ['ADMIN', 'RRHH', 'JEFATURA'].includes(user?.rol || '')

  async function load() {
    setLoading(true)
    try {
      const params = estado ? `?estado=${estado}` : ''
      const data = await api.get(`/api/v1/external/permisos${params}`)
      setPermisos(data || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [estado])

  async function handleAprobar(id: string) {
    if (!confirm('¿Aprobar este permiso?')) return
    await api.put(`/api/v1/external/permisos/${id}/aprobar`, { observaciones: '' })
    load()
  }

  async function handleRechazar(id: string) {
    const obs = prompt('Motivo de rechazo (opcional):')
    await api.put(`/api/v1/external/permisos/${id}/rechazar`, { observaciones: obs || '' })
    load()
  }

  return (
    <Box>
      <Flex align="center" justify="space-between" mb={6} flexWrap="wrap" gap={3}>
        <Box>
          <Text fontSize="1.5rem" fontWeight={800} color={NAVY}>Permisos y Vacaciones</Text>
          <Text fontSize="0.85rem" color="gray.500">{permisos.length} registros</Text>
        </Box>
        <Button bg={NAVY} color="white" borderRadius="10px" h="40px" fontWeight={700} _hover={{ bg: '#142035' }} onClick={() => navigate('/permisos/nuevo')}>
          <Plus size={16} style={{ marginRight: 6 }} />
          Solicitar Permiso
        </Button>
      </Flex>

      <Box bg="white" borderRadius="14px" p={4} mb={4} boxShadow="0 1px 6px rgba(0,0,0,0.05)">
        <Flex gap={3}>
          {['', 'PENDIENTE', 'APROBADO', 'RECHAZADO', 'CANCELADO'].map(s => (
            <Button
              key={s}
              size="sm"
              borderRadius="8px"
              fontWeight={estado === s ? 700 : 500}
              bg={estado === s ? NAVY : 'gray.100'}
              color={estado === s ? 'white' : 'gray.600'}
              _hover={{ bg: estado === s ? NAVY : 'gray.200' }}
              onClick={() => setEstado(s)}
            >
              {s || 'Todos'}
            </Button>
          ))}
        </Flex>
      </Box>

      {loading ? (
        <Flex justify="center" p={12}><Spinner color={NAVY} size="xl" /></Flex>
      ) : permisos.length === 0 ? (
        <Box textAlign="center" py={12}><Text color="gray.400">No hay permisos registrados</Text></Box>
      ) : (
        <Box bg="white" borderRadius="14px" boxShadow="0 1px 6px rgba(0,0,0,0.05)" overflow="hidden">
          <Box overflowX="auto">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                  {['Funcionario', 'Tipo', 'Desde', 'Hasta', 'Días', 'Estado', ...(canApprove ? ['Acciones'] : [])].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '12px 16px', color: '#6B7280', fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {permisos.map(p => (
                  <tr key={p.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 600, color: NAVY }}>{p.funcionario_nombre}</td>
                    <td style={{ padding: '12px 16px', color: '#374151' }}>{p.tipo.replace(/_/g, ' ')}</td>
                    <td style={{ padding: '12px 16px', color: '#374151' }}>{new Date(p.fecha_inicio).toLocaleDateString('es-CL')}</td>
                    <td style={{ padding: '12px 16px', color: '#374151' }}>{new Date(p.fecha_fin).toLocaleDateString('es-CL')}</td>
                    <td style={{ padding: '12px 16px', fontWeight: 700, color: NAVY }}>{p.dias_habiles}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <Box display="inline-block" px={2} py={0.5} borderRadius="full" fontSize="0.7rem" fontWeight={700} color="white" bg={ESTADO_BG[p.estado] || '#6B7280'}>
                        {p.estado}
                      </Box>
                    </td>
                    {canApprove && (
                      <td style={{ padding: '12px 16px' }}>
                        {p.estado === 'PENDIENTE' && (
                          <Flex gap={2}>
                            <Button size="xs" bg="#3D8B37" color="white" borderRadius="6px" onClick={() => handleAprobar(p.id)} _hover={{ bg: '#2d6928' }}>
                              <CheckCircle size={12} style={{ marginRight: 4 }} />Aprobar
                            </Button>
                            <Button size="xs" bg="#EF4444" color="white" borderRadius="6px" onClick={() => handleRechazar(p.id)} _hover={{ bg: '#dc2626' }}>
                              <XCircle size={12} style={{ marginRight: 4 }} />Rechazar
                            </Button>
                          </Flex>
                        )}
                        {p.estado !== 'PENDIENTE' && (
                          <Text fontSize="0.75rem" color="gray.500">{p.aprobado_por || '—'}</Text>
                        )}
                      </td>
                    )}
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
