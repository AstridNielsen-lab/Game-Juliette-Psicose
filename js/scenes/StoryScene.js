// Story Scene for Juliette Psicose Game
// Shows scrolling text with the game's backstory and gameplay information

class StoryScene extends Phaser.Scene {
    constructor() {
        super({ key: 'StoryScene' });
        this.storyTextParts = [];
        this.currentPart = 0;
        this.scrollSpeed = 1.5;
        this.autoScroll = true;
    }

    preload() {
        // Load assets for the story scene
        this.load.image('bg-story', 'assets/images/background-story.jpg');
        this.load.audio('story-music', 'assets/audio/story-theme.mp3');
        this.load.audio('page-turn', 'assets/audio/page-turn.mp3');
    }

    create() {
        // Initialize story text content
        this.initializeStoryText();
        
        // Create dark background
        const bg = this.add.rectangle(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            this.cameras.main.width,
            this.cameras.main.height,
            0x000000
        );
        
        // Add atmospheric effects
        this.createAtmosphericEffects();
        
        // Create the title
        const titleText = this.add.text(
            this.cameras.main.width / 2,
            80,
            'A HISTÓRIA DE JULIETTE',
            {
                font: '42px Georgia',
                fill: '#9e1e63',
                stroke: '#000',
                strokeThickness: 4,
                shadow: { offsetX: 2, offsetY: 2, color: '#000', blur: 2, stroke: true, fill: true }
            }
        ).setOrigin(0.5);
        
        // Add subtitle
        const subtitleText = this.add.text(
            this.cameras.main.width / 2,
            140,
            'Ecos da Rebelião',
            {
                font: '28px Georgia',
                fill: '#b39ddb',
                stroke: '#000',
                strokeThickness: 2
            }
        ).setOrigin(0.5);
        
        // Create scroll container
        const scrollMask = this.add.graphics()
            .fillStyle(0xffffff)
            .fillRect(
                this.cameras.main.width / 2 - 400,
                200, 
                800, 
                400
            );
            
        this.storyContainer = this.add.container(0, 0);
        this.storyContainer.setMask(new Phaser.Display.Masks.GeometryMask(this, scrollMask));
        
        // Create scrolling text area
        this.storyText = this.add.text(
            this.cameras.main.width / 2,
            600, // Start below the visible area
            this.storyTextParts[this.currentPart],
            {
                font: '24px Georgia',
                fill: '#f0f0f0',
                align: 'center',
                wordWrap: { width: 700 },
                lineSpacing: 10
            }
        ).setOrigin(0.5, 0);
        
        this.storyContainer.add(this.storyText);
        
        // Create border for text area
        const textBorder = this.add.rectangle(
            this.cameras.main.width / 2,
            400, // Middle of the mask
            810,
            410,
            0x9e1e63,
            0.3
        ).setStrokeStyle(2, 0x9e1e63);
        
        // Add navigation buttons
        this.addNavigationButtons();
        
        // Add auto-scroll toggle
        this.addAutoScrollToggle();
        
        // Add return to menu button
        this.addReturnButton();
        
        // Start text-to-speech for the first part
        this.speakCurrentPart();
        
        // Auto scroll animation
        this.startScrolling();
        
        // Start ambient music
        // this.sound.play('story-music', { loop: true, volume: 0.3 });
    }
    
    startScrolling() {
        this.scrollTween = this.tweens.add({
            targets: this.storyText,
            y: -this.storyText.height,
            duration: this.storyText.height * 100 / this.scrollSpeed,
            ease: 'Linear',
            onComplete: () => {
                // When finished scrolling, move to next part if available
                if (this.currentPart < this.storyTextParts.length - 1) {
                    this.goToNextPart();
                }
            }
        });
        
        // Pause if auto-scroll is disabled
        if (!this.autoScroll) {
            this.scrollTween.pause();
        }
    }
    
    goToNextPart() {
        if (this.currentPart < this.storyTextParts.length - 1) {
            this.currentPart++;
            this.storyText.setText(this.storyTextParts[this.currentPart]);
            this.storyText.y = 600; // Reset position
            
            // Speak the current part
            this.speakCurrentPart();
            
            // Reset scrolling
            this.startScrolling();
            
            // Play page turn sound
            // this.sound.play('page-turn', { volume: 0.5 });
        }
    }
    
    goToPreviousPart() {
        if (this.currentPart > 0) {
            this.currentPart--;
            this.storyText.setText(this.storyTextParts[this.currentPart]);
            this.storyText.y = 600; // Reset position
            
            // Speak the current part
            this.speakCurrentPart();
            
            // Reset scrolling
            this.startScrolling();
            
            // Play page turn sound
            // this.sound.play('page-turn', { volume: 0.5 });
        }
    }
    
    speakCurrentPart() {
        // Stop any current speech
        if (window.ttsManager) {
            window.ttsManager.cancel();
            
            // Speak with female voice
            window.ttsManager.speak(this.storyTextParts[this.currentPart], {
                rate: 0.9,
                pitch: 1.2, // Higher pitch for more feminine voice
                voiceURI: 'female' // Try to select a female voice if available
            });
        }
    }
    
    toggleAutoScroll() {
        this.autoScroll = !this.autoScroll;
        
        if (this.autoScroll) {
            this.scrollTween.resume();
        } else {
            this.scrollTween.pause();
        }
    }
    
    addNavigationButtons() {
        // Previous button
        this.prevButton = this.add.circle(
            this.cameras.main.width / 2 - 350,
            400,
            30,
            0x9e1e63
        ).setInteractive({ useHandCursor: true });
        
        this.add.text(
            this.cameras.main.width / 2 - 350,
            400,
            '<',
            {
                font: '32px Georgia',
                fill: '#ffffff'
            }
        ).setOrigin(0.5);
        
        this.prevButton.on('pointerdown', () => {
            this.goToPreviousPart();
        });
        
        // Next button
        this.nextButton = this.add.circle(
            this.cameras.main.width / 2 + 350,
            400,
            30,
            0x9e1e63
        ).setInteractive({ useHandCursor: true });
        
        this.add.text(
            this.cameras.main.width / 2 + 350,
            400,
            '>',
            {
                font: '32px Georgia',
                fill: '#ffffff'
            }
        ).setOrigin(0.5);
        
        this.nextButton.on('pointerdown', () => {
            this.goToNextPart();
        });
        
        // Button hover effects
        this.prevButton.on('pointerover', () => {
            this.prevButton.setFillStyle(0xb52d75);
        });
        
        this.prevButton.on('pointerout', () => {
            this.prevButton.setFillStyle(0x9e1e63);
        });
        
        this.nextButton.on('pointerover', () => {
            this.nextButton.setFillStyle(0xb52d75);
        });
        
        this.nextButton.on('pointerout', () => {
            this.nextButton.setFillStyle(0x9e1e63);
        });
    }
    
    addAutoScrollToggle() {
        // Auto-scroll toggle
        this.autoScrollButton = this.add.rectangle(
            this.cameras.main.width / 2,
            610,
            200,
            40,
            0x9e1e63
        ).setInteractive({ useHandCursor: true });
        
        this.autoScrollText = this.add.text(
            this.cameras.main.width / 2,
            610,
            'Auto-Scroll: ON',
            {
                font: '18px Georgia',
                fill: '#ffffff'
            }
        ).setOrigin(0.5);
        
        this.autoScrollButton.on('pointerdown', () => {
            this.toggleAutoScroll();
            this.autoScrollText.setText(`Auto-Scroll: ${this.autoScroll ? 'ON' : 'OFF'}`);
        });
        
        // Button hover effects
        this.autoScrollButton.on('pointerover', () => {
            this.autoScrollButton.setFillStyle(0xb52d75);
        });
        
        this.autoScrollButton.on('pointerout', () => {
            this.autoScrollButton.setFillStyle(0x9e1e63);
        });
    }
    
    addReturnButton() {
        // Return to menu button
        this.returnButton = this.add.rectangle(
            this.cameras.main.width / 2,
            670,
            200,
            40,
            0x333333
        ).setInteractive({ useHandCursor: true });
        
        this.add.text(
            this.cameras.main.width / 2,
            670,
            'Voltar ao Menu',
            {
                font: '18px Georgia',
                fill: '#ffffff'
            }
        ).setOrigin(0.5);
        
        this.returnButton.on('pointerdown', () => {
            // Stop speech
            if (window.ttsManager) {
                window.ttsManager.cancel();
            }
            
            // Return to menu scene
            this.scene.start('MenuScene');
        });
        
        // Button hover effects
        this.returnButton.on('pointerover', () => {
            this.returnButton.setFillStyle(0x555555);
        });
        
        this.returnButton.on('pointerout', () => {
            this.returnButton.setFillStyle(0x333333);
        });
    }
    
    createAtmosphericEffects() {
        // Add subtle smoke/fog effect
        const smokeParticles = this.add.group();
        
        for (let i = 0; i < 5; i++) {
            const x = Phaser.Math.Between(0, this.cameras.main.width);
            const y = Phaser.Math.Between(0, this.cameras.main.height);
            
            const smoke = this.add.circle(x, y, Phaser.Math.Between(50, 150), 0xffffff, 0.02);
            smokeParticles.add(smoke);
            
            this.tweens.add({
                targets: smoke,
                x: smoke.x + Phaser.Math.Between(-100, 100),
                y: smoke.y - Phaser.Math.Between(50, 150),
                alpha: 0,
                scale: 2,
                duration: Phaser.Math.Between(10000, 20000),
                onComplete: () => {
                    smoke.setPosition(
                        Phaser.Math.Between(0, this.cameras.main.width),
                        this.cameras.main.height + 50
                    );
                    smoke.setAlpha(0.02);
                    smoke.setScale(1);
                    
                    this.tweens.add({
                        targets: smoke,
                        x: smoke.x + Phaser.Math.Between(-100, 100),
                        y: smoke.y - Phaser.Math.Between(200, 400),
                        alpha: 0,
                        scale: 2,
                        duration: Phaser.Math.Between(10000, 20000),
                        onComplete: () => {
                            smoke.destroy();
                        }
                    });
                }
            });
        }
    }
    
    initializeStoryText() {
        // Part 1: Introduction to Juliette
        this.storyTextParts.push(
            "JULIETTE PSICOSE: ECOS DA REBELIÃO\n\n" +
            "Juliette era uma jovem jornalista investigativa, conhecida por sua mente afiada e determinação inabalável. " +
            "Quando ela começou a investigar uma série de mortes suspeitas conectadas a um poderoso juiz, não imaginou " +
            "que estaria prestes a desvendar uma conspiração que atravessava as mais altas esferas do poder.\n\n" +
            "Durante uma manifestação pública, Juliette revelou documentos comprometedores que provavam a corrupção do sistema judicial. " +
            "Na mesma noite, ela foi detida, sedada e internada no Hospital Psiquiátrico St. Mäder, diagnosticada com " +
            "psicose aguda e delírios persecutórios.\n\n" +
            "Agora, presa entre paredes de concreto e mentes manipuladas, Juliette precisa distinguir entre realidade e " +
            "alucinação, enquanto busca escapar e expor a verdade que tentaram silenciar."
        );
        
        // Part 2: Gameplay Mechanics
        this.storyTextParts.push(
            "MECÂNICAS DE JOGO\n\n" +
            "Em Juliette Psicose, você navegará por um mundo onde realidade e delírio se misturam. O jogo combina elementos " +
            "de aventura psicológica, investigação e horror existencial.\n\n" +
            "• SISTEMA DE KARMA: Suas escolhas afetam o rumo da história e determinam qual dos múltiplos finais você alcançará.\n\n" +
            "• DESAFIOS MENTAIS: Resolva quebra-cabeças que representam os conflitos internos de Juliette e os obstáculos em seu caminho.\n\n" +
            "• CONTADOR DE TEMPO: Cada desafio possui um tempo limite, aumentando a pressão e a sensação de urgência.\n\n" +
            "• SISTEMA DE SANIDADE: Mantenha o equilíbrio mental de Juliette enquanto enfrenta horrores reais e imaginários."
        );
        
        // Part 3: Game Tips
        this.storyTextParts.push(
            "DICAS DE JOGO\n\n" +
            "• OBSERVE ATENTAMENTE: Detalhes aparentemente insignificantes podem conter pistas cruciais.\n\n" +
            "• QUESTIONE TUDO: Nem tudo o que você vê ou ouve é real. Aprenda a distinguir entre realidade e alucinação.\n\n" +
            "• GERENCIE O TEMPO: Os desafios têm tempo limitado. Mantenha a calma mesmo sob pressão.\n\n" +
            "• EXPLORE DIÁLOGOS: Escolha suas palavras com cuidado. Algumas respostas podem abrir ou fechar caminhos.\n\n" +
            "• USE O ASSISTENTE: O chatbot de IA pode oferecer dicas sutis quando você estiver preso em algum puzzle.\n\n" +
            "• CUIDE DA SANIDADE: Tomar decisões extremas pode comprometer o estado mental de Juliette."
        );
        
        // Part 4: Controls and Interface
        this.storyTextParts.push(
            "CONTROLES E INTERFACE\n\n" +
            "• MOVIMENTO: Clique nos locais ou objetos de interesse para interagir com eles.\n\n" +
            "• INVENTÁRIO: Acesse seus itens coletados no canto inferior da tela.\n\n" +
            "• DIÁRIO: Consulte as anotações de Juliette para revisitar pistas e informações.\n\n" +
            "• SANIDADE: O medidor no canto superior mostra o estado mental atual de Juliette.\n\n" +
            "• MENU: Acesse as configurações de áudio, salvamento e outras opções a qualquer momento.\n\n" +
            "• ASSISTENTE IA: Clique no ícone de chat para conversar com o assistente e receber dicas."
        );
        
        // Part 5: Story Conclusion
        this.storyTextParts.push(
            "A JORNADA COMEÇA\n\n" +
            "A linha entre sanidade e loucura é tênue, especialmente quando aqueles no poder definem o que é real.\n\n" +
            "Juliette sabe que não está louca. As evidências que encontrou são reais. A conspiração é real.\n\n" +
            "Mas em um mundo onde a verdade é manipulada e aqueles que a buscam são silenciados, quem decidirá o que é real?\n\n" +
            "Você está pronto para descobrir a verdade, não importa quão perturbadora ela seja?\n\n" +
            "Bem-vindo ao mundo de Juliette Psicose. A jornada para a verdade começa agora."
        );
    }
    
    update() {
        // Manual scroll control using arrow keys
        if (!this.autoScroll) {
            const cursors = this.input.keyboard.createCursorKeys();
            
            if (cursors.up.isDown) {
                this.storyText.y += 5;
            } else if (cursors.down.isDown) {
                this.storyText.y -= 5;
            }
        }
    }
}

