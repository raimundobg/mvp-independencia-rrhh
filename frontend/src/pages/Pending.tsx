import { Box, Text, Button, Flex } from '@chakra-ui/react'
import { Clock, LogOut } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function Pending() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  return (
    <Flex minH="100vh" bg="#F5F3EE" align="center" justify="center" p={6}>
      <Box textAlign="center" maxW="480px">
        <Box
          w="80px" h="80px" borderRadius="full" bg="#1B2B4B"
          display="flex" alignItems="center" justifyContent="center" mx="auto" mb={6}
        >
          <Clock size={36} color="#F4C430" />
        </Box>
        <Text fontSize="1.8rem" fontWeight={800} color="#1B2B4B" mb={3}>
          Cuenta pendiente de activación
        </Text>
        <Text color="gray.500" mb={2} lineHeight={1.7}>
          Tu cuenta <strong>{user?.email}</strong> fue registrada correctamente.
        </Text>
        <Text color="gray.500" mb={8} lineHeight={1.7}>
          Un administrador debe asignarte un rol para que puedas acceder al sistema. Por favor, contacta a RRHH.
        </Text>
        <Button
          bg="#E91E7B" color="white" borderRadius="10px" h="44px" fontWeight={700}
          _hover={{ bg: '#c9186a' }}
          onClick={async () => { await logout(); navigate('/login') }}
        >
          <LogOut size={16} style={{ marginRight: 8 }} />
          Cerrar sesión
        </Button>
      </Box>
    </Flex>
  )
}
