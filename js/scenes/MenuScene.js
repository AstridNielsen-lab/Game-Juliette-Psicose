// Menu Scene for Juliette Psicose Game

class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    preload() {
        // Load assets for the menu
        this.load.image('bg-menu', 'assets/images/background-menu.jpg');
        this.load.image('logo', 'assets/images/logo.png');
        this.load.image('button', 'assets/images/button.png');
        this.load.image('mirror', 'assets/images/mirror.png');
        
        // Load audio
        this.load.audio('menu-music', 'assets/audio/menu-theme.mp3');
        this.load.audio('click', 'assets/audio/click.mp3');
        
        // Loading screen simulation (in a real game, you would have actual assets)
        const loadingText = this.add.text(
            this.cameras.main.width / 2, 
            this.cameras.main.height / 2, 
            'Carregando...', 
            { 
                font: '28px Georgia', 
                fill: '#ffffff' 
            }
        ).setOrigin(0.5);
        
        this.load.on('complete', () => {
            loadingText.destroy();
        });
    }

    create() {
        // Initialize the sound manager
        this.soundManager = Object.create(SoundManager).init(this);
        
        // Initialize AI Chat
        this.aiChat = new AIChat(this, {
            visible: false,
            x: this.cameras.main.width / 2,
            y: this.cameras.main.height / 2
        });
        
        // Show welcome card with text-to-speech if player has a saved name
        if (localStorage.getItem('juliettePsicose_playerName')) {
            const playerName = localStorage.getItem('juliettePsicose_playerName');
            
            // Show welcome card with text-to-speech
            const welcomeCard = new MessageCard(this, {
                y: 100,
                style: 'info',
                duration: 5000,
                speakText: true,
                speakOptions: {
                    rate: 0.9,
                    pitch: 1.0
                }
            });
            welcomeCard.show(`Bem-vindo(a) de volta, ${playerName}...`);
        }
        
        // Create background (placeholder in this demo)
        const bg = this.add.rectangle(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            this.cameras.main.width,
            this.cameras.main.height,
            0x000000
        );
        
        // Add smoke/fog effect
        this.createSmokeEffect();
        
        // Add title
        const titleText = this.add.text(
            this.cameras.main.width / 2,
            150,
            'Juliette Psicose',
            {
                font: '64px Georgia',
                fill: '#9e1e63',
                stroke: '#000',
                strokeThickness: 4,
                shadow: { offsetX: 2, offsetY: 2, color: '#000', blur: 2, stroke: true, fill: true }
            }
        ).setOrigin(0.5);
        
        const subtitleText = this.add.text(
            this.cameras.main.width / 2,
            220,
            'Ecos da Rebelião',
            {
                font: '32px Georgia',
                fill: '#b39ddb',
                stroke: '#000',
                strokeThickness: 2
            }
        ).setOrigin(0.5);
        
        // Apply glitch effect to title
        this.time.addEvent({
            delay: 5000,
            callback: () => {
                VisualEffects.applyGlitch(this, titleText, 1.5, 1000);
            },
            loop: true
        });
        
        // Add a quote with text-to-speech
        const quote = '"Entre visões e espelhos quebrados,\nencontra-se a verdade além do véu."';
        
        // Display quote in a card that reads it aloud
        const quoteCard = new MessageCard(this, {
            y: 300,
            width: 600,
            height: 100,
            backgroundColor: 0x000000,
            backgroundAlpha: 0.5,
            borderColor: 0x9e1e63,
            fontFamily: 'Georgia',
            fontSize: 24,
            fontColor: '#f0f0f0',
            fontStyle: 'italic',
            duration: 8000,
            speakText: true,
            speakOptions: {
                rate: 0.8,
                pitch: 0.9
            },
            autoDestroy: false
        });
        quoteCard.show(quote);
        
        // Create mirror illustration (placeholder)
        const mirror = this.add.rectangle(
            this.cameras.main.width / 2,
            450,
            300,
            200,
            0x333333
        ).setAlpha(0.6);
        
        const mirrorBorder = this.add.rectangle(
            this.cameras.main.width / 2,
            450,
            310,
            210,
            0x9e1e63
        ).setAlpha(0.8).setDepth(-1);
        
        // Create button container for better organization
        this.buttonContainer = this.add.container(0, 0);
        
        // Add start button
        const startButton = this.add.rectangle(
            this.cameras.main.width / 2,
            520,
            250,
            60,
            0x9e1e63
        ).setInteractive({ useHandCursor: true });
        
        const startText = this.add.text(
            this.cameras.main.width / 2,
            520,
            'Começar a Jornada',
            {
                font: '24px Georgia',
                fill: '#ffffff'
            }
        ).setOrigin(0.5);
        
        this.buttonContainer.add(startButton);
        this.buttonContainer.add(startText);
        
        // Add story button
        const storyButton = this.add.rectangle(
            this.cameras.main.width / 2,
            590,
            250,
            60,
            0x7b1fa2
        ).setInteractive({ useHandCursor: true });
        
        const storyText = this.add.text(
            this.cameras.main.width / 2,
            590,
            'História do Jogo',
            {
                font: '24px Georgia',
                fill: '#ffffff'
            }
        ).setOrigin(0.5);
        
        this.buttonContainer.add(storyButton);
        this.buttonContainer.add(storyText);
        
        // Add AI Chat button
        const chatButton = this.add.rectangle(
            this.cameras.main.width / 2,
            660,
            250,
            60,
            0x512da8
        ).setInteractive({ useHandCursor: true });
        
        const chatText = this.add.text(
            this.cameras.main.width / 2,
            660,
            'Assistente de IA',
            {
                font: '24px Georgia',
                fill: '#ffffff'
            }
        ).setOrigin(0.5);
        
        this.buttonContainer.add(chatButton);
        this.buttonContainer.add(chatText);
        
        // Button events
        startButton.on('pointerover', () => {
            startButton.fillColor = 0xb52d75;
            startText.setScale(1.05);
        });
        
        startButton.on('pointerout', () => {
            startButton.fillColor = 0x9e1e63;
            startText.setScale(1);
        });
        
        startButton.on('pointerdown', () => {
            // Play click sound
            // this.sound.play('click');
            
            // Transition effect
            this.cameras.main.fade(1000, 0, 0, 0, false, (camera, progress) => {
                if (progress === 1) {
                    // Start the first chapter
                    this.scene.start('Chapter1Scene');
                }
            });
        });
        
        // Story button events
        storyButton.on('pointerover', () => {
            storyButton.fillColor = 0x9c27b0;
            storyText.setScale(1.05);
        });
        
        storyButton.on('pointerout', () => {
            storyButton.fillColor = 0x7b1fa2;
            storyText.setScale(1);
        });
        
        storyButton.on('pointerdown', () => {
            // Play click sound
            // this.sound.play('click');
            
            // Transition to story scene
            this.cameras.main.fade(1000, 0, 0, 0, false, (camera, progress) => {
                if (progress === 1) {
                    this.scene.start('StoryScene');
                }
            });
        });
        
        // Chat button events
        chatButton.on('pointerover', () => {
            chatButton.fillColor = 0x673ab7;
            chatText.setScale(1.05);
        });
        
        chatButton.on('pointerout', () => {
            chatButton.fillColor = 0x512da8;
            chatText.setScale(1);
        });
        
        chatButton.on('pointerdown', () => {
            // Play click sound
            // this.sound.play('click');
            
            // Open AI Chat interface
            this.toggleAIChat();
        });
        
        // Add credits button
        const creditsButton = this.add.text(
            this.cameras.main.width - 20,
            this.cameras.main.height - 20,
            'Créditos',
            {
                font: '18px Georgia',
                fill: '#b39ddb'
            }
        )
        .setOrigin(1)
        .setInteractive({ useHandCursor: true })
        .on('pointerover', () => creditsButton.setAlpha(0.7))
        .on('pointerout', () => creditsButton.setAlpha(1))
        .on('pointerdown', () => this.showCredits());
        
        // Start background music
        // this.sound.play('menu-music', { loop: true, volume: 0.5 });
    }
    
    createSmokeEffect() {
        // In a real implementation, this would create a particle system
        // For now, we'll just create some simple graphics to simulate smoke
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
    
    toggleAIChat() {
        // Toggle AI Chat visibility
        this.aiChat.toggle();
    }
    
    showCredits() {
        // This would display a credits overlay
        console.log('Credits shown');
        
        const creditsBox = this.add.rectangle(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            500,
            400,
            0x000000,
            0.9
        );
        
        const border = this.add.rectangle(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            510,
            410,
            0x9e1e63,
            1
        ).setDepth(-1);
        
        const creditsTitle = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2 - 150,
            'CRÉDITOS',
            {
                font: '32px Georgia',
                fill: '#9e1e63'
            }
        ).setOrigin(0.5);
        
        const creditsContent = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2 - 50,
            'Desenvolvido por: [Nome]\n\nMúsica por: [Compositor]\n\nArte por: [Artista]\n\nAgradecimentos especiais:\n[Lista de agradecimentos]',
            {
                font: '20px Georgia',
                fill: '#ffffff',
                align: 'center'
            }
        ).setOrigin(0.5);
        
        // Show a message card with text-to-speech
        const creditsCard = new MessageCard(this, {
            y: this.cameras.main.height / 2 + 80,
            width: 400,
            height: 60,
            style: 'info',
            duration: 6000,
            speakText: true
        });
        creditsCard.show("Obrigado por jogar Juliette Psicose");
        
        const closeButton = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2 + 150,
            'Fechar',
            {
                font: '24px Georgia',
                fill: '#b39ddb'
            }
        )
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on('pointerover', () => closeButton.setAlpha(0.7))
        .on('pointerout', () => closeButton.setAlpha(1))
        .on('pointerdown', () => {
            creditsBox.destroy();
            border.destroy();
            creditsTitle.destroy();
            creditsContent.destroy();
            closeButton.destroy();
        });
    }
}

