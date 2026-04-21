import { useEffect, useState } from 'react'
import { Box, Flex, Text, Grid, Spinner } from '@chakra-ui/react'
import { Users, Clock, FileText, TrendingUp } from 'lucide-react'
import { api } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

const NAVY = '#1B2B4B'
const PINK = '#E91E7B'
const YELLOW = '#F4C430'
const GREEN = '#3D8B37'

const PIE_COLORS = [NAVY, PINK, YELLOW, GREEN, '#6B7280']

interface DashboardData {
  total_activos: number
  por_contrato: { tipo_contrato: string; total: number }[]
  por_unidad: { unidad: string; total: number }[]
  permisos_pendientes: number
  documentos_pendientes: number
  recientes: { nombres: string; apellido_paterno: string; cargo: string; unidad: string; fecha_ingreso: string }[]
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
  return (
    <Box bg="white" borderRadius="16px" p={5} boxShadow="0 1px 8px rgba(0,0,0,0.06)">
      <Flex align="center" gap={3} mb={3}>
        <Box w="40px" h="40px" borderRadius="10px" bg={color + '18'} display="flex" alignItems="center" justifyContent="center" color={color}>
          {icon}
        </Box>
        <Text fontSize="0.85rem" color="gray.500" fontWeight={500}>{label}</Text>
      </Flex>
      <Text fontSize="2rem" fontWeight={800} color={NAVY}>{value.toLocaleString()}</Text>
    </Box>
  )
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    if (!['ADMIN', 'RRHH', 'JEFATURA'].includes(user?.rol || '')) {
      setLoading(false)
      return
    }
    api.get('/api/v1/external/reportes/dashboard')
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (user?.rol === 'USUARIO') {
    return (
      <Box>
        <Text fontSize="1.5rem" fontWeight={800} color={NAVY} mb={2}>
          Bienvenido, {user.nombre || user.email}
        </Text>
        <Text color="gray.500" mb={6}>Accede a tu perfil y solicita permisos desde el menú lateral.</Text>
        <Grid templateColumns={{ base: '1fr', md: 'repeat(2,1fr)' }} gap={4}>
          <Box bg="white" borderRadius="16px" p={5} boxShadow="0 1px 8px rgba(0,0,0,0.06)" cursor="pointer"
            onClick={() => window.location.href = '/mi-perfil'} _hover={{ transform: 'translateY(-2px)' }} transition="all 0.2s">
            <Text fontWeight={700} color={NAVY} mb={1}>Mi Perfil</Text>
            <Text fontSize="0.85rem" color="gray.500">Ver y actualizar tus datos personales</Text>
          </Box>
          <Box bg="white" borderRadius="16px" p={5} boxShadow="0 1px 8px rgba(0,0,0,0.06)" cursor="pointer"
            onClick={() => window.location.href = '/permisos'} _hover={{ transform: 'translateY(-2px)' }} transition="all 0.2s">
            <Text fontWeight={700} color={NAVY} mb={1}>Mis Permisos</Text>
            <Text fontSize="0.85rem" color="gray.500">Solicitar y revisar permisos y vacaciones</Text>
          </Box>
          <Box bg="white" borderRadius="16px" p={5} boxShadow="0 1px 8px rgba(0,0,0,0.06)" cursor="pointer"
            onClick={() => window.location.href = '/documentos'} _hover={{ transform: 'translateY(-2px)' }} transition="all 0.2s">
            <Text fontWeight={700} color={NAVY} mb={1}>Mis Documentos</Text>
            <Text fontSize="0.85rem" color="gray.500">Ver y firmar documentos pendientes</Text>
          </Box>
          <Box bg="white" borderRadius="16px" p={5} boxShadow="0 1px 8px rgba(0,0,0,0.06)" cursor="pointer"
            onClick={() => window.location.href = '/directorio'} _hover={{ transform: 'translateY(-2px)' }} transition="all 0.2s">
            <Text fontWeight={700} color={NAVY} mb={1}>Directorio</Text>
            <Text fontSize="0.85rem" color="gray.500">Contactos de la corporación</Text>
          </Box>
        </Grid>
      </Box>
    )
  }

  if (loading) return <Flex justify="center" align="center" h="300px"><Spinner color={NAVY} size="xl" /></Flex>
  if (!data) return <Text color="gray.500">No se pudo cargar el dashboard.</Text>

  const pieData = data.por_contrato.map(d => ({ name: d.tipo_contrato, value: Number(d.total) }))
  const barData = data.por_unidad.map(d => ({ name: d.unidad.length > 14 ? d.unidad.substring(0, 12) + '…' : d.unidad, total: Number(d.total) }))

  return (
    <Box>
      <Text fontSize="1.5rem" fontWeight={800} color={NAVY} mb={6}>Dashboard</Text>

      <Grid templateColumns={{ base: '1fr 1fr', md: 'repeat(4,1fr)' }} gap={4} mb={6}>
        <StatCard icon={<Users size={20} />} label="Funcionarios activos" value={data.total_activos} color={NAVY} />
        <StatCard icon={<Clock size={20} />} label="Permisos pendientes" value={data.permisos_pendientes} color={YELLOW} />
        <StatCard icon={<FileText size={20} />} label="Docs. por firmar" value={data.documentos_pendientes} color={PINK} />
        <StatCard icon={<TrendingUp size={20} />} label="Total contrataciones recientes" value={data.recientes.length} color={GREEN} />
      </Grid>

      <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={6} mb={6}>
        <Box bg="white" borderRadius="16px" p={5} boxShadow="0 1px 8px rgba(0,0,0,0.06)">
          <Text fontWeight={700} color={NAVY} mb={4}>Dotación por tipo de contrato</Text>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine={false} fontSize={11}>
                  {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : <Text color="gray.400" fontSize="0.9rem">Sin datos</Text>}
        </Box>
        <Box bg="white" borderRadius="16px" p={5} boxShadow="0 1px 8px rgba(0,0,0,0.06)">
          <Text fontWeight={700} color={NAVY} mb={4}>Dotación por unidad</Text>
          {barData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={barData} layout="vertical" margin={{ left: 0 }}>
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={90} />
                <Tooltip />
                <Bar dataKey="total" fill={NAVY} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <Text color="gray.400" fontSize="0.9rem">Sin datos</Text>}
        </Box>
      </Grid>

      <Box bg="white" borderRadius="16px" p={5} boxShadow="0 1px 8px rgba(0,0,0,0.06)">
        <Text fontWeight={700} color={NAVY} mb={4}>Últimas incorporaciones</Text>
        {data.recientes.length === 0 ? (
          <Text color="gray.400" fontSize="0.9rem">No hay contrataciones registradas</Text>
        ) : (
          <Box overflowX="auto">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                  {['Nombre', 'Cargo', 'Unidad', 'Fecha Ingreso'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '8px 12px', color: '#6B7280', fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.recientes.map((f, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 600, color: NAVY }}>{f.nombres} {f.apellido_paterno}</td>
                    <td style={{ padding: '10px 12px', color: '#374151' }}>{f.cargo}</td>
                    <td style={{ padding: '10px 12px', color: '#374151' }}>{f.unidad}</td>
                    <td style={{ padding: '10px 12px', color: '#6B7280' }}>{new Date(f.fecha_ingreso).toLocaleDateString('es-CL')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Box>
        )}
      </Box>
    </Box>
  )
}
