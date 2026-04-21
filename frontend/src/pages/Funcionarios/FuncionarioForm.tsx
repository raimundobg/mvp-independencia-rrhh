import { useEffect, useState } from 'react'
import { Box, Flex, Text, Button, Input, Grid, Spinner } from '@chakra-ui/react'
import { ArrowLeft, Save } from 'lucide-react'
import { api } from '../../services/api'
import { useNavigate, useParams } from 'react-router-dom'

const NAVY = '#1B2B4B'
const PINK = '#E91E7B'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Box>
      <Text fontSize="0.82rem" fontWeight={600} color={NAVY} mb={1.5}>{label}</Text>
      {children}
    </Box>
  )
}

const inputStyle = {
  border: '1.5px solid #E5E7EB', borderRadius: '8px', padding: '8px 12px',
  fontSize: '0.9rem', width: '100%', background: 'white', color: '#1B2B4B', outline: 'none',
}
const selectStyle = { ...inputStyle }

export default function FuncionarioForm() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [cargos, setCargos] = useState<any[]>([])
  const [funcionarios, setFuncionarios] = useState<any[]>([])
  const [form, setForm] = useState({
    rut: '', nombres: '', apellido_paterno: '', apellido_materno: '', email: '',
    email_personal: '', telefono: '', fecha_nacimiento: '', genero: 'NI',
    nacionalidad: 'Chilena', estado_civil: '', direccion: '', comuna: '', region: '',
    tipo_contrato: 'CONTRATA', cargo: '', cargo_id: '', unidad: '', area: '',
    fecha_ingreso: '', fecha_termino: '', jefe_directo_id: '', sueldo_base: '',
    grado_escalaforma: '', jornada: '44', afp: '', isapre: '', previred_codigo: '',
    estado: 'ACTIVO',
  })

  useEffect(() => {
    Promise.all([
      api.get('/api/v1/external/cargos'),
      api.get('/api/v1/external/funcionarios'),
    ]).then(([c, f]) => { setCargos(c || []); setFuncionarios(f || []) })

    if (isEdit) {
      setLoading(true)
      api.get(`/api/v1/external/funcionarios/${id}`)
        .then(data => setForm({
          rut: data.rut || '', nombres: data.nombres || '', apellido_paterno: data.apellido_paterno || '',
          apellido_materno: data.apellido_materno || '', email: data.email || '',
          email_personal: data.email_personal || '', telefono: data.telefono || '',
          fecha_nacimiento: data.fecha_nacimiento?.split('T')[0] || '', genero: data.genero || 'NI',
          nacionalidad: data.nacionalidad || 'Chilena', estado_civil: data.estado_civil || '',
          direccion: data.direccion || '', comuna: data.comuna || '', region: data.region || '',
          tipo_contrato: data.tipo_contrato || 'CONTRATA', cargo: data.cargo || '',
          cargo_id: data.cargo_id || '', unidad: data.unidad || '', area: data.area || '',
          fecha_ingreso: data.fecha_ingreso?.split('T')[0] || '', fecha_termino: data.fecha_termino?.split('T')[0] || '',
          jefe_directo_id: data.jefe_directo_id || '', sueldo_base: String(data.sueldo_base || ''),
          grado_escalaforma: data.grado_escalaforma || '', jornada: String(data.jornada || '44'),
          afp: data.afp || '', isapre: data.isapre || '', previred_codigo: data.previred_codigo || '',
          estado: data.estado || 'ACTIVO',
        }))
        .catch(console.error)
        .finally(() => setLoading(false))
    }
  }, [id])

  function set(key: string, val: string) {
    setForm(f => ({ ...f, [key]: val }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = { ...form, sueldo_base: parseFloat(form.sueldo_base) || 0, jornada: parseInt(form.jornada) || 44 }
      if (isEdit) {
        await api.put(`/api/v1/external/funcionarios/${id}`, payload)
      } else {
        await api.post('/api/v1/external/funcionarios', payload)
      }
      navigate('/funcionarios')
    } catch (err: any) {
      alert(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Flex justify="center" p={12}><Spinner color={NAVY} size="xl" /></Flex>

  return (
    <Box>
      <Flex align="center" gap={3} mb={6}>
        <Button variant="ghost" color={NAVY} onClick={() => navigate('/funcionarios')} p={2}>
          <ArrowLeft size={18} />
        </Button>
        <Box>
          <Text fontSize="1.4rem" fontWeight={800} color={NAVY}>
            {isEdit ? 'Editar Funcionario' : 'Nuevo Funcionario'}
          </Text>
          <Text fontSize="0.85rem" color="gray.500">Completa todos los campos requeridos</Text>
        </Box>
      </Flex>

      <Box as="form" onSubmit={handleSubmit}>
        <Box bg="white" borderRadius="14px" p={5} mb={4} boxShadow="0 1px 6px rgba(0,0,0,0.05)">
          <Text fontWeight={700} color={NAVY} mb={4} fontSize="0.95rem" borderBottom="2px solid" borderColor="#E5E7EB" pb={2}>
            Datos de Identificación
          </Text>
          <Grid templateColumns={{ base: '1fr', md: 'repeat(2,1fr)', lg: 'repeat(3,1fr)' }} gap={4}>
            <Field label="RUT *">
              <input style={inputStyle} value={form.rut} onChange={e => set('rut', e.target.value)} placeholder="12.345.678-9" required />
            </Field>
            <Field label="Nombres *">
              <input style={inputStyle} value={form.nombres} onChange={e => set('nombres', e.target.value)} required />
            </Field>
            <Field label="Apellido Paterno *">
              <input style={inputStyle} value={form.apellido_paterno} onChange={e => set('apellido_paterno', e.target.value)} required />
            </Field>
            <Field label="Apellido Materno">
              <input style={inputStyle} value={form.apellido_materno} onChange={e => set('apellido_materno', e.target.value)} />
            </Field>
            <Field label="Email institucional *">
              <input style={inputStyle} type="email" value={form.email} onChange={e => set('email', e.target.value)} required />
            </Field>
            <Field label="Email personal">
              <input style={inputStyle} type="email" value={form.email_personal} onChange={e => set('email_personal', e.target.value)} />
            </Field>
            <Field label="Teléfono">
              <input style={inputStyle} value={form.telefono} onChange={e => set('telefono', e.target.value)} placeholder="+56 9 1234 5678" />
            </Field>
            <Field label="Fecha de Nacimiento *">
              <input style={inputStyle} type="date" value={form.fecha_nacimiento} onChange={e => set('fecha_nacimiento', e.target.value)} required />
            </Field>
            <Field label="Género">
              <select style={selectStyle} value={form.genero} onChange={e => set('genero', e.target.value)}>
                <option value="M">Masculino</option>
                <option value="F">Femenino</option>
                <option value="NB">No binario</option>
                <option value="NI">No indica</option>
              </select>
            </Field>
            <Field label="Estado Civil">
              <input style={inputStyle} value={form.estado_civil} onChange={e => set('estado_civil', e.target.value)} />
            </Field>
            <Field label="Nacionalidad">
              <input style={inputStyle} value={form.nacionalidad} onChange={e => set('nacionalidad', e.target.value)} />
            </Field>
          </Grid>
          <Grid templateColumns={{ base: '1fr', md: 'repeat(3,1fr)' }} gap={4} mt={4}>
            <Field label="Dirección">
              <input style={inputStyle} value={form.direccion} onChange={e => set('direccion', e.target.value)} />
            </Field>
            <Field label="Comuna">
              <input style={inputStyle} value={form.comuna} onChange={e => set('comuna', e.target.value)} />
            </Field>
            <Field label="Región">
              <input style={inputStyle} value={form.region} onChange={e => set('region', e.target.value)} />
            </Field>
          </Grid>
        </Box>

        <Box bg="white" borderRadius="14px" p={5} mb={4} boxShadow="0 1px 6px rgba(0,0,0,0.05)">
          <Text fontWeight={700} color={NAVY} mb={4} fontSize="0.95rem" borderBottom="2px solid" borderColor="#E5E7EB" pb={2}>
            Información Contractual
          </Text>
          <Grid templateColumns={{ base: '1fr', md: 'repeat(2,1fr)', lg: 'repeat(3,1fr)' }} gap={4}>
            <Field label="Tipo de Contrato *">
              <select style={selectStyle} value={form.tipo_contrato} onChange={e => set('tipo_contrato', e.target.value)}>
                <option value="PLANTA">Planta</option>
                <option value="CONTRATA">Contrata</option>
                <option value="HONORARIOS">Honorarios</option>
                <option value="CODIGO_TRABAJO">Código del Trabajo</option>
              </select>
            </Field>
            <Field label="Cargo *">
              <input style={inputStyle} value={form.cargo} onChange={e => set('cargo', e.target.value)} required />
            </Field>
            <Field label="Cargo (catálogo)">
              <select style={selectStyle} value={form.cargo_id} onChange={e => set('cargo_id', e.target.value)}>
                <option value="">Seleccionar...</option>
                {cargos.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            </Field>
            <Field label="Unidad *">
              <input style={inputStyle} value={form.unidad} onChange={e => set('unidad', e.target.value)} required />
            </Field>
            <Field label="Área *">
              <input style={inputStyle} value={form.area} onChange={e => set('area', e.target.value)} required />
            </Field>
            <Field label="Jefe Directo">
              <select style={selectStyle} value={form.jefe_directo_id} onChange={e => set('jefe_directo_id', e.target.value)}>
                <option value="">Sin jefe directo</option>
                {funcionarios.filter(f => f.id !== id).map(f => (
                  <option key={f.id} value={f.id}>{f.nombres} {f.apellido_paterno}</option>
                ))}
              </select>
            </Field>
            <Field label="Fecha de Ingreso *">
              <input style={inputStyle} type="date" value={form.fecha_ingreso} onChange={e => set('fecha_ingreso', e.target.value)} required />
            </Field>
            <Field label="Fecha de Término">
              <input style={inputStyle} type="date" value={form.fecha_termino} onChange={e => set('fecha_termino', e.target.value)} />
            </Field>
            <Field label="Sueldo Base (CLP) *">
              <input style={inputStyle} type="number" value={form.sueldo_base} onChange={e => set('sueldo_base', e.target.value)} min={0} required />
            </Field>
            <Field label="Jornada (hrs semanales)">
              <input style={inputStyle} type="number" value={form.jornada} onChange={e => set('jornada', e.target.value)} min={1} max={45} />
            </Field>
            <Field label="Grado Escalaforma">
              <input style={inputStyle} value={form.grado_escalaforma} onChange={e => set('grado_escalaforma', e.target.value)} />
            </Field>
            <Field label="Estado">
              <select style={selectStyle} value={form.estado} onChange={e => set('estado', e.target.value)}>
                <option value="ACTIVO">Activo</option>
                <option value="INACTIVO">Inactivo</option>
                <option value="LICENCIA">Licencia</option>
                <option value="VACACIONES">Vacaciones</option>
              </select>
            </Field>
          </Grid>
        </Box>

        <Box bg="white" borderRadius="14px" p={5} mb={6} boxShadow="0 1px 6px rgba(0,0,0,0.05)">
          <Text fontWeight={700} color={NAVY} mb={4} fontSize="0.95rem" borderBottom="2px solid" borderColor="#E5E7EB" pb={2}>
            Información Previsional
          </Text>
          <Grid templateColumns={{ base: '1fr', md: 'repeat(3,1fr)' }} gap={4}>
            <Field label="AFP">
              <select style={selectStyle} value={form.afp} onChange={e => set('afp', e.target.value)}>
                <option value="">Seleccionar...</option>
                {['Capital', 'Cuprum', 'Habitat', 'Modelo', 'PlanVital', 'ProVida', 'Uno'].map(a => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </Field>
            <Field label="Isapre / Fonasa">
              <select style={selectStyle} value={form.isapre} onChange={e => set('isapre', e.target.value)}>
                <option value="">Seleccionar...</option>
                {['Fonasa', 'Banmédica', 'Colmena', 'Cruz Blanca', 'Masvida', 'Nueva Masvida', 'Vida Tres'].map(i => (
                  <option key={i} value={i}>{i}</option>
                ))}
              </select>
            </Field>
            <Field label="Código PreviRed">
              <input style={inputStyle} value={form.previred_codigo} onChange={e => set('previred_codigo', e.target.value)} />
            </Field>
          </Grid>
        </Box>

        <Flex gap={3} justify="flex-end">
          <Button variant="outline" borderRadius="10px" h="42px" color={NAVY} borderColor={NAVY} onClick={() => navigate('/funcionarios')}>
            Cancelar
          </Button>
          <Button type="submit" bg={NAVY} color="white" borderRadius="10px" h="42px" fontWeight={700} loading={saving} _hover={{ bg: '#142035' }}>
            <Save size={16} style={{ marginRight: 8 }} />
            {isEdit ? 'Guardar cambios' : 'Crear funcionario'}
          </Button>
        </Flex>
      </Box>
    </Box>
  )
}
