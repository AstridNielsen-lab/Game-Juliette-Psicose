// AudioManager.js - Handles all game audio including music, sound effects, and dynamic mixing

class AudioManager {
    constructor(scene) {
        this.scene = scene;
        this.musicTracks = {};
        this.soundEffects = {};
        this.currentMusic = null;
        this.isMuted = localStorage.getItem('juliettePsicose_musicOn') === 'false';
        this.volume = parseFloat(localStorage.getItem('juliettePsicose_volume') || '0.5');
        this.crossFadeDuration = 2000; // ms
        
        // Initialize audio context if Web Audio API is available
        if (window.AudioContext || window.webkitAudioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.gainNode = this.audioContext.createGain();
            this.gainNode.connect(this.audioContext.destination);
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 256;
            this.gainNode.connect(this.analyser);
            
            // For visualization
            this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
        } else {
            console.warn("Web Audio API not supported in this browser");
        }
        
        // Track current state for each sound category
        this.states = {
            music: {
                volume: this.volume,
                isMuted: this.isMuted,
            },
            sfx: {
                volume: this.volume,
                isMuted: this.isMuted,
            },
            ambient: {
                volume: this.volume * 0.7, // Ambient sounds slightly quieter by default
                isMuted: this.isMuted,
            }
        };
    }
    
    // Load music tracks
    loadMusic(key, path) {
        this.scene.load.audio(key, path);
        return this;
    }
    
    // Load sound effects
    loadSoundEffect(key, path) {
        this.scene.load.audio(key, path);
        return this;
    }
    
    // Called after all assets are loaded
    initialize() {
        // Set up the main tracks
        this.musicTracks = {
            'main_theme': this.scene.sound.add('main_theme', { loop: true, volume: this.states.music.volume }),
            'dark_electronic': this.scene.sound.add('dark_electronic', { loop: true, volume: this.states.music.volume }),
            'twisted_jazz': this.scene.sound.add('twisted_jazz', { loop: true, volume: this.states.music.volume }),
            'rebellion_theme': this.scene.sound.add('rebellion_theme', { loop: true, volume: this.states.music.volume }),
            'juliette_theme': this.scene.sound.add('juliette_theme', { loop: true, volume: this.states.music.volume }),
            'mirror_theme': this.scene.sound.add('mirror_theme', { loop: true, volume: this.states.music.volume }),
            'asylum_ambience': this.scene.sound.add('asylum_ambience', { loop: true, volume: this.states.ambient.volume })
        };
        
        // Set up the sound effects
        this.soundEffects = {
            // Glass breaking sounds
            'glass_break_1': this.scene.sound.add('glass_break_1', { volume: this.states.sfx.volume }),
            'glass_break_2': this.scene.sound.add('glass_break_2', { volume: this.states.sfx.volume }),
            'glass_crack': this.scene.sound.add('glass_crack', { volume: this.states.sfx.volume }),
            
            // Glitch sounds
            'glitch_1': this.scene.sound.add('glitch_1', { volume: this.states.sfx.volume }),
            'glitch_2': this.scene.sound.add('glitch_2', { volume: this.states.sfx.volume }),
            'static': this.scene.sound.add('static', { volume: this.states.sfx.volume }),
            
            // Ambient sounds
            'heartbeat': this.scene.sound.add('heartbeat', { loop: true, volume: this.states.ambient.volume }),
            'whispers': this.scene.sound.add('whispers', { loop: true, volume: this.states.ambient.volume }),
            'footsteps': this.scene.sound.add('footsteps', { volume: this.states.sfx.volume })
        };
        
        // Set initial muted state based on localStorage
        this.setMute(this.isMuted);
        
        return this;
    }
    
    // Play music with optional crossfade
    playMusic(key, options = {}) {
        const defaultOptions = {
            volume: this.states.music.volume,
            crossFade: true,
            fadeIn: true,
            fadeInDuration: 2000,
            onComplete: null
        };
        
        const config = { ...defaultOptions, ...options };
        
        // Stop current music with crossfade if enabled
        if (this.currentMusic) {
            const previousMusic = this.currentMusic;
            
            if (config.crossFade) {
                // Fade out current music
                this.scene.tweens.add({
                    targets: previousMusic,
                    volume: 0,
                    duration: this.crossFadeDuration,
                    onComplete: () => {
                        previousMusic.stop();
                    }
                });
            } else {
                previousMusic.stop();
            }
        }
        
        // Set the new current music
        this.currentMusic = this.musicTracks[key];
        
        // Apply mute status
        if (this.isMuted) {
            this.currentMusic.setMute(true);
        }
        
        if (config.fadeIn) {
            // Start at 0 volume and fade in
            this.currentMusic.setVolume(0);
            this.currentMusic.play();
            
            this.scene.tweens.add({
                targets: this.currentMusic,
                volume: config.volume,
                duration: config.fadeInDuration,
                onComplete: config.onComplete
            });
        } else {
            // Start immediately at target volume
            this.currentMusic.setVolume(config.volume);
            this.currentMusic.play();
            
            if (config.onComplete) {
                config.onComplete();
            }
        }
        
        return this;
    }
    
    // Play a sound effect
    playSoundEffect(key, options = {}) {
        const defaultOptions = {
            volume: this.states.sfx.volume,
            rate: 1.0,
            detune: 0
        };
        
        const config = { ...defaultOptions, ...options };
        
        // Check if the sound exists
        if (this.soundEffects[key]) {
            this.soundEffects[key].setVolume(config.volume);
            this.soundEffects[key].setRate(config.rate);
            this.soundEffects[key].setDetune(config.detune);
            this.soundEffects[key].play();
            return this.soundEffects[key];
        } else {
            console.warn(`Sound effect "${key}" not found`);
            return null;
        }
    }
    
    // Stop a specific sound effect
    stopSoundEffect(key) {
        if (this.soundEffects[key] && this.soundEffects[key].isPlaying) {
            this.soundEffects[key].stop();
        }
        return this;
    }
    
    // Play ambient sound
    playAmbientSound(key, options = {}) {
        const defaultOptions = {
            volume: this.states.ambient.volume,
            fadeIn: true,
            fadeInDuration: 3000
        };
        
        const config = { ...defaultOptions, ...options };
        
        // Check if the sound exists
        if (this.soundEffects[key]) {
            if (config.fadeIn) {
                this.soundEffects[key].setVolume(0);
                this.soundEffects[key].play();
                
                this.scene.tweens.add({
                    targets: this.soundEffects[key],
                    volume: config.volume,
                    duration: config.fadeInDuration
                });
            } else {
                this.soundEffects[key].setVolume(config.volume);
                this.soundEffects[key].play();
            }
            return this.soundEffects[key];
        } else {
            console.warn(`Ambient sound "${key}" not found`);
            return null;
        }
    }
    
    // Stop ambient sound
    stopAmbientSound(key, fadeOut = true, fadeOutDuration = 2000) {
        if (this.soundEffects[key] && this.soundEffects[key].isPlaying) {
            if (fadeOut) {
                this.scene.tweens.add({
                    targets: this.soundEffects[key],
                    volume: 0,
                    duration: fadeOutDuration,
                    onComplete: () => {
                        this.soundEffects[key].stop();
                    }
                });
            } else {
                this.soundEffects[key].stop();
            }
        }
        return this;
    }
    
    // Master volume control
    setVolume(volume, category = 'all') {
        volume = Phaser.Math.Clamp(volume, 0, 1);
        
        if (category === 'all' || category === 'music') {
            this.states.music.volume = volume;
            for (const key in this.musicTracks) {
                if (this.musicTracks[key] !== this.currentMusic) {
                    this.musicTracks[key].setVolume(volume);
                }
            }
            
            // Don't change current music volume immediately - it might be mid-fade
            if (this.currentMusic && !this.scene.tweens.isTweening(this.currentMusic)) {
                this.currentMusic.setVolume(volume);
            }
        }
        
        if (category === 'all' || category === 'sfx') {
            this.states.sfx.volume = volume;
            for (const key in this.soundEffects) {
                if (!['heartbeat', 'whispers'].includes(key)) {
                    this.soundEffects[key].setVolume(volume);
                }
            }
        }
        
        if (category === 'all' || category === 'ambient') {
            this.states.ambient.volume = volume * 0.7; // Ambient slightly quieter
            if (this.soundEffects['heartbeat']) this.soundEffects['heartbeat'].setVolume(this.states.ambient.volume);
            if (this.soundEffects['whispers']) this.soundEffects['whispers'].setVolume(this.states.ambient.volume);
        }
        
        // Save to localStorage if all categories changed
        if (category === 'all') {
            localStorage.setItem('juliettePsicose_volume', volume.toString());
            this.volume = volume;
        }
        
        return this;
    }
    
    // Mute/unmute all sounds
    setMute(isMuted) {
        this.isMuted = isMuted;
        
        // Update mute status for all audio
        for (const key in this.musicTracks) {
            this.musicTracks[key].setMute(isMuted);
        }
        
        for (const key in this.soundEffects) {
            this.soundEffects[key].setMute(isMuted);
        }
        
        // Save to localStorage
        localStorage.setItem('juliettePsicose_musicOn', !isMuted);
        
        return this;
    }
    
    // Toggle mute status
    toggleMute() {
        this.setMute(!this.isMuted);
        return this;
    }
    
    // Apply glitch effect to current music
    applyGlitchEffect(intensity = 0.5, duration = 500) {
        if (!this.currentMusic || !this.currentMusic.isPlaying) return this;
        
        // Save original rate and detune
        const originalRate = this.currentMusic.rate;
        const originalDetune = this.currentMusic.detune;
        
        // Apply glitch effect
        this.currentMusic.setRate(originalRate + (Math.random() * 0.4 - 0.2) * intensity);
        this.currentMusic.setDetune(originalDetune + (Math.random() * 300 - 150) * intensity);
        
        // Play glitch sound effect
        const glitchSound = Math.random() > 0.5 ? 'glitch_1' : 'glitch_2';
        this.playSoundEffect(glitchSound, {
            volume: 0.4 * intensity,
            rate: 0.8 + Math.random() * 0.4
        });
        
        // Reset after duration
        this.scene.time.delayedCall(duration, () => {
            this.currentMusic.setRate(originalRate);
            this.currentMusic.setDetune(originalDetune);
        });
        
        return this;
    }
    
    // Get audio frequency data for visualizations
    getAudioData() {
        if (this.analyser) {
            this.analyser.getByteFrequencyData(this.dataArray);
            return this.dataArray;
        }
        return null;
    }
    
    // Clean up resources
    destroy() {
        // Stop all sounds
        for (const key in this.musicTracks) {
            if (this.musicTracks[key].isPlaying) {
                this.musicTracks[key].stop();
            }
        }
        
        for (const key in this.soundEffects) {
            if (this.soundEffects[key].isPlaying) {
                this.soundEffects[key].stop();
            }
        }
        
        // Clean up Web Audio API resources
        if (this.audioContext) {
            this.gainNode.disconnect();
            this.analyser.disconnect();
        }
    }
}

