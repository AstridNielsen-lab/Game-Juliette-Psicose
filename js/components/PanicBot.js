// Panic Bot - Generates panic-inducing messages for the player

class PanicBot {
    constructor(scene, options = {}) {
        this.scene = scene;
        this.options = Object.assign({
            minDelay: 5000,          // Minimum delay between messages (ms)
            maxDelay: 15000,         // Maximum delay between messages (ms)
            messageX: scene.cameras.main.width / 2,  // X position of messages
            messageY: 100,           // Y position of messages
            fontSize: 24,            // Font size
            fontFamily: 'Georgia',   // Font family
            textColor: '#ff0000',    // Text color
            strokeColor: '#000000',  // Stroke color
            strokeWidth: 2,          // Stroke width
            messageTime: 3000,       // How long messages stay on screen
            fadeTime: 1000,          // Fade in/out time
            glitchEffect: true,      // Whether to apply glitch effect
            soundEffect: null,       // Sound effect to play with messages
            enabled: true            // Whether the bot is active
        }, options);
        
        this.messages = [
            "O tempo está acabando!",
            "Você não vai conseguir!",
            "Está demorando demais...",
            "Os outros completaram mais rápido!",
            "Está ficando sem tempo!",
            "Sua mente está lenta demais!",
            "Pressão! Pressão! Pressão!",
            "Tique-taque... O relógio não para!",
            "Concentre-se ou vai falhar!",
            "O sistema detecta sua hesitação!",
            "Sem esperança... Sem tempo...",
            "Desista agora e evite a humilhação!",
            "Sua performance é decepcionante!",
            "Outros estão te julgando neste momento!",
            "A falha é inevitável...",
            "Suas chances diminuem a cada segundo!",
            "Está sentindo o pânico subir?",
            "Sua ansiedade só vai aumentar!",
            "Você não nasceu para isto!",
            "O tempo não perdoa os lentos!"
        ];
        
        this.currentMessageObject = null;
        this.timerEvent = null;
        
        // Start the message cycle if enabled
        if (this.options.enabled) {
            this.start();
        }
    }
    
    start() {
        this.options.enabled = true;
        this.scheduleNextMessage();
    }
    
    stop() {
        this.options.enabled = false;
        if (this.timerEvent) {
            this.timerEvent.remove();
            this.timerEvent = null;
        }
        
        // Clear any current message
        if (this.currentMessageObject) {
            this.scene.tweens.killTweensOf(this.currentMessageObject);
            this.currentMessageObject.destroy();
            this.currentMessageObject = null;
        }
    }
    
    scheduleNextMessage() {
        if (!this.options.enabled) return;
        
        const delay = Phaser.Math.Between(this.options.minDelay, this.options.maxDelay);
        
        this.timerEvent = this.scene.time.delayedCall(delay, () => {
            this.showRandomMessage();
        });
    }
    
    showRandomMessage() {
        if (!this.options.enabled) return;
        
        // Choose a random message
        const message = Phaser.Utils.Array.GetRandom(this.messages);
        
        // Use MessageCard component instead of plain text
        this.messageCard = new MessageCard(this.scene, {
            x: this.options.messageX,
            y: this.options.messageY,
            width: 500,
            height: 80,
            backgroundColor: 0x330000,
            borderColor: 0xff0000,
            fontFamily: this.options.fontFamily,
            fontSize: this.options.fontSize,
            fontColor: this.options.textColor,
            strokeColor: this.options.strokeColor,
            strokeThickness: this.options.strokeWidth,
            duration: this.options.messageTime,
            fadeInTime: this.options.fadeTime,
            fadeOutTime: this.options.fadeTime,
            glitchEffect: this.options.glitchEffect,
            speakText: true,
            speakOptions: {
                rate: 1.1,  // Slightly faster speech for panic effect
                pitch: 1.2, // Higher pitch for more stress
                volume: 0.8
            },
            style: 'danger',
            onHide: () => {
                // Schedule next message
                this.scheduleNextMessage();
            },
            autoDestroy: true
        });
        
        // Show the message
        this.messageCard.show(message);
        
        // Play sound if provided
        if (this.options.soundEffect) {
            this.scene.sound.play(this.options.soundEffect, { volume: 0.7 });
        }
    }
    
    // Add a custom message to the list
    addCustomMessage(message) {
        if (typeof message === 'string' && message.length > 0) {
            this.messages.push(message);
        }
        return this;
    }
    
    // Set panic intensity (affects frequency and message style)
    setIntensity(level) {
        // level should be between 0 and 1
        level = Phaser.Math.Clamp(level, 0, 1);
        
        // Adjust timing based on intensity
        this.options.minDelay = Phaser.Math.Linear(10000, 2000, level);
        this.options.maxDelay = Phaser.Math.Linear(20000, 5000, level);
        
        // Adjust visual properties
        this.options.fontSize = Phaser.Math.Linear(20, 32, level);
        
        return this;
    }
}

