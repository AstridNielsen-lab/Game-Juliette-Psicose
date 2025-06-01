// Text-to-Speech Manager - Handles voice synthesis for game messages

class TextToSpeechManager {
    constructor(options = {}) {
        this.options = Object.assign({
            enabled: true,           // Whether TTS is enabled
            voice: null,             // Specific voice to use (null = default)
            rate: 1.0,               // Speech rate (0.1 to 10)
            pitch: 1.0,              // Speech pitch (0 to 2)
            volume: 1.0,             // Speech volume (0 to 1)
            lang: 'pt-BR',           // Language for speech synthesis
            voiceURI: null,          // Specific voice URI to use if available
            onStart: null,           // Callback when speech starts
            onEnd: null,             // Callback when speech ends
            onError: null,           // Callback on error
            onNoSupport: null        // Callback if speech synthesis not supported
        }, options);

        // Check if browser supports speech synthesis
        this.supported = 'speechSynthesis' in window;
        
        if (!this.supported) {
            console.warn("Text-to-speech is not supported in this browser.");
            if (this.options.onNoSupport) {
                this.options.onNoSupport();
            }
            return;
        }
        
        this.synth = window.speechSynthesis;
        this.voices = [];
        
        // Load available voices
        this.loadVoices();
        
        // Handle cases where voices may load asynchronously
        if (speechSynthesis.onvoiceschanged !== undefined) {
            speechSynthesis.onvoiceschanged = this.loadVoices.bind(this);
        }
        
        // Queue for managing multiple speech requests
        this.queue = [];
        this.speaking = false;
    }
    
    loadVoices() {
        // Get list of available voices
        this.voices = this.synth.getVoices();
        
        // Try to find the requested voice
        if (this.options.voiceURI) {
            this.selectedVoice = this.voices.find(voice => voice.voiceURI === this.options.voiceURI);
        }
        
        // If no specific voice requested or not found, try to get a voice matching the language
        if (!this.selectedVoice && this.options.lang) {
            this.selectedVoice = this.voices.find(voice => voice.lang === this.options.lang);
        }
        
        // If still no voice, just use the first one
        if (!this.selectedVoice && this.voices.length > 0) {
            this.selectedVoice = this.voices[0];
        }
    }
    
    speak(text, options = {}) {
        if (!this.supported || !this.options.enabled) return false;
        
        // Merge default options with provided options
        const speakOptions = Object.assign({}, this.options, options);
        
        // Create utterance
        const utterance = new SpeechSynthesisUtterance(text);
        
        // Set utterance properties
        utterance.voice = speakOptions.voice || this.selectedVoice;
        utterance.rate = speakOptions.rate;
        utterance.pitch = speakOptions.pitch;
        utterance.volume = speakOptions.volume;
        utterance.lang = speakOptions.lang;
        
        // Set event handlers
        utterance.onstart = () => {
            this.speaking = true;
            if (speakOptions.onStart) speakOptions.onStart();
        };
        
        utterance.onend = () => {
            this.speaking = false;
            if (speakOptions.onEnd) speakOptions.onEnd();
            this.processQueue(); // Process next item in queue
        };
        
        utterance.onerror = (event) => {
            this.speaking = false;
            if (speakOptions.onError) speakOptions.onError(event);
            this.processQueue(); // Process next item in queue
        };
        
        // Add to queue and process immediately if not already speaking
        this.queue.push(utterance);
        if (!this.speaking) {
            this.processQueue();
        }
        
        return true;
    }
    
    processQueue() {
        if (this.queue.length === 0 || this.speaking) return;
        
        const utterance = this.queue.shift();
        this.synth.speak(utterance);
    }
    
    cancel() {
        if (!this.supported) return;
        
        this.queue = [];
        this.synth.cancel();
        this.speaking = false;
    }
    
    pause() {
        if (!this.supported) return;
        this.synth.pause();
    }
    
    resume() {
        if (!this.supported) return;
        this.synth.resume();
    }
    
    // Change voice settings
    setVoice(voiceURI) {
        if (!this.supported) return;
        
        const voice = this.voices.find(v => v.voiceURI === voiceURI);
        if (voice) {
            this.selectedVoice = voice;
            this.options.voiceURI = voiceURI;
        }
    }
    
    // Change language
    setLanguage(lang) {
        if (!this.supported) return;
        
        this.options.lang = lang;
        
        // Try to find a voice for this language
        const voice = this.voices.find(v => v.lang === lang);
        if (voice) {
            this.selectedVoice = voice;
        }
    }
    
    // Enable/disable speech
    setEnabled(enabled) {
        this.options.enabled = enabled;
        if (!enabled) {
            this.cancel();
        }
    }
    
    // Get available voices
    getVoices() {
        return this.voices;
    }
    
    // Get current settings
    getSettings() {
        return this.options;
    }
}

