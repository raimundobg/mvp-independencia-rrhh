import { useEffect, useState } from 'react'
import { Box, Flex, Text, Button, Grid, Spinner } from '@chakra-ui/react'
import { ArrowLeft, Save } from 'lucide-react'
import { api } from '../../services/api'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

const NAVY = '#1B2B4B'

const inputStyle = { border: '1.5px solid #E5E7EB', borderRadius: '8px', padding: '8px 12px', fontSize: '0.9rem', width: '100%', background: 'white', color: '#1B2B4B', outline: 'none' }

export default function PermisosForm() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [funcionarios, setFuncionarios] = useState<any[]>([])
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    funcionario_id: '', tipo: 'FERIADO_LEGAL', fecha_inicio: '', fecha_fin: '', motivo: '', suplencia_id: '',
  })

  useEffect(() => {
    api.get('/api/v1/external/funcionarios').then(setFuncionarios).catch(console.error)
    if (user?.rol === 'USUARIO') {
      api.get('/api/v1/external/funcionarios').then((fs: any[]) => {
        const me = fs.find(f => f.email === user.email)
        if (me) setForm(prev => ({ ...prev, funcionario_id: me.id }))
      })
    }
  }, [])

  function set(k: string, v: string) { setForm(f => ({ ...f, [k]: v })) }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      await api.post('/api/v1/external/permisos', form)
      navigate('/permisos')
    } catch (err: any) {
      alert(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Box>
      <Flex align="center" gap={3} mb={6}>
        <Button variant="ghost" color={NAVY} onClick={() => navigate('/permisos')} p={2}><ArrowLeft size={18} /></Button>
        <Box>
          <Text fontSize="1.4rem" fontWeight={800} color={NAVY}>Solicitar Permiso</Text>
          <Text fontSize="0.85rem" color="gray.500">Completa la información del permiso</Text>
        </Box>
      </Flex>

      <Box bg="white" borderRadius="14px" p={6} boxShadow="0 1px 6px rgba(0,0,0,0.05)" maxW="680px">
        <Box as="form" onSubmit={handleSubmit}>
          <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={5} mb={5}>
            <Box gridColumn={{ md: '1 / -1' }}>
              <Text fontSize="0.82rem" fontWeight={600} color={NAVY} mb={1.5}>Funcionario *</Text>
              <select style={inputStyle} value={form.funcionario_id} onChange={e => set('funcionario_id', e.target.value)} required disabled={user?.rol === 'USUARIO'}>
                <option value="">Seleccionar funcionario...</option>
                {funcionarios.map(f => <option key={f.id} value={f.id}>{f.nombres} {f.apellido_paterno} — {f.cargo}</option>)}
              </select>
            </Box>
            <Box gridColumn={{ md: '1 / -1' }}>
              <Text fontSize="0.82rem" fontWeight={600} color={NAVY} mb={1.5}>Tipo de Permiso *</Text>
              <select style={inputStyle} value={form.tipo} onChange={e => set('tipo', e.target.value)} required>
                <option value="FERIADO_LEGAL">Feriado Legal (Vacaciones)</option>
                <option value="PERMISO_CON_GOCE">Permiso con Goce de Sueldo</option>
                <option value="PERMISO_SIN_GOCE">Permiso sin Goce de Sueldo</option>
                <option value="DIA_ADMINISTRATIVO">Día Administrativo</option>
                <option value="LICENCIA_MEDICA">Licencia Médica</option>
                <option value="FALLECIMIENTO_FAMILIAR">Permiso por Fallecimiento Familiar</option>
              </select>
            </Box>
            <Box>
              <Text fontSize="0.82rem" fontWeight={600} color={NAVY} mb={1.5}>Fecha Inicio *</Text>
              <input style={inputStyle} type="date" value={form.fecha_inicio} onChange={e => set('fecha_inicio', e.target.value)} required />
            </Box>
            <Box>
              <Text fontSize="0.82rem" fontWeight={600} color={NAVY} mb={1.5}>Fecha Fin *</Text>
              <input style={inputStyle} type="date" value={form.fecha_fin} onChange={e => set('fecha_fin', e.target.value)} required min={form.fecha_inicio} />
            </Box>
            <Box gridColumn={{ md: '1 / -1' }}>
              <Text fontSize="0.82rem" fontWeight={600} color={NAVY} mb={1.5}>Motivo</Text>
              <textarea
                style={{ ...inputStyle, resize: 'vertical', minHeight: '80px' }}
                value={form.motivo}
                onChange={e => set('motivo', e.target.value)}
                placeholder="Describe brevemente el motivo del permiso..."
              />
            </Box>
            <Box gridColumn={{ md: '1 / -1' }}>
              <Text fontSize="0.82rem" fontWeight={600} color={NAVY} mb={1.5}>Suplente (opcional)</Text>
              <select style={inputStyle} value={form.suplencia_id} onChange={e => set('suplencia_id', e.target.value)}>
                <option value="">Sin suplente designado</option>
                {funcionarios.filter(f => f.id !== form.funcionario_id).map(f => (
                  <option key={f.id} value={f.id}>{f.nombres} {f.apellido_paterno}</option>
                ))}
              </select>
            </Box>
          </Grid>

          <Box bg="#F5F3EE" borderRadius="10px" p={4} mb={5}>
            <Text fontSize="0.82rem" color="gray.600" fontWeight={500}>
              💡 Los días hábiles se calculan automáticamente al crear la solicitud. La solicitud quedará en estado <strong>PENDIENTE</strong> hasta ser aprobada por tu jefatura o RRHH.
            </Text>
          </Box>

          <Flex gap={3} justify="flex-end">
            <Button variant="outline" borderRadius="10px" h="42px" color={NAVY} borderColor={NAVY} onClick={() => navigate('/permisos')}>Cancelar</Button>
            <Button type="submit" bg={NAVY} color="white" borderRadius="10px" h="42px" fontWeight={700} loading={saving} _hover={{ bg: '#142035' }}>
              <Save size={16} style={{ marginRight: 8 }} />
              Enviar solicitud
            </Button>
          </Flex>
        </Box>
      </Box>
    </Box>
  )
}
