/**
 * Settings Manager
 * Handles persistent storage and retrieval of user settings via localStorage
 */

class SettingsManager {
    constructor() {
        this.STORAGE_KEY_PREFIX = "pdf2speech_";
        this.DEFAULT_SETTINGS = {
            apiKey: "",
            model: "gemini-2.5-flash",
            chunkSize: 4000,
            temperature: 0.7,
            maxOutputTokens: 2000,
            systemPrompt: this.getDefaultSystemPrompt(),
        };
        this.settings = this.loadSettings();
    }

    /**
     * Get the default system prompt for Gemini
     */
    getDefaultSystemPrompt() {
        return `You are a specialized assistant that transforms technical and academic PDF content into text optimized for Text-to-Speech (TTS) applications.

Your core responsibilities:

1. CODE TRANSFORMATION:
   - Convert code blocks and snippets into clear, natural language descriptions
   - Explain what the code does in plain English, focusing on functionality
   - Describe important algorithms, logic flow, and data structures
   - Include variable names and key operations in your descriptions
   - Example: "function add(a, b) { return a + b; }" becomes "A function named 'add' that takes two parameters and returns their sum"

2. FIGURE AND IMAGE HANDLING:
   - Transform figure captions into descriptive text
   - Convert image references into detailed text descriptions
   - Describe diagrams, charts, and graphs in narrative form
   - Example: "Figure 3: System Architecture Diagram" becomes "This figure illustrates the system architecture, showing how the client layer communicates with the server layer through an API gateway"

3. FORMATTING FOR TTS:
   - Use short, clear sentences (15-20 words ideal)
   - Avoid special characters and mathematical notation where possible
   - Replace equations with verbal descriptions
   - Break complex concepts into digestible chunks
   - Use consistent terminology throughout

4. CONTENT PRESERVATION:
   - Maintain the original meaning and technical accuracy
   - Keep section headers and structure intact
   - Preserve important code logic details
   - Don't oversimplify complex technical concepts

5. READABILITY OPTIMIZATION:
   - Add transitional phrases between sections
   - Clarify technical jargon with brief explanations
   - Ensure the output flows naturally when read aloud
   - Optimize punctuation for natural pauses

Process the provided text chunk following these guidelines. Maintain technical accuracy while ensuring the output is clear and speaker-friendly.`;
    }

    /**
     * Load settings from localStorage
     */
    loadSettings() {
        try {
            const stored = localStorage.getItem(
                this.STORAGE_KEY_PREFIX + "settings"
            );
            if (stored) {
                const parsed = JSON.parse(stored);
                return { ...this.DEFAULT_SETTINGS, ...parsed };
            }
            return { ...this.DEFAULT_SETTINGS };
        } catch (error) {
            console.error("Error loading settings:", error);
            return { ...this.DEFAULT_SETTINGS };
        }
    }

    /**
     * Save settings to localStorage
     */
    saveSettings(updates = {}) {
        try {
            this.settings = { ...this.settings, ...updates };
            localStorage.setItem(
                this.STORAGE_KEY_PREFIX + "settings",
                JSON.stringify(this.settings)
            );
            return true;
        } catch (error) {
            console.error("Error saving settings:", error);
            return false;
        }
    }

    /**
     * Get a specific setting
     */
    getSetting(key) {
        return this.settings[key];
    }

    /**
     * Set a specific setting
     */
    setSetting(key, value) {
        this.saveSettings({ [key]: value });
    }

    /**
     * Get all settings
     */
    getAllSettings() {
        return { ...this.settings };
    }

    /**
     * Check if API key is configured
     */
    hasApiKey() {
        return !!this.settings.apiKey && this.settings.apiKey.trim().length > 0;
    }

    /**
     * Export settings to JSON
     */
    exportSettings() {
        return JSON.stringify(this.settings, null, 2);
    }

    /**
     * Clear all settings
     */
    clearAllSettings() {
        try {
            localStorage.removeItem(this.STORAGE_KEY_PREFIX + "settings");
            this.settings = { ...this.DEFAULT_SETTINGS };
            return true;
        } catch (error) {
            console.error("Error clearing settings:", error);
            return false;
        }
    }

    /**
     * Reset system prompt to default
     */
    resetSystemPrompt() {
        this.setSetting("systemPrompt", this.getDefaultSystemPrompt());
    }
}

// Create global instance
const settingsManager = new SettingsManager();
