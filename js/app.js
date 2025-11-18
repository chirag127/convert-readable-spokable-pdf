/**
 * PDF2Speech Main Application
 * Orchestrates the entire workflow: settings, PDF processing, API calls, and PDF generation
 */

class PDF2SpeechApp {
    constructor() {
        this.currentProcessing = {
            chunks: [],
            processedChunks: [],
            pdfMetadata: null,
            isProcessing: false,
        };

        this.init();
    }

    /**
     * Initialize the application
     */
    init() {
        this.setupEventListeners();
        this.loadInitialUI();
        this.checkApiKeyConfiguration();
    }

    /**
     * Setup all event listeners
     */
    setupEventListeners() {
        // Navigation
        document.querySelectorAll(".nav-link").forEach((link) => {
            link.addEventListener("click", (e) => {
                e.preventDefault();
                const page = link.getAttribute("data-page");
                this.navigateTo(page);
            });
        });

        // Home Page - Upload
        const uploadBtn = document.getElementById("uploadBtn");
        const pdfUpload = document.getElementById("pdfUpload");

        uploadBtn.addEventListener("click", () => pdfUpload.click());
        pdfUpload.addEventListener("change", (e) => this.handleFileUpload(e));

        // Drag and drop
        const uploadBox = document.querySelector(".upload-box");
        ["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
            uploadBox.addEventListener(eventName, this.preventDefaults, false);
        });

        uploadBox.addEventListener(
            "dragenter",
            () => (uploadBox.style.borderColor = "#6366f1")
        );
        uploadBox.addEventListener(
            "dragleave",
            () => (uploadBox.style.borderColor = "#e5e7eb")
        );
        uploadBox.addEventListener("drop", (e) => {
            uploadBox.style.borderColor = "#e5e7eb";
            if (e.dataTransfer.files.length > 0) {
                this.handleFileUpload({
                    target: { files: e.dataTransfer.files },
                });
            }
        });

        // Results section
        document
            .getElementById("downloadBtn")
            ?.addEventListener("click", () => this.downloadPDF());
        document
            .getElementById("resetBtn")
            ?.addEventListener("click", () => this.resetUI());
        document
            .getElementById("errorRetryBtn")
            ?.addEventListener("click", () => this.resetUI());

        // Settings page
        this.setupSettingsEventListeners();

        // Contact form
        const contactForm = document.getElementById("contactForm");
        if (contactForm) {
            contactForm.addEventListener("submit", (e) => {
                e.preventDefault();
                this.handleContactSubmit();
            });
        }
    }

    /**
     * Setup settings page event listeners
     */
    setupSettingsEventListeners() {
        // API Key toggle visibility
        const toggleApiKeyBtn = document.getElementById("toggleApiKey");
        const apiKeyInput = document.getElementById("apiKey");

        if (toggleApiKeyBtn && apiKeyInput) {
            toggleApiKeyBtn.addEventListener("click", () => {
                const isPassword = apiKeyInput.type === "password";
                apiKeyInput.type = isPassword ? "text" : "password";
                toggleApiKeyBtn.textContent = isPassword ? "🙈" : "👁️";
            });
        }

        // Temperature slider
        const temperatureSlider = document.getElementById("temperature");
        const temperatureValue = document.getElementById("temperatureValue");

        if (temperatureSlider && temperatureValue) {
            temperatureSlider.addEventListener("input", (e) => {
                temperatureValue.textContent = e.target.value;
            });
        }

        // Test API Connection
        document
            .getElementById("testApiBtn")
            ?.addEventListener("click", () => this.testApiConnection());
        document
            .getElementById("clearApiBtn")
            ?.addEventListener("click", () => this.clearApiKey());

        // System Prompt actions
        document
            .getElementById("resetPromptBtn")
            ?.addEventListener("click", () => this.resetSystemPrompt());
        document
            .getElementById("copyPromptBtn")
            ?.addEventListener("click", () => this.copySystemPrompt());

        // Data management
        document
            .getElementById("exportSettingsBtn")
            ?.addEventListener("click", () => this.exportSettings());
        document
            .getElementById("clearAllBtn")
            ?.addEventListener("click", () => this.clearAllData());

        // Save settings
        document
            .getElementById("saveSettingsBtn")
            ?.addEventListener("click", () => this.saveAllSettings());

        // Load current settings into form
        this.loadSettingsToForm();
    }

    /**
     * Load settings from manager into form inputs
     */
    loadSettingsToForm() {
        const settings = settingsManager.getAllSettings();

        // API Key
        const apiKeyInput = document.getElementById("apiKey");
        if (apiKeyInput) {
            apiKeyInput.value = settings.apiKey;
        }

        // Model select
        const modelSelect = document.getElementById("modelSelect");
        if (modelSelect) {
            modelSelect.value = settings.model;
        }

        // Chunk size
        const chunkSizeInput = document.getElementById("chunkSize");
        if (chunkSizeInput) {
            chunkSizeInput.value = settings.chunkSize;
        }

        // Temperature
        const temperatureSlider = document.getElementById("temperature");
        const temperatureValue = document.getElementById("temperatureValue");
        if (temperatureSlider && temperatureValue) {
            temperatureSlider.value = settings.temperature;
            temperatureValue.textContent = settings.temperature;
        }

        // Max output tokens
        const maxTokensInput = document.getElementById("maxOutputTokens");
        if (maxTokensInput) {
            maxTokensInput.value = settings.maxOutputTokens;
        }

        // System prompt
        const systemPromptTextarea = document.getElementById("systemPrompt");
        if (systemPromptTextarea) {
            systemPromptTextarea.value = settings.systemPrompt;
        }
    }

    /**
     * Navigate to a specific page
     */
    navigateTo(pageName) {
        // Hide all pages
        document.querySelectorAll(".page").forEach((page) => {
            page.classList.remove("active");
        });

        // Show selected page
        const targetPage = document.getElementById(pageName);
        if (targetPage) {
            targetPage.classList.add("active");
        }

        // Update nav links
        document.querySelectorAll(".nav-link").forEach((link) => {
            link.classList.remove("active");
            if (link.getAttribute("data-page") === pageName) {
                link.classList.add("active");
            }
        });

        // Load settings form when navigating to settings page
        if (pageName === "settings") {
            this.loadSettingsToForm();
        }

        // Scroll to top
        window.scrollTo(0, 0);
    }

    /**
     * Handle file upload
     */
    async handleFileUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        try {
            this.showProcessingSection();

            // Extract text from PDF
            this.updateProgress("Extracting text from PDF...", 0);
            const extractionResult = await pdfProcessor.extractTextFromPDF(
                file
            );
            const { text, metadata } = extractionResult;

            // Store metadata
            this.currentProcessing.pdfMetadata = metadata;

            const contentAnalysis = pdfProcessor.analyzeContent(text);
            this.updateProgress(
                `Analyzing content: ${contentAnalysis.wordCount} words found`,
                15
            );

            // Chunk the text
            const chunkSize = settingsManager.getSetting("chunkSize");
            const chunks = pdfProcessor.chunkText(text, chunkSize);
            this.currentProcessing.chunks = chunks;

            this.updateProgress(
                `Preparing ${chunks.length} chunks for processing...`,
                25
            );

            // Check API key
            if (!settingsManager.hasApiKey()) {
                throw new Error(
                    "API key not configured. Please go to Settings and configure your Gemini API key."
                );
            }

            // Process chunks
            await this.processChunks();

            // Generate output PDF
            this.updateProgress("Generating output PDF...", 85);
            this.completeProcessing();
        } catch (error) {
            this.showError(error.message);
            console.error("Processing error:", error);
        }

        // Reset file input
        document.getElementById("pdfUpload").value = "";
    }

    /**
     * Process chunks sequentially with Gemini API
     */
    async processChunks() {
        const totalChunks = this.currentProcessing.chunks.length;
        let successCount = 0;

        for (let i = 0; i < totalChunks; i++) {
            try {
                const chunk = this.currentProcessing.chunks[i];
                const progressPercentage = 25 + (i / totalChunks) * 60;
                this.updateProgress(
                    `Processing chunk ${i + 1}/${totalChunks}...`,
                    progressPercentage
                );

                const processedChunk = await geminiAPI.processChunk(
                    chunk,
                    i,
                    totalChunks
                );
                this.currentProcessing.processedChunks.push(processedChunk);
                successCount++;
            } catch (error) {
                console.error(`Error processing chunk ${i + 1}:`, error);
                // Continue processing other chunks even if one fails
                // Optionally push original chunk as fallback
                this.currentProcessing.processedChunks.push(
                    this.currentProcessing.chunks[i]
                );
            }

            // Add a small delay between API calls to avoid rate limiting
            if (i < totalChunks - 1) {
                await new Promise((resolve) => setTimeout(resolve, 100));
            }
        }

        if (successCount === 0) {
            throw new Error(
                "Failed to process any chunks. Please check your API key and try again."
            );
        }
    }

    /**
     * Complete processing and show results
     */
    completeProcessing() {
        const processedText =
            this.currentProcessing.processedChunks.join("\n\n");

        // Show results section
        document.getElementById("processingSection").style.display = "none";
        document.getElementById("errorSection").style.display = "none";
        document.getElementById("resultsSection").style.display = "block";

        // Update stats
        const stats = `
            Original Chunks: ${this.currentProcessing.chunks.length} |
            Pages: ${this.currentProcessing.pdfMetadata.pageCount} |
            File: ${this.currentProcessing.pdfMetadata.fileName}
        `;
        document.getElementById("resultStats").textContent = stats;

        // Show preview
        const previewLength = Math.min(500, processedText.length);
        document.getElementById("previewContent").textContent =
            processedText.substring(0, previewLength) +
            (processedText.length > 500 ? "..." : "");

        this.updateProgress("Complete!", 100);
        this.updateStepIndicator(3);
    }

    /**
     * Generate and download output PDF
     */
    async downloadPDF() {
        try {
            const processedText =
                this.currentProcessing.processedChunks.join("\n\n");
            const fileName =
                this.currentProcessing.pdfMetadata.fileName.replace(
                    ".pdf",
                    "_tts-optimized.pdf"
                );

            // Use jsPDF to create PDF
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF({
                orientation: "portrait",
                unit: "mm",
                format: "a4",
            });

            // Add title
            const title = `TTS-Optimized: ${this.currentProcessing.pdfMetadata.fileName}`;
            doc.setFontSize(16);
            doc.text(title, 20, 20);

            // Add metadata
            doc.setFontSize(10);
            doc.setTextColor(128, 128, 128);
            const timestamp = new Date().toLocaleString();
            doc.text(`Generated: ${timestamp}`, 20, 30);

            // Add content
            doc.setTextColor(0, 0, 0);
            doc.setFontSize(11);
            const pageHeight = doc.internal.pageSize.getHeight();
            const pageWidth = doc.internal.pageSize.getWidth();
            const margin = 20;
            const maxWidth = pageWidth - 2 * margin;

            doc.setY(40);
            const lines = doc.splitTextToSize(processedText, maxWidth);

            lines.forEach((line) => {
                if (doc.getY() + 7 > pageHeight - margin) {
                    doc.addPage();
                    doc.setY(margin);
                }
                doc.text(line, margin, doc.getY());
                doc.setDrawColor(0);
            });

            // Save
            doc.save(fileName);
            this.showToast(`PDF downloaded: ${fileName}`, "success");
        } catch (error) {
            this.showError(`Failed to download PDF: ${error.message}`);
        }
    }

    /**
     * Test API connection
     */
    async testApiConnection() {
        const testBtn = document.getElementById("testApiBtn");
        const resultMessage = document.getElementById("testResultMessage");

        testBtn.disabled = true;
        testBtn.textContent = "Testing...";
        resultMessage.style.display = "block";
        resultMessage.textContent = "Testing connection...";
        resultMessage.className = "test-result";

        try {
            const response = await geminiAPI.testConnection();
            resultMessage.textContent =
                "✓ Connection successful! API is working properly.";
            resultMessage.className = "test-result success";
            this.showToast("API connection test successful!", "success");
        } catch (error) {
            resultMessage.textContent = `✗ Connection failed: ${error.message}`;
            resultMessage.className = "test-result error";
            this.showToast(`API test failed: ${error.message}`, "error");
        } finally {
            testBtn.disabled = false;
            testBtn.textContent = "Test Connection";
        }
    }

    /**
     * Clear API Key
     */
    clearApiKey() {
        if (confirm("Are you sure you want to clear your API key?")) {
            document.getElementById("apiKey").value = "";
            settingsManager.setSetting("apiKey", "");
            this.showToast("API key cleared", "info");
        }
    }

    /**
     * Reset system prompt to default
     */
    resetSystemPrompt() {
        if (confirm("Reset system prompt to default?")) {
            settingsManager.resetSystemPrompt();
            document.getElementById("systemPrompt").value =
                settingsManager.getSetting("systemPrompt");
            this.showToast("System prompt reset to default", "info");
        }
    }

    /**
     * Copy system prompt to clipboard
     */
    copySystemPrompt() {
        const promptText = document.getElementById("systemPrompt").value;
        navigator.clipboard
            .writeText(promptText)
            .then(() => {
                this.showToast("System prompt copied to clipboard", "success");
            })
            .catch((err) => {
                this.showToast("Failed to copy to clipboard", "error");
            });
    }

    /**
     * Export settings
     */
    exportSettings() {
        try {
            const exportedSettings = settingsManager.exportSettings();
            const blob = new Blob([exportedSettings], {
                type: "application/json",
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "pdf2speech-settings.json";
            a.click();
            URL.revokeObjectURL(url);
            this.showToast("Settings exported", "success");
        } catch (error) {
            this.showToast(`Export failed: ${error.message}`, "error");
        }
    }

    /**
     * Clear all data
     */
    clearAllData() {
        if (
            confirm(
                "This will delete all your settings and API key. Are you sure?"
            )
        ) {
            settingsManager.clearAllSettings();
            this.loadSettingsToForm();
            this.showToast("All data cleared", "success");
        }
    }

    /**
     * Save all settings
     */
    saveAllSettings() {
        try {
            const apiKey = document.getElementById("apiKey").value;
            const model = document.getElementById("modelSelect").value;
            const chunkSize = parseInt(
                document.getElementById("chunkSize").value
            );
            const temperature = parseFloat(
                document.getElementById("temperature").value
            );
            const maxOutputTokens = parseInt(
                document.getElementById("maxOutputTokens").value
            );
            const systemPrompt = document.getElementById("systemPrompt").value;

            // Validate
            if (!apiKey.trim()) {
                throw new Error("API key cannot be empty");
            }
            if (chunkSize < 500 || chunkSize > 20000) {
                throw new Error("Chunk size must be between 500 and 20000");
            }
            if (maxOutputTokens < 100 || maxOutputTokens > 8000) {
                throw new Error(
                    "Max output tokens must be between 100 and 8000"
                );
            }

            // Save
            settingsManager.saveSettings({
                apiKey,
                model,
                chunkSize,
                temperature,
                maxOutputTokens,
                systemPrompt,
            });

            this.showToast("Settings saved successfully!", "success");
        } catch (error) {
            this.showToast(`Save failed: ${error.message}`, "error");
        }
    }

    /**
     * Handle contact form submission
     */
    handleContactSubmit() {
        const name = document.getElementById("contactName").value;
        const email = document.getElementById("contactEmail").value;
        const subject = document.getElementById("contactSubject").value;
        const message = document.getElementById("contactMessage").value;

        const mailtoLink = `mailto:support@pdf2speech.dev?subject=${encodeURIComponent(
            subject
        )}&body=${encodeURIComponent(
            `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`
        )}`;

        window.location.href = mailtoLink;
        this.showToast("Opening email client...", "info");
    }

    /**
     * Show processing section
     */
    showProcessingSection() {
        document.getElementById("uploadSection").style.display = "none";
        document.getElementById("processingSection").style.display = "block";
        document.getElementById("resultsSection").style.display = "none";
        document.getElementById("errorSection").style.display = "none";
        this.updateStepIndicator(1);
    }

    /**
     * Update progress bar and text
     */
    updateProgress(text, percentage) {
        const progressFill = document.getElementById("progressFill");
        const progressText = document.getElementById("progressText");

        if (progressFill) {
            progressFill.style.width = percentage + "%";
        }
        if (progressText) {
            progressText.textContent = text;
        }
    }

    /**
     * Update step indicator
     */
    updateStepIndicator(stepNumber) {
        for (let i = 1; i <= 3; i++) {
            const step = document.getElementById(`step${i}`);
            if (step) {
                if (i <= stepNumber) {
                    step.classList.add("active");
                } else {
                    step.classList.remove("active");
                }
            }
        }
    }

    /**
     * Show error message
     */
    showError(message) {
        document.getElementById("uploadSection").style.display = "none";
        document.getElementById("processingSection").style.display = "none";
        document.getElementById("resultsSection").style.display = "none";
        document.getElementById("errorSection").style.display = "block";
        document.getElementById("errorMessage").textContent = message;
        this.showToast(`Error: ${message}`, "error");
    }

    /**
     * Reset UI to initial state
     */
    resetUI() {
        this.currentProcessing = {
            chunks: [],
            processedChunks: [],
            pdfMetadata: null,
            isProcessing: false,
        };

        document.getElementById("uploadSection").style.display = "block";
        document.getElementById("processingSection").style.display = "none";
        document.getElementById("resultsSection").style.display = "none";
        document.getElementById("errorSection").style.display = "none";

        this.updateProgress("", 0);
        this.updateStepIndicator(1);
        this.navigateTo("home");
    }

    /**
     * Show toast notification
     */
    showToast(message, type = "info") {
        const toast = document.getElementById("toast");
        if (toast) {
            toast.textContent = message;
            toast.className = `toast show ${type}`;

            setTimeout(() => {
                toast.classList.remove("show");
            }, 3000);
        }
    }

    /**
     * Load initial UI state
     */
    loadInitialUI() {
        document.getElementById("uploadSection").style.display = "block";
        document.getElementById("processingSection").style.display = "none";
        document.getElementById("resultsSection").style.display = "none";
        document.getElementById("errorSection").style.display = "none";
    }

    /**
     * Check if API key is configured
     */
    checkApiKeyConfiguration() {
        if (!settingsManager.hasApiKey()) {
            // Show modal on first load if no API key
            const apiKeyModal = document.getElementById("apiKeyModal");
            if (
                apiKeyModal &&
                localStorage.getItem("pdf2speech_first_load") === null
            ) {
                apiKeyModal.style.display = "flex";
                localStorage.setItem("pdf2speech_first_load", "true");
            }
        }
    }

    /**
     * Prevent default drag and drop behavior
     */
    preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
}

// Helper function for navigation (called from HTML)
function navigateTo(pageName) {
    app.navigateTo(pageName);
}

function closeApiKeyModal() {
    const modal = document.getElementById("apiKeyModal");
    if (modal) {
        modal.style.display = "none";
    }
}

// Initialize app when DOM is ready
let app;
document.addEventListener("DOMContentLoaded", () => {
    app = new PDF2SpeechApp();
});
