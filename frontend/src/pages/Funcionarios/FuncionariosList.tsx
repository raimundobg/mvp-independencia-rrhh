import { useEffect, useState } from 'react'
import { Box, Flex, Text, Button, Input, Badge, Spinner, Grid } from '@chakra-ui/react'
import { Plus, Search, Eye, Edit2, Filter } from 'lucide-react'
import { api } from '../../services/api'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

const NAVY = '#1B2B4B'
const PINK = '#E91E7B'

const ESTADO_COLORS: Record<string, string> = {
  ACTIVO: '#3D8B37', INACTIVO: '#6B7280', LICENCIA: '#F4C430', VACACIONES: '#3B82F6'
}
const CONTRATO_COLORS: Record<string, string> = {
  PLANTA: NAVY, CONTRATA: PINK, HONORARIOS: '#F4C430', CODIGO_TRABAJO: '#3D8B37'
}

export default function FuncionariosList() {
  const [funcionarios, setFuncionarios] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')
  const [estado, setEstado] = useState('')
  const [tipoContrato, setTipoContrato] = useState('')
  const navigate = useNavigate()
  const { user } = useAuth()

  async function load() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (q) params.set('q', q)
      if (estado) params.set('estado', estado)
      if (tipoContrato) params.set('tipo_contrato', tipoContrato)
      const data = await api.get(`/api/v1/external/funcionarios?${params}`)
      setFuncionarios(data || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    load()
  }

  const canEdit = ['ADMIN', 'RRHH'].includes(user?.rol || '')

  return (
    <Box>
      <Flex align="center" justify="space-between" mb={6} flexWrap="wrap" gap={3}>
        <Box>
          <Text fontSize="1.5rem" fontWeight={800} color={NAVY}>Funcionarios</Text>
          <Text fontSize="0.85rem" color="gray.500">{funcionarios.length} registros</Text>
        </Box>
        {canEdit && (
          <Button
            bg={NAVY} color="white" borderRadius="10px" h="40px" fontWeight={700}
            _hover={{ bg: '#142035' }} onClick={() => navigate('/funcionarios/nuevo')}
          >
            <Plus size={16} style={{ marginRight: 6 }} />
            Nuevo Funcionario
          </Button>
        )}
      </Flex>

      <Box bg="white" borderRadius="14px" p={4} mb={4} boxShadow="0 1px 6px rgba(0,0,0,0.05)">
        <Flex as="form" onSubmit={handleSearch} gap={3} flexWrap="wrap">
          <Flex
            flex={1} minW="200px" align="center" border="1.5px solid" borderColor="gray.200"
            borderRadius="8px" bg="white" px={3} gap={2} _focusWithin={{ borderColor: NAVY }}
          >
            <Search size={15} color="#9CA3AF" />
            <Input
              border="none" p={2} pl={0} placeholder="Buscar por nombre, RUT, email..."
              value={q} onChange={e => setQ(e.target.value)} fontSize="0.9rem"
              _focus={{ boxShadow: 'none' }}
            />
          </Flex>
          <select
            value={estado} onChange={e => setEstado(e.target.value)}
            style={{ border: '1.5px solid #E5E7EB', borderRadius: '8px', padding: '0 12px', fontSize: '0.9rem', background: 'white', color: '#374151', minWidth: '140px' }}
          >
            <option value="">Todos los estados</option>
            <option value="ACTIVO">Activo</option>
            <option value="INACTIVO">Inactivo</option>
            <option value="LICENCIA">Licencia</option>
            <option value="VACACIONES">Vacaciones</option>
          </select>
          <select
            value={tipoContrato} onChange={e => setTipoContrato(e.target.value)}
            style={{ border: '1.5px solid #E5E7EB', borderRadius: '8px', padding: '0 12px', fontSize: '0.9rem', background: 'white', color: '#374151', minWidth: '140px' }}
          >
            <option value="">Todos los contratos</option>
            <option value="PLANTA">Planta</option>
            <option value="CONTRATA">Contrata</option>
            <option value="HONORARIOS">Honorarios</option>
            <option value="CODIGO_TRABAJO">Código Trabajo</option>
          </select>
          <Button type="submit" bg={NAVY} color="white" borderRadius="8px" h="40px" fontWeight={600} _hover={{ bg: '#142035' }}>
            <Filter size={14} style={{ marginRight: 6 }} />
            Filtrar
          </Button>
        </Flex>
      </Box>

      {loading ? (
        <Flex justify="center" p={12}><Spinner color={NAVY} size="xl" /></Flex>
      ) : funcionarios.length === 0 ? (
        <Box textAlign="center" py={12}>
          <Text color="gray.400" fontSize="1rem">No se encontraron funcionarios</Text>
        </Box>
      ) : (
        <>
          <Box display={{ base: 'none', md: 'block' }} bg="white" borderRadius="14px" boxShadow="0 1px 6px rgba(0,0,0,0.05)" overflow="hidden">
            <Box overflowX="auto">
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                    {['Funcionario', 'RUT', 'Cargo', 'Unidad', 'Contrato', 'Estado', 'Acciones'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '12px 16px', color: '#6B7280', fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {funcionarios.map(f => (
                    <tr key={f.id} style={{ borderBottom: '1px solid #F3F4F6' }} onMouseEnter={e => (e.currentTarget.style.background = '#FAFAFA')} onMouseLeave={e => (e.currentTarget.style.background = '')}>
                      <td style={{ padding: '12px 16px' }}>
                        <Flex align="center" gap={2}>
                          <Box w="32px" h="32px" borderRadius="full" bg={NAVY} display="flex" alignItems="center" justifyContent="center" color="white" fontWeight={700} fontSize="0.75rem" flexShrink={0}>
                            {f.nombres[0]}{f.apellido_paterno[0]}
                          </Box>
                          <Box>
                            <Text fontWeight={600} color={NAVY} fontSize="0.875rem">{f.nombres} {f.apellido_paterno}</Text>
                            <Text fontSize="0.75rem" color="gray.500">{f.email}</Text>
                          </Box>
                        </Flex>
                      </td>
                      <td style={{ padding: '12px 16px', color: '#374151', fontFamily: 'monospace' }}>{f.rut}</td>
                      <td style={{ padding: '12px 16px', color: '#374151' }}>{f.cargo}</td>
                      <td style={{ padding: '12px 16px', color: '#374151' }}>{f.unidad}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <Box display="inline-block" px={2} py={0.5} borderRadius="full" fontSize="0.7rem" fontWeight={700} color="white" bg={CONTRATO_COLORS[f.tipo_contrato] || '#6B7280'}>
                          {f.tipo_contrato}
                        </Box>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <Box display="inline-block" px={2} py={0.5} borderRadius="full" fontSize="0.7rem" fontWeight={700} color="white" bg={ESTADO_COLORS[f.estado] || '#6B7280'}>
                          {f.estado}
                        </Box>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <Flex gap={2}>
                          <Button size="xs" variant="ghost" color={NAVY} onClick={() => navigate(`/funcionarios/${f.id}`)}><Eye size={14} /></Button>
                          {canEdit && <Button size="xs" variant="ghost" color={PINK} onClick={() => navigate(`/funcionarios/${f.id}/editar`)}><Edit2 size={14} /></Button>}
                        </Flex>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Box>
          </Box>

          <Grid templateColumns={{ base: '1fr', sm: 'repeat(2,1fr)' }} gap={3} display={{ base: 'grid', md: 'none' }}>
            {funcionarios.map(f => (
              <Box key={f.id} bg="white" borderRadius="12px" p={4} boxShadow="0 1px 6px rgba(0,0,0,0.05)" onClick={() => navigate(`/funcionarios/${f.id}`)} cursor="pointer">
                <Flex align="center" gap={2} mb={2}>
                  <Box w="36px" h="36px" borderRadius="full" bg={NAVY} display="flex" alignItems="center" justifyContent="center" color="white" fontWeight={700} fontSize="0.8rem">
                    {f.nombres[0]}{f.apellido_paterno[0]}
                  </Box>
                  <Box flex={1} minW={0}>
                    <Text fontWeight={700} color={NAVY} fontSize="0.875rem" noOfLines={1}>{f.nombres} {f.apellido_paterno}</Text>
                    <Text fontSize="0.75rem" color="gray.500" noOfLines={1}>{f.cargo}</Text>
                  </Box>
                </Flex>
                <Text fontSize="0.75rem" color="gray.500">{f.unidad} · {f.rut}</Text>
                <Flex gap={1} mt={2}>
                  <Box display="inline-block" px={2} py={0.5} borderRadius="full" fontSize="0.65rem" fontWeight={700} color="white" bg={CONTRATO_COLORS[f.tipo_contrato] || '#6B7280'}>{f.tipo_contrato}</Box>
                  <Box display="inline-block" px={2} py={0.5} borderRadius="full" fontSize="0.65rem" fontWeight={700} color="white" bg={ESTADO_COLORS[f.estado] || '#6B7280'}>{f.estado}</Box>
                </Flex>
              </Box>
            ))}
          </Grid>
        </>
      )}
    </Box>
  )
}
