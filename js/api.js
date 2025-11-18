/**
 * Gemini API Integration
 * Handles REST API communication with Google Gemini
 */

class GeminiAPI {
    constructor() {
        this.baseUrl =
            "https://generativelanguage.googleapis.com/v1beta/models";
        this.maxRetries = 3;
        this.retryDelay = 1000; // milliseconds
    }

    /**
     * Test the API connection
     */
    async testConnection() {
        const apiKey = settingsManager.getSetting("apiKey");
        const model = settingsManager.getSetting("model");

        if (!apiKey) {
            throw new Error("API key not configured");
        }

        const testPrompt = 'Say "Connection successful" if you can read this.';

        try {
            const response = await this.sendRequest(model, testPrompt, 100);
            return response;
        } catch (error) {
            throw new Error(`Connection test failed: ${error.message}`);
        }
    }

    /**
     * Process a single text chunk
     */
    async processChunk(text, chunkIndex = 0, totalChunks = 1) {
        const apiKey = settingsManager.getSetting("apiKey");
        const model = settingsManager.getSetting("model");
        const systemPrompt = settingsManager.getSetting("systemPrompt");
        const maxOutputTokens = settingsManager.getSetting("maxOutputTokens");

        if (!apiKey) {
            throw new Error("API key not configured");
        }

        if (!text || text.trim().length === 0) {
            throw new Error("Text content is empty");
        }

        const userPrompt = `Process the following text chunk (${
            chunkIndex + 1
        }/${totalChunks}):\n\n${text}`;

        try {
            const response = await this.sendRequest(
                model,
                userPrompt,
                maxOutputTokens,
                systemPrompt
            );
            return response;
        } catch (error) {
            throw new Error(
                `Failed to process chunk ${chunkIndex + 1}: ${error.message}`
            );
        }
    }

    /**
     * Send request to Gemini API with retry logic
     */
    async sendRequest(
        model,
        userMessage,
        maxTokens,
        systemPrompt = null,
        retryCount = 0
    ) {
        const apiKey = settingsManager.getSetting("apiKey");
        const temperature = settingsManager.getSetting("temperature");

        const url = `${this.baseUrl}/${model}:generateContent?key=${apiKey}`;

        const requestBody = {
            contents: [
                {
                    parts: [
                        {
                            text: userMessage,
                        },
                    ],
                },
            ],
            generationConfig: {
                temperature: temperature,
                maxOutputTokens: maxTokens,
                topP: 0.95,
                topK: 40,
            },
            safetySettings: [
                {
                    category: "HARM_CATEGORY_HARASSMENT",
                    threshold: "BLOCK_NONE",
                },
                {
                    category: "HARM_CATEGORY_HATE_SPEECH",
                    threshold: "BLOCK_NONE",
                },
                {
                    category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                    threshold: "BLOCK_NONE",
                },
                {
                    category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                    threshold: "BLOCK_NONE",
                },
            ],
        };

        // Add system prompt if provided
        if (systemPrompt) {
            requestBody.systemInstruction = {
                parts: [
                    {
                        text: systemPrompt,
                    },
                ],
            };
        }

        try {
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestBody),
            });

            if (!response.ok) {
                const errorData = await response.json();
                const errorMessage =
                    errorData?.error?.message ||
                    `API Error: ${response.status}`;

                if (response.status === 429 && retryCount < this.maxRetries) {
                    // Rate limited - retry with exponential backoff
                    const delay = this.retryDelay * Math.pow(2, retryCount);
                    await new Promise((resolve) => setTimeout(resolve, delay));
                    return this.sendRequest(
                        model,
                        userMessage,
                        maxTokens,
                        systemPrompt,
                        retryCount + 1
                    );
                }

                throw new Error(errorMessage);
            }

            const data = await response.json();

            if (
                !data.candidates ||
                !data.candidates[0] ||
                !data.candidates[0].content
            ) {
                throw new Error("Invalid API response format");
            }

            const textContent = data.candidates[0].content.parts
                .filter((part) => part.text)
                .map((part) => part.text)
                .join("");

            return textContent;
        } catch (error) {
            if (error instanceof TypeError) {
                throw new Error(`Network error: ${error.message}`);
            }
            throw error;
        }
    }

    /**
     * Get available models for the configured API key
     */
    async getAvailableModels() {
        const apiKey = settingsManager.getSetting("apiKey");

        if (!apiKey) {
            throw new Error("API key not configured");
        }

        try {
            const url = `${this.baseUrl}?key=${apiKey}`;
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`Failed to fetch models: ${response.status}`);
            }

            const data = await response.json();
            return data.models || [];
        } catch (error) {
            throw new Error(
                `Error fetching available models: ${error.message}`
            );
        }
    }
}

// Create global instance
const geminiAPI = new GeminiAPI();
