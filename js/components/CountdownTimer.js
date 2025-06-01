// Countdown Timer - Creates and manages a visual countdown timer

class CountdownTimer {
    constructor(scene, options = {}) {
        this.scene = scene;
        this.options = Object.assign({
            x: scene.cameras.main.width / 2,       // X position
            y: 50,                                // Y position
            duration: 60000,                      // Duration in ms (default: 60 seconds)
            fontSize: 32,                         // Font size
            fontFamily: 'Georgia',                // Font family
            textColor: '#ffffff',                 // Text color
            warningColor: '#ffff00',              // Color when time is running low
            criticalColor: '#ff0000',             // Color when time is critical
            warningThreshold: 0.5,                // Percentage of time when warning color shows
            criticalThreshold: 0.25,              // Percentage of time when critical color shows
            strokeColor: '#000000',               // Text stroke color
            strokeWidth: 2,                       // Text stroke width
            showMilliseconds: false,              // Whether to show milliseconds
            paused: false,                        // Whether timer starts paused
            onComplete: null,                     // Callback when timer completes
            onTick: null,                         // Callback on each tick (second change)
            timeFormat: 'MM:SS',                  // Time format (MM:SS or M:SS)
            pulse: true,                          // Whether to pulse when time is low
            pulseTint: 0xff0000,                  // Tint color for pulse effect
            pulseThreshold: 0.25,                 // When to start pulsing (as percentage of total)
            soundEffect: null,                    // Tick sound effect
            criticalSoundEffect: null,            // Sound when time is critical
            autoDestroy: true                     // Whether to destroy timer on completion
        }, options);
        
        // Internal properties
        this.timeLeft = this.options.duration;
        this.startTime = null;
        this.timerEvent = null;
        this.lastSecond = Math.ceil(this.timeLeft / 1000);
        this.isRunning = false;
        this.isComplete = false;
        
        // Create the timer text
        this.timerText = this.scene.add.text(
            this.options.x,
            this.options.y,
            this.formatTime(this.timeLeft),
            {
                fontFamily: this.options.fontFamily,
                fontSize: `${this.options.fontSize}px`,
                fill: this.options.textColor,
                stroke: this.options.strokeColor,
                strokeThickness: this.options.strokeWidth
            }
        ).setOrigin(0.5).setDepth(100);
        
        // Start the timer if not paused
        if (!this.options.paused) {
            this.start();
        }
    }
    
    start() {
        if (this.isRunning) return;
        
        this.startTime = Date.now();
        this.isRunning = true;
        this.isComplete = false;
        
        // Clear existing event if any
        if (this.timerEvent) {
            this.timerEvent.remove();
        }
        
        // Create update event
        this.timerEvent = this.scene.time.addEvent({
            delay: 50,  // Update frequently for smooth visuals
            callback: this.update,
            callbackScope: this,
            loop: true
        });
    }
    
    pause() {
        if (!this.isRunning) return;
        
        this.isRunning = false;
        this.timeLeft -= (Date.now() - this.startTime);
        
        if (this.timerEvent) {
            this.timerEvent.remove();
            this.timerEvent = null;
        }
    }
    
    resume() {
        if (this.isRunning || this.isComplete) return;
        
        this.startTime = Date.now();
        this.isRunning = true;
        
        // Create update event
        this.timerEvent = this.scene.time.addEvent({
            delay: 50,
            callback: this.update,
            callbackScope: this,
            loop: true
        });
    }
    
    reset(newDuration = null) {
        // Stop the timer
        this.pause();
        
        // Reset to initial state or new duration
        this.timeLeft = newDuration !== null ? newDuration : this.options.duration;
        this.lastSecond = Math.ceil(this.timeLeft / 1000);
        this.isComplete = false;
        
        // Update the display
        this.timerText.setText(this.formatTime(this.timeLeft));
        this.timerText.setFill(this.options.textColor);
        
        // Start again if it was running
        if (this.isRunning) {
            this.start();
        }
    }
    
    update() {
        if (!this.isRunning || this.isComplete) return;
        
        // Calculate time left
        const elapsed = Date.now() - this.startTime;
        const newTimeLeft = Math.max(0, this.timeLeft - elapsed);
        
        // Update the timer text
        this.timerText.setText(this.formatTime(newTimeLeft));
        
        // Calculate completion percentage for color changes
        const completionPercentage = newTimeLeft / this.options.duration;
        
        // Update color based on time left
        if (completionPercentage <= this.options.criticalThreshold) {
            this.timerText.setFill(this.options.criticalColor);
            
            // Apply pulse effect for critical time
            if (this.options.pulse && completionPercentage <= this.options.pulseThreshold) {
                const pulseFactor = 0.8 + Math.sin(Date.now() / 100) * 0.2;
                this.timerText.setScale(pulseFactor);
                
                // Play critical sound if available and not already played
                if (this.options.criticalSoundEffect && 
                    Math.floor(newTimeLeft / 1000) !== Math.floor(this.timeLeft / 1000)) {
                    this.scene.sound.play(this.options.criticalSoundEffect, { volume: 0.7 });
                }
            }
        } else if (completionPercentage <= this.options.warningThreshold) {
            this.timerText.setFill(this.options.warningColor);
            this.timerText.setScale(1); // Reset scale if not critical
        } else {
            this.timerText.setFill(this.options.textColor);
            this.timerText.setScale(1); // Reset scale if not critical
        }
        
        // Check for tick (second change)
        const currentSecond = Math.ceil(newTimeLeft / 1000);
        if (currentSecond !== this.lastSecond) {
            this.lastSecond = currentSecond;
            
            // Play tick sound if available
            if (this.options.soundEffect) {
                this.scene.sound.play(this.options.soundEffect, { volume: 0.5 });
            }
            
            // Call tick callback if provided
            if (this.options.onTick) {
                this.options.onTick(currentSecond, completionPercentage);
            }
        }
        
        // Check if timer is complete
        if (newTimeLeft <= 0) {
            this.complete();
        } else {
            // Update internal timeLeft for pause functionality
            this.timeLeft = newTimeLeft;
        }
    }
    
    complete() {
        this.isRunning = false;
        this.isComplete = true;
        this.timeLeft = 0;
        
        // Update display
        this.timerText.setText(this.formatTime(0));
        this.timerText.setFill(this.options.criticalColor);
        
        // Remove timer event
        if (this.timerEvent) {
            this.timerEvent.remove();
            this.timerEvent = null;
        }
        
        // Call completion callback if provided
        if (this.options.onComplete) {
            this.options.onComplete();
        }
        
        // Auto destroy if enabled
        if (this.options.autoDestroy) {
            this.destroy();
        }
    }
    
    formatTime(ms) {
        // Convert to seconds
        const totalSeconds = Math.ceil(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        
        // Format based on options
        if (this.options.timeFormat === 'MM:SS') {
            return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        } else {
            return `${minutes}:${String(seconds).padStart(2, '0')}`;
        }
    }
    
    // Add time to the timer (positive values add time, negative reduce)
    addTime(milliseconds) {
        if (!this.isRunning || this.isComplete) return;
        
        // Pause to update timeLeft
        this.pause();
        
        // Add time (but don't go below zero)
        this.timeLeft = Math.max(0, this.timeLeft + milliseconds);
        
        // Resume
        this.resume();
    }
    
    // Set visibility
    setVisible(visible) {
        this.timerText.setVisible(visible);
        return this;
    }
    
    // Set position
    setPosition(x, y) {
        this.timerText.setPosition(x, y);
        return this;
    }
    
    // Get remaining time in milliseconds
    getRemainingTime() {
        if (this.isRunning) {
            const elapsed = Date.now() - this.startTime;
            return Math.max(0, this.timeLeft - elapsed);
        }
        return this.timeLeft;
    }
    
    // Destroy the timer
    destroy() {
        if (this.timerEvent) {
            this.timerEvent.remove();
        }
        
        if (this.timerText) {
            this.timerText.destroy();
        }
    }
}

