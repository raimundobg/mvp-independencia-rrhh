import { useState } from 'react'
import { Box, Button, Input, Text, Flex, VStack, Separator } from '@chakra-ui/react'
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth'
import { auth, googleProvider } from '../firebase'
import { useNavigate } from 'react-router-dom'
import { Mail, Lock, LogIn } from 'lucide-react'

const NAVY = '#1B2B4B'
const PINK = '#E91E7B'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      await signInWithEmailAndPassword(auth, email, password)
      navigate('/')
    } catch (err: any) {
      setError('Email o contraseña incorrectos')
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogle() {
    setLoading(true); setError('')
    try {
      await signInWithPopup(auth, googleProvider)
      navigate('/')
    } catch (err: any) {
      setError('No se pudo iniciar sesión con Google')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Flex minH="100vh" bg="#F5F3EE">
      <Box
        display={{ base: 'none', lg: 'flex' }}
        w="45%"
        bg={NAVY}
        flexDir="column"
        justify="center"
        p={12}
        position="relative"
        overflow="hidden"
      >
        <Box
          position="absolute"
          top="-80px"
          right="-80px"
          w="400px"
          h="400px"
          borderRadius="full"
          bg="rgba(233,30,123,0.12)"
        />
        <Box
          position="absolute"
          bottom="-60px"
          left="-60px"
          w="300px"
          h="300px"
          borderRadius="full"
          bg="rgba(244,196,48,0.08)"
        />
        <Box position="relative" zIndex={1}>
          <Text fontWeight={800} fontSize="2.5rem" color="white" lineHeight={1}>
            independencia
          </Text>
          <Text fontWeight={800} fontSize="2.5rem" color={PINK} lineHeight={1} mb={4}>
            ciudadana
          </Text>
          <Text fontSize="1rem" color="rgba(255,255,255,0.65)" maxW="380px" lineHeight={1.7}>
            Corporación de Innovación y Desarrollo de Independencia
          </Text>
          <Box mt={8} w="50px" h="4px" bg={PINK} borderRadius="full" />
          <Text mt={6} fontSize="0.95rem" color="rgba(255,255,255,0.5)">
            Sistema de Gestión de Personas (RRHH)
          </Text>
        </Box>
      </Box>

      <Flex flex={1} align="center" justify="center" p={6}>
        <Box w="100%" maxW="420px">
          <Box display={{ base: 'block', lg: 'none' }} mb={8} textAlign="center">
            <Text fontWeight={800} fontSize="1.8rem" color={NAVY} lineHeight={1}>
              independencia
            </Text>
            <Text fontWeight={800} fontSize="1.8rem" color={PINK} lineHeight={1} mb={1}>
              ciudadana
            </Text>
            <Text fontSize="0.85rem" color="gray.500">Sistema de Gestión de Personas</Text>
          </Box>

          <Text fontSize="1.6rem" fontWeight={800} color={NAVY} mb={1}>
            Bienvenido
          </Text>
          <Text fontSize="0.9rem" color="gray.500" mb={8}>
            Ingresa a tu cuenta para continuar
          </Text>

          <VStack as="form" onSubmit={handleEmail} gap={4}>
            <Box w="100%">
              <Text fontSize="0.85rem" fontWeight={600} color={NAVY} mb={1.5}>Email</Text>
              <Flex
                align="center"
                border="2px solid"
                borderColor="gray.200"
                borderRadius="10px"
                bg="white"
                _focusWithin={{ borderColor: NAVY }}
                transition="border-color 0.2s"
                overflow="hidden"
              >
                <Box px={3} color="gray.400"><Mail size={16} /></Box>
                <Input
                  border="none"
                  outline="none"
                  p={3}
                  pl={0}
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  type="email"
                  placeholder="usuario@independencia.cl"
                  required
                  _focus={{ boxShadow: 'none' }}
                  fontSize="0.9rem"
                />
              </Flex>
            </Box>

            <Box w="100%">
              <Text fontSize="0.85rem" fontWeight={600} color={NAVY} mb={1.5}>Contraseña</Text>
              <Flex
                align="center"
                border="2px solid"
                borderColor="gray.200"
                borderRadius="10px"
                bg="white"
                _focusWithin={{ borderColor: NAVY }}
                transition="border-color 0.2s"
                overflow="hidden"
              >
                <Box px={3} color="gray.400"><Lock size={16} /></Box>
                <Input
                  border="none"
                  outline="none"
                  p={3}
                  pl={0}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  type="password"
                  placeholder="••••••••"
                  required
                  _focus={{ boxShadow: 'none' }}
                  fontSize="0.9rem"
                />
              </Flex>
            </Box>

            {error && (
              <Box w="100%" bg="red.50" border="1px solid" borderColor="red.200" borderRadius="8px" p={3}>
                <Text fontSize="0.85rem" color="red.600">{error}</Text>
              </Box>
            )}

            <Button
              type="submit"
              w="100%"
              bg={NAVY}
              color="white"
              borderRadius="10px"
              h="48px"
              fontWeight={700}
              loading={loading}
              _hover={{ bg: '#142035' }}
              transition="all 0.2s"
            >
              <LogIn size={16} style={{ marginRight: 8 }} />
              Ingresar
            </Button>
          </VStack>

          <Flex align="center" gap={3} my={6}>
            <Separator flex={1} />
            <Text fontSize="0.8rem" color="gray.400" flexShrink={0}>o continúa con</Text>
            <Separator flex={1} />
          </Flex>

          <Button
            w="100%"
            variant="outline"
            borderRadius="10px"
            h="48px"
            fontWeight={600}
            onClick={handleGoogle}
            loading={loading}
            border="2px solid"
            borderColor="gray.200"
            _hover={{ borderColor: NAVY, bg: 'gray.50' }}
            color={NAVY}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" style={{ marginRight: 8 }}>
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Ingresar con Google
          </Button>

          <Text textAlign="center" fontSize="0.8rem" color="gray.400" mt={8}>
            © {new Date().getFullYear()} Independencia Ciudadana · Shelby Dev Co
          </Text>
        </Box>
      </Flex>
    </Flex>
  )
}
