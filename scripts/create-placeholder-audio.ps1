# PowerShell script to create placeholder audio files
# This creates empty MP3 files with the right structure

# Define the directories
$audioDir = Join-Path $PSScriptRoot "..\assets\audio"
$tarotDir = Join-Path $audioDir "tarot"
$glassBreakDir = Join-Path $audioDir "glass_break"
$glitchDir = Join-Path $audioDir "glitch"
$ambientDir = Join-Path $audioDir "ambient"

# Create directories if they don't exist
$dirs = @($audioDir, $tarotDir, $glassBreakDir, $glitchDir, $ambientDir)
foreach ($dir in $dirs) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force
        Write-Host "Created directory: $dir"
    }
}

# Function to create a placeholder MP3 file
function Create-PlaceholderMP3 {
    param (
        [string]$directory,
        [string]$filename,
        [string]$description
    )
    
    $filePath = Join-Path -Path $directory -ChildPath $filename
    
    # Check if file already exists
    if (-not (Test-Path $filePath)) {
        # Create a minimal MP3 header (not a valid MP3 but serves as a placeholder)
        $bytes = [byte[]]@(0x49, 0x44, 0x33, 0x03, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00)
        [System.IO.File]::WriteAllBytes($filePath, $bytes)
        
        Write-Host "Created placeholder: $filePath - $description"
    }
    else {
        Write-Host "File already exists: $filePath"
    }
}

# Create tarot sound placeholders
Create-PlaceholderMP3 -directory $tarotDir -filename "shuffle.mp3" -description "Shuffling cards sound (2s)"
Create-PlaceholderMP3 -directory $tarotDir -filename "flip.mp3" -description "Card flip sound (0.5s)"
Create-PlaceholderMP3 -directory $tarotDir -filename "select.mp3" -description "Card selection sound (0.3s)"
Create-PlaceholderMP3 -directory $tarotDir -filename "reveal.mp3" -description "Card reveal sound (1s)"
Create-PlaceholderMP3 -directory $tarotDir -filename "justice.mp3" -description "Ethereal choir with bell toll (3s)"
Create-PlaceholderMP3 -directory $tarotDir -filename "rebellion.mp3" -description "Deep drums with distorted guitar (3s)"
Create-PlaceholderMP3 -directory $tarotDir -filename "love.mp3" -description "Soft female vocals with reverb (3s)"
Create-PlaceholderMP3 -directory $tarotDir -filename "moon.mp3" -description "Mystical ambient pad (3s)"

# Create main audio tracks
Create-PlaceholderMP3 -directory $audioDir -filename "main_theme.mp3" -description "Main theme with female vocals (2-3 min)"
Create-PlaceholderMP3 -directory $audioDir -filename "dark_electronic.mp3" -description "Dark ambient electronic (2-3 min)"
Create-PlaceholderMP3 -directory $audioDir -filename "twisted_jazz.mp3" -description "Distorted jazz piece (2-3 min)"
Create-PlaceholderMP3 -directory $audioDir -filename "rebellion_theme.mp3" -description "Intense hybrid theme (2-3 min)"
Create-PlaceholderMP3 -directory $audioDir -filename "juliette_theme.mp3" -description "Melodic theme for Juliette (2-3 min)"
Create-PlaceholderMP3 -directory $audioDir -filename "mirror_theme.mp3" -description "Distorted version of Juliette's theme (2-3 min)"
Create-PlaceholderMP3 -directory $audioDir -filename "asylum_ambience.mp3" -description "Dark asylum atmosphere (3-5 min)"

# Create glass break sound effects
Create-PlaceholderMP3 -directory $glassBreakDir -filename "break_1.mp3" -description "Clean glass break (1s)"
Create-PlaceholderMP3 -directory $glassBreakDir -filename "break_2.mp3" -description "Distorted glass break (1s)"
Create-PlaceholderMP3 -directory $glassBreakDir -filename "crack.mp3" -description "Glass cracking sound (0.5s)"

# Create glitch sound effects
Create-PlaceholderMP3 -directory $glitchDir -filename "glitch_1.mp3" -description "Digital artifact sound (0.5s)"
Create-PlaceholderMP3 -directory $glitchDir -filename "glitch_2.mp3" -description "Data corruption sound (0.5s)"
Create-PlaceholderMP3 -directory $glitchDir -filename "static.mp3" -description "Electronic interference (1s)"

# Create ambient sound effects
Create-PlaceholderMP3 -directory $ambientDir -filename "heartbeat.mp3" -description "Deep, rhythmic heartbeat (2s loop)"
Create-PlaceholderMP3 -directory $ambientDir -filename "whispers.mp3" -description "Distant whispered poetry (3s)"
Create-PlaceholderMP3 -directory $ambientDir -filename "footsteps.mp3" -description "Echoing footsteps (2s)"

Write-Host "All placeholder audio files created successfully."

