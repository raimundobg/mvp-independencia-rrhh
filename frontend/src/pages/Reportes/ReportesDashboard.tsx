import { useState } from 'react'
import { Box, Flex, Text, Button, Grid } from '@chakra-ui/react'
import { Download, FileText, Users, Calendar, ClipboardList, FileSpreadsheet } from 'lucide-react'
import { downloadFile } from '../../services/api'

const NAVY = '#1B2B4B'
const PINK = '#E91E7B'

interface ReporteCard {
  icon: React.ReactNode
  title: string
  description: string
  action: () => void
  color: string
}

export default function ReportesDashboard() {
  const [desde, setDesde] = useState('')
  const [hasta, setHasta] = useState('')

  const inputStyle = { border: '1.5px solid #E5E7EB', borderRadius: '8px', padding: '7px 12px', fontSize: '0.9rem', background: 'white', color: '#374151', outline: 'none' }

  const buildParams = () => {
    const p = new URLSearchParams()
    if (desde) p.set('desde', desde)
    if (hasta) p.set('hasta', hasta)
    return p.toString()
  }

  const reportes: ReporteCard[] = [
    {
      icon: <Users size={22} />,
      title: 'Dotación Completa',
      description: 'Listado de todos los funcionarios activos con sus datos contractuales.',
      action: () => downloadFile('/api/v1/external/reportes/dotacion', 'dotacion_completa.xlsx'),
      color: NAVY,
    },
    {
      icon: <Calendar size={22} />,
      title: 'Permisos del Período',
      description: 'Exporta todos los permisos en el rango de fechas seleccionado.',
      action: () => downloadFile(`/api/v1/external/reportes/permisos?${buildParams()}`, 'permisos.xlsx'),
      color: PINK,
    },
    {
      icon: <FileText size={22} />,
      title: 'Estado Documentos',
      description: 'Lista de documentos con su estado de firma.',
      action: () => downloadFile(`/api/v1/external/reportes/documentos?${buildParams()}`, 'documentos.xlsx'),
      color: '#3B82F6',
    },
    {
      icon: <ClipboardList size={22} />,
      title: 'Auditoría',
      description: 'Log completo de modificaciones en el sistema por período.',
      action: () => downloadFile(`/api/v1/external/reportes/auditoria?${buildParams()}`, 'auditoria.xlsx'),
      color: '#8B5CF6',
    },
    {
      icon: <FileSpreadsheet size={22} />,
      title: 'Exportable PreviRed',
      description: 'Archivo TXT con formato oficial para carga manual en PreviRed.',
      action: () => downloadFile('/api/v1/external/reportes/previred', 'previred.txt'),
      color: '#3D8B37',
    },
  ]

  return (
    <Box>
      <Box mb={6}>
        <Text fontSize="1.5rem" fontWeight={800} color={NAVY}>Reportes y Exportables</Text>
        <Text fontSize="0.85rem" color="gray.500">Descarga información del sistema en formato Excel o TXT</Text>
      </Box>

      <Box bg="white" borderRadius="14px" p={4} mb={6} boxShadow="0 1px 6px rgba(0,0,0,0.05)">
        <Text fontWeight={600} color={NAVY} mb={3} fontSize="0.9rem">Rango de fechas (opcional)</Text>
        <Flex gap={3} flexWrap="wrap" align="flex-end">
          <Box>
            <Text fontSize="0.75rem" color="gray.500" mb={1}>Desde</Text>
            <input style={inputStyle} type="date" value={desde} onChange={e => setDesde(e.target.value)} />
          </Box>
          <Box>
            <Text fontSize="0.75rem" color="gray.500" mb={1}>Hasta</Text>
            <input style={inputStyle} type="date" value={hasta} onChange={e => setHasta(e.target.value)} />
          </Box>
        </Flex>
        <Text fontSize="0.75rem" color="gray.400" mt={2}>El filtro de fechas aplica a los reportes de permisos, documentos y auditoría.</Text>
      </Box>

      <Grid templateColumns={{ base: '1fr', md: 'repeat(2,1fr)', lg: 'repeat(3,1fr)' }} gap={4}>
        {reportes.map((r) => (
          <Box
            key={r.title}
            bg="white"
            borderRadius="14px"
            p={5}
            boxShadow="0 1px 6px rgba(0,0,0,0.05)"
            border="1px solid transparent"
            transition="all 0.2s"
            _hover={{ transform: 'translateY(-2px)', boxShadow: '0 4px 16px rgba(0,0,0,0.1)', borderColor: r.color + '30' }}
          >
            <Box
              w="44px"
              h="44px"
              borderRadius="10px"
              bg={r.color + '15'}
              color={r.color}
              display="flex"
              alignItems="center"
              justifyContent="center"
              mb={3}
            >
              {r.icon}
            </Box>
            <Text fontWeight={700} color={NAVY} mb={1}>{r.title}</Text>
            <Text fontSize="0.82rem" color="gray.500" mb={4} lineHeight={1.5}>{r.description}</Text>
            <Button
              w="100%"
              bg={r.color}
              color="white"
              borderRadius="8px"
              h="38px"
              fontWeight={600}
              fontSize="0.85rem"
              onClick={r.action}
              _hover={{ opacity: 0.9 }}
            >
              <Download size={14} style={{ marginRight: 6 }} />
              Descargar
            </Button>
          </Box>
        ))}
      </Grid>
    </Box>
  )
}
