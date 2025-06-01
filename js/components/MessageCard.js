// Message Card - Creates stylized message cards for game scenes

class MessageCard {
    constructor(scene, options = {}) {
        this.scene = scene;
        this.options = Object.assign({
            x: scene.cameras.main.width / 2,    // X position
            y: scene.cameras.main.height / 2,   // Y position
            width: 600,                         // Card width
            height: 150,                        // Card height
            backgroundColor: 0x000000,          // Card background color
            backgroundAlpha: 0.8,               // Card background alpha
            borderColor: 0x9e1e63,              // Card border color
            borderThickness: 2,                 // Card border thickness
            fontFamily: 'Georgia',              // Text font family
            fontSize: 24,                       // Text font size
            fontColor: '#ffffff',               // Text color
            strokeColor: '#000000',             // Text stroke color
            strokeThickness: 2,                 // Text stroke thickness
            padding: 20,                        // Inner padding
            duration: 5000,                     // How long card stays on screen (ms)
            fadeInTime: 1000,                   // Fade in time (ms)
            fadeOutTime: 1000,                  // Fade out time (ms)
            glitchEffect: false,                // Whether to apply glitch effect
            speakText: true,                    // Whether to speak the text
            speakOptions: {},                   // Options for text-to-speech
            autoDestroy: true,                  // Whether to destroy after animation
            onShow: null,                       // Callback when card is shown
            onHide: null,                       // Callback when card is hidden
            style: 'default',                   // Card style ('default', 'warning', 'danger')
            moveY: -50,                         // Y movement during animation
            offsetX: 0,                         // X offset from center
            offsetY: 0,                         // Y offset from center
            depth: 100                          // Z-index of the card
        }, options);
        
        // Create container for all card elements
        this.container = this.scene.add.container(
            this.options.x + this.options.offsetX,
            this.options.y + this.options.offsetY
        ).setDepth(this.options.depth).setAlpha(0);
        
        // Apply style customizations
        this.applyStyle();
        
        // Create card background
        this.background = this.scene.add.rectangle(
            0,
            0,
            this.options.width,
            this.options.height,
            this.options.backgroundColor,
            this.options.backgroundAlpha
        );
        this.container.add(this.background);
        
        // Create card border
        this.border = this.scene.add.rectangle(
            0,
            0,
            this.options.width + (this.options.borderThickness * 2),
            this.options.height + (this.options.borderThickness * 2),
            this.options.borderColor
        ).setDepth(-1);
        this.container.add(this.border);
        
        // Create text object (will be set when showing a message)
        this.textObject = this.scene.add.text(
            0,
            0,
            '',
            {
                fontFamily: this.options.fontFamily,
                fontSize: this.options.fontSize,
                fill: this.options.fontColor,
                stroke: this.options.strokeColor,
                strokeThickness: this.options.strokeThickness,
                align: 'center',
                wordWrap: { width: this.options.width - (this.options.padding * 2) }
            }
        ).setOrigin(0.5);
        this.container.add(this.textObject);
        
        // Animation properties
        this.timeline = null;
        this.currentMessage = '';
        this.isVisible = false;
        
        // Initialize text-to-speech if needed
        if (this.options.speakText && window.ttsManager) {
            this.tts = window.ttsManager;
        }
    }
    
    applyStyle() {
        // Apply predefined styles
        switch (this.options.style) {
            case 'warning':
                this.options.backgroundColor = 0x333300;
                this.options.borderColor = 0xffff00;
                this.options.fontColor = '#ffff00';
                break;
            case 'danger':
                this.options.backgroundColor = 0x330000;
                this.options.borderColor = 0xff0000;
                this.options.fontColor = '#ff0000';
                break;
            case 'success':
                this.options.backgroundColor = 0x003300;
                this.options.borderColor = 0x00ff00;
                this.options.fontColor = '#00ff00';
                break;
            case 'info':
                this.options.backgroundColor = 0x000033;
                this.options.borderColor = 0x0099ff;
                this.options.fontColor = '#0099ff';
                break;
            // default uses the initial settings
        }
    }
    
    show(message, duration = null) {
        // Don't show empty messages
        if (!message || message.trim() === '') return this;
        
        // Store the message
        this.currentMessage = message;
        
        // Update text
        this.textObject.setText(message);
        
        // Cancel any existing animation
        if (this.timeline) {
            this.timeline.destroy();
        }
        
        // Reset position and alpha
        this.container.setAlpha(0);
        this.container.setY(this.options.y + this.options.offsetY + this.options.moveY);
        
        // Create animation timeline
        this.timeline = this.scene.tweens.createTimeline();
        
        // Add fade in animation
        this.timeline.add({
            targets: this.container,
            alpha: 1,
            y: this.options.y + this.options.offsetY,
            duration: this.options.fadeInTime,
            ease: 'Power2',
            onComplete: () => {
                this.isVisible = true;
                if (this.options.onShow) this.options.onShow();
                
                // Apply glitch effect if enabled
                if (this.options.glitchEffect) {
                    VisualEffects.applyGlitch(this.scene, this.textObject, 1, 500);
                }
                
                // Speak the text if enabled
                if (this.options.speakText && this.tts) {
                    this.tts.speak(message, this.options.speakOptions);
                }
            }
        });
        
        // Add delay
        this.timeline.add({
            targets: {},
            duration: duration || this.options.duration
        });
        
        // Add fade out animation
        this.timeline.add({
            targets: this.container,
            alpha: 0,
            y: this.options.y + this.options.offsetY - this.options.moveY,
            duration: this.options.fadeOutTime,
            ease: 'Power2',
            onComplete: () => {
                this.isVisible = false;
                if (this.options.onHide) this.options.onHide();
                
                if (this.options.autoDestroy) {
                    this.destroy();
                }
            }
        });
        
        // Start the animation
        this.timeline.play();
        
        return this;
    }
    
    hide(fadeOutTime = null) {
        if (!this.isVisible) return this;
        
        // Cancel existing timeline
        if (this.timeline) {
            this.timeline.destroy();
        }
        
        // Create and play fade out animation
        this.scene.tweens.add({
            targets: this.container,
            alpha: 0,
            y: this.options.y + this.options.offsetY - this.options.moveY,
            duration: fadeOutTime || this.options.fadeOutTime,
            ease: 'Power2',
            onComplete: () => {
                this.isVisible = false;
                if (this.options.onHide) this.options.onHide();
                
                if (this.options.autoDestroy) {
                    this.destroy();
                }
            }
        });
        
        return this;
    }
    
    update(message) {
        this.currentMessage = message;
        this.textObject.setText(message);
        
        // Speak updated text if enabled and visible
        if (this.options.speakText && this.tts && this.isVisible) {
            this.tts.speak(message, this.options.speakOptions);
        }
        
        return this;
    }
    
    setPosition(x, y) {
        this.options.x = x;
        this.options.y = y;
        this.container.setPosition(x + this.options.offsetX, y + this.options.offsetY);
        return this;
    }
    
    setStyle(style) {
        this.options.style = style;
        this.applyStyle();
        
        // Update visuals
        this.background.setFillStyle(this.options.backgroundColor, this.options.backgroundAlpha);
        this.border.setStrokeStyle(this.options.borderThickness, this.options.borderColor);
        this.textObject.setStyle({
            fill: this.options.fontColor,
            stroke: this.options.strokeColor,
            strokeThickness: this.options.strokeThickness
        });
        
        return this;
    }
    
    destroy() {
        if (this.timeline) {
            this.timeline.destroy();
        }
        
        this.container.destroy();
        
        return this;
    }
}

