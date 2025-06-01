// ESPChallengeSystem.js - Handles ESP (Extrasensory Perception) challenges with explanation screens

class ESPChallengeSystem {
    constructor(scene, options = {}) {
        this.scene = scene;
        
        // Default options
        this.options = Object.assign({
            x: this.scene.cameras.main.width / 2,
            y: this.scene.cameras.main.height / 2,
            width: this.scene.cameras.main.width * 0.8,
            height: this.scene.cameras.main.height * 0.8,
            backgroundColor: 0x1a1a1a,
            textColor: '#f0f0f0',
            accentColor: '#9e1e63',
            fontFamily: 'Georgia',
            showExplanationScreen: true,
            challengeDuration: 60000, // 1 minute by default
            useKarmaSystem: true,
            onComplete: null,
            onSuccess: null,
            onFail: null
        }, options);
        
        // Challenge state
        this.currentChallenge = null;
        this.isActive = false;
        this.results = {
            totalAttempts: 0,
            successfulAttempts: 0,
            currentScore: 0,
            expectedChance: 0,
            challengeHistory: []
        };
        
        // Zener card symbols
        this.zenerSymbols = ['circle', 'square', 'triangle', 'plus', 'waves'];
        
        // Container for challenge UI
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
        
        // Challenge background
        this.challengeBg = this.scene.add.rectangle(
            0, 0,
            this.options.width,
            this.options.height,
            this.options.backgroundColor, 0.9
        );
        this.challengeBg.setStrokeStyle(2, 0x9e1e63);
        this.challengeBg.setOrigin(0.5);
        this.container.add(this.challengeBg);
        
        // Create explanation screen elements
        this.createExplanationScreen();
        
        // Create challenge content container
        this.challengeContent = this.scene.add.container(0, 0);
        this.challengeContent.setVisible(false);
        this.container.add(this.challengeContent);
        
        // Create results screen elements
        this.createResultsScreen();
    }
    
    // Create the explanation screen elements
    createExplanationScreen() {
        this.explanationContainer = this.scene.add.container(0, 0);
        this.container.add(this.explanationContainer);
        
        // Title text
        this.explanationTitle = this.scene.add.text(
            0, -this.options.height / 2 + 50,
            'Teste de Percepção Extrassensorial',
            {
                fontFamily: this.options.fontFamily,
                fontSize: '32px',
                color: this.options.accentColor,
                align: 'center',
                stroke: '#000000',
                strokeThickness: 2
            }
        );
        this.explanationTitle.setOrigin(0.5);
        this.explanationContainer.add(this.explanationTitle);
        
        // Explanation text
        this.explanationText = this.scene.add.text(
            0, -50,
            'Carregando instruções...',
            {
                fontFamily: this.options.fontFamily,
                fontSize: '20px',
                color: this.options.textColor,
                align: 'center',
                wordWrap: { width: this.options.width - 100 }
            }
        );
        this.explanationText.setOrigin(0.5);
        this.explanationContainer.add(this.explanationText);
        
        // Historical context text
        this.contextText = this.scene.add.text(
            0, 80,
            '',
            {
                fontFamily: this.options.fontFamily,
                fontSize: '16px',
                color: '#b39ddb',
                fontStyle: 'italic',
                align: 'center',
                wordWrap: { width: this.options.width - 150 }
            }
        );
        this.contextText.setOrigin(0.5);
        this.explanationContainer.add(this.contextText);
        
        // Success criteria text
        this.criteriaText = this.scene.add.text(
            0, 170,
            '',
            {
                fontFamily: this.options.fontFamily,
                fontSize: '18px',
                color: '#80cbc4',
                align: 'center',
                wordWrap: { width: this.options.width - 150 }
            }
        );
        this.criteriaText.setOrigin(0.5);
        this.explanationContainer.add(this.criteriaText);
        
        // Continue button
        this.continueButton = this.scene.add.rectangle(
            0, this.options.height / 2 - 80,
            200,
            50,
            0x9e1e63
        );
        this.continueButton.setInteractive({ useHandCursor: true });
        this.continueButton.on('pointerdown', () => this.startChallenge());
        this.explanationContainer.add(this.continueButton);
        
        // Continue button text
        this.continueText = this.scene.add.text(
            0, this.options.height / 2 - 80,
            'Continuar',
            {
                fontFamily: this.options.fontFamily,
                fontSize: '20px',
                color: '#ffffff'
            }
        );
        this.continueText.setOrigin(0.5);
        this.explanationContainer.add(this.continueText);
    }
    
    // Create the results screen elements
    createResultsScreen() {
        this.resultsContainer = this.scene.add.container(0, 0);
        this.resultsContainer.setVisible(false);
        this.container.add(this.resultsContainer);
        
        // Results title
        this.resultsTitle = this.scene.add.text(
            0, -this.options.height / 2 + 50,
            'Resultados do Teste',
            {
                fontFamily: this.options.fontFamily,
                fontSize: '32px',
                color: this.options.accentColor,
                align: 'center',
                stroke: '#000000',
                strokeThickness: 2
            }
        );
        this.resultsTitle.setOrigin(0.5);
        this.resultsContainer.add(this.resultsTitle);
        
        // Score text
        this.scoreText = this.scene.add.text(
            0, -80,
            'Pontuação: 0',
            {
                fontFamily: this.options.fontFamily,
                fontSize: '24px',
                color: this.options.textColor,
                align: 'center'
            }
        );
        this.scoreText.setOrigin(0.5);
        this.resultsContainer.add(this.scoreText);
        
        // Stats text
        this.statsText = this.scene.add.text(
            0, 0,
            'Estatísticas detalhadas:',
            {
                fontFamily: this.options.fontFamily,
                fontSize: '18px',
                color: this.options.textColor,
                align: 'left',
                wordWrap: { width: this.options.width - 150 }
            }
        );
        this.statsText.setOrigin(0.5);
        this.resultsContainer.add(this.statsText);
        
        // Analysis text
        this.analysisText = this.scene.add.text(
            0, 100,
            '',
            {
                fontFamily: this.options.fontFamily,
                fontSize: '20px',
                color: '#b39ddb',
                fontStyle: 'italic',
                align: 'center',
                wordWrap: { width: this.options.width - 150 }
            }
        );
        this.analysisText.setOrigin(0.5);
        this.resultsContainer.add(this.analysisText);
        
        // Close button
        this.closeButton = this.scene.add.rectangle(
            0, this.options.height / 2 - 80,
            200,
            50,
            0x9e1e63
        );
        this.closeButton.setInteractive({ useHandCursor: true });
        this.closeButton.on('pointerdown', () => this.close());
        this.resultsContainer.add(this.closeButton);
        
        // Close button text
        this.closeText = this.scene.add.text(
            0, this.options.height / 2 - 80,
            'Fechar',
            {
                fontFamily: this.options.fontFamily,
                fontSize: '20px',
                color: '#ffffff'
            }
        );
        this.closeText.setOrigin(0.5);
        this.resultsContainer.add(this.closeText);
    }
    
    // Start a Zener card ESP test
    startZenerCardTest(options = {}) {
        const challengeOptions = Object.assign({
            rounds: 25,
            timePerCard: 3000,
            title: 'Teste de Cartas Zener',
            explanation: 'Neste teste, você tentará adivinhar qual símbolo está na carta virada para baixo. Existem cinco símbolos possíveis: círculo, quadrado, triângulo, cruz e ondas.',
            context: 'O teste de cartas Zener foi criado pelo psicólogo Karl Zener na década de 1930 para testar habilidades ESP em laboratório. Usado nos famosos experimentos do Dr. J.B. Rhine na Universidade Duke, estabeleceu os fundamentos da parapsicologia moderna.',
            criteria: 'Acertar mais de 7 símbolos em 25 tentativas é considerado acima da chance aleatória (20%). Cada acerto aumenta seu karma, e resultados extraordinários (acima de 10 acertos) revelarão novas visões.'
        }, options);
        
        this.currentChallenge = {
            type: 'zener',
            options: challengeOptions,
            rounds: challengeOptions.rounds,
            currentRound: 0,
            targetSymbols: [],
            selectedSymbols: [],
            timer: null,
            startTime: null,
            expectedChance: 0.2 // 1/5 = 20%
        };
        
        this.showExplanationScreen(challengeOptions);
        
        return this;
    }
    
    // Start a precognition test
    startPrecognitionTest(options = {}) {
        const challengeOptions = Object.assign({
            predictions: 10,
            title: 'Teste de Precognição',
            explanation: 'Neste teste, você tentará prever qual imagem será gerada aleatoriamente pelo computador nos próximos segundos. Concentre-se e selecione a imagem que você sente que aparecerá.',
            context: 'Os testes de precognição investigam a capacidade de prever eventos futuros. Estudos conduzidos no Princeton Engineering Anomalies Research (PEAR) exploraram a capacidade humana de influenciar e prever resultados de geradores de números aleatórios.',
            criteria: 'Acertar mais de 4 previsões em 10 tentativas é considerado acima da chance aleatória (25%). Cada previsão correta fortalece sua conexão com as visões do futuro.'
        }, options);
        
        this.currentChallenge = {
            type: 'precognition',
            options: challengeOptions,
            predictions: challengeOptions.predictions,
            currentPrediction: 0,
            results: [],
            targetImages: [],
            selectedImages: [],
            timer: null,
            startTime: null,
            expectedChance: 0.25 // 1/4 = 25%
        };
        
        this.showExplanationScreen(challengeOptions);
        
        return this;
    }
    
    // Start a remote viewing test
    startRemoteViewingTest(options = {}) {
        const challengeOptions = Object.assign({
            targets: 5,
            title: 'Teste de Visão Remota',
            explanation: 'Neste teste, você tentará "ver" um local ou objeto distante usando apenas sua mente. Concentre-se no alvo desconhecido e selecione a imagem que melhor corresponde à sua impressão.',
            context: 'A visão remota foi estudada extensivamente por programas governamentais como o Stargate Project. Desenvolvida nos anos 1970 em Stanford, a técnica permitiu que indivíduos treinados descrevessem locais e objetos a milhares de quilômetros de distância.',
            criteria: 'Sua precisão será avaliada em uma escala de 0 a 5. Uma pontuação média acima de 2.5 é considerada significativa e indicará uma forte conexão com sua capacidade de percepção além dos sentidos físicos.'
        }, options);
        
        this.currentChallenge = {
            type: 'remoteViewing',
            options: challengeOptions,
            targets: challengeOptions.targets,
            currentTarget: 0,
            targetLocations: [],
            selectedDescriptions: [],
            accuracy: [],
            timer: null,
            startTime: null,
            expectedChance: 0.2 // 1/5 = 20%
        };
        
        this.showExplanationScreen(challengeOptions);
        
        return this;
    }
    
    // Start an emotional reading test
    startEmotionalReadingTest(options = {}) {
        const challengeOptions = Object.assign({
            readings: 8,
            title: 'Teste de Leitura Emocional',
            explanation: 'Neste teste, você tentará sentir a emoção de uma pessoa a partir de uma fotografia oculta. Concentre-se na energia emocional e selecione a emoção que você percebe.',
            context: 'A leitura emocional, ou empatia psíquica, é estudada na teoria dos campos morfogenéticos de Rupert Sheldrake. Sugere que as emoções humanas criam padrões energéticos que pessoas sensíveis podem detectar, mesmo à distância.',
            criteria: 'Identificar corretamente mais de 3 emoções em 8 tentativas é considerado acima da chance aleatória (25%). Cada leitura correta amplia sua capacidade de sentir além das palavras.'
        }, options);
        
        this.currentChallenge = {
            type: 'emotionalReading',
            options: challengeOptions,
            readings: challengeOptions.readings,
            currentReading: 0,
            targetEmotions: [],
            selectedEmotions: [],
            timer: null,
            startTime: null,
            expectedChance: 0.25 // 1/4 = 25%
        };
        
        this.showExplanationScreen(challengeOptions);
        
        return this;
    }
    
    // Show the explanation screen
    showExplanationScreen(challengeOptions) {
        // Reset UI state
        this.explanationContainer.setVisible(true);
        this.challengeContent.setVisible(false);
        this.resultsContainer.setVisible(false);
        
        // Set texts
        this.explanationTitle.setText(challengeOptions.title);
        this.explanationText.setText(challengeOptions.explanation);
        this.contextText.setText(challengeOptions.context);
        this.criteriaText.setText(challengeOptions.criteria);
        
        // Show the container
        this.container.setVisible(true);
        this.overlay.setVisible(true);
        
        // Apply fade-in effect
        this.container.setAlpha(0);
        this.scene.tweens.add({
            targets: this.container,
            alpha: 1,
            duration: 500
        });
        
        // Play ambient sound for ESP challenges
        if (this.scene.audioManager) {
            this.scene.audioManager.playMusic('twisted_jazz', {
                volume: 0.3,
                crossFade: true,
                fadeInDuration: 2000
            });
        }
        
        // Mark as active
        this.isActive = true;
    }
    
    // Start the actual challenge
    startChallenge() {
        if (!this.currentChallenge) return;
        
        // Hide explanation screen
        this.explanationContainer.setVisible(false);
        
        // Show challenge content
        this.challengeContent.setVisible(true);
        
        // Record start time
        this.currentChallenge.startTime = new Date().getTime();
        
        // Set up challenge based on type
        switch (this.currentChallenge.type) {
            case 'zener':
                this.setupZenerCardChallenge();
                break;
            case 'precognition':
                this.setupPrecognitionChallenge();
                break;
            case 'remoteViewing':
                this.setupRemoteViewingChallenge();
                break;
            case 'emotionalReading':
                this.setupEmotionalReadingChallenge();
                break;
        }
    }
    
    // Set up the Zener card challenge
    setupZenerCardChallenge() {
        // Clear previous content
        this.challengeContent.removeAll(true);
        
        // Generate random sequence of target symbols
        this.currentChallenge.targetSymbols = [];
        for (let i = 0; i < this.currentChallenge.rounds; i++) {
            const randomIndex = Math.floor(Math.random() * this.zenerSymbols.length);
            this.currentChallenge.targetSymbols.push(this.zenerSymbols[randomIndex]);
        }
        
        // Create challenge title
        const title = this.scene.add.text(
            0, -this.options.height / 2 + 50,
            'Cartas Zener: Ronda 1/' + this.currentChallenge.rounds,
            {
                fontFamily: this.options.fontFamily,
                fontSize: '28px',
                color: this.options.accentColor,
                align: 'center'
            }
        );
        title.setOrigin(0.5);
        this.challengeContent.add(title);
        
        // Create target card (face down)
        const targetCard = this.scene.add.rectangle(
            0, -80,
            120,
            180,
            0x333333
        );
        targetCard.setStrokeStyle(2, 0x9e1e63);
        this.challengeContent.add(targetCard);
        
        // Create target card back design
        const cardBackText = this.scene.add.text(
            0, -80,
            '?',
            {
                fontFamily: this.options.fontFamily,
                fontSize: '48px',
                color: '#9e1e63'
            }
        );
        cardBackText.setOrigin(0.5);
        this.challengeContent.add(cardBackText);
        
        // Create instruction text
        const instruction = this.scene.add.text(
            0, 50,
            'Qual símbolo você acha que está na carta?',
            {
                fontFamily: this.options.fontFamily,
                fontSize: '20px',
                color: this.options.textColor,
                align: 'center'
            }
        );
        instruction.setOrigin(0.5);
        this.challengeContent.add(instruction);
        
        // Create Zener card options
        const cardSpacing = 110;
        const startX = -(cardSpacing * 2);
        
        // Container for card options
        const cardOptions = this.scene.add.container(0, 120);
        this.challengeContent.add(cardOptions);
        
        // Add each Zener symbol as an option
        this.zenerSymbols.forEach((symbol, index) => {
            const x = startX + (index * cardSpacing);
            
            // Card background
            const card = this.scene.add.rectangle(
                x, 0,
                100,
                150,
                0x4a4a4a
            );
            card.setStrokeStyle(2, 0x9e1e63);
            card.setInteractive({ useHandCursor: true });
            
            // Symbol text
            let symbolText = '';
            switch(symbol) {
                case 'circle': symbolText = '○'; break;
                case 'square': symbolText = '□'; break;
                case 'triangle': symbolText = '△'; break;
                case 'plus': symbolText = '+'; break;
                case 'waves': symbolText = '∿'; break;
            }
            
            const text = this.scene.add.text(
                x, 0,
                symbolText,
                {
                    fontFamily: 'Arial',
                    fontSize: '60px',
                    color: '#ffffff'
                }
            );
            text.setOrigin(0.5);
            
            // Symbol label
            const label = this.scene.add.text(
                x, 65,
                symbol.charAt(0).toUpperCase() + symbol.slice(1),
                {
                    fontFamily: this.options.fontFamily,
                    fontSize: '16px',
                    color: '#b39ddb'
                }
            );
            label.setOrigin(0.5);
            
            // Add to container
            cardOptions.add(card);
            cardOptions.add(text);
            cardOptions.add(label);
            
            // Add interaction
            card.on('pointerdown', () => {
                this.makeZenerCardSelection(symbol, targetCard, cardBackText, title);
            });
            
            // Hover effect
            card.on('pointerover', () => {
                this.scene.tweens.add({
                    targets: card,
                    scaleX: 1.05,
                    scaleY: 1.05,
                    duration: 100
                });
            });
            
            card.on('pointerout', () => {
                this.scene.tweens.add({
                    targets: card,
                    scaleX: 1,
                    scaleY: 1,
                    duration: 100
                });
            });
        });
    }
    
    // Handle Zener card selection
    makeZenerCardSelection(selectedSymbol, targetCard, cardBackText, titleText) {
        // Add selection to results
        this.currentChallenge.selectedSymbols.push(selectedSymbol);
        this.currentChallenge.currentRound++;
        
        // Get the target symbol for this round
        const targetSymbol = this.currentChallenge.targetSymbols[this.currentChallenge.currentRound - 1];
        
        // Check if correct
        const isCorrect = selectedSymbol === targetSymbol;
        
        // Play sound based on result
        if (this.scene.audioManager) {
            if (isCorrect) {
                this.scene.audioManager.playSoundEffect('tarot-reveal', { volume: 0.4 });
            } else {
                this.scene.audioManager.playSoundEffect('glass_crack', { volume: 0.3 });
            }
        }
        
        // Reveal the target card
        this.scene.tweens.add({
            targets: targetCard,
            scaleX: 0,
            duration: 300,
            onComplete: () => {
                // Change card appearance
                targetCard.fillColor = isCorrect ? 0x4a9e4a : 0x9e4a4a;
                
                // Update symbol
                let symbolText = '';
                switch(targetSymbol) {
                    case 'circle': symbolText = '○'; break;
                    case 'square': symbolText = '□'; break;
                    case 'triangle': symbolText = '△'; break;
                    case 'plus': symbolText = '+'; break;
                    case 'waves': symbolText = '∿'; break;
                }
                cardBackText.setText(symbolText);
                cardBackText.setColor('#ffffff');
                
                // Flip card back
                this.scene.tweens.add({
                    targets: targetCard,
                    scaleX: 1,
                    duration: 300,
                    onComplete: () => {
                        // Wait a moment then continue
                        this.scene.time.delayedCall(1000, () => {
                            // If more rounds remain, continue
                            if (this.currentChallenge.currentRound < this.currentChallenge.rounds) {
                                // Update title
                                titleText.setText('Cartas Zener: Ronda ' + (this.currentChallenge.currentRound + 1) + '/' + this.currentChallenge.rounds);
                                
                                // Reset card
                                targetCard.fillColor = 0x333333;
                                cardBackText.setText('?');
                                cardBackText.setColor('#9e1e63');
                            } else {
                                // Complete the challenge
                                this.completeChallenge();
                            }
                        });
                    }
                });
            }
        });
    }
    
    // Set up the precognition challenge
    setupPrecognitionChallenge() {
        // Implementation for precognition challenge
        // This would be similar to setupZenerCardChallenge but with future prediction elements
    }
    
    // Set up the remote viewing challenge
    setupRemoteViewingChallenge() {
        // Implementation for remote viewing challenge
        // Would include target locations and matching mechanics
    }
    
    // Set up the emotional reading challenge
    setupEmotionalReadingChallenge() {
        // Implementation for emotional reading challenge
        // Would include hidden faces and emotion selection
    }
    
    // Complete the challenge and show results
    completeChallenge() {
        if (!this.currentChallenge) return;
        
        // Hide challenge content
        this.challengeContent.setVisible(false);
        
        // Calculate results
        let score = 0;
        let correctCount = 0;
        let totalCount = 0;
        
        switch (this.currentChallenge.type) {
            case 'zener':
                totalCount = this.currentChallenge.rounds;
                // Calculate correct guesses
                for (let i = 0; i < totalCount; i++) {
                    if (this.currentChallenge.selectedSymbols[i] === this.currentChallenge.targetSymbols[i]) {
                        correctCount++;
                    }
                }
                
                // Calculate score as percentage above chance
                const expectedCorrect = totalCount * this.currentChallenge.expectedChance;
                score = Math.max(0, correctCount - expectedCorrect);
                break;
                
            // Other challenge types would have similar calculations
        }
        
        // Update results
        this.results.totalAttempts += totalCount;
        this.results.successfulAttempts += correctCount;
        this.results.currentScore = score;
        this.results.expectedChance = this.currentChallenge.expectedChance;
        
        // Add to history
        this.results.challengeHistory.push({
            type: this.currentChallenge.type,
            totalAttempts: totalCount,
            successfulAttempts: correctCount,
            score: score,
            expectedChance: this.currentChallenge.expectedChance,
            timestamp: new Date().toISOString()
        });
        
        // Update karma if enabled
        if (this.options.useKarmaSystem && window.gameState) {
            // Adjust karma based on performance
            const karmaBonus = Math.floor(score * 2);
            window.gameState.karma += karmaBonus;
            
            // Show karma notification if score is positive
            if (karmaBonus > 0) {
                const karmaMsg = new MessageCard(this.scene, {
                    y: 70,
                    style: 'success',
                    duration: 3000
                });
                karmaMsg.show(`Karma +${karmaBonus}: Sua percepção extrassensorial fortaleceu seu destino.`);
            }
        }
        
        // Update results screen
        this.updateResultsScreen(correctCount, totalCount, score);
        
        // Show results screen
        this.resultsContainer.setVisible(true);
        
        // Play completion sound
        if (this.scene.audioManager) {
            // Different sounds based on performance
            if (correctCount > totalCount * this.currentChallenge.expectedChance * 1.5) {
                // Great performance
                this.scene.audioManager.playSoundEffect('tarot-justice', { volume: 0.5 });
            } else if (correctCount > totalCount * this.currentChallenge.expectedChance) {
                // Good performance
                this.scene.audioManager.playSoundEffect('tarot-reveal', { volume: 0.5 });
            } else {
                // Average or below performance
                this.scene.audioManager.playSoundEffect('static', { volume: 0.3 });
            }
        }
        
        // Call completion callback if provided
        if (this.options.onComplete) {
            this.options.onComplete({
                type: this.currentChallenge.type,
                success: correctCount > totalCount * this.currentChallenge.expectedChance,
                score: score,
                correctCount: correctCount,
                totalCount: totalCount,
                expectedChance: this.currentChallenge.expectedChance
            });
        }
    }
    
    // Update the results screen
    updateResultsScreen(correctCount, totalCount, score) {
        // Set title based on challenge type
        let titleText = 'Resultados do Teste';
        switch (this.currentChallenge.type) {
            case 'zener': titleText = 'Resultados: Cartas Zener'; break;
            case 'precognition': titleText = 'Resultados: Precognição'; break;
            case 'remoteViewing': titleText = 'Resultados: Visão Remota'; break;
            case 'emotionalReading': titleText = 'Resultados: Leitura Emocional'; break;
        }
        this.resultsTitle.setText(titleText);
        
        // Update score text
        this.scoreText.setText(`Pontuação: ${score.toFixed(1)} (${correctCount} de ${totalCount} acertos)`);
        
        // Calculate performance relative to chance
        const expectedCorrect = totalCount * this.currentChallenge.expectedChance;
        const percentAboveChance = ((correctCount / expectedCorrect) - 1) * 100;
        
        // Update stats text
        this.statsText.setText(
            `Estatísticas:\n` +
            `Acertos: ${correctCount} de ${totalCount} (${(correctCount/totalCount*100).toFixed(1)}%)\n` +
            `Esperado por acaso: ${expectedCorrect.toFixed(1)} (${(this.currentChallenge.expectedChance*100).toFixed(0)}%)\n` +
            `Desempenho: ${percentAboveChance > 0 ? '+' : ''}${percentAboveChance.toFixed(1)}% em relação ao acaso`
        );
        
        // Update analysis text
        let analysisText = '';
        if (percentAboveChance > 50) {
            analysisText = 'Extraordinário! Sua capacidade de percepção extrassensorial é notável. Você demonstrou uma conexão excepcional com o invisível.';
        } else if (percentAboveChance > 25) {
            analysisText = 'Impressionante! Seu desempenho foi significativamente acima do esperado. Você possui habilidades latentes que merecem ser exploradas.';
        } else if (percentAboveChance > 0) {
            analysisText = 'Interessante. Seu desempenho foi ligeiramente acima do acaso. Há indícios de uma sensibilidade que pode ser desenvolvida.';
        } else {
            analysisText = 'Seu desempenho esteve dentro do esperado pelo acaso. Isso não significa ausência de habilidade, apenas que ela pode estar adormecida no momento.';
        }
        this.analysisText.setText(analysisText);
    }
    
    // Close the challenge system
    close() {
        // Fade out animation
        this.scene.tweens.add({
            targets: this.container,
            alpha: 0,
            duration: 500,
            onComplete: () => {
                this.container.setVisible(false);
                this.overlay.setVisible(false);
                this.isActive = false;
                this.currentChallenge = null;
            }
        });
        
        // Fade back to previous music
        if (this.scene.audioManager) {
            this.scene.audioManager.playMusic('asylum_ambience', {
                volume: 0.3,
                crossFade: true,
                fadeInDuration: 2000
            });
        }
    }
    
    // Update method for animation effects
    update() {
        // Add any per-frame updates here
    }
}

