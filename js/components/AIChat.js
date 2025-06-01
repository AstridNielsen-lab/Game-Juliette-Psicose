// AI Chat Component - Provides hints and guidance using Gemini API

class AIChat {
    constructor(scene, options = {}) {
        this.scene = scene;
        this.options = Object.assign({
            x: scene.cameras.main.width / 2,           // X position of chat window
            y: scene.cameras.main.height / 2,          // Y position of chat window
            width: 500,                                // Chat window width
            height: 400,                               // Chat window height
            backgroundColor: 0x000000,                 // Background color
            backgroundAlpha: 0.8,                      // Background alpha
            borderColor: 0x9e1e63,                     // Border color
            textColor: '#ffffff',                      // Text color
            fontFamily: 'Georgia',                     // Font family
            fontSize: 18,                              // Font size
            avatarSize: 40,                            // Size of AI avatar
            aiName: 'ARIA',                            // AI assistant name
            aiAvatar: 'assets/images/ai-avatar.png',   // AI avatar image
            apiKey: 'AIzaSyBAUeMGmXN5Cfyo4Rp-83pBZCV4suJRBvQ', // Gemini API key
            apiUrl: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent', // API URL
            visible: false,                            // Initially visible?
            depth: 1000                                // Z-index
        }, options);
        
        // Chat history
        this.messages = [
            {
                role: 'ai',
                content: "Olá, sou ARIA, sua assistente em Juliette Psicose. Posso oferecer dicas enigmáticas, mas jamais revelarei as soluções diretamente. Como posso ajudar?"
            }
        ];
        
        // Create chat container
        this.container = this.scene.add.container(this.options.x, this.options.y)
            .setDepth(this.options.depth)
            .setVisible(this.options.visible);
        
        // Create chat window
        this.createChatWindow();
        
        // Setup input
        this.setupInput();
        
        // Initial render
        this.renderMessages();
    }
    
    createChatWindow() {
        // Background
        this.background = this.scene.add.rectangle(
            0,
            0,
            this.options.width,
            this.options.height,
            this.options.backgroundColor,
            this.options.backgroundAlpha
        );
        this.container.add(this.background);
        
        // Border
        this.border = this.scene.add.rectangle(
            0,
            0,
            this.options.width + 4,
            this.options.height + 4,
            this.options.borderColor
        ).setStrokeStyle(2, this.options.borderColor);
        this.container.add(this.border);
        
        // Title bar
        this.titleBar = this.scene.add.rectangle(
            0,
            -this.options.height / 2 + 15,
            this.options.width,
            30,
            this.options.borderColor
        );
        this.container.add(this.titleBar);
        
        // Title text
        this.titleText = this.scene.add.text(
            0,
            -this.options.height / 2 + 15,
            `Chat com ${this.options.aiName}`,
            {
                fontFamily: this.options.fontFamily,
                fontSize: this.options.fontSize,
                fill: '#ffffff'
            }
        ).setOrigin(0.5);
        this.container.add(this.titleText);
        
        // Close button
        this.closeButton = this.scene.add.circle(
            this.options.width / 2 - 20,
            -this.options.height / 2 + 15,
            10,
            0xff0000
        ).setInteractive({ useHandCursor: true });
        this.container.add(this.closeButton);
        
        this.closeButton.on('pointerdown', () => {
            this.hide();
        });
        
        // Messages container with mask for scrolling
        this.messagesContainer = this.scene.add.container(0, 0);
        this.container.add(this.messagesContainer);
        
        // Create a mask for the messages
        const messageMask = this.scene.add.graphics()
            .fillStyle(0xffffff)
            .fillRect(
                -this.options.width / 2,
                -this.options.height / 2 + 30,
                this.options.width,
                this.options.height - 80
            );
            
        this.messagesContainer.setMask(new Phaser.Display.Masks.GeometryMask(this.scene, messageMask));
        
        // Input area
        this.inputBg = this.scene.add.rectangle(
            0,
            this.options.height / 2 - 25,
            this.options.width - 20,
            40,
            0x333333
        );
        this.container.add(this.inputBg);
        
        // Create HTML input for typing (Phaser doesn't have good text input)
        this.createHtmlInput();
    }
    
    createHtmlInput() {
        // Create an HTML input element for typing
        const inputElement = document.createElement('input');
        inputElement.type = 'text';
        inputElement.placeholder = 'Digite sua pergunta...';
        inputElement.style.position = 'absolute';
        inputElement.style.width = (this.options.width - 100) + 'px';
        inputElement.style.height = '30px';
        inputElement.style.padding = '5px';
        inputElement.style.backgroundColor = '#333';
        inputElement.style.color = '#fff';
        inputElement.style.border = '1px solid #9e1e63';
        inputElement.style.borderRadius = '5px';
        inputElement.style.fontFamily = this.options.fontFamily;
        inputElement.style.fontSize = '16px';
        inputElement.style.display = 'none'; // Hidden by default
        
        document.body.appendChild(inputElement);
        this.inputElement = inputElement;
        
        // Send button
        this.sendButton = this.scene.add.rectangle(
            this.options.width / 2 - 30,
            this.options.height / 2 - 25,
            60,
            30,
            this.options.borderColor
        ).setInteractive({ useHandCursor: true });
        this.container.add(this.sendButton);
        
        this.sendText = this.scene.add.text(
            this.options.width / 2 - 30,
            this.options.height / 2 - 25,
            'Enviar',
            {
                fontFamily: this.options.fontFamily,
                fontSize: 14,
                fill: '#ffffff'
            }
        ).setOrigin(0.5);
        this.container.add(this.sendText);
        
        this.sendButton.on('pointerdown', () => {
            this.sendMessage();
        });
        
        // Handle input positioning
        this.scene.scale.on('resize', this.positionInput, this);
        this.container.on('dragend', this.positionInput, this);
    }
    
    positionInput() {
        if (this.container.visible && this.inputElement) {
            const scale = this.scene.scale;
            const bounds = this.scene.scale.canvasBounds;
            
            // Calculate world position of the input box
            const worldX = this.container.x - this.options.width / 2 + 60;
            const worldY = this.container.y + this.options.height / 2 - 25;
            
            // Convert to screen coordinates
            const screenX = bounds.x + worldX * scale.displayScale.x;
            const screenY = bounds.y + worldY * scale.displayScale.y;
            
            // Position the HTML input
            this.inputElement.style.left = screenX + 'px';
            this.inputElement.style.top = (screenY - 15) + 'px'; // Adjust vertical alignment
            
            // Only show when chat is visible
            this.inputElement.style.display = this.container.visible ? 'block' : 'none';
        }
    }
    
    setupInput() {
        // Make chat window draggable
        this.scene.input.setDraggable(this.background);
        
        this.background.on('drag', (pointer, dragX, dragY) => {
            this.container.x = dragX;
            this.container.y = dragY;
            this.positionInput();
        });
        
        // Handle pressing Enter in the input field
        this.inputElement.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                this.sendMessage();
            }
        });
    }
    
    sendMessage() {
        const message = this.inputElement.value.trim();
        if (message === '') return;
        
        // Add user message to chat
        this.messages.push({
            role: 'user',
            content: message
        });
        
        // Clear input
        this.inputElement.value = '';
        
        // Update chat display
        this.renderMessages();
        
        // Generate AI response
        this.generateAIResponse(message);
    }
    
    async generateAIResponse(userMessage) {
        // Add loading indicator
        const loadingMessage = {
            role: 'ai',
            content: '...',
            isLoading: true
        };
        this.messages.push(loadingMessage);
        this.renderMessages();
        
        try {
            // Prepare context about the game
            const gameContext = 
                "Você é ARIA, uma assistente de IA que ajuda jogadores no jogo de horror psicológico 'Juliette Psicose'. " +
                "O jogo é sobre Juliette, uma jornalista injustamente internada em um asilo após descobrir uma conspiração. " +
                "Suas respostas devem ser misteriosas, poéticas e enigmáticas, nunca revelando diretamente as soluções dos puzzles. " +
                "Ofereça apenas dicas sutis que incentivem o jogador a pensar. " +
                "Use metáforas e linguagem que evoque a atmosfera de suspense psicológico do jogo. " +
                "Mantenha suas respostas curtas (máximo 3 frases) e com tom misterioso.";
            
            // Prepare the chat history for the API
            const prompt = {
                "contents": [
                    {
                        "role": "user",
                        "parts": [{ "text": gameContext }]
                    },
                    {
                        "role": "model",
                        "parts": [{ "text": "Compreendido. Sou ARIA, sua guia enigmática nos labirintos da mente de Juliette. O que deseja saber, viajante?" }]
                    },
                    {
                        "role": "user",
                        "parts": [{ "text": userMessage }]
                    }
                ]
            };
            
            // Make the API request
            const response = await fetch(`${this.options.apiUrl}?key=${this.options.apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(prompt)
            });
            
            const responseData = await response.json();
            
            // Process the response
            let aiResponse = "Não consigo processar sua pergunta agora. A verdade às vezes se esconde nas sombras...";
            
            if (responseData.candidates && responseData.candidates[0] && responseData.candidates[0].content) {
                aiResponse = responseData.candidates[0].content.parts[0].text;
            }
            
            // Remove loading message
            this.messages.pop();
            
            // Add actual AI response
            this.messages.push({
                role: 'ai',
                content: aiResponse
            });
            
            // Update the chat display
            this.renderMessages();
            
            // Speak the response
            if (window.ttsManager) {
                window.ttsManager.speak(aiResponse, {
                    pitch: 1.2,  // Higher for female voice
                    rate: 0.9
                });
            }
            
        } catch (error) {
            console.error('Error generating AI response:', error);
            
            // Remove loading message
            this.messages.pop();
            
            // Add error message
            this.messages.push({
                role: 'ai',
                content: "As trevas obscurecem minha visão... Não consigo acessar a resposta neste momento."
            });
            
            // Update the chat display
            this.renderMessages();
        }
    }
    
    renderMessages() {
        // Clear previous messages
        this.messagesContainer.removeAll();
        
        let yOffset = -this.options.height / 2 + 50;
        
        // Render each message
        this.messages.forEach((message, index) => {
            const isAI = message.role === 'ai';
            const textColor = isAI ? '#b39ddb' : '#ffffff';
            const bgColor = isAI ? 0x333333 : 0x444444;
            const alignX = isAI ? -this.options.width / 2 + 30 : -this.options.width / 2 + 50;
            const bubbleWidth = this.options.width - 80;
            
            // Message text
            const textObject = this.scene.add.text(
                alignX,
                yOffset,
                isAI ? `${this.options.aiName}: ${message.content}` : `Você: ${message.content}`,
                {
                    fontFamily: this.options.fontFamily,
                    fontSize: this.options.fontSize,
                    fill: textColor,
                    wordWrap: { width: bubbleWidth - 20 }
                }
            );
            
            // Calculate bubble height based on text height
            const bubbleHeight = textObject.height + 20;
            
            // Message bubble
            const bubble = this.scene.add.rectangle(
                alignX + bubbleWidth / 2 - 10,
                yOffset + bubbleHeight / 2 - 10,
                bubbleWidth,
                bubbleHeight,
                bgColor,
                0.7
            ).setStrokeStyle(1, isAI ? this.options.borderColor : 0x555555);
            
            // Add to container in the right order (bubble behind text)
            this.messagesContainer.add(bubble);
            this.messagesContainer.add(textObject);
            
            // If it's a loading message, add animation
            if (message.isLoading) {
                const dots = this.scene.add.text(
                    alignX + 80,
                    yOffset,
                    '...',
                    {
                        fontFamily: this.options.fontFamily,
                        fontSize: this.options.fontSize,
                        fill: textColor
                    }
                );
                this.messagesContainer.add(dots);
                
                // Animate the dots
                this.scene.tweens.add({
                    targets: dots,
                    alpha: 0.3,
                    yoyo: true,
                    repeat: -1,
                    duration: 500
                });
            }
            
            // Update yOffset for next message
            yOffset += bubbleHeight + 10;
        });
        
        // Auto-scroll to bottom
        if (yOffset > this.options.height - 100) {
            this.messagesContainer.y = -yOffset + this.options.height - 100;
        }
    }
    
    show() {
        this.container.setVisible(true);
        if (this.inputElement) {
            this.positionInput();
        }
        
        // Apply a fade-in effect
        this.container.alpha = 0;
        this.scene.tweens.add({
            targets: this.container,
            alpha: 1,
            duration: 300
        });
        
        return this;
    }
    
    hide() {
        // Fade out
        this.scene.tweens.add({
            targets: this.container,
            alpha: 0,
            duration: 300,
            onComplete: () => {
                this.container.setVisible(false);
                if (this.inputElement) {
                    this.inputElement.style.display = 'none';
                }
            }
        });
        
        return this;
    }
    
    toggle() {
        if (this.container.visible) {
            this.hide();
        } else {
            this.show();
        }
        
        return this;
    }
    
    destroy() {
        // Remove HTML element
        if (this.inputElement && this.inputElement.parentNode) {
            this.inputElement.parentNode.removeChild(this.inputElement);
        }
        
        // Remove event listeners
        this.scene.scale.off('resize', this.positionInput, this);
        
        // Destroy container and all children
        this.container.destroy();
        
        return this;
    }
}

