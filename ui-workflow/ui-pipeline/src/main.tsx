import React from 'react'
import ReactDOM from 'react-dom/client'
import '@appletosolutions/reactbits/dist/index.css'
import { ChakraProvider, extendTheme } from '@chakra-ui/react'
import { HeroSection } from './ui/sections/HeroSection'
import dna from '../design-dna/theme.json'

const theme = extendTheme({
  colors: dna.colors,
  fonts: dna.fonts,
  fontSizes: dna.fontSizes,
  space: dna.space,
  radii: dna.radii,
  shadows: dna.shadows,
  config: dna.config,
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <HeroSection />
    </ChakraProvider>
  </React.StrictMode>
)
