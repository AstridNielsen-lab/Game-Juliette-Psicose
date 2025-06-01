// Chapter 1 Scene: "No Espelho da Mente"
// Juliette wakes up in an asylum and must escape using mental puzzles

class Chapter1Scene extends Phaser.Scene {
    constructor() {
        super({ key: 'Chapter1Scene' });
    }

    preload() {
        // Load assets for Chapter 1
        this.load.image('bg-asylum', 'assets/images/asylum.jpg');
        this.load.image('mirror', 'assets/images/mirror.png');
        this.load.image('juliette', 'assets/images/juliette.png');
        this.load.image('asylum-door', 'assets/images/door.png');
        this.load.image('key', 'assets/images/key.png');
        
        // Load audio
        this.load.audio('chapter1-music', 'assets/audio/chapter1-theme.mp3');
        this.load.audio('heartbeat', 'assets/audio/heartbeat.mp3');
        this.load.audio('glass-break', 'assets/audio/glass-break.mp3');
        
        // Load dialog box assets
        this.load.image('dialog-box', 'assets/images/dialog-box.png');
        
        // Loading text (placeholder for actual loading screen)
        const loadingText = this.add.text(
            this.cameras.main.width / 2, 
            this.cameras.main.height / 2, 
            'Entrando na visão...', 
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
        // Set up chapter
        this.chapterTitle = "No Espelho da Mente";
        gameState.currentEpisode = "Visão da Injustiça";
        
        // Initialize dialog system
        this.dialogSystem = new DialogSystem(this);
        
        // Create panic bot for anxiety-inducing messages
        this.panicBot = new PanicBot(this, {
            minDelay: 8000,
            maxDelay: 15000,
            messageY: 150,
            enabled: false // Start disabled, will enable during challenges
        });
        
        // Create background (placeholder in this demo)
        const bg = this.add.rectangle(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            this.cameras.main.width,
            this.cameras.main.height,
            0x111111
        );
        
        // Add chapter title
        const titleText = this.add.text(
            this.cameras.main.width / 2,
            100,
            this.chapterTitle,
            {
                font: '48px Georgia',
                fill: '#9e1e63',
                stroke: '#000',
                strokeThickness: 4
            }
        ).setOrigin(0.5).setAlpha(0);
        
        // Fade in title
        this.tweens.add({
            targets: titleText,
            alpha: 1,
            duration: 2000,
            ease: 'Power2',
            onComplete: () => {
                // Hold for a moment then fade out
                this.time.delayedCall(3000, () => {
                    this.tweens.add({
                        targets: titleText,
                        alpha: 0,
                        duration: 1500,
                        onComplete: () => {
                            titleText.destroy();
                            this.startChapter();
                        }
                    });
                });
            }
        });
        
        // Create asylum room (placeholder)
        this.roomContainer = this.add.container(0, 0).setAlpha(0);
        
        // Walls
        const walls = this.add.rectangle(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            800,
            500,
            0x333333
        );
        this.roomContainer.add(walls);
        
        // Floor
        const floor = this.add.rectangle(
            this.cameras.main.width / 2,
            this.cameras.main.height - 100,
            800,
            200,
            0x222222
        );
        this.roomContainer.add(floor);
        
        // Door
        const door = this.add.rectangle(
            this.cameras.main.width / 2 + 300,
            this.cameras.main.height - 200,
            80,
            160,
            0x4a3728
        ).setInteractive({ useHandCursor: true });
        door.name = 'door';
        this.roomContainer.add(door);
        
        // Door handle
        const doorHandle = this.add.circle(
            door.x + 25,
            door.y,
            5,
            0xc0c0c0
        );
        this.roomContainer.add(doorHandle);
        
        // Bed
        const bed = this.add.rectangle(
            this.cameras.main.width / 2 - 250,
            this.cameras.main.height - 150,
            150,
            80,
            0x496882
        );
        this.roomContainer.add(bed);
        
        // Mirror
        const mirror = this.add.rectangle(
            this.cameras.main.width / 2,
            this.cameras.main.height - 250,
            120,
            200,
            0xc0c0c0,
            0.7
        ).setInteractive({ useHandCursor: true });
        mirror.name = 'mirror';
        this.roomContainer.add(mirror);
        
        // Mirror frame
        const mirrorFrame = this.add.rectangle(
            mirror.x,
            mirror.y,
            130,
            210,
            0x222222
        ).setDepth(-1);
        this.roomContainer.add(mirrorFrame);
        
        // Set up interactions
        this.setupInteractions();
        
        // Start background sounds
        // this.sound.play('chapter1-music', { loop: true, volume: 0.3 });
        
        // For game state tracking
        this.mirrorInspected = false;
        this.doorInspected = false;
        this.hasKey = false;
    }
    
    startChapter() {
        // Fade in the room
        this.tweens.add({
            targets: this.roomContainer,
            alpha: 1,
            duration: 2000,
            ease: 'Power2',
            onComplete: () => {
                // Start intro dialog
                this.startIntroDialog();
            }
        });
    }
    
    // Timer challenge system
    startChallenge(duration = 30000, onComplete = null, onFail = null) {
        // Create a countdown timer
        this.challengeTimer = new CountdownTimer(this, {
            duration: duration,
            onComplete: () => {
                // Time's up - challenge failed
                if (onFail) onFail();
                
                // Stop the panic bot
                this.panicBot.stop();
                
                // Save challenge result
                const results = JSON.parse(localStorage.getItem('juliettePsicose_challengeResults') || '[]');
                results.push({
                    challenge: gameState.currentEpisode,
                    timestamp: new Date().toISOString(),
                    success: false,
                    timeLeft: 0
                });
                localStorage.setItem('juliettePsicose_challengeResults', JSON.stringify(results));
            },
            warningThreshold: 0.6,
            criticalThreshold: 0.3,
            pulse: true
        });
        
        // Activate the panic bot with increasing intensity
        this.panicBot.start();
        
        // Increase panic as time goes on
        const intensityTimer = this.time.addEvent({
            delay: duration / 10,
            callback: () => {
                const timeLeft = this.challengeTimer.getRemainingTime();
                const intensity = 1 - (timeLeft / duration);
                this.panicBot.setIntensity(intensity);
            },
            repeat: 9
        });
        
        // Method to complete the challenge
        this.completeChallenge = () => {
            // Get remaining time
            const timeLeft = this.challengeTimer.getRemainingTime();
            
            // Stop the timer
            this.challengeTimer.pause();
            this.challengeTimer.destroy();
            
            // Stop the panic bot
            this.panicBot.stop();
            
            // Clean up
            intensityTimer.remove();
            
            // Save challenge result
            const results = JSON.parse(localStorage.getItem('juliettePsicose_challengeResults') || '[]');
            results.push({
                challenge: gameState.currentEpisode,
                timestamp: new Date().toISOString(),
                success: true,
                timeLeft: timeLeft
            });
            localStorage.setItem('juliettePsicose_challengeResults', JSON.stringify(results));
            
            // Call success callback
            if (onComplete) onComplete(timeLeft);
        };
        
        return {
            timer: this.challengeTimer,
            complete: this.completeChallenge
        };
    }
    
    startIntroDialog() {
        // Setup the narrative dialog
        this.dialogSystem
            .addDialog("Onde... onde estou?", "Juliette")
            .addDialog("Minha cabeça dói. Estas paredes... este lugar...", "Juliette")
            .addDialog("Você está no Asilo Santa Claridade. Você teve outro... episódio.", "Voz Desconhecida")
            .addDialog("Não! Não foram alucinações. Eu vi a verdade! A corrupção, as mentiras!", "Juliette")
            .addChoice("O que devo fazer?", [
                {
                    text: "Examinar o quarto cuidadosamente",
                    karma: 1,
                    callback: () => {
                        this.dialogSystem
                            .addDialog("Preciso entender este lugar. Há algo errado aqui...", "Juliette")
                            .addDialog("O espelho parece... diferente. Como se algo estivesse além dele.");
                    }
                },
                {
                    text: "Gritar por ajuda",
                    karma: -1,
                    callback: () => {
                        this.dialogSystem
                            .addDialog("ALGUÉM ME AJUDE! ESTOU PRESA!", "Juliette")
                            .addDialog("Apenas silêncio responde aos seus gritos. Talvez não seja sábio chamar atenção.");
                    }
                },
                {
                    text: "Concentrar-se e tentar lembrar",
                    karma: 2,
                    callback: () => {
                        this.dialogSystem
                            .addDialog("Preciso me concentrar... lembrar como vim parar aqui.", "Juliette")
                            .addDialog("Imagens fragmentadas surgem... você discursando numa praça... policiais... um julgamento apressado.");
                    }
                }
            ])
            .addDialog("O espelho na parede parece estar chamando por você. Talvez deva examiná-lo mais de perto.")
            .onDialogComplete(() => {
                // Add a hint effect to the mirror
                this.tweens.add({
                    targets: this.roomContainer.getByName('mirror'),
                    alpha: 0.9,
                    yoyo: true,
                    repeat: 3,
                    duration: 300
                });
            })
            .start();
    }
    
    setupInteractions() {
        // Mirror interaction
        const mirror = this.roomContainer.getByName('mirror');
        mirror.on('pointerdown', () => {
            this.interactWithMirror();
        });
        
        // Door interaction
        const door = this.roomContainer.getByName('door');
        door.on('pointerdown', () => {
            this.interactWithDoor();
        });
    }
    
    interactWithMirror() {
        if (this.dialogSystem.isDialogActive) return;
        
        this.mirrorInspected = true;
        
        // Play sound effect
        // this.sound.play('heartbeat', { volume: 0.5 });
        
        // Start a challenge timer for the mirror puzzle
        this.mirrorChallenge = this.startChallenge(45000, 
            (timeLeft) => {
                // Challenge completed successfully - will be called by completeChallenge()
                console.log('Mirror challenge completed with ' + timeLeft + 'ms remaining');
                gameState.karma += 2; // Bonus for completing quickly
            }, 
            () => {
                // Challenge failed - timer ran out
                console.log('Mirror challenge failed');
                gameState.karma -= 1;
                this.dialogSystem
                    .addDialog("*Você demorou demais para reagir*")
                    .addDialog("*O reflexo desaparece, deixando apenas um vislumbre de desapontamento*")
                    .start();
            }
        );
        
        // Apply glitch effect to mirror
        VisualEffects.applyGlitch(this, this.roomContainer.getByName('mirror'), 2, 1500);
        
        // Mirror dialog
        this.dialogSystem
            .addDialog("Esse espelho... há algo estranho nele.", "Juliette")
            .addDialog("A superfície ondula como água quando me aproximo...")
            .addDialog("Vejo meu reflexo, mas... não sou eu. Ou sou? Os olhos... têm um brilho diferente.")
            .addDialog("*O reflexo sorri quando você não está sorrindo*", "Reflexo")
            .addDialog("Precisamos conversar, Juliette.", "Reflexo")
            .addChoice("Como devo responder?", [
                {
                    text: "Quem é você?",
                    callback: () => {
                        this.dialogSystem
                            .addDialog("Quem é você? Como sabe meu nome?", "Juliette")
                            .addDialog("Eu sou você. A parte que eles tentam silenciar com remédios e confinamento.", "Reflexo")
                            .addDialog("Lembra-se da praça? Do seu discurso? Do que você viu nos arquivos do juiz?", "Reflexo");
                    }
                },
                {
                    text: "Você não é real",
                    karma: -1,
                    callback: () => {
                        this.dialogSystem
                            .addDialog("Você não é real. É só outro delírio.", "Juliette")
                            .addDialog("*O reflexo ri*", "Reflexo")
                            .addDialog("É isso que eles querem que você pense. Que tudo o que você descobriu foi loucura.", "Reflexo");
                    }
                },
                {
                    text: "Ajude-me a sair daqui",
                    karma: 1,
                    callback: () => {
                        this.dialogSystem
                            .addDialog("Você pode me ajudar a sair daqui?", "Juliette")
                            .addDialog("É para isso que estou aqui. Mas primeiro você precisa lembrar-se.", "Reflexo")
                            .addDialog("Toque o espelho. Sinta a verdade fluir através dele.", "Reflexo");
                    }
                }
            ])
            .addDialog("*O reflexo coloca a mão na superfície do espelho*", "Reflexo")
            .addDialog("Toque o espelho, Juliette. Recupere suas memórias.", "Reflexo")
            .addChoice("O que fazer?", [
                {
                    text: "Tocar o espelho",
                    karma: 2,
                    callback: () => {
                        this.dialogSystem
                            .addDialog("*Você toca o espelho e ele ondula como água*")
                            .addDialog("*Uma sensação de eletricidade percorre seu corpo*")
                            .addDialog("*Fragmentos de memória inundam sua mente*")
                            .addDialog("A praça... o discurso... os documentos... o juiz corrompido...", "Juliette")
                            .addDialog("Agora você lembra. Eles te colocaram aqui porque você descobriu a verdade.", "Reflexo")
                            .addDialog("*O espelho racha e um objeto cai no chão*")
                            .addDialog("*Uma chave apareceu*");
                            
                        this.time.delayedCall(1500, () => {
                            this.giveKey();
                            // Complete the challenge
                            if (this.mirrorChallenge && this.completeChallenge) {
                                this.completeChallenge();
                            }
                        });
                    }
                },
                {
                    text: "Recuar com medo",
                    karma: -2,
                    callback: () => {
                        this.dialogSystem
                            .addDialog("*Você recua, temendo ser apenas mais uma alucinação*", "Juliette")
                            .addDialog("*O reflexo parece desapontado*", "Reflexo")
                            .addDialog("Você ainda não está pronta... mas o tempo se esgota.", "Reflexo")
                            .addDialog("*O espelho começa a rachar sozinho*")
                            .addDialog("Eu encontrarei outro caminho para te ajudar.", "Reflexo")
                            .addDialog("*Uma chave cai do espelho quebrado*");
                            
                        this.time.delayedCall(1500, () => {
                            this.giveKey();
                        });
                    }
                }
            ])
            .start();
    }
    
    giveKey() {
        // Play glass breaking sound
        // this.sound.play('glass-break', { volume: 0.7 });
        
        // Show key animation
        const key = this.add.rectangle(
            this.roomContainer.getByName('mirror').x,
            this.roomContainer.getByName('mirror').y + 120,
            20,
            40,
            0xd4af37
        );
        
        // Animate key falling
        this.tweens.add({
            targets: key,
            y: key.y + 30,
            duration: 500,
            ease: 'Bounce',
            onComplete: () => {
                // Add glimmer effect
                this.tweens.add({
                    targets: key,
                    alpha: 0.5,
                    yoyo: true,
                    repeat: 3,
                    duration: 200,
                    onComplete: () => {
                        key.setInteractive({ useHandCursor: true })
                            .on('pointerdown', () => {
                                key.destroy();
                                this.hasKey = true;
                                
                                this.dialogSystem
                                    .addDialog("*Você pega a chave*")
                                    .addDialog("Esta deve ser a chave para a porta. Preciso sair daqui.", "Juliette")
                                    .start();
                            });
                    }
                });
            }
        });
        
        // Add cracks to mirror
        this.addCracksToMirror();
    }
    
    addCracksToMirror() {
        const mirror = this.roomContainer.getByName('mirror');
        
        // In a real implementation, you would overlay a cracked texture
        // For now, we'll just change the color to simulate cracks
        mirror.fillColor = 0xa0a0a0;
        
        // Create simple crack lines
        const centerX = mirror.x;
        const centerY = mirror.y - 30;
        
        const cracks = [];
        
        // Add a few crack lines
        for (let i = 0; i < 5; i++) {
            const angle = Phaser.Math.Between(0, 360);
            const length = Phaser.Math.Between(30, 80);
            
            const endX = centerX + length * Math.cos(angle * Math.PI / 180);
            const endY = centerY + length * Math.sin(angle * Math.PI / 180);
            
            const line = this.add.line(0, 0, centerX, centerY, endX, endY, 0x000000);
            line.setLineWidth(1);
            line.setOrigin(0, 0);
            
            cracks.push(line);
            this.roomContainer.add(line);
            
            // Add branches to main cracks
            if (Phaser.Math.Between(0, 1) === 1) {
                const branchStartX = (centerX + endX) / 2;
                const branchStartY = (centerY + endY) / 2;
                const branchAngle = angle + Phaser.Math.Between(-45, 45);
                const branchLength = length * 0.4;
                
                const branchEndX = branchStartX + branchLength * Math.cos(branchAngle * Math.PI / 180);
                const branchEndY = branchStartY + branchLength * Math.sin(branchAngle * Math.PI / 180);
                
                const branch = this.add.line(0, 0, branchStartX, branchStartY, branchEndX, branchEndY, 0x000000);
                branch.setLineWidth(1);
                branch.setOrigin(0, 0);
                
                cracks.push(branch);
                this.roomContainer.add(branch);
            }
        }
    }
    
    interactWithDoor() {
        if (this.dialogSystem.isDialogActive) return;
        
        if (!this.doorInspected) {
            // First time checking the door
            this.doorInspected = true;
            
            this.dialogSystem
                .addDialog("A porta está trancada.", "Juliette")
                .addDialog("Preciso encontrar uma maneira de sair daqui.")
                .start();
        } else if (!this.hasKey) {
            // Already checked but don't have key
            this.dialogSystem
                .addDialog("Ainda está trancada. Preciso encontrar a chave.", "Juliette")
                .start();
        } else {
            // Start a door escape challenge
            const doorChallenge = this.startChallenge(30000, 
                (timeLeft) => {
                    // Door opened successfully
                    console.log('Door escape completed with ' + timeLeft + 'ms remaining');
                    gameState.karma += 1; // Bonus for quick escape
                }, 
                () => {
                    // Failed to escape in time
                    console.log('Door escape failed');
                    gameState.karma -= 2;
                    this.dialogSystem
                        .addDialog("*A fechadura parece ter travado novamente*")
                        .addDialog("*Você ouve passos se aproximando no corredor*")
                        .addDialog("Não! Preciso tentar de novo, rápido!", "Juliette")
                        .onDialogComplete(() => {
                            // Give player another chance
                            this.hasKey = true; // Keep the key
                        })
                        .start();
                }
            );
            
            // Have the key, can open the door
            this.dialogSystem
                .addDialog("*Você insere a chave na fechadura*")
                .addDialog("*Click* Está destrancada!", "Juliette")
                .addDialog("Agora posso sair daqui e descobrir o que está acontecendo.")
                .addDialog("*Ao abrir a porta, uma luz brilhante inunda o quarto*")
                .onDialogComplete(() => {
                    // Complete the challenge
                    if (doorChallenge && this.completeChallenge) {
                        this.completeChallenge();
                    }
                    this.completeChapter();
                })
                .start();
        }
    }
    
    completeChapter() {
        // Fade to white
        this.cameras.main.fade(3000, 255, 255, 255, false, (camera, progress) => {
            if (progress === 1) {
                // Show chapter completion message
                const completeText = this.add.text(
                    this.cameras.main.width / 2,
                    this.cameras.main.height / 2 - 50,
                    'Capítulo 1 Completo',
                    {
                        font: '48px Georgia',
                        fill: '#9e1e63',
                        stroke: '#000',
                        strokeThickness: 4
                    }
                ).setOrigin(0.5);
                
                // Show poetic message from Juliette
                const poemText = this.add.text(
                    this.cameras.main.width / 2,
                    this.cameras.main.height / 2 + 50,
                    'No espelho da mente, encontrei\nFragmentos da verdade que tanto busquei\nEntre delírios e clareza, um fino véu\nA injustiça é real, não é devaneio meu.',
                    {
                        font: '24px Georgia',
                        fill: '#333333',
                        align: 'center',
                        fontStyle: 'italic'
                    }
                ).setOrigin(0.5);
                
                // Add continue button
                this.time.delayedCall(4000, () => {
                    const continueButton = this.add.rectangle(
                        this.cameras.main.width / 2,
                        this.cameras.main.height / 2 + 150,
                        200,
                        50,
                        0x9e1e63
                    ).setInteractive({ useHandCursor: true });
                    
                    const continueText = this.add.text(
                        this.cameras.main.width / 2,
                        this.cameras.main.height / 2 + 150,
                        'Continuar',
                        {
                            font: '24px Georgia',
                            fill: '#ffffff'
                        }
                    ).setOrigin(0.5);
                    
                    continueButton.on('pointerdown', () => {
                        // In a full game, this would lead to Chapter 2
                        this.scene.start('MenuScene');
                    });
                });
            }
        });
    }
    
    update() {
        // Game update loop - would handle animations, movement, etc.
    }
}

