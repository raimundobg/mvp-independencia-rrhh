import { useState, useEffect, useRef } from 'react'
import { Box, Button, Input, Text, Flex, VStack, Separator } from '@chakra-ui/react'
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth'
import { auth, googleProvider } from '../firebase'
import { useNavigate } from 'react-router-dom'
import { Mail, Lock, LogIn, X, FileText, Clock } from 'lucide-react'

const NAVY = '#1B2B4B'
const PINK = '#E91E7B'
const EXPIRY = new Date('2026-05-01T23:59:59')

function getTimeLeft() {
  const diff = EXPIRY.getTime() - Date.now()
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 }
  const days    = Math.floor(diff / 86400000)
  const hours   = Math.floor((diff % 86400000) / 3600000)
  const minutes = Math.floor((diff % 3600000) / 60000)
  const seconds = Math.floor((diff % 60000) / 1000)
  return { days, hours, minutes, seconds }
}

function FomoModal({ onClose }: { onClose: () => void }) {
  const [timeLeft, setTimeLeft]   = useState(getTimeLeft())
  const [progress, setProgress]   = useState(100)
  const autoClose                 = 7
  const startRef                  = useRef(Date.now())

  useEffect(() => {
    const id = setInterval(() => {
      setTimeLeft(getTimeLeft())
      const elapsed = (Date.now() - startRef.current) / 1000
      const pct     = Math.max(0, 100 - (elapsed / autoClose) * 100)
      setProgress(pct)
      if (elapsed >= autoClose) {
        clearInterval(id)
        onClose()
      }
    }, 80)
    return () => clearInterval(id)
  }, [onClose])

  const pad = (n: number) => String(n).padStart(2, '0')

  return (
    <Box
      position="fixed" inset={0} zIndex={9999}
      bg="rgba(0,0,0,0.72)" backdropFilter="blur(6px)"
      display="flex" alignItems="center" justifyContent="center"
      p={4}
      style={{ animation: 'fadeIn .25s ease' }}
    >
      <style>{`
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes pulse  { 0%,100%{transform:scale(1)} 50%{transform:scale(1.04)} }
        @keyframes shake  { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-4px)} 75%{transform:translateX(4px)} }
      `}</style>

      <Box
        bg="white"
        borderRadius="20px"
        overflow="hidden"
        maxW="480px"
        w="100%"
        boxShadow="0 40px 120px rgba(0,0,0,0.5)"
        position="relative"
      >
        {/* Top accent bar */}
        <Box h="5px" background="linear-gradient(90deg, #E91E7B, #1B2B4B, #E91E7B)" />

        {/* Progress bar auto-close */}
        <Box h="3px" bg="#f1f5f9" position="relative">
          <Box
            position="absolute" top={0} left={0} h="100%"
            bg="#E91E7B"
            style={{ width: `${progress}%`, transition: 'width 0.08s linear' }}
          />
        </Box>

        <Box p={{ base: 6, md: 8 }}>
          {/* Close */}
          <Button
            position="absolute" top={4} right={4}
            size="sm" variant="ghost" color="gray.400"
            onClick={onClose}
            _hover={{ color: NAVY, bg: 'gray.100' }}
            borderRadius="full"
          >
            <X size={18} />
          </Button>

          {/* Icon */}
          <Box textAlign="center" mb={4}>
            <Box
              display="inline-flex" alignItems="center" justifyContent="center"
              w="56px" h="56px" borderRadius="16px"
              bg="#fff0f6" mb={3}
              style={{ animation: 'pulse 2s ease-in-out infinite' }}
            >
              <Clock size={28} color={PINK} />
            </Box>
            <Box
              display="inline-block" px={3} py={1}
              bg="#fff0f6" borderRadius="full"
              fontSize="0.7rem" fontWeight={700}
              color={PINK} letterSpacing="0.1em"
              textTransform="uppercase"
            >
              Oferta con plazo limitado
            </Box>
          </Box>

          <Text
            textAlign="center" fontSize={{ base: '1.3rem', md: '1.5rem' }}
            fontWeight={800} color={NAVY} mb={1}
          >
            Esta propuesta vence en:
          </Text>
          <Text textAlign="center" fontSize="0.9rem" color="gray.500" mb={6}>
            Después de esta fecha, los precios y condiciones podrían cambiar.
          </Text>

          {/* Countdown */}
          <Flex justify="center" gap={3} mb={6}>
            {[
              { v: timeLeft.days,    l: 'días' },
              { v: timeLeft.hours,   l: 'horas' },
              { v: timeLeft.minutes, l: 'min' },
              { v: timeLeft.seconds, l: 'seg' },
            ].map(({ v, l }) => (
              <Box key={l} textAlign="center">
                <Box
                  bg={NAVY} color="white"
                  borderRadius="12px"
                  px={{ base: 3, md: 4 }}
                  py={3}
                  minW={{ base: '56px', md: '70px' }}
                  style={{ animation: l === 'seg' ? 'shake 1s ease-in-out infinite' : 'none' }}
                >
                  <Text fontSize={{ base: '1.6rem', md: '2.2rem' }} fontWeight={800} lineHeight={1}>
                    {pad(v)}
                  </Text>
                </Box>
                <Text fontSize="0.65rem" color="gray.400" fontWeight={600} mt={1} textTransform="uppercase" letterSpacing="0.1em">
                  {l}
                </Text>
              </Box>
            ))}
          </Flex>

          {/* FOMO text */}
          <Box
            bg="#fff8f0" border="1.5px solid #fde68a"
            borderRadius="10px" p={3} mb={6}
            textAlign="center"
          >
            <Text fontSize="0.82rem" color="#92400e" lineHeight={1.6}>
              ⚠️ <strong>Propuesta válida hasta el 1 de mayo de 2026.</strong><br />
              Actúa ahora y asegura las condiciones presentadas.
            </Text>
          </Box>

          <Button
            w="100%" h="50px"
            bg={PINK} color="white"
            borderRadius="12px"
            fontWeight={700} fontSize="0.95rem"
            onClick={onClose}
            _hover={{ bg: '#c41669', transform: 'translateY(-1px)' }}
            transition="all 0.2s"
          >
            <FileText size={18} style={{ marginRight: 8 }} />
            Ver propuesta completa →
          </Button>
          <Text textAlign="center" fontSize="0.72rem" color="gray.400" mt={3}>
            Se cerrará automáticamente en {Math.ceil((progress / 100) * autoClose)}s
          </Text>
        </Box>
      </Box>
    </Box>
  )
}

export default function Login() {
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const [showFomo, setShowFomo] = useState(false)
  const navigate = useNavigate()

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      await signInWithEmailAndPassword(auth, email, password)
      navigate('/')
    } catch {
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
    } catch {
      setError('No se pudo iniciar sesión con Google')
    } finally {
      setLoading(false)
    }
  }

  function handleProposal() {
    setShowFomo(true)
  }

  function handleFomoClose() {
    setShowFomo(false)
    window.open('/propuesta.html', '_blank')
  }

  return (
    <>
      {showFomo && <FomoModal onClose={handleFomoClose} />}

      <Flex minH="100vh" bg="#F5F3EE">
        {/* Left panel */}
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
          <Box position="absolute" top="-80px" right="-80px" w="400px" h="400px" borderRadius="full" bg="rgba(233,30,123,0.12)" />
          <Box position="absolute" bottom="-60px" left="-60px" w="300px" h="300px" borderRadius="full" bg="rgba(244,196,48,0.08)" />

          <Box position="relative" zIndex={1}>
            <Text fontWeight={800} fontSize="2.5rem" color="white" lineHeight={1}>
              independencia
            </Text>
            <Text fontWeight={800} fontSize="2.5rem" color={PINK} lineHeight={1} mb={4}>
              ciudadana
            </Text>
            <Text fontSize="1rem" color="rgba(255,255,255,0.65)" maxW="380px" lineHeight={1.7}>
              Corporación de Desarrollo Social de Independencia
            </Text>
            <Box mt={8} w="50px" h="4px" bg={PINK} borderRadius="full" />
            <Text mt={6} fontSize="0.95rem" color="rgba(255,255,255,0.5)">
              Sistema de Gestión de Personas (RRHH)
            </Text>

            {/* Proposal CTA */}
            <Box
              mt={10}
              p={5}
              borderRadius="16px"
              bg="rgba(255,255,255,0.06)"
              border="1.5px solid rgba(233,30,123,0.35)"
              cursor="pointer"
              onClick={handleProposal}
              _hover={{ bg: 'rgba(233,30,123,0.12)', borderColor: PINK }}
              transition="all 0.2s"
            >
              <Flex align="center" gap={3} mb={2}>
                <Box
                  bg={PINK} borderRadius="10px" p={2}
                  display="flex" alignItems="center" justifyContent="center"
                >
                  <FileText size={18} color="white" />
                </Box>
                <Text fontWeight={700} color="white" fontSize="0.95rem">
                  Revisa nuestra propuesta
                </Text>
              </Flex>
              <Text fontSize="0.8rem" color="rgba(255,255,255,0.55)" lineHeight={1.6}>
                Planes, precios y detalle técnico del sistema RRHH preparado especialmente para tu organización.
              </Text>
              <Flex align="center" gap={1} mt={3}>
                <Box w="6px" h="6px" borderRadius="full" bg="#E91E7B" style={{ animation: 'pulse 1.5s ease-in-out infinite' }} />
                <Text fontSize="0.72rem" color={PINK} fontWeight={600}>Oferta por tiempo limitado</Text>
              </Flex>
            </Box>
          </Box>
        </Box>

        {/* Right panel - login form */}
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
                    border="none" outline="none" p={3} pl={0}
                    value={email} onChange={e => setEmail(e.target.value)}
                    type="email" placeholder="usuario@independencia.cl"
                    required _focus={{ boxShadow: 'none' }} fontSize="0.9rem"
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
                    border="none" outline="none" p={3} pl={0}
                    value={password} onChange={e => setPassword(e.target.value)}
                    type="password" placeholder="••••••••"
                    required _focus={{ boxShadow: 'none' }} fontSize="0.9rem"
                  />
                </Flex>
              </Box>

              {error && (
                <Box w="100%" bg="red.50" border="1px solid" borderColor="red.200" borderRadius="8px" p={3}>
                  <Text fontSize="0.85rem" color="red.600">{error}</Text>
                </Box>
              )}

              <Button
                type="submit" w="100%" bg={NAVY} color="white"
                borderRadius="10px" h="48px" fontWeight={700}
                loading={loading} _hover={{ bg: '#142035' }} transition="all 0.2s"
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
              w="100%" variant="outline" borderRadius="10px" h="48px"
              fontWeight={600} onClick={handleGoogle} loading={loading}
              border="2px solid" borderColor="gray.200"
              _hover={{ borderColor: NAVY, bg: 'gray.50' }} color={NAVY}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" style={{ marginRight: 8 }}>
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Ingresar con Google
            </Button>

            {/* Mobile proposal CTA */}
            <Box
              display={{ base: 'block', lg: 'none' }}
              mt={6}
              p={4}
              borderRadius="14px"
              bg={NAVY}
              cursor="pointer"
              onClick={handleProposal}
            >
              <Flex align="center" gap={3}>
                <Box bg={PINK} borderRadius="8px" p={1.5}>
                  <FileText size={16} color="white" />
                </Box>
                <Box>
                  <Text fontWeight={700} color="white" fontSize="0.9rem">Revisa nuestra propuesta</Text>
                  <Text fontSize="0.72rem" color={PINK} fontWeight={600}>Oferta por tiempo limitado →</Text>
                </Box>
              </Flex>
            </Box>

            <Text textAlign="center" fontSize="0.8rem" color="gray.400" mt={8}>
              © {new Date().getFullYear()} Independencia Ciudadana · Desarrollado por{' '}
              <Box as="span" color={NAVY} fontWeight={600}>Consultora Hélice</Box>
            </Text>
          </Box>
        </Flex>
      </Flex>
    </>
  )
}
