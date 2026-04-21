import React from 'react'
import ReactDOM from 'react-dom/client'
import { ChakraProvider, createSystem, defaultConfig, defineConfig } from '@chakra-ui/react'
import App from './App'

const customConfig = defineConfig({
  theme: {
    tokens: {
      colors: {
        navy: {
          50: { value: '#e8ecf4' },
          100: { value: '#c5cedf' },
          200: { value: '#9faecc' },
          300: { value: '#7a8db9' },
          400: { value: '#5e76ac' },
          500: { value: '#1B2B4B' },
          600: { value: '#172540' },
          700: { value: '#121e35' },
          800: { value: '#0d172a' },
          900: { value: '#080f1e' },
        },
        pink: {
          50: { value: '#fde8f2' },
          100: { value: '#fac5de' },
          200: { value: '#f69fc8' },
          300: { value: '#f278b2' },
          400: { value: '#ef5aa0' },
          500: { value: '#E91E7B' },
          600: { value: '#c9186a' },
          700: { value: '#a81258' },
          800: { value: '#880d47' },
          900: { value: '#680936' },
        },
        yellow: {
          500: { value: '#F4C430' },
        },
        green: {
          500: { value: '#3D8B37' },
        },
      },
      fonts: {
        heading: { value: `'Segoe UI', -apple-system, sans-serif` },
        body: { value: `'Segoe UI', -apple-system, sans-serif` },
      },
    },
    semanticTokens: {
      colors: {
        brand: { value: '{colors.navy.500}' },
        accent: { value: '{colors.pink.500}' },
        surface: { value: '#F5F3EE' },
      },
    },
  },
})

const system = createSystem(defaultConfig, customConfig)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ChakraProvider value={system}>
      <App />
    </ChakraProvider>
  </React.StrictMode>,
)
