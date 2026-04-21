import { Box, Flex, Text, VStack, IconButton } from '@chakra-ui/react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Users, Calendar, FileText, GitBranch,
  Phone, User, BarChart2, ClipboardList, Settings, X
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

const NAVY = '#1B2B4B'
const PINK = '#E91E7B'

interface NavItem {
  to: string
  icon: React.ReactNode
  label: string
  roles?: string[]
}

const navItems: NavItem[] = [
  { to: '/', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
  { to: '/funcionarios', icon: <Users size={18} />, label: 'Funcionarios' },
  { to: '/permisos', icon: <Calendar size={18} />, label: 'Permisos' },
  { to: '/documentos', icon: <FileText size={18} />, label: 'Documentos' },
  { to: '/organigrama', icon: <GitBranch size={18} />, label: 'Organigrama' },
  { to: '/directorio', icon: <Phone size={18} />, label: 'Directorio' },
  { to: '/mi-perfil', icon: <User size={18} />, label: 'Mi Perfil' },
  { to: '/reportes', icon: <BarChart2 size={18} />, label: 'Reportes', roles: ['ADMIN', 'RRHH'] },
  { to: '/auditoria', icon: <ClipboardList size={18} />, label: 'Auditoría', roles: ['ADMIN', 'RRHH'] },
  { to: '/admin/usuarios', icon: <Settings size={18} />, label: 'Usuarios', roles: ['ADMIN'] },
]

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

function NavItem({ item, onClick }: { item: NavItem; onClick?: () => void }) {
  return (
    <NavLink
      to={item.to}
      end={item.to === '/'}
      onClick={onClick}
      style={({ isActive }) => ({
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '10px 16px',
        borderRadius: '10px',
        color: isActive ? '#fff' : 'rgba(255,255,255,0.75)',
        background: isActive ? PINK : 'transparent',
        fontWeight: isActive ? 600 : 400,
        fontSize: '0.9rem',
        textDecoration: 'none',
        transition: 'all 0.15s',
        width: '100%',
      })}
    >
      {item.icon}
      {item.label}
    </NavLink>
  )
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user } = useAuth()
  const visibleItems = navItems.filter(item => !item.roles || (user && item.roles.includes(user.rol)))

  const sidebarContent = (
    <Box
      w="260px"
      minH="100vh"
      bg={NAVY}
      display="flex"
      flexDir="column"
      p={4}
      gap={2}
    >
      <Flex align="center" justify="space-between" mb={6} mt={2}>
        <Box>
          <Text fontWeight={800} fontSize="1.1rem" color="white" lineHeight={1.1}>
            independencia
          </Text>
          <Text fontWeight={700} fontSize="1.1rem" color={PINK} lineHeight={1.1}>
            ciudadana
          </Text>
          <Text fontSize="0.65rem" color="rgba(255,255,255,0.5)" mt={1}>
            Sistema RRHH
          </Text>
        </Box>
        <IconButton
          display={{ base: 'flex', lg: 'none' }}
          aria-label="Cerrar menú"
          onClick={onClose}
          variant="ghost"
          color="white"
          size="sm"
        >
          <X size={18} />
        </IconButton>
      </Flex>

      <VStack gap={1} align="stretch" flex={1}>
        {visibleItems.map(item => (
          <NavItem key={item.to} item={item} onClick={onClose} />
        ))}
      </VStack>

      {user && (
        <Box
          mt={4}
          p={3}
          borderRadius="10px"
          bg="rgba(255,255,255,0.08)"
        >
          <Text fontSize="0.75rem" color="rgba(255,255,255,0.5)" mb={0.5}>Conectado como</Text>
          <Text fontSize="0.85rem" color="white" fontWeight={600} noOfLines={1}>{user.nombre || user.email}</Text>
          <Box
            display="inline-block"
            mt={1}
            px={2}
            py={0.5}
            borderRadius="full"
            bg={PINK}
            fontSize="0.65rem"
            color="white"
            fontWeight={700}
          >
            {user.rol}
          </Box>
        </Box>
      )}
    </Box>
  )

  return (
    <>
      <Box
        display={{ base: 'none', lg: 'block' }}
        position="fixed"
        top={0}
        left={0}
        zIndex={100}
        h="100vh"
      >
        {sidebarContent}
      </Box>
      {isOpen && (
        <Box
          display={{ base: 'block', lg: 'none' }}
          position="fixed"
          inset={0}
          zIndex={200}
          onClick={onClose}
          bg="rgba(0,0,0,0.5)"
        />
      )}
      <Box
        display={{ base: 'block', lg: 'none' }}
        position="fixed"
        top={0}
        left={isOpen ? 0 : '-260px'}
        zIndex={300}
        transition="left 0.25s"
        h="100vh"
      >
        {sidebarContent}
      </Box>
    </>
  )
}
