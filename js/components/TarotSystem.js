// TarotSystem.js - Handles mystical tarot card interactions with visual and audio effects

class TarotSystem {
    constructor(scene, options = {}) {
        this.scene = scene;
        
        // Default options
        this.options = Object.assign({
            x: this.scene.cameras.main.width / 2,
            y: this.scene.cameras.main.height / 2,
            scale: 1.0,
            cardScale: 0.8,
            cardSpacing: 30,
            flipDuration: 800,
            glitchIntensity: 0.7,
            cardBackTexture: 'tarot-back',
            showMeanings: true,
            speakMeanings: true,
            useKarmaInfluence: true,
            onCardSelected: null,
            onReadingComplete: null
        }, options);
        
        // Card definitions with meanings and karma influence
        this.cards = {
            justice: {
                key: 'tarot-justice',
                name: 'Justiça',
                uprightMeaning: 'Equilíbrio, verdade, consequências das escolhas.',
                reversedMeaning: 'Injustiça, desequilíbrio, corrupção moral.',
                karmaInfluence: 2, // Higher influence on karma
                symbol: '⚖️',
                color: 0xb39ddb,
                audioKey: 'tarot-justice',
                keywords: ['verdade', 'equilíbrio', 'consequência'],
                poetic: 'Na balança entre sombra e luz\nA verdade persiste, e conduz\nMesmo quando a justiça parece distante\nSua força é o fio cortante'
            },
            rebellion: {
                key: 'tarot-rebellion',
                name: 'Rebelião',
                uprightMeaning: 'Resistência, transformação, quebra de correntes.',
                reversedMeaning: 'Opressão, conformismo, submissão ao sistema.',
                karmaInfluence: 3, // Highest influence on karma
                symbol: '⚔️',
                color: 0xe57373,
                audioKey: 'tarot-rebellion',
                keywords: ['resistência', 'liberdade', 'quebra'],
                poetic: 'Sob o peso da opressão\nA semente da rebelião\nOnde algemas aprisionam mentes\nO grito de liberdade será permanente'
            },
            love: {
                key: 'tarot-love',
                name: 'Amor',
                uprightMeaning: 'Conexão profunda, força emocional, união.',
                reversedMeaning: 'Amor distorcido, obsessão, manipulação.',
                karmaInfluence: 2,
                symbol: '❤️',
                color: 0xf06292,
                audioKey: 'tarot-love',
                keywords: ['conexão', 'emoção', 'força'],
                poetic: 'No abismo entre dois corações\nFloresce a mais profunda das emoções\nAmor que liberta e que aprisiona\nPoder que destrói e transforma'
            },
            moon: {
                key: 'tarot-moon',
                name: 'Lua',
                uprightMeaning: 'Intuição, visões, percepção além da realidade.',
                reversedMeaning: 'Ilusão, delírio, perda da lucidez.',
                karmaInfluence: 1,
                symbol: '🌙',
                color: 0x7986cb,
                audioKey: 'tarot-moon',
                keywords: ['intuição', 'visão', 'percepção'],
                poetic: 'Na dança entre sonho e realidade\nA lua revela a mais profunda verdade\nEntre delírio e clareza, o véu se desfaz\nNa fronteira onde o olhar comum não é capaz'
            }
        };
        
        // Current reading state
        this.currentReading = {
            type: null,
            cards: [],
            positions: [],
            revealed: [],
            isActive: false,
            selectedIndex: -1
        };
        
        // Container for all tarot card objects
        this.container = this.scene.add.container(this.options.x, this.options.y);
        this.container.setVisible(false);
        
        // Background overlay
        this.overlay = this.scene.add.rectangle(
            0, 0,
            this.scene.cameras.main.width * 2,
            this.scene.cameras.main.height * 2,
            0x000000, 0.7
        );
        this.overlay.setOrigin(0.5);
        this.overlay.setVisible(false);
        this.container.add(this.overlay);
        
        // Reading table background
        this.tableBg = this.scene.add.rectangle(
            0, 0,
            this.scene.cameras.main.width * 0.8,
            this.scene.cameras.main.height * 0.7,
            0x1a1a1a, 0.9
        );
        this.tableBg.setStrokeStyle(2, 0x9e1e63);
        this.tableBg.setOrigin(0.5);
        this.container.add(this.tableBg);
        
        // Title text
        this.titleText = this.scene.add.text(
            0, -this.tableBg.height / 2 + 40,
            'Cartas do Destino',
            {
                fontFamily: 'Georgia',
                fontSize: '32px',
                color: '#9e1e63',
                stroke: '#000000',
                strokeThickness: 2
            }
        );
        this.titleText.setOrigin(0.5);
        this.container.add(this.titleText);
        
        // Instruction text
        this.instructionText = this.scene.add.text(
            0, this.tableBg.height / 2 - 40,
            'Clique em uma carta para revelar seu significado',
            {
                fontFamily: 'Georgia',
                fontSize: '18px',
                color: '#b39ddb',
                stroke: '#000000',
                strokeThickness: 1
            }
        );
        this.instructionText.setOrigin(0.5);
        this.container.add(this.instructionText);
        
        // Close button
        this.closeButton = this.scene.add.circle(
            this.tableBg.width / 2 - 20,
            -this.tableBg.height / 2 + 20,
            15,
            0xff3860
        );
        this.closeButton.setInteractive({ useHandCursor: true });
        this.closeButton.on('pointerdown', () => this.closeReading());
        this.container.add(this.closeButton);
        
        // Close button X
        this.closeX = this.scene.add.text(
            this.closeButton.x,
            this.closeButton.y,
            'X',
            {
                fontFamily: 'Arial',
                fontSize: '16px',
                color: '#ffffff'
            }
        );
        this.closeX.setOrigin(0.5);
        this.container.add(this.closeX);
        
        // Card objects container
        this.cardsContainer = this.scene.add.container(0, 0);
        this.container.add(this.cardsContainer);
        
        // Meaning display
        this.meaningContainer = this.scene.add.container(0, 0);
        this.meaningContainer.setVisible(false);
        this.container.add(this.meaningContainer);
        
        // Meaning background
        this.meaningBg = this.scene.add.rectangle(
            0, 0,
            this.tableBg.width * 0.9,
            150,
            0x2d2d2d, 0.9
        );
        this.meaningBg.setStrokeStyle(1, 0x9e1e63);
        this.meaningContainer.add(this.meaningBg);
        
        // Card name text
        this.cardNameText = this.scene.add.text(
            0, -this.meaningBg.height / 2 + 25,
            '',
            {
                fontFamily: 'Georgia',
                fontSize: '24px',
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 1
            }
        );
        this.cardNameText.setOrigin(0.5);
        this.meaningContainer.add(this.cardNameText);
        
        // Card meaning text
        this.meaningText = this.scene.add.text(
            0, 15,
            '',
            {
                fontFamily: 'Georgia',
                fontSize: '18px',
                color: '#f0f0f0',
                align: 'center',
                wordWrap: { width: this.meaningBg.width - 40 }
            }
        );
        this.meaningText.setOrigin(0.5);
        this.meaningContainer.add(this.meaningText);
        
        // Poetic text
        this.poeticText = this.scene.add.text(
            0, this.meaningBg.height / 2 + 40,
            '',
            {
                fontFamily: 'Georgia',
                fontSize: '16px',
                fontStyle: 'italic',
                color: '#b39ddb',
                align: 'center',
                wordWrap: { width: this.meaningBg.width - 40 }
            }
        );
        this.poeticText.setOrigin(0.5);
        this.meaningContainer.add(this.poeticText);
        
        // Symbol element
        this.symbol = this.scene.add.text(
            this.meaningBg.width / 2 - 30,
            0,
            '',
            {
                fontSize: '32px'
            }
        );
        this.meaningContainer.add(this.symbol);
        
        // Initialize animations
        this.initAnimations();
    }
    
    // Initialize animations for the tarot system
    initAnimations() {
        // Card flip animation
        if (!this.scene.anims.exists('card-flip')) {
            this.scene.anims.create({
                key: 'card-flip',
                frames: [
                    { key: 'tarot-back', frame: 0 }
                ],
                frameRate: 10,
                repeat: 0
            });
        }
        
        // Symbol pulse animation
        this.symbolTween = this.scene.tweens.add({
            targets: this.symbol,
            scale: { from: 1, to: 1.2 },
            alpha: { from: 0.7, to: 1 },
            duration: 1500,
            yoyo: true,
            repeat: -1,
            paused: true
        });
    }
    
    // Preload all necessary assets
    preloadAssets() {
        // Load card textures
        this.scene.load.image(this.options.cardBackTexture, 'assets/images/tarot/card-back.png');
        
        // Load individual card images
        for (const cardKey in this.cards) {
            const card = this.cards[cardKey];
            this.scene.load.image(card.key, `assets/images/tarot/${cardKey}.png`);
        }
        
        // Load audio
        this.scene.load.audio('tarot-shuffle', 'assets/audio/tarot/shuffle.mp3');
        this.scene.load.audio('tarot-flip', 'assets/audio/tarot/flip.mp3');
        this.scene.load.audio('tarot-select', 'assets/audio/tarot/select.mp3');
        this.scene.load.audio('tarot-reveal', 'assets/audio/tarot/reveal.mp3');
        
        // Load individual card sounds
        for (const cardKey in this.cards) {
            const card = this.cards[cardKey];
            this.scene.load.audio(card.audioKey, `assets/audio/tarot/${cardKey}.mp3`);
        }
    }
    
    // Start a single card reading
    startSingleCardReading(options = {}) {
        return this.startReading('single', options);
    }
    
    // Start a three card reading (past/present/future)
    startThreeCardReading(options = {}) {
        return this.startReading('three', options);
    }
    
    // Start a cross reading for major decisions
    startCrossReading(options = {}) {
        return this.startReading('cross', options);
    }
    
    // Start a reading with the given type
    startReading(type, options = {}) {
        // Reset any existing reading
        this.resetReading();
        
        // Set up the new reading
        this.currentReading.type = type;
        this.currentReading.isActive = true;
        
        // Apply reading-specific options
        const readingOptions = Object.assign({
            title: this.getTitleForReadingType(type),
            instruction: 'Clique em uma carta para revelar seu significado',
            autoReveal: false,
            revealDelay: 1000,
            karmaInfluence: true,
            onReveal: null,
            onComplete: null
        }, options);
        
        // Update title and instruction
        this.titleText.setText(readingOptions.title);
        this.instructionText.setText(readingOptions.instruction);
        
        // Determine card positions based on reading type
        this.setupCardPositions(type);
        
        // Draw and shuffle cards
        this.drawCards(type);
        
        // Show the reading
        this.showReading();
        
        // Play shuffle sound
        if (this.scene.audioManager) {
            this.scene.audioManager.playSoundEffect('tarot-shuffle', { 
                volume: 0.6 
            });
        }
        
        // Auto-reveal cards if enabled
        if (readingOptions.autoReveal) {
            for (let i = 0; i < this.currentReading.cards.length; i++) {
                this.scene.time.delayedCall(i * readingOptions.revealDelay, () => {
                    this.revealCard(i);
                });
            }
        }
        
        return this;
    }
    
    // Get title text based on reading type
    getTitleForReadingType(type) {
        switch (type) {
            case 'single':
                return 'A Carta do Destino';
            case 'three':
                return 'Passado • Presente • Futuro';
            case 'cross':
                return 'A Encruzilhada do Destino';
            default:
                return 'Leitura das Cartas';
        }
    }
    
    // Set up positions for cards based on reading type
    setupCardPositions(type) {
        const positions = [];
        
        switch (type) {
            case 'single':
                // Single card in center
                positions.push({ x: 0, y: 0, rotation: 0, label: 'Destino' });
                break;
                
            case 'three':
                // Three cards in a row
                const spacing = this.options.cardSpacing + 150 * this.options.cardScale;
                positions.push({ x: -spacing, y: 0, rotation: 0, label: 'Passado' });
                positions.push({ x: 0, y: 0, rotation: 0, label: 'Presente' });
                positions.push({ x: spacing, y: 0, rotation: 0, label: 'Futuro' });
                break;
                
            case 'cross':
                // Cross pattern with 5 cards
                const cardSize = 150 * this.options.cardScale;
                positions.push({ x: 0, y: 0, rotation: 0, label: 'Situação Atual' }); // Center
                positions.push({ x: 0, y: -cardSize - 20, rotation: 0, label: 'Desafio' }); // Top
                positions.push({ x: cardSize + 20, y: 0, rotation: 0, label: 'Futuro Próximo' }); // Right
                positions.push({ x: 0, y: cardSize + 20, rotation: 0, label: 'Fundação' }); // Bottom
                positions.push({ x: -cardSize - 20, y: 0, rotation: 0, label: 'Passado' }); // Left
                break;
        }
        
        this.currentReading.positions = positions;
    }
    
    // Draw and shuffle cards for the reading
    drawCards(type) {
        // Determine how many cards to draw
        let cardCount;
        switch (type) {
            case 'single': cardCount = 1; break;
            case 'three': cardCount = 3; break;
            case 'cross': cardCount = 5; break;
            default: cardCount = 1;
        }
        
        // Get available cards
        const availableCards = Object.keys(this.cards);
        
        // Shuffle the available cards
        const shuffledCards = Phaser.Utils.Array.Shuffle([...availableCards]);
        
        // Select cards for the reading
        const selectedCardKeys = shuffledCards.slice(0, cardCount);
        
        // Create card objects and add to scene
        for (let i = 0; i < selectedCardKeys.length; i++) {
            const cardKey = selectedCardKeys[i];
            const card = this.cards[cardKey];
            const position = this.currentReading.positions[i];
            
            // Create card back sprite
            const cardSprite = this.scene.add.sprite(
                position.x, 
                position.y, 
                this.options.cardBackTexture
            );
            cardSprite.setScale(this.options.cardScale);
            
            // Set rotation if any
            if (position.rotation !== 0) {
                cardSprite.setRotation(position.rotation);
            }
            
            // Make card interactive
            cardSprite.setInteractive({ useHandCursor: true });
            
            // Add hover effects
            cardSprite.on('pointerover', () => {
                if (!this.currentReading.revealed[i]) {
                    this.scene.tweens.add({
                        targets: cardSprite,
                        scaleX: this.options.cardScale * 1.05,
                        scaleY: this.options.cardScale * 1.05,
                        duration: 200
                    });
                }
            });
            
            cardSprite.on('pointerout', () => {
                if (!this.currentReading.revealed[i]) {
                    this.scene.tweens.add({
                        targets: cardSprite,
                        scaleX: this.options.cardScale,
                        scaleY: this.options.cardScale,
                        duration: 200
                    });
                }
            });
            
            // Add click handler to reveal card
            cardSprite.on('pointerdown', () => {
                if (!this.currentReading.revealed[i]) {
                    this.revealCard(i);
                } else {
                    this.showCardMeaning(i);
                }
            });
            
            // Store cards and set revealed status to false
            this.currentReading.cards.push({
                key: cardKey,
                sprite: cardSprite,
                position: position,
                reversed: Math.random() > 0.7, // 30% chance of reversed card
                cardData: card
            });
            this.currentReading.revealed.push(false);
            
            // Add label below card
            if (position.label) {
                const label = this.scene.add.text(
                    position.x,
                    position.y + 100 * this.options.cardScale,
                    position.label,
                    {
                        fontFamily: 'Georgia',
                        fontSize: '16px',
                        color: '#b39ddb',
                        stroke: '#000000',
                        strokeThickness: 1
                    }
                );
                label.setOrigin(0.5);
                this.cardsContainer.add(label);
            }
            
            // Add to cards container
            this.cardsContainer.add(cardSprite);
        }
    }
    
    // Reveal a card at the specified index
    revealCard(index) {
        if (index < 0 || index >= this.currentReading.cards.length || this.currentReading.revealed[index]) {
            return;
        }
        
        const card = this.currentReading.cards[index];
        
        // Mark as revealed
        this.currentReading.revealed[index] = true;
        this.currentReading.selectedIndex = index;
        
        // Play flip sound
        if (this.scene.audioManager) {
            this.scene.audioManager.playSoundEffect('tarot-flip', { 
                volume: 0.5 
            });
        }
        
        // Flip animation
        this.scene.tweens.add({
            targets: card.sprite,
            scaleX: 0,
            duration: this.options.flipDuration / 2,
            onComplete: () => {
                // Change texture to card front
                card.sprite.setTexture(card.cardData.key);
                
                // Apply reversed orientation if needed
                if (card.reversed) {
                    card.sprite.setRotation(Math.PI);
                }
                
                // Reveal the card
                this.scene.tweens.add({
                    targets: card.sprite,
                    scaleX: this.options.cardScale,
                    duration: this.options.flipDuration / 2,
                    onComplete: () => {
                        // Apply glitch effect
                        if (this.options.glitchIntensity > 0 && this.scene.VisualEffects) {
                            this.scene.VisualEffects.applyGlitch(
                                this.scene, 
                                card.sprite, 
                                this.options.glitchIntensity, 
                                300
                            );
                        }
                        
                        // Play reveal sound
                        if (this.scene.audioManager) {
                            this.scene.audioManager.playSoundEffect('tarot-reveal', { 
                                volume: 0.4 
                            });
                            
                            // Play card-specific sound
                            this.scene.time.delayedCall(500, () => {
                                this.scene.audioManager.playSoundEffect(card.cardData.audioKey, { 
                                    volume: 0.5 
                                });
                            });
                        }
                        
                        // Show card meaning
                        this.showCardMeaning(index);
                        
                        // Apply karma effect
                        if (this.options.useKarmaInfluence && window.gameState) {
                            const karmaChange = card.reversed ? 
                                -card.cardData.karmaInfluence : 
                                card.cardData.karmaInfluence;
                                
                            window.gameState.karma += karmaChange;
                            
                            // Show karma change notification
                            const karmaMsg = new MessageCard(this.scene, {
                                y: 70,
                                style: karmaChange > 0 ? 'success' : 'danger',
                                duration: 3000
                            });
                            
                            const karmaText = karmaChange > 0 ? 
                                `Karma +${karmaChange}: Destino favorável` : 
                                `Karma ${karmaChange}: Destino adverso`;
                                
                            karmaMsg.show(karmaText);
                        }
                        
                        // Check if all cards are revealed
                        this.checkReadingComplete();
                        
                        // Call onReveal callback if provided
                        if (this.options.onCardSelected) {
                            this.options.onCardSelected(card, index);
                        }
                    }
                });
            }
        });
    }
    
    // Show the meaning of a card
    showCardMeaning(index) {
        if (index < 0 || index >= this.currentReading.cards.length) {
            return;
        }
        
        const card = this.currentReading.cards[index];
        this.currentReading.selectedIndex = index;
        
        // Play select sound
        if (this.scene.audioManager) {
            this.scene.audioManager.playSoundEffect('tarot-select', { 
                volume: 0.3 
            });
        }
        
        // Highlight selected card
        for (let i = 0; i < this.currentReading.cards.length; i++) {
            const currentCard = this.currentReading.cards[i];
            if (i === index) {
                this.scene.tweens.add({
                    targets: currentCard.sprite,
                    y: currentCard.position.y - 20,
                    duration: 300
                });
            } else {
                this.scene.tweens.add({
                    targets: currentCard.sprite,
                    y: currentCard.position.y,
                    duration: 300
                });
            }
        }
        
        // Update meaning text
        const meaning = card.reversed ? card.cardData.reversedMeaning : card.cardData.uprightMeaning;
        const orientation = card.reversed ? ' (Invertida)' : '';
        
        this.cardNameText.setText(card.cardData.name + orientation);
        this.cardNameText.setColor(Phaser.Display.Color.IntegerToColor(card.cardData.color).rgba);
        
        this.meaningText.setText(meaning);
        this.poeticText.setText(card.cardData.poetic);
        this.symbol.setText(card.cardData.symbol);
        
        // Position meaning container
        const targetY = this.tableBg.height / 2 - 100;
        this.meaningContainer.setPosition(0, targetY);
        
        // Show the meaning container with animation
        this.meaningContainer.setVisible(true);
        this.meaningContainer.setAlpha(0);
        this.scene.tweens.add({
            targets: this.meaningContainer,
            alpha: 1,
            duration: 500
        });
        
        // Animate symbol
        this.symbol.setScale(0);
        this.scene.tweens.add({
            targets: this.symbol,
            scale: 1,
            duration: 500,
            ease: 'Back.easeOut',
            onComplete: () => {
                this.symbolTween.restart();
            }
        });
        
        // Speak the meaning if text-to-speech is enabled
        if (this.options.speakMeanings && window.ttsManager) {
            window.ttsManager.speak(card.cardData.name + '. ' + meaning);
        }
    }
    
    // Check if all cards have been revealed
    checkReadingComplete() {
        const allRevealed = this.currentReading.revealed.every(status => status === true);
        
        if (allRevealed) {
            // Show completion message
            const completeMsg = new MessageCard(this.scene, {
                y: 120,
                style: 'info',
                duration: 5000,
                speakText: true
            });
            
            completeMsg.show('Leitura completa. As cartas revelaram seu destino.');
            
            // Call onComplete callback if provided
            if (this.options.onReadingComplete) {
                this.options.onReadingComplete(this.currentReading);
            }
        }
    }
    
    // Show the reading interface
    showReading() {
        this.container.setVisible(true);
        this.container.setAlpha(0);
        this.overlay.setVisible(true);
        
        // Fade in animation
        this.scene.tweens.add({
            targets: this.container,
            alpha: 1,
            duration: 500
        });
        
        // Animate cards appearing
        for (let i = 0; i < this.currentReading.cards.length; i++) {
            const card = this.currentReading.cards[i];
            
            // Set initial state
            card.sprite.setAlpha(0);
            card.sprite.y = card.position.y - 50;
            
            // Animate entry
            this.scene.tweens.add({
                targets: card.sprite,
                alpha: 1,
                y: card.position.y,
                duration: 500,
                delay: i * 200,
                ease: 'Back.easeOut'
            });
        }
    }
    
    // Close the current reading
    closeReading() {
        // Fade out animation
        this.scene.tweens.add({
            targets: this.container,
            alpha: 0,
            duration: 500,
            onComplete: () => {
                this.container.setVisible(false);
                this.resetReading();
            }
        });
        
        // Stop any playing card sounds
        if (this.scene.audioManager) {
            for (const cardKey in this.cards) {
                const card = this.cards[cardKey];
                this.scene.audioManager.stopSoundEffect(card.audioKey);
            }
        }
    }
    
    // Reset the current reading
    resetReading() {
        // Clear card sprites
        this.cardsContainer.removeAll(true);
        
        // Hide meaning container
        this.meaningContainer.setVisible(false);
        
        // Stop symbol animation
        this.symbolTween.pause();
        
        // Reset current reading state
        this.currentReading = {
            type: null,
            cards: [],
            positions: [],
            revealed: [],
            isActive: false,
            selectedIndex: -1
        };
    }
    
    // Update method for animation effects
    update() {
        // Add any per-frame updates here
        if (this.currentReading.isActive) {
            // For example, subtle floating animation for cards
            for (let i = 0; i < this.currentReading.cards.length; i++) {
                const card = this.currentReading.cards[i];
                
                // Add subtle hover animation for unrevealed cards
                if (!this.currentReading.revealed[i]) {
                    card.sprite.y = card.position.y + Math.sin(this.scene.time.now / 1000 + i) * 3;
                }
            }
        }
    }
}

