# Audio Assets for Juliette Psicose

This directory contains all audio assets for the game, organized by category.

## Technical Specifications
- Format: MP3
- Sample rate: 44.1kHz
- Bit rate: 320kbps
- Stereo audio
- Normalized levels
- Loop points for ambient tracks
- Crossfade-compatible endings

## Directory Structure

### Tarot Sounds
- `tarot/` - Contains all sounds related to tarot card interactions
  - `shuffle.mp3` - Shuffling cards sound (2s)
  - `flip.mp3` - Card flip sound (0.5s)
  - `select.mp3` - Card selection sound (0.3s)
  - `reveal.mp3` - Card reveal sound (1s)
  - `justice.mp3` - Ethereal choir with bell toll (3s)
  - `rebellion.mp3` - Deep drums with distorted guitar (3s)
  - `love.mp3` - Soft female vocals with reverb (3s)
  - `moon.mp3` - Mystical ambient pad (3s)

### Music Tracks
- `main_theme.mp3` - Main theme with female vocals (2-3 min)
- `dark_electronic.mp3` - Dark ambient electronic (2-3 min)
- `twisted_jazz.mp3` - Distorted jazz piece (2-3 min)
- `rebellion_theme.mp3` - Intense hybrid theme (2-3 min)
- `juliette_theme.mp3` - Melodic theme for Juliette (2-3 min)
- `mirror_theme.mp3` - Distorted version of Juliette's theme (2-3 min)
- `asylum_ambience.mp3` - Dark asylum atmosphere (3-5 min)

### Sound Effects
- `glass_break/` - Glass breaking sound effects
  - `break_1.mp3` - Clean glass break (1s)
  - `break_2.mp3` - Distorted glass break (1s)
  - `crack.mp3` - Glass cracking sound (0.5s)
- `glitch/` - Digital glitch sound effects
  - `glitch_1.mp3` - Digital artifact sound (0.5s)
  - `glitch_2.mp3` - Data corruption sound (0.5s)
  - `static.mp3` - Electronic interference (1s)
- `ambient/` - Ambient sound effects
  - `heartbeat.mp3` - Deep, rhythmic heartbeat (2s loop)
  - `whispers.mp3` - Distant whispered poetry (3s)
  - `footsteps.mp3` - Echoing footsteps (2s)

## Audio Credits

All audio assets are original compositions created specifically for Juliette Psicose, except where noted below:

- Some sound effects are modified from royalty-free sources
- Atmospheric elements derived from field recordings
- All vocal performances by professional voice actors

## Workflow for Audio Integration

1. Sound effects are triggered by specific in-game events
2. Music tracks transition using crossfade techniques
3. Volume levels are dynamically adjusted based on game context
4. Spatial audio is used for positional sound effects
5. Audio is processed with reverb and other effects based on environment

## Notes for Developers

- Use the AudioManager component to handle all audio playback
- Set loop points in code for seamless looping of ambient tracks
- Implement volume ramping for smooth transitions
- Consider audio compression for mobile platforms

