import { useEffect, useState } from 'react'
import { Box, Flex, Text, Button, Spinner, Grid, Input } from '@chakra-ui/react'
import { Plus, FileText, CheckCircle, Key } from 'lucide-react'
import { api } from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'

const NAVY = '#1B2B4B'
const PINK = '#E91E7B'

const inputStyle = { border: '1.5px solid #E5E7EB', borderRadius: '8px', padding: '8px 12px', fontSize: '0.9rem', width: '100%', background: 'white', color: '#1B2B4B', outline: 'none' }

export default function DocumentosList() {
  const [docs, setDocs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showGenerar, setShowGenerar] = useState(false)
  const [showFirmar, setShowFirmar] = useState<string | null>(null)
  const [codigoSolicitado, setCodigoSolicitado] = useState(false)
  const [codigo, setCodigo] = useState('')
  const [funcionarios, setFuncionarios] = useState<any[]>([])
  const [genForm, setGenForm] = useState({ funcionario_id: '', tipo: 'CONTRATO', nombre: '' })
  const { user } = useAuth()
  const canCreate = ['ADMIN', 'RRHH'].includes(user?.rol || '')

  async function load() {
    setLoading(true)
    try {
      const data = await api.get('/api/v1/external/documentos')
      setDocs(data || [])
    } finally { setLoading(false) }
  }

  useEffect(() => {
    load()
    if (canCreate) api.get('/api/v1/external/funcionarios').then(setFuncionarios)
  }, [])

  async function handleGenerar(e: React.FormEvent) {
    e.preventDefault()
    try {
      await api.post('/api/v1/external/documentos/generar', genForm)
      setShowGenerar(false)
      setGenForm({ funcionario_id: '', tipo: 'CONTRATO', nombre: '' })
      load()
    } catch (err: any) { alert(err.message) }
  }

  async function handleSolicitarCodigo(id: string) {
    try {
      await api.post(`/api/v1/external/documentos/firma/solicitar/${id}`, {})
      setCodigoSolicitado(true)
      setShowFirmar(id)
    } catch (err: any) { alert(err.message) }
  }

  async function handleConfirmarFirma(id: string) {
    try {
      await api.post(`/api/v1/external/documentos/firma/confirmar/${id}`, { codigo })
      setShowFirmar(null)
      setCodigo('')
      setCodigoSolicitado(false)
      load()
      alert('Documento firmado exitosamente')
    } catch (err: any) { alert(err.message) }
  }

  const ESTADO_BG: Record<string, string> = { PENDIENTE_FIRMA: '#F4C430', FIRMADO: '#3D8B37', ACTIVO: '#3B82F6', ARCHIVADO: '#6B7280' }

  return (
    <Box>
      <Flex align="center" justify="space-between" mb={6} flexWrap="wrap" gap={3}>
        <Box>
          <Text fontSize="1.5rem" fontWeight={800} color={NAVY}>Gestión Documental</Text>
          <Text fontSize="0.85rem" color="gray.500">{docs.length} documentos</Text>
        </Box>
        {canCreate && (
          <Button bg={NAVY} color="white" borderRadius="10px" h="40px" fontWeight={700} _hover={{ bg: '#142035' }} onClick={() => setShowGenerar(true)}>
            <Plus size={16} style={{ marginRight: 6 }} />
            Generar Documento
          </Button>
        )}
      </Flex>

      {showGenerar && (
        <Box bg="white" borderRadius="14px" p={5} mb={5} boxShadow="0 1px 6px rgba(0,0,0,0.05)" border="2px solid" borderColor={NAVY + '20'}>
          <Text fontWeight={700} color={NAVY} mb={4}>Generar nuevo documento</Text>
          <Box as="form" onSubmit={handleGenerar}>
            <Grid templateColumns={{ base: '1fr', md: 'repeat(3,1fr)' }} gap={4} mb={4}>
              <Box>
                <Text fontSize="0.82rem" fontWeight={600} color={NAVY} mb={1.5}>Funcionario *</Text>
                <select style={inputStyle} value={genForm.funcionario_id} onChange={e => setGenForm(f => ({ ...f, funcionario_id: e.target.value }))} required>
                  <option value="">Seleccionar...</option>
                  {funcionarios.map(f => <option key={f.id} value={f.id}>{f.nombres} {f.apellido_paterno}</option>)}
                </select>
              </Box>
              <Box>
                <Text fontSize="0.82rem" fontWeight={600} color={NAVY} mb={1.5}>Tipo *</Text>
                <select style={inputStyle} value={genForm.tipo} onChange={e => setGenForm(f => ({ ...f, tipo: e.target.value }))} required>
                  {['CONTRATO', 'ANEXO', 'CERTIFICADO_TRABAJO', 'CERTIFICADO_ANTIGUEDAD', 'OTRO'].map(t => (
                    <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
                  ))}
                </select>
              </Box>
              <Box>
                <Text fontSize="0.82rem" fontWeight={600} color={NAVY} mb={1.5}>Nombre del documento *</Text>
                <input style={inputStyle} value={genForm.nombre} onChange={e => setGenForm(f => ({ ...f, nombre: e.target.value }))} placeholder="Ej: Contrato de trabajo 2026" required />
              </Box>
            </Grid>
            <Flex gap={3}>
              <Button type="submit" bg={NAVY} color="white" borderRadius="8px" h="38px" fontWeight={600} _hover={{ bg: '#142035' }}>Generar</Button>
              <Button variant="outline" borderRadius="8px" h="38px" onClick={() => setShowGenerar(false)}>Cancelar</Button>
            </Flex>
          </Box>
        </Box>
      )}

      {showFirmar && (
        <Box bg="white" borderRadius="14px" p={5} mb={5} boxShadow="0 2px 12px rgba(0,0,0,0.1)" border="2px solid" borderColor={PINK}>
          <Text fontWeight={700} color={NAVY} mb={2}>Firma Digital</Text>
          {!codigoSolicitado ? (
            <>
              <Text fontSize="0.9rem" color="gray.600" mb={4}>Se enviará un código de 6 dígitos a tu email registrado. El código es válido por 10 minutos.</Text>
              <Flex gap={3}>
                <Button bg={PINK} color="white" borderRadius="8px" h="38px" fontWeight={600} onClick={() => handleSolicitarCodigo(showFirmar)}>Solicitar código</Button>
                <Button variant="outline" borderRadius="8px" h="38px" onClick={() => { setShowFirmar(null); setCodigoSolicitado(false) }}>Cancelar</Button>
              </Flex>
            </>
          ) : (
            <>
              <Text fontSize="0.9rem" color="gray.600" mb={4}>Ingresa el código que recibiste en tu email:</Text>
              <Flex gap={3} mb={4} maxW="300px">
                <input style={{ ...inputStyle, textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.5rem', fontWeight: 700 }}
                  value={codigo} onChange={e => setCodigo(e.target.value)} maxLength={6} placeholder="000000" />
              </Flex>
              <Flex gap={3}>
                <Button bg={PINK} color="white" borderRadius="8px" h="38px" fontWeight={600} onClick={() => handleConfirmarFirma(showFirmar!)} disabled={codigo.length !== 6}>
                  <CheckCircle size={14} style={{ marginRight: 6 }} />Confirmar firma
                </Button>
                <Button variant="outline" borderRadius="8px" h="38px" onClick={() => { setShowFirmar(null); setCodigoSolicitado(false); setCodigo('') }}>Cancelar</Button>
              </Flex>
            </>
          )}
        </Box>
      )}

      {loading ? (
        <Flex justify="center" p={12}><Spinner color={NAVY} size="xl" /></Flex>
      ) : docs.length === 0 ? (
        <Box textAlign="center" py={12}><Text color="gray.400">No hay documentos registrados</Text></Box>
      ) : (
        <Box bg="white" borderRadius="14px" boxShadow="0 1px 6px rgba(0,0,0,0.05)" overflow="hidden">
          <Box overflowX="auto">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                  {['Documento', 'Funcionario', 'Tipo', 'Estado', 'Fecha', 'Acciones'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '12px 16px', color: '#6B7280', fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {docs.map(d => (
                  <tr key={d.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <Flex align="center" gap={2}>
                        <FileText size={16} color={NAVY} />
                        <Text fontWeight={600} color={NAVY}>{d.nombre}</Text>
                      </Flex>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#374151' }}>{d.funcionario_nombre}</td>
                    <td style={{ padding: '12px 16px', color: '#374151' }}>{d.tipo.replace(/_/g, ' ')}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <Box display="inline-block" px={2} py={0.5} borderRadius="full" fontSize="0.7rem" fontWeight={700} color="white" bg={ESTADO_BG[d.estado] || '#6B7280'}>
                        {d.estado.replace(/_/g, ' ')}
                      </Box>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#6B7280' }}>{new Date(d.created_at).toLocaleDateString('es-CL')}</td>
                    <td style={{ padding: '12px 16px' }}>
                      {d.estado === 'PENDIENTE_FIRMA' && (
                        <Button size="xs" bg={PINK} color="white" borderRadius="6px" onClick={() => { setShowFirmar(d.id); setCodigoSolicitado(false) }} _hover={{ bg: '#c9186a' }}>
                          <Key size={12} style={{ marginRight: 4 }} />Firmar
                        </Button>
                      )}
                      {d.estado === 'FIRMADO' && (
                        <Text fontSize="0.75rem" color="#3D8B37" fontWeight={600}>✓ Firmado {d.firmado_en ? new Date(d.firmado_en).toLocaleDateString('es-CL') : ''}</Text>
                      )}
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
