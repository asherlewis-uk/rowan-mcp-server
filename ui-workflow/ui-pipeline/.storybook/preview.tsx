import React from 'react'
import type { Preview } from '@storybook/react'
import { ChakraProvider, extendTheme } from '@chakra-ui/react'
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

const preview: Preview = {
  decorators: [
    Story => (
      <ChakraProvider theme={theme}>
        <Story />
      </ChakraProvider>
    ),
  ],
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
    a11y: {
      config: {
        rules: [
          { id: 'color-contrast', enabled: true },
          { id: 'landmark-one-main', enabled: true },
        ],
      },
    },
    viewport: {
      viewports: {
        mobile: { name: 'Mobile', styles: { width: '375px', height: '812px' } },
        tablet: { name: 'Tablet', styles: { width: '768px', height: '1024px' } },
        desktop: { name: 'Desktop', styles: { width: '1440px', height: '900px' } },
      },
    },
  },
}

export default preview
