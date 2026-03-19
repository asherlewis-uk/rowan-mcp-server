# ReactBits Component Catalogue
# @appletosolutions/reactbits v1.0.3
# All components importable from: @appletosolutions/reactbits
# CSS required in entry point: import '@appletosolutions/reactbits/dist/index.css'

## Text & Typography
- BlurText           — Blur-in text reveal
- DecryptedText      — Hacker-style character scramble reveal
- FuzzyText          — Fuzzy/glitch text effect
- GlitchText         — RGB-split glitch effect
- GradientText       — Animated gradient fill on text
- ScrambleText       — Character scramble on hover
- ScrollFloat        — Text floats in as you scroll
- ScrollReveal       — Reveal text on scroll
- ScrollVelocity     — Text speed tied to scroll velocity
- ShinyText          — Shiny shimmer sweep
- SplitText          — Split into chars/words for stagger animation
- TextCursor         — Animated blinking cursor appended to text
- TextPressure       — Text weight/size responds to cursor proximity
- TrueFocus          — Focus blur effect on text segments
- VariableProximity  — Variable font axes driven by cursor distance
- AsciiText          — Render text as ASCII art
- CircularText       — Text laid out on a circular path
- Counter            — Animated number counter
- CountUp            — Count-up from zero

## Backgrounds & Full-Screen Effects
- Aurora             — Aurora borealis animated gradient background
- Balatro            — Card-game inspired holographic background
- Beams              — Animated light beams
- Dither             — Dithered noise background
- DotGrid            — Animated dot-grid mesh
- Hyperspeed         — Warp-speed star field (Three.js)
- Iridescence        — Iridescent oil-slick surface
- LetterGlitch       — Full-screen letter glitch overlay
- LiquidChrome       — Liquid chrome fluid background
- MetaBalls          — Organic blob meta-balls
- MetallicPaint      — Metallic paint swirl (WebGL)
- Noise              — Simplex noise texture overlay
- Orb                — Glowing orb / ambient light
- Particles          — Configurable particle field
- Ribbons            — Flowing 3D ribbons (Three.js)
- ShapeBlur          — Blurred geometric shapes
- Silk               — Silk cloth simulation
- Squares            — Animated square grid
- Threads            — Flowing thread / fiber animation
- Waves              — Sine-wave background animation
- GridDistortion     — Image grid warp distortion (WebGL)
- GridMotion         — Motion-responsive image grid

## Cards & Containers
- BounceCards        — Stacked cards that bounce on entry
- CardSwap           — Swipeable card stack
- DecayCard          — Card with physics decay on drag
- GlareHover         — Glare light effect on hover
- PixelCard          — Pixel-art style card
- ProfileCard        — Social-style profile card with 3D tilt
- SpotlightCard      — Spotlight follow-cursor card
- TiltedCard         — Perspective tilt on mouse move
- Stack              — Physics-stacked card pile (Matter.js)
- Folder             — Expandable folder UI

## Cursors & Interactions
- BlobCursor         — Blob that follows the cursor
- ClickSpark         — Spark burst on click
- Crosshair          — Crosshair cursor overlay
- ImageTrail         — Images trail behind cursor
- Magnet             — Element magnetically attracted to cursor
- MagnetLines        — Magnetic field lines around cursor
- PixelTrail         — Pixel trail following cursor
- SplashCursor       — Fluid splash on cursor (WebGL)
- TextCursor         — (also in typography)

## Navigation & Menus
- Dock               — macOS-style magnifying dock
- FlowingMenu        — Menu items with flowing hover effect
- GooeyNav           — Gooey blob navigation
- InfiniteMenu       — 3D infinite rotating menu sphere

## Lists, Galleries & Sliders
- AnimatedContent    — Animated content switcher
- AnimatedList       — List items animate in on mount
- Carousel           — Horizontal scroll carousel
- CircularGallery    — Items arranged on a rotating circle
- ElasticSlider      — Elastic drag slider
- FlyingPosters      — Posters fly in from edges
- InfiniteScroll     — Seamless infinite scroll ticker
- RollingGallery     — Gallery rolls on scroll
- ImageTrail         — (also in cursors)

## 3D & WebGL
- Ballpit            — Physics ball pit (@react-three/rapier)
- ChromaGrid         — Chroma-key grid (WebGL)
- Hyperspeed         — (also in backgrounds)
- LiquidChrome       — (also in backgrounds)
- MetallicPaint      — (also in backgrounds)
- ModelViewer        — Drag-to-rotate GLTF/GLB viewer
- Ribbons            — (also in backgrounds)
- GridDistortion     — (also in backgrounds)

## Misc / UI Components
- Bounce             — Bouncy spring animation wrapper
- FadeContent        — Fade + slide in wrapper
- FallingText        — Text characters fall with gravity (Matter.js)
- GlassIcons         — Glassmorphism icon buttons
- Lightning          — Lightning bolt animated SVG
- PixelTransition    — Pixelated page transition
- Stepper            — Animated multi-step stepper
- Aurora             — (also in backgrounds)

## Peer Deps Required Per Category
| Category          | Extra Deps Needed                                      |
|-------------------|--------------------------------------------------------|
| Basic animations  | framer-motion                                          |
| GSAP effects      | gsap                                                   |
| 3D / WebGL        | three, @react-three/fiber, @react-three/drei, ogl      |
| 3D postprocessing | @react-three/postprocessing, postprocessing            |
| Physics (3D)      | @react-three/rapier                                    |
| Physics (2D)      | matter-js                                              |
| WebGL lines       | meshline, three-stdlib                                 |
| Matrix math       | gl-matrix                                              |

## Usage Example
```tsx
import {
  Bounce, ClickSpark, BlurText, Aurora, Ballpit, GlareHover
} from '@appletosolutions/reactbits'
// CSS must be imported once in entry point:
// import '@appletosolutions/reactbits/dist/index.css'
```
