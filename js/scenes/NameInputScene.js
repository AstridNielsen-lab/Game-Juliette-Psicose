// Name Input Scene for Juliette Psicose Game

class NameInputScene extends Phaser.Scene {
    constructor() {
        super({ key: 'NameInputScene' });
        this.playerName = '';
    }

    preload() {
        // Load assets for the name input screen
        this.load.image('bg-name', 'assets/images/background-menu.jpg');
        this.load.audio('type-sound', 'assets/audio/type.mp3');
        this.load.audio('name-music', 'assets/audio/ambient-dark.mp3');
    }

    create() {
        // Create background (placeholder)
        const bg = this.add.rectangle(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            this.cameras.main.width,
            this.cameras.main.height,
            0x000000
        );
        
        // Show welcome message with text-to-speech
        const welcomeCard = new MessageCard(this, {
            y: 300,
            height: 100,
            style: 'info',
            duration: 7000,
            speakText: true
        });
        welcomeCard.show("Bem-vindo(a) ao experimento mental. Por favor, identifique-se para continuarmos.");
        
        // Add smoke/fog effect similar to menu scene
        this.createSmokeEffect();
        
        // Add title with glitch effect
        const titleText = this.add.text(
            this.cameras.main.width / 2,
            150,
            'IDENTIFIQUE-SE',
            {
                font: '48px Georgia',
                fill: '#9e1e63',
                stroke: '#000',
                strokeThickness: 4,
                shadow: { offsetX: 2, offsetY: 2, color: '#000', blur: 2, stroke: true, fill: true }
            }
        ).setOrigin(0.5);
        
        // Apply glitch effect to title
        this.time.addEvent({
            delay: 3000,
            callback: () => {
                VisualEffects.applyGlitch(this, titleText, 1.5, 1000);
            },
            loop: true
        });
        
        // Add a creepy quote
        const quoteText = this.add.text(
            this.cameras.main.width / 2,
            220,
            '"Antes de prosseguir, precisamos saber quem você é..."',
            {
                font: '24px Georgia',
                fill: '#f0f0f0',
                fontStyle: 'italic',
                align: 'center'
            }
        ).setOrigin(0.5);
        
        // Create input field background
        const inputBg = this.add.rectangle(
            this.cameras.main.width / 2,
            350,
            400,
            60,
            0x111111,
            0.7
        );
        
        const inputBorder = this.add.rectangle(
            this.cameras.main.width / 2,
            350,
            404,
            64,
            0x9e1e63,
            0.8
        ).setDepth(-1);
        
        // Create text for input field
        this.inputText = this.add.text(
            this.cameras.main.width / 2 - 190,
            350,
            '|',
            {
                font: '32px Georgia',
                fill: '#ffffff'
            }
        ).setOrigin(0, 0.5);
        
        // Add instruction text
        const instructionText = this.add.text(
            this.cameras.main.width / 2,
            420,
            'Digite seu nome e pressione ENTER',
            {
                font: '20px Georgia',
                fill: '#b39ddb'
            }
        ).setOrigin(0.5);
        
        // Create input prompt animation (blinking cursor)
        this.time.addEvent({
            delay: 500,
            callback: () => {
                if (this.inputText.text.endsWith('|')) {
                    this.inputText.text = this.inputText.text.slice(0, -1);
                } else {
                    this.inputText.text = this.playerName + '|';
                }
            },
            loop: true
        });
        
        // Setup keyboard input
        this.input.keyboard.on('keydown', event => {
            // Allow only letters, numbers, and basic punctuation
            if (/^[a-zA-Z0-9 .,'-]$/.test(event.key)) {
                if (this.playerName.length < 20) {  // Limit name length
                    this.playerName += event.key;
                    this.inputText.text = this.playerName + '|';
                    // Play typing sound
                    // this.sound.play('type-sound', { volume: 0.5 });
                }
            } 
            else if (event.key === 'Backspace') {
                // Handle backspace
                if (this.playerName.length > 0) {
                    this.playerName = this.playerName.slice(0, -1);
                    this.inputText.text = this.playerName + '|';
                }
            }
            else if (event.key === 'Enter') {
                // Handle enter - submit name
                if (this.playerName.trim().length > 0) {
                    this.savePlayerName();
                } else {
                    // Shake the input field to indicate error
                    this.cameras.main.shake(200, 0.01);
                }
            }
        });
        
        // Continue button
        const continueButton = this.add.rectangle(
            this.cameras.main.width / 2,
            500,
            250,
            60,
            0x9e1e63
        ).setInteractive({ useHandCursor: true });
        
        const continueText = this.add.text(
            this.cameras.main.width / 2,
            500,
            'Continuar',
            {
                font: '24px Georgia',
                fill: '#ffffff'
            }
        ).setOrigin(0.5);
        
        // Button events
        continueButton.on('pointerover', () => {
            continueButton.fillColor = 0xb52d75;
            continueText.setScale(1.05);
        });
        
        continueButton.on('pointerout', () => {
            continueButton.fillColor = 0x9e1e63;
            continueText.setScale(1);
        });
        
        continueButton.on('pointerdown', () => {
            if (this.playerName.trim().length > 0) {
                this.savePlayerName();
            } else {
                // Shake the input field to indicate error
                this.cameras.main.shake(200, 0.01);
                inputBorder.setStrokeStyle(2, 0xff0000);
                this.time.delayedCall(500, () => {
                    inputBorder.setStrokeStyle(0);
                });
            }
        });
        
        // Add a creepy message that appears randomly
        this.time.addEvent({
            delay: Phaser.Math.Between(5000, 10000),
            callback: () => {
                const creepyMessages = [
                    "Estamos observando você...",
                    "Tem certeza que esse é seu nome?",
                    "Você não conseguirá escapar...",
                    "Seus dados estão sendo coletados...",
                    "O tempo está passando...",
                    "Não confie no sistema..."
                ];
                
                // Use MessageCard component with text-to-speech
                const messageCard = new MessageCard(this, {
                    y: 600,
                    width: 550,
                    height: 80,
                    style: 'danger',
                    glitchEffect: true,
                    duration: 4000,
                    speakText: true,
                    speakOptions: {
                        pitch: 0.8,  // Lower pitch for creepy effect
                        rate: 0.9,   // Slower speech for emphasis
                        volume: 0.9
                    }
                });
                
                messageCard.show(Phaser.Utils.Array.GetRandom(creepyMessages));
            },
            loop: true
        });
        
        // Check if there's a stored name and populate it
        const storedName = localStorage.getItem('juliettePsicose_playerName');
        if (storedName) {
            this.playerName = storedName;
            this.inputText.text = this.playerName + '|';
        }
        
        // Start ambient music
        // this.sound.play('name-music', { loop: true, volume: 0.3 });
    }
    
    createSmokeEffect() {
        // Similar to MenuScene smoke effect
        const smokeParticles = this.add.group();
        
        for (let i = 0; i < 10; i++) {
            const x = Phaser.Math.Between(0, this.cameras.main.width);
            const y = Phaser.Math.Between(0, this.cameras.main.height);
            
            const smoke = this.add.circle(x, y, Phaser.Math.Between(50, 150), 0xffffff, 0.05);
            smokeParticles.add(smoke);
            
            this.tweens.add({
                targets: smoke,
                x: smoke.x + Phaser.Math.Between(-100, 100),
                y: smoke.y - Phaser.Math.Between(50, 150),
                alpha: 0,
                scale: 2,
                duration: Phaser.Math.Between(4000, 8000),
                onComplete: () => {
                    smoke.setPosition(
                        Phaser.Math.Between(0, this.cameras.main.width),
                        this.cameras.main.height + 50
                    );
                    smoke.setAlpha(0.05);
                    smoke.setScale(1);
                    
                    this.tweens.add({
                        targets: smoke,
                        x: smoke.x + Phaser.Math.Between(-100, 100),
                        y: smoke.y - Phaser.Math.Between(200, 400),
                        alpha: 0,
                        scale: 2,
                        duration: Phaser.Math.Between(4000, 8000),
                        onComplete: () => {
                            smoke.destroy();
                        }
                    });
                }
            });
        }
    }
    
    savePlayerName() {
        // Save player name to localStorage
        localStorage.setItem('juliettePsicose_playerName', this.playerName.trim());
        
        // Update global game state
        window.gameState.playerName = this.playerName.trim();
        
        // Transition to menu scene
        this.cameras.main.fade(1000, 0, 0, 0, false, (camera, progress) => {
            if (progress === 1) {
                this.scene.start('MenuScene');
            }
        });
    }
}

