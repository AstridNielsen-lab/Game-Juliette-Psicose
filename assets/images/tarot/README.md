# Tarot Card Assets for Juliette Psicose

This directory contains all tarot card images used in the game's mystical card system.

## Card Specifications
- Resolution: 512x768 pixels
- Format: PNG with transparency
- Style: Digital collage with glitch art elements
- Color palette: Dark purples, crimsons, and blues with high contrast accents

## Cards Included

### Standard Cards
- `card-back.png` - The back design used for all cards
- `justice.png` - Justice card (Justiça) representing moral choices and consequences
- `rebellion.png` - Custom Rebellion card (Rebelião) representing resistance themes
- `love.png` - Love card (Amor) representing emotional power
- `moon.png` - Moon card (Lua) for psychic visions and intuition

### Visual Effects Layers
- `glow-overlay.png` - Glow effect for selected cards
- `glitch-effect.png` - Glitch texture overlay for card reveals
- `symbol-overlay.png` - Mystical symbols overlay

## Art Direction Notes

The tarot cards combine traditional tarot symbolism with modern digital collage techniques:

1. Each card features multiple layers of imagery
2. Text elements are integrated as part of the visual composition
3. Glitch effects are concentrated around the edges and key symbols
4. Each card has a distinct color signature while maintaining overall cohesion
5. Cards should evoke the game's themes of rebellion, truth-seeking, and mental clarity

## Implementation Notes

- Cards are loaded as sprite textures in Phaser.js
- Animations handle card flips, reveals, and selection effects
- TarotSystem.js manages all card interactions and meaning displays
- Cards connect to the karma system, affecting game narrative

## Card Meanings and Poetic Elements

Each card contains layers of symbolism that connect to the game's narrative:

- **Justice (Justiça)**: Represents the balance between truth and deception, and the consequences of one's choices. Connected to Juliette's discovery of corruption.

- **Rebellion (Rebelião)**: A custom card symbolizing resistance against oppressive systems. Visual elements include broken chains and flickering flames.

- **Love (Amor)**: Represents emotional connections as both liberating and potentially destructive forces. Imagery includes intertwined hearts with thorns.

- **Moon (Lua)**: Symbolizes intuition, the unconscious mind, and the thin veil between delusion and clarity. Features distorted reflections and multiple phases.

