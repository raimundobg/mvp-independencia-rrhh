import { useEffect, useState } from 'react'
import { Box, Flex, Text, Button, Grid, Spinner, Tabs } from '@chakra-ui/react'
import { ArrowLeft, Edit2, Calendar, FileText, ClipboardList } from 'lucide-react'
import { api } from '../../services/api'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

const NAVY = '#1B2B4B'
const PINK = '#E91E7B'

function InfoRow({ label, value }: { label: string; value?: string | number }) {
  return (
    <Box>
      <Text fontSize="0.75rem" color="gray.500" fontWeight={500} mb={0.5}>{label}</Text>
      <Text fontSize="0.9rem" color={NAVY} fontWeight={600}>{value || '—'}</Text>
    </Box>
  )
}

export default function FuncionarioDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [f, setF] = useState<any>(null)
  const [permisos, setPermisos] = useState<any[]>([])
  const [documentos, setDocumentos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const canEdit = ['ADMIN', 'RRHH'].includes(user?.rol || '')

  useEffect(() => {
    Promise.all([
      api.get(`/api/v1/external/funcionarios/${id}`),
      api.get(`/api/v1/external/permisos?funcionario_id=${id}`),
      api.get(`/api/v1/external/documentos?funcionario_id=${id}`),
    ]).then(([func, perm, docs]) => {
      setF(func); setPermisos(perm || []); setDocumentos(docs || [])
    }).catch(console.error).finally(() => setLoading(false))
  }, [id])

  if (loading) return <Flex justify="center" p={12}><Spinner color={NAVY} size="xl" /></Flex>
  if (!f) return <Text color="gray.500">Funcionario no encontrado</Text>

  const ESTADO_BG: Record<string, string> = { ACTIVO: '#3D8B37', INACTIVO: '#6B7280', LICENCIA: '#F4C430', VACACIONES: '#3B82F6' }
  const PERMISO_BG: Record<string, string> = { PENDIENTE: '#F4C430', APROBADO: '#3D8B37', RECHAZADO: '#EF4444', CANCELADO: '#6B7280' }

  return (
    <Box>
      <Flex align="center" gap={3} mb={6} flexWrap="wrap">
        <Button variant="ghost" color={NAVY} onClick={() => navigate('/funcionarios')} p={2}><ArrowLeft size={18} /></Button>
        <Box flex={1}>
          <Flex align="center" gap={3} flexWrap="wrap">
            <Box w="48px" h="48px" borderRadius="full" bg={NAVY} display="flex" alignItems="center" justifyContent="center" color="white" fontWeight={800} fontSize="1rem">
              {f.nombres[0]}{f.apellido_paterno[0]}
            </Box>
            <Box>
              <Text fontSize="1.4rem" fontWeight={800} color={NAVY}>{f.nombres} {f.apellido_paterno} {f.apellido_materno}</Text>
              <Flex align="center" gap={2}>
                <Text fontSize="0.85rem" color="gray.500">{f.cargo} · {f.unidad}</Text>
                <Box px={2} py={0.5} borderRadius="full" fontSize="0.7rem" fontWeight={700} color="white" bg={ESTADO_BG[f.estado] || '#6B7280'}>{f.estado}</Box>
              </Flex>
            </Box>
          </Flex>
        </Box>
        {canEdit && (
          <Button bg={NAVY} color="white" borderRadius="10px" h="38px" fontWeight={600} onClick={() => navigate(`/funcionarios/${id}/editar`)}>
            <Edit2 size={14} style={{ marginRight: 6 }} />Editar
          </Button>
        )}
      </Flex>

      <Tabs.Root defaultValue="datos">
        <Tabs.List mb={4}>
          <Tabs.Trigger value="datos">Datos Personales</Tabs.Trigger>
          <Tabs.Trigger value="contrato">Contrato</Tabs.Trigger>
          <Tabs.Trigger value="permisos">Permisos ({permisos.length})</Tabs.Trigger>
          <Tabs.Trigger value="documentos">Documentos ({documentos.length})</Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="datos">
          <Box bg="white" borderRadius="14px" p={5} boxShadow="0 1px 6px rgba(0,0,0,0.05)">
            <Grid templateColumns={{ base: '1fr 1fr', md: 'repeat(3,1fr)' }} gap={5}>
              <InfoRow label="RUT" value={f.rut} />
              <InfoRow label="Email institucional" value={f.email} />
              <InfoRow label="Email personal" value={f.email_personal} />
              <InfoRow label="Teléfono" value={f.telefono} />
              <InfoRow label="Fecha nacimiento" value={f.fecha_nacimiento ? new Date(f.fecha_nacimiento).toLocaleDateString('es-CL') : ''} />
              <InfoRow label="Género" value={{ M: 'Masculino', F: 'Femenino', NB: 'No binario', NI: 'No indica' }[f.genero as string]} />
              <InfoRow label="Nacionalidad" value={f.nacionalidad} />
              <InfoRow label="Estado civil" value={f.estado_civil} />
              <InfoRow label="Dirección" value={`${f.direccion || ''} ${f.comuna || ''} ${f.region || ''}`.trim()} />
            </Grid>
          </Box>
        </Tabs.Content>

        <Tabs.Content value="contrato">
          <Box bg="white" borderRadius="14px" p={5} boxShadow="0 1px 6px rgba(0,0,0,0.05)">
            <Grid templateColumns={{ base: '1fr 1fr', md: 'repeat(3,1fr)' }} gap={5}>
              <InfoRow label="Tipo contrato" value={f.tipo_contrato} />
              <InfoRow label="Cargo" value={f.cargo} />
              <InfoRow label="Unidad" value={f.unidad} />
              <InfoRow label="Área" value={f.area} />
              <InfoRow label="Fecha ingreso" value={f.fecha_ingreso ? new Date(f.fecha_ingreso).toLocaleDateString('es-CL') : ''} />
              <InfoRow label="Fecha término" value={f.fecha_termino ? new Date(f.fecha_termino).toLocaleDateString('es-CL') : 'Indefinido'} />
              <InfoRow label="Sueldo base" value={f.sueldo_base ? `$${Number(f.sueldo_base).toLocaleString('es-CL')}` : ''} />
              <InfoRow label="Jornada" value={f.jornada ? `${f.jornada} hrs/semana` : ''} />
              <InfoRow label="Grado escalaforma" value={f.grado_escalaforma} />
              <InfoRow label="AFP" value={f.afp} />
              <InfoRow label="Isapre/Fonasa" value={f.isapre} />
              <InfoRow label="Jefe directo" value={f.jefe_nombre} />
            </Grid>
          </Box>
        </Tabs.Content>

        <Tabs.Content value="permisos">
          <Box bg="white" borderRadius="14px" p={5} boxShadow="0 1px 6px rgba(0,0,0,0.05)">
            {permisos.length === 0 ? (
              <Text color="gray.400">Sin permisos registrados</Text>
            ) : (
              <Box overflowX="auto">
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #E5E7EB' }}>
                      {['Tipo', 'Desde', 'Hasta', 'Días', 'Estado'].map(h => (
                        <th key={h} style={{ textAlign: 'left', padding: '8px 12px', color: '#6B7280', fontWeight: 600 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {permisos.map(p => (
                      <tr key={p.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                        <td style={{ padding: '10px 12px', color: '#374151' }}>{p.tipo.replace(/_/g, ' ')}</td>
                        <td style={{ padding: '10px 12px', color: '#374151' }}>{new Date(p.fecha_inicio).toLocaleDateString('es-CL')}</td>
                        <td style={{ padding: '10px 12px', color: '#374151' }}>{new Date(p.fecha_fin).toLocaleDateString('es-CL')}</td>
                        <td style={{ padding: '10px 12px', fontWeight: 600, color: NAVY }}>{p.dias_habiles}</td>
                        <td style={{ padding: '10px 12px' }}>
                          <Box display="inline-block" px={2} py={0.5} borderRadius="full" fontSize="0.7rem" fontWeight={700} color="white" bg={PERMISO_BG[p.estado] || '#6B7280'}>{p.estado}</Box>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Box>
            )}
          </Box>
        </Tabs.Content>

        <Tabs.Content value="documentos">
          <Box bg="white" borderRadius="14px" p={5} boxShadow="0 1px 6px rgba(0,0,0,0.05)">
            {documentos.length === 0 ? (
              <Text color="gray.400">Sin documentos</Text>
            ) : (
              <Box overflowX="auto">
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #E5E7EB' }}>
                      {['Nombre', 'Tipo', 'Estado', 'Fecha'].map(h => (
                        <th key={h} style={{ textAlign: 'left', padding: '8px 12px', color: '#6B7280', fontWeight: 600 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {documentos.map(d => (
                      <tr key={d.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                        <td style={{ padding: '10px 12px', fontWeight: 600, color: NAVY }}>{d.nombre}</td>
                        <td style={{ padding: '10px 12px', color: '#374151' }}>{d.tipo}</td>
                        <td style={{ padding: '10px 12px' }}>
                          <Box display="inline-block" px={2} py={0.5} borderRadius="full" fontSize="0.7rem" fontWeight={700} color="white"
                            bg={d.estado === 'FIRMADO' ? '#3D8B37' : d.estado === 'PENDIENTE_FIRMA' ? '#F4C430' : '#6B7280'}>
                            {d.estado.replace(/_/g, ' ')}
                          </Box>
                        </td>
                        <td style={{ padding: '10px 12px', color: '#6B7280' }}>{new Date(d.created_at).toLocaleDateString('es-CL')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Box>
            )}
          </Box>
        </Tabs.Content>
      </Tabs.Root>
    </Box>
  )
}
