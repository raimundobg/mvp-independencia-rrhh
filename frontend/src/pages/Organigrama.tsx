import { useEffect, useState } from 'react'
import { Box, Flex, Text, Spinner, Input } from '@chakra-ui/react'
import { Search } from 'lucide-react'
import { api } from '../services/api'

const NAVY = '#1B2B4B'
const PINK = '#E91E7B'

interface OrgNode {
  id: string
  nombres: string
  apellido_paterno: string
  cargo: string
  unidad: string
  children: OrgNode[]
}

function OrgCard({ node, level = 0 }: { node: OrgNode; level?: number }) {
  const [open, setOpen] = useState(level < 2)
  const hasChildren = node.children.length > 0

  return (
    <Box>
      <Flex
        direction="column"
        align="center"
        cursor={hasChildren ? 'pointer' : 'default'}
        onClick={() => hasChildren && setOpen(o => !o)}
        position="relative"
      >
        <Box
          bg={level === 0 ? NAVY : level === 1 ? PINK : 'white'}
          color={level <= 1 ? 'white' : NAVY}
          border={level >= 2 ? `2px solid ${NAVY}20` : 'none'}
          borderRadius="12px"
          px={4}
          py={3}
          textAlign="center"
          minW="160px"
          maxW="200px"
          boxShadow={`0 2px 8px rgba(0,0,0,${level === 0 ? 0.15 : 0.08})`}
          transition="transform 0.15s"
          _hover={{ transform: 'translateY(-2px)' }}
        >
          <Box
            w="36px"
            h="36px"
            borderRadius="full"
            bg={level === 0 ? PINK : level === 1 ? 'rgba(255,255,255,0.25)' : NAVY + '18'}
            display="flex"
            alignItems="center"
            justifyContent="center"
            mx="auto"
            mb={1.5}
            fontSize="0.85rem"
            fontWeight={800}
            color={level <= 1 ? 'white' : NAVY}
          >
            {node.nombres[0]}{node.apellido_paterno[0]}
          </Box>
          <Text fontWeight={700} fontSize="0.8rem" noOfLines={1}>{node.nombres} {node.apellido_paterno}</Text>
          <Text fontSize="0.7rem" opacity={0.8} noOfLines={1} mt={0.5}>{node.cargo}</Text>
          {hasChildren && (
            <Text fontSize="0.65rem" mt={1} opacity={0.6}>{open ? '▲' : '▼'} {node.children.length}</Text>
          )}
        </Box>
      </Flex>
      {hasChildren && open && (
        <Flex justify="center" mt={4} position="relative">
          <Box position="absolute" top="-16px" left="50%" w="1px" h="16px" bg="#D1D5DB" transform="translateX(-50%)" />
          <Flex gap={4} flexWrap="wrap" justify="center" position="relative">
            {node.children.length > 1 && (
              <Box
                position="absolute"
                top="-1px"
                left={`calc(${100 / node.children.length}% / 2)`}
                right={`calc(${100 / node.children.length}% / 2)`}
                h="1px"
                bg="#D1D5DB"
              />
            )}
            {node.children.map(child => (
              <Box key={child.id} position="relative" pt={4}>
                <Box position="absolute" top={0} left="50%" w="1px" h="16px" bg="#D1D5DB" transform="translateX(-50%)" />
                <OrgCard node={child} level={level + 1} />
              </Box>
            ))}
          </Flex>
        </Flex>
      )}
    </Box>
  )
}

export default function Organigrama() {
  const [tree, setTree] = useState<OrgNode[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/api/v1/external/organigrama')
      .then(setTree)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Flex justify="center" p={12}><Spinner color={NAVY} size="xl" /></Flex>

  return (
    <Box>
      <Box mb={6}>
        <Text fontSize="1.5rem" fontWeight={800} color={NAVY}>Organigrama</Text>
        <Text fontSize="0.85rem" color="gray.500">Estructura jerárquica de la corporación · Haz clic en los nodos para expandir</Text>
      </Box>

      {tree.length === 0 ? (
        <Box textAlign="center" py={16}>
          <Text color="gray.400">No hay funcionarios registrados en el organigrama.</Text>
          <Text fontSize="0.85rem" color="gray.400" mt={1}>Registra funcionarios y asigna jefes directos para ver la jerarquía.</Text>
        </Box>
      ) : (
        <Box bg="white" borderRadius="14px" p={8} boxShadow="0 1px 6px rgba(0,0,0,0.05)" overflowX="auto">
          <Flex direction="column" align="center" gap={6} minW="600px">
            {tree.map(node => <OrgCard key={node.id} node={node} level={0} />)}
          </Flex>
        </Box>
      )}
    </Box>
  )
}
