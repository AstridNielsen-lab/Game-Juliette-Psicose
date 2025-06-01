// Main Game Configuration

// Game configuration
const config = {
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
    parent: 'game',
    backgroundColor: '#000',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: [MenuScene, Chapter1Scene],
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    }
};

// Game variables
const gameState = {
    choices: [],
    playerName: 'Juliette',
    chapter: 1,
    karma: 0, // Positive values = good karma, negative = bad karma
    collectibles: [],
    currentEpisode: 'Visão da Injustiça',
    musicOn: true
};

// Initialize the game
window.addEventListener('load', function() {
    // Wait for font loading (simulated)
    setTimeout(() => {
        window.game = new Phaser.Game(config);
        window.gameState = gameState;
    }, 2500); // Delayed to ensure loading screen is shown
});

// Dialog system
class DialogSystem {
    constructor(scene) {
        this.scene = scene;
        this.dialogQueue = [];
        this.isDialogActive = false;
        this.choicesMade = [];
    }

    addDialog(text, speaker = null, options = {}) {
        this.dialogQueue.push({
            text,
            speaker,
            options
        });
        return this;
    }

    addChoice(prompt, choices) {
        this.dialogQueue.push({
            type: 'choice',
            prompt,
            choices
        });
        return this;
    }

    start() {
        if (!this.isDialogActive && this.dialogQueue.length > 0) {
            this.isDialogActive = true;
            this.showNextDialog();
        }
        return this;
    }

    showNextDialog() {
        if (this.dialogQueue.length === 0) {
            this.isDialogActive = false;
            if (this.onComplete) this.onComplete();
            return;
        }

        const currentDialog = this.dialogQueue.shift();
        
        // Handle different dialog types
        if (currentDialog.type === 'choice') {
            this.showChoice(currentDialog);
        } else {
            this.showText(currentDialog);
        }
    }

    showText(dialog) {
        // This would create the text box, animate text, etc.
        console.log(`[${dialog.speaker || 'Narrador'}]: ${dialog.text}`);
        
        // In a real implementation, you would create UI elements here
        // For now, we'll just simulate showing text and continue after a delay
        setTimeout(() => {
            this.showNextDialog();
        }, 2000);
    }

    showChoice(dialog) {
        console.log(`Escolha: ${dialog.prompt}`);
        dialog.choices.forEach((choice, index) => {
            console.log(`${index + 1}. ${choice.text}`);
        });

        // In a real implementation, you would create UI elements for choices
        // For now, we'll just simulate a random choice
        const randomChoice = Math.floor(Math.random() * dialog.choices.length);
        this.choicesMade.push(randomChoice);
        
        if (dialog.choices[randomChoice].karma) {
            gameState.karma += dialog.choices[randomChoice].karma;
        }
        
        if (dialog.choices[randomChoice].callback) {
            dialog.choices[randomChoice].callback();
        }
        
        // Continue dialog after a delay
        setTimeout(() => {
            this.showNextDialog();
        }, 1500);
    }

    onDialogComplete(callback) {
        this.onComplete = callback;
        return this;
    }
}

// Global utility for visual effects
const VisualEffects = {
    applyGlitch: function(scene, target, intensity = 1, duration = 500) {
        // In a real implementation, this would apply a glitch shader to the target object
        console.log(`Applying glitch effect to ${target} with intensity ${intensity}`);
        
        // Simulate a glitch effect with a simple shake
        if (scene && target) {
            const originalX = target.x;
            const originalY = target.y;
            
            const glitchInterval = setInterval(() => {
                target.x = originalX + (Math.random() * 10 - 5) * intensity;
                target.y = originalY + (Math.random() * 10 - 5) * intensity;
            }, 50);
            
            setTimeout(() => {
                clearInterval(glitchInterval);
                target.x = originalX;
                target.y = originalY;
            }, duration);
        }
    },
    
    applyVignette: function(scene, intensity = 0.5) {
        // Would apply a vignette effect to the scene
        console.log(`Applying vignette with intensity ${intensity}`);
    },
    
    applyFilter: function(scene, filterType, intensity = 1) {
        // Would apply various filters (sepia, noise, etc.)
        console.log(`Applying ${filterType} filter with intensity ${intensity}`);
    }
};

// Sound manager
const SoundManager = {
    init: function(scene) {
        this.scene = scene;
        this.sounds = {};
        return this;
    },
    
    loadMusic: function(key, path, options = {}) {
        // Would load background music
        console.log(`Loading music: ${key} from ${path}`);
        return this;
    },
    
    loadSfx: function(key, path) {
        // Would load sound effects
        console.log(`Loading SFX: ${key} from ${path}`);
        return this;
    },
    
    playMusic: function(key, options = {}) {
        // Would play background music
        console.log(`Playing music: ${key}`);
        return this;
    },
    
    playSfx: function(key) {
        // Would play sound effects
        console.log(`Playing SFX: ${key}`);
        return this;
    }
};

