import { useEffect, useState } from 'react'
import { Box, Flex, Text, Button, Grid, Spinner } from '@chakra-ui/react'
import { Save, Calendar } from 'lucide-react'
import { api } from '../services/api'
import { useAuth } from '../contexts/AuthContext'

const NAVY = '#1B2B4B'
const PINK = '#E91E7B'
const inputStyle = { border: '1.5px solid #E5E7EB', borderRadius: '8px', padding: '8px 12px', fontSize: '0.9rem', width: '100%', background: 'white', color: '#1B2B4B', outline: 'none' }

export default function MiPerfil() {
  const { user } = useAuth()
  const [funcionario, setFuncionario] = useState<any>(null)
  const [balance, setBalance] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ email_personal: '', telefono: '', direccion: '', comuna: '', region: '' })

  useEffect(() => {
    api.get('/api/v1/external/funcionarios')
      .then((fs: any[]) => {
        const me = fs.find(f => f.email === user?.email)
        if (me) {
          setFuncionario(me)
          setForm({ email_personal: me.email_personal || '', telefono: me.telefono || '', direccion: me.direccion || '', comuna: me.comuna || '', region: me.region || '' })
          return api.get(`/api/v1/external/permisos/balance/${me.id}`)
        }
      })
      .then(b => setBalance(b || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [user])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!funcionario) return
    setSaving(true)
    try {
      await api.put(`/api/v1/external/funcionarios/${funcionario.id}`, { ...funcionario, ...form })
      alert('Perfil actualizado correctamente')
    } catch (err: any) { alert(err.message) } finally { setSaving(false) }
  }

  if (loading) return <Flex justify="center" p={12}><Spinner color={NAVY} size="xl" /></Flex>
  if (!funcionario) return (
    <Box textAlign="center" py={16}>
      <Text color="gray.500">Tu cuenta no tiene una ficha de funcionario asociada.</Text>
      <Text fontSize="0.85rem" color="gray.400" mt={1}>Contacta a RRHH para que creen tu ficha.</Text>
    </Box>
  )

  const BALANCE_COLORS: Record<string, string> = { FERIADO_LEGAL: NAVY, PERMISO_CON_GOCE: PINK, PERMISO_SIN_GOCE: '#F4C430', DIA_ADMINISTRATIVO: '#3D8B37' }
  const CONTRATO_BG: Record<string, string> = { PLANTA: NAVY, CONTRATA: PINK, HONORARIOS: '#F4C430', CODIGO_TRABAJO: '#3D8B37' }

  return (
    <Box>
      <Text fontSize="1.5rem" fontWeight={800} color={NAVY} mb={6}>Mi Perfil</Text>

      <Flex gap={5} mb={5} flexWrap="wrap">
        <Box
          bg={NAVY}
          borderRadius="14px"
          p={5}
          flex="0 0 auto"
          minW={{ base: '100%', md: '280px' }}
          color="white"
        >
          <Box w="56px" h="56px" borderRadius="full" bg={PINK} display="flex" alignItems="center" justifyContent="center" fontWeight={800} fontSize="1.2rem" mb={3}>
            {funcionario.nombres[0]}{funcionario.apellido_paterno[0]}
          </Box>
          <Text fontWeight={800} fontSize="1.1rem">{funcionario.nombres} {funcionario.apellido_paterno}</Text>
          <Text fontSize="0.85rem" opacity={0.75} mb={3}>{funcionario.email}</Text>
          <Box display="inline-block" px={2.5} py={0.5} borderRadius="full" bg={CONTRATO_BG[funcionario.tipo_contrato] || '#6B7280'} fontSize="0.72rem" fontWeight={700} mb={3}>
            {funcionario.tipo_contrato}
          </Box>
          <Box borderTop="1px solid rgba(255,255,255,0.15)" pt={3} mt={1}>
            <Text fontSize="0.75rem" opacity={0.6} mb={0.5}>Cargo</Text>
            <Text fontWeight={600} fontSize="0.9rem">{funcionario.cargo}</Text>
          </Box>
          <Box mt={2}>
            <Text fontSize="0.75rem" opacity={0.6} mb={0.5}>Unidad</Text>
            <Text fontWeight={600} fontSize="0.9rem">{funcionario.unidad}</Text>
          </Box>
          <Box mt={2}>
            <Text fontSize="0.75rem" opacity={0.6} mb={0.5}>Fecha ingreso</Text>
            <Text fontWeight={600} fontSize="0.9rem">{new Date(funcionario.fecha_ingreso).toLocaleDateString('es-CL')}</Text>
          </Box>
          <Box mt={2}>
            <Text fontSize="0.75rem" opacity={0.6} mb={0.5}>AFP / Isapre</Text>
            <Text fontWeight={600} fontSize="0.85rem">{funcionario.afp || '—'} / {funcionario.isapre || '—'}</Text>
          </Box>
        </Box>

        <Box flex={1} minW="280px">
          {balance.length > 0 && (
            <Box bg="white" borderRadius="14px" p={5} boxShadow="0 1px 6px rgba(0,0,0,0.05)" mb={4}>
              <Flex align="center" gap={2} mb={4}>
                <Calendar size={18} color={NAVY} />
                <Text fontWeight={700} color={NAVY}>Balance de días {new Date().getFullYear()}</Text>
              </Flex>
              <Grid templateColumns="repeat(2,1fr)" gap={3}>
                {balance.map(b => {
                  const disponible = b.dias_disponibles - b.dias_usados
                  const pct = Math.min((b.dias_usados / b.dias_disponibles) * 100, 100)
                  return (
                    <Box key={b.tipo} p={3} borderRadius="10px" bg="#F9FAFB" border="1px solid #E5E7EB">
                      <Text fontSize="0.72rem" color="gray.500" mb={1}>{b.tipo.replace(/_/g, ' ')}</Text>
                      <Text fontWeight={800} color={BALANCE_COLORS[b.tipo] || NAVY} fontSize="1.4rem">{disponible}</Text>
                      <Text fontSize="0.7rem" color="gray.400">de {b.dias_disponibles} días</Text>
                      <Box mt={2} h="4px" borderRadius="full" bg="#E5E7EB">
                        <Box h="4px" borderRadius="full" bg={BALANCE_COLORS[b.tipo] || NAVY} w={`${pct}%`} transition="width 0.5s" />
                      </Box>
                    </Box>
                  )
                })}
              </Grid>
            </Box>
          )}
        </Box>
      </Flex>

      <Box bg="white" borderRadius="14px" p={5} boxShadow="0 1px 6px rgba(0,0,0,0.05)">
        <Text fontWeight={700} color={NAVY} mb={4} fontSize="0.95rem">Datos que puedes actualizar</Text>
        <Box as="form" onSubmit={handleSave}>
          <Grid templateColumns={{ base: '1fr', md: 'repeat(2,1fr)' }} gap={4} mb={5}>
            <Box>
              <Text fontSize="0.82rem" fontWeight={600} color={NAVY} mb={1.5}>Email personal</Text>
              <input style={inputStyle} type="email" value={form.email_personal} onChange={e => setForm(f => ({ ...f, email_personal: e.target.value }))} />
            </Box>
            <Box>
              <Text fontSize="0.82rem" fontWeight={600} color={NAVY} mb={1.5}>Teléfono</Text>
              <input style={inputStyle} value={form.telefono} onChange={e => setForm(f => ({ ...f, telefono: e.target.value }))} placeholder="+56 9 1234 5678" />
            </Box>
            <Box gridColumn={{ md: '1 / -1' }}>
              <Text fontSize="0.82rem" fontWeight={600} color={NAVY} mb={1.5}>Dirección</Text>
              <input style={inputStyle} value={form.direccion} onChange={e => setForm(f => ({ ...f, direccion: e.target.value }))} />
            </Box>
            <Box>
              <Text fontSize="0.82rem" fontWeight={600} color={NAVY} mb={1.5}>Comuna</Text>
              <input style={inputStyle} value={form.comuna} onChange={e => setForm(f => ({ ...f, comuna: e.target.value }))} />
            </Box>
            <Box>
              <Text fontSize="0.82rem" fontWeight={600} color={NAVY} mb={1.5}>Región</Text>
              <input style={inputStyle} value={form.region} onChange={e => setForm(f => ({ ...f, region: e.target.value }))} />
            </Box>
          </Grid>
          <Button type="submit" bg={NAVY} color="white" borderRadius="10px" h="42px" fontWeight={700} loading={saving} _hover={{ bg: '#142035' }}>
            <Save size={16} style={{ marginRight: 8 }} />
            Guardar cambios
          </Button>
        </Box>
      </Box>
    </Box>
  )
}
