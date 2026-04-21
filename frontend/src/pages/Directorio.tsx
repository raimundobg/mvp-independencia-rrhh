import { useEffect, useState } from 'react'
import { Box, Flex, Text, Input, Grid, Spinner } from '@chakra-ui/react'
import { Search, Mail, Phone } from 'lucide-react'
import { api } from '../services/api'

const NAVY = '#1B2B4B'
const PINK = '#E91E7B'

export default function Directorio() {
  const [funcionarios, setFuncionarios] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')

  async function load(query?: string) {
    setLoading(true)
    try {
      const params = query ? `?q=${encodeURIComponent(query)}` : ''
      const data = await api.get(`/api/v1/external/directorio${params}`)
      setFuncionarios(data || [])
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    load(q)
  }

  return (
    <Box>
      <Box mb={6}>
        <Text fontSize="1.5rem" fontWeight={800} color={NAVY}>Directorio</Text>
        <Text fontSize="0.85rem" color="gray.500">{funcionarios.length} funcionarios activos</Text>
      </Box>

      <Box bg="white" borderRadius="14px" p={4} mb={5} boxShadow="0 1px 6px rgba(0,0,0,0.05)">
        <Flex as="form" onSubmit={handleSearch} gap={3}>
          <Flex
            flex={1}
            align="center"
            border="1.5px solid"
            borderColor="gray.200"
            borderRadius="8px"
            px={3}
            gap={2}
            _focusWithin={{ borderColor: NAVY }}
          >
            <Search size={15} color="#9CA3AF" />
            <Input
              border="none"
              p={2}
              pl={0}
              placeholder="Buscar por nombre, cargo, unidad, email..."
              value={q}
              onChange={e => setQ(e.target.value)}
              fontSize="0.9rem"
              _focus={{ boxShadow: 'none' }}
            />
          </Flex>
        </Flex>
      </Box>

      {loading ? (
        <Flex justify="center" p={12}><Spinner color={NAVY} size="xl" /></Flex>
      ) : funcionarios.length === 0 ? (
        <Box textAlign="center" py={12}><Text color="gray.400">No se encontraron funcionarios</Text></Box>
      ) : (
        <Grid templateColumns={{ base: '1fr', sm: 'repeat(2,1fr)', lg: 'repeat(3,1fr)', xl: 'repeat(4,1fr)' }} gap={4}>
          {funcionarios.map(f => (
            <Box
              key={f.id}
              bg="white"
              borderRadius="14px"
              p={4}
              boxShadow="0 1px 6px rgba(0,0,0,0.05)"
              transition="all 0.15s"
              _hover={{ transform: 'translateY(-2px)', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}
            >
              <Flex align="center" gap={3} mb={3}>
                <Box
                  w="44px"
                  h="44px"
                  borderRadius="full"
                  bg={NAVY}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  color="white"
                  fontWeight={800}
                  fontSize="0.9rem"
                  flexShrink={0}
                >
                  {f.nombres[0]}{f.apellido_paterno[0]}
                </Box>
                <Box flex={1} minW={0}>
                  <Text fontWeight={700} color={NAVY} fontSize="0.9rem" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {f.nombres} {f.apellido_paterno}
                  </Text>
                  <Text fontSize="0.75rem" color="gray.500" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.cargo}</Text>
                </Box>
              </Flex>

              <Box
                display="inline-block"
                px={2}
                py={0.5}
                borderRadius="full"
                bg={PINK + '15'}
                color={PINK}
                fontSize="0.7rem"
                fontWeight={600}
                mb={3}
              >
                {f.unidad}
              </Box>

              {f.email && (
                <Flex align="center" gap={2} mb={1.5}>
                  <Mail size={12} color="#9CA3AF" />
                  <Text fontSize="0.75rem" color="gray.600" noOfLines={1}>{f.email}</Text>
                </Flex>
              )}
              {f.telefono && (
                <Flex align="center" gap={2}>
                  <Phone size={12} color="#9CA3AF" />
                  <Text fontSize="0.75rem" color="gray.600">{f.telefono}</Text>
                </Flex>
              )}
            </Box>
          ))}
        </Grid>
      )}
    </Box>
  )
}
