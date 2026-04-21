import { Outlet } from 'react-router-dom'
import { Box, Flex } from '@chakra-ui/react'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import { useState } from 'react'

export default function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <Flex minH="100vh" bg="#F5F3EE">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Box
        flex={1}
        ml={{ base: 0, lg: '260px' }}
        transition="margin 0.2s"
        minH="100vh"
        display="flex"
        flexDir="column"
      >
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        <Box flex={1} p={{ base: 4, md: 6 }} maxW="1400px" w="100%" mx="auto">
          <Outlet />
        </Box>
      </Box>
    </Flex>
  )
}
