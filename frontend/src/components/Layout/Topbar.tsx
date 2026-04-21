import { Box, Flex, IconButton, Text, Menu } from '@chakra-ui/react'
import { Menu as MenuIcon, LogOut, User } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useNavigate, useLocation } from 'react-router-dom'

const ROUTE_LABELS: Record<string, string> = {
  '/': 'Dashboard',
  '/funcionarios': 'Funcionarios',
  '/permisos': 'Permisos y Vacaciones',
  '/documentos': 'Gestión Documental',
  '/organigrama': 'Organigrama',
  '/directorio': 'Directorio',
  '/mi-perfil': 'Mi Perfil',
  '/reportes': 'Reportes',
  '/auditoria': 'Auditoría',
  '/admin/usuarios': 'Administración de Usuarios',
}

interface TopbarProps {
  onMenuClick: () => void
}

export default function Topbar({ onMenuClick }: TopbarProps) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const pageTitle = ROUTE_LABELS[location.pathname] || 'RRHH Independencia'

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  return (
    <Box
      h="64px"
      bg="white"
      borderBottom="1px solid"
      borderColor="gray.200"
      px={{ base: 4, md: 6 }}
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      position="sticky"
      top={0}
      zIndex={50}
      boxShadow="0 1px 4px rgba(0,0,0,0.06)"
    >
      <Flex align="center" gap={3}>
        <IconButton
          display={{ base: 'flex', lg: 'none' }}
          aria-label="Abrir menú"
          onClick={onMenuClick}
          variant="ghost"
          size="sm"
          color="#1B2B4B"
        >
          <MenuIcon size={20} />
        </IconButton>
        <Text fontWeight={700} fontSize={{ base: '0.95rem', md: '1.1rem' }} color="#1B2B4B">
          {pageTitle}
        </Text>
      </Flex>

      <Flex align="center" gap={2}>
        <Flex
          align="center"
          gap={2}
          cursor="pointer"
          p={2}
          borderRadius="8px"
          _hover={{ bg: 'gray.50' }}
          onClick={() => navigate('/mi-perfil')}
        >
          <Box
            w="32px"
            h="32px"
            borderRadius="full"
            bg="#1B2B4B"
            display="flex"
            alignItems="center"
            justifyContent="center"
            color="white"
            fontSize="0.8rem"
            fontWeight={700}
            flexShrink={0}
          >
            {(user?.nombre || user?.email || '?')[0].toUpperCase()}
          </Box>
          <Box display={{ base: 'none', md: 'block' }}>
            <Text fontSize="0.85rem" fontWeight={600} color="#1B2B4B" lineHeight={1.2}>
              {user?.nombre || user?.email}
            </Text>
            <Text fontSize="0.7rem" color="gray.500">{user?.rol}</Text>
          </Box>
        </Flex>
        <IconButton
          aria-label="Cerrar sesión"
          onClick={handleLogout}
          variant="ghost"
          size="sm"
          color="gray.500"
          _hover={{ color: '#E91E7B', bg: 'pink.50' }}
        >
          <LogOut size={16} />
        </IconButton>
      </Flex>
    </Box>
  )
}
