import { Box, Button, Heading } from '@chakra-ui/react'
import { Bounce, ClickSpark } from '@appletosolutions/reactbits'

export function HeroSection() {
  return (
    <Box py="6rem" textAlign="center" data-testid="hero-section">
      <Bounce>
        <Heading size="3xl">Agentic UI Factory</Heading>
      </Bounce>
      <ClickSpark sparkColor="#ff6b6b">
        <Button mt="2rem" size="lg">Generate Screen</Button>
      </ClickSpark>
    </Box>
  )
}
