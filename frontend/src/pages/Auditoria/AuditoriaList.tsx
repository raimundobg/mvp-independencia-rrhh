import { useEffect, useState } from 'react'
import { Box, Flex, Text, Button, Spinner } from '@chakra-ui/react'
import { downloadFile, api } from '../../services/api'
import { Download } from 'lucide-react'

const NAVY = '#1B2B4B'

const ACCION_BG: Record<string, string> = {
  CREATE: '#3D8B37', UPDATE: '#3B82F6', DELETE: '#EF4444',
  APPROVE: '#10B981', REJECT: '#F59E0B', SIGN: '#8B5CF6'
}

export default function AuditoriaList() {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [desde, setDesde] = useState('')
  const [hasta, setHasta] = useState('')

  async function load() {
    setLoading(true)
    const params = new URLSearchParams()
    if (desde) params.set('desde', desde)
    if (hasta) params.set('hasta', hasta)
    try {
      const data = await api.get(`/api/v1/external/auditoria?${params}&limit=200`)
      setLogs(data || [])
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const inputStyle = { border: '1.5px solid #E5E7EB', borderRadius: '8px', padding: '7px 12px', fontSize: '0.9rem', background: 'white', color: '#374151', outline: 'none' }

  return (
    <Box>
      <Flex align="center" justify="space-between" mb={6} flexWrap="wrap" gap={3}>
        <Box>
          <Text fontSize="1.5rem" fontWeight={800} color={NAVY}>Historial de Auditoría</Text>
          <Text fontSize="0.85rem" color="gray.500">{logs.length} registros</Text>
        </Box>
        <Button
          bg="#3D8B37" color="white" borderRadius="10px" h="40px" fontWeight={700}
          _hover={{ bg: '#2d6928' }}
          onClick={() => {
            const params = new URLSearchParams()
            if (desde) params.set('desde', desde)
            if (hasta) params.set('hasta', hasta)
            downloadFile(`/api/v1/external/reportes/auditoria?${params}`, 'auditoria.xlsx')
          }}
        >
          <Download size={14} style={{ marginRight: 6 }} />
          Exportar Excel
        </Button>
      </Flex>

      <Box bg="white" borderRadius="14px" p={4} mb={4} boxShadow="0 1px 6px rgba(0,0,0,0.05)">
        <Flex gap={3} flexWrap="wrap" align="center">
          <Box>
            <Text fontSize="0.75rem" color="gray.500" mb={1}>Desde</Text>
            <input style={inputStyle} type="date" value={desde} onChange={e => setDesde(e.target.value)} />
          </Box>
          <Box>
            <Text fontSize="0.75rem" color="gray.500" mb={1}>Hasta</Text>
            <input style={inputStyle} type="date" value={hasta} onChange={e => setHasta(e.target.value)} />
          </Box>
          <Button bg={NAVY} color="white" borderRadius="8px" h="38px" fontWeight={600} _hover={{ bg: '#142035' }} onClick={load} mt={4}>
            Filtrar
          </Button>
        </Flex>
      </Box>

      {loading ? (
        <Flex justify="center" p={12}><Spinner color={NAVY} size="xl" /></Flex>
      ) : logs.length === 0 ? (
        <Box textAlign="center" py={12}><Text color="gray.400">No hay registros de auditoría</Text></Box>
      ) : (
        <Box bg="white" borderRadius="14px" boxShadow="0 1px 6px rgba(0,0,0,0.05)" overflow="hidden">
          <Box overflowX="auto">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
              <thead>
                <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                  {['Fecha/Hora', 'Entidad', 'Acción', 'Usuario', 'Rol', 'IP'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '10px 16px', color: '#6B7280', fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {logs.map(l => (
                  <tr key={l.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                    <td style={{ padding: '10px 16px', color: '#6B7280', whiteSpace: 'nowrap' }}>
                      {new Date(l.timestamp).toLocaleString('es-CL')}
                    </td>
                    <td style={{ padding: '10px 16px', fontWeight: 600, color: NAVY }}>
                      {l.entidad}
                    </td>
                    <td style={{ padding: '10px 16px' }}>
                      <Box display="inline-block" px={2} py={0.5} borderRadius="full" fontSize="0.68rem" fontWeight={700} color="white" bg={ACCION_BG[l.accion] || '#6B7280'}>
                        {l.accion}
                      </Box>
                    </td>
                    <td style={{ padding: '10px 16px', color: '#374151' }}>{l.usuario_email}</td>
                    <td style={{ padding: '10px 16px', color: '#6B7280' }}>{l.usuario_rol}</td>
                    <td style={{ padding: '10px 16px', color: '#9CA3AF', fontFamily: 'monospace' }}>{l.ip}</td>
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
