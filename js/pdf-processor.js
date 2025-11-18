/**
 * PDF Processor
 * Handles PDF extraction, chunking, and reassembly
 */

// Set PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc =
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

class PDFProcessor {
    constructor() {
        this.tokenEstimationFactor = 4; // Rough estimate: 1 token ≈ 4 characters
    }

    /**
     * Extract text from PDF file
     */
    async extractTextFromPDF(file) {
        if (!file || file.type !== "application/pdf") {
            throw new Error("Invalid file format. Please upload a PDF.");
        }

        try {
            const arrayBuffer = await this.readFileAsArrayBuffer(file);
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer })
                .promise;

            let fullText = "";
            let metadata = {
                pageCount: pdf.numPages,
                fileName: file.name,
            };

            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                const pageText = textContent.items
                    .filter((item) => item.str)
                    .map((item) => item.str)
                    .join("");

                // Add page break for readability
                fullText += `\n\n--- Page ${i} ---\n\n${pageText}`;
            }

            return {
                text: fullText.trim(),
                metadata: metadata,
            };
        } catch (error) {
            throw new Error(`PDF extraction failed: ${error.message}`);
        }
    }

    /**
     * Read file as array buffer
     */
    readFileAsArrayBuffer(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject(new Error("File reading failed"));
            reader.readAsArrayBuffer(file);
        });
    }

    /**
     * Estimate token count for text
     */
    estimateTokens(text) {
        return Math.ceil(text.length / this.tokenEstimationFactor);
    }

    /**
     * Split text into chunks respecting token limits
     */
    chunkText(text, maxTokensPerChunk) {
        const chunks = [];
        const targetCharSize = maxTokensPerChunk * this.tokenEstimationFactor;

        // Split by paragraphs first to maintain context
        const paragraphs = text.split(/\n\n+/);
        let currentChunk = "";

        for (const paragraph of paragraphs) {
            const potentialChunk =
                currentChunk + (currentChunk ? "\n\n" : "") + paragraph;

            if (
                this.estimateTokens(potentialChunk) > maxTokensPerChunk &&
                currentChunk.length > 0
            ) {
                // Current chunk is full, save it and start a new one
                chunks.push(currentChunk.trim());
                currentChunk = paragraph;
            } else if (this.estimateTokens(paragraph) > maxTokensPerChunk) {
                // Single paragraph exceeds limit, need to split by sentences
                if (currentChunk) {
                    chunks.push(currentChunk.trim());
                    currentChunk = "";
                }

                const sentences = this.splitBySentences(paragraph);
                let sentenceChunk = "";

                for (const sentence of sentences) {
                    const potentialSentenceChunk =
                        sentenceChunk + (sentenceChunk ? " " : "") + sentence;

                    if (
                        this.estimateTokens(potentialSentenceChunk) >
                            maxTokensPerChunk &&
                        sentenceChunk.length > 0
                    ) {
                        chunks.push(sentenceChunk.trim());
                        sentenceChunk = sentence;
                    } else {
                        sentenceChunk = potentialSentenceChunk;
                    }
                }

                if (sentenceChunk.length > 0) {
                    currentChunk = sentenceChunk;
                }
            } else {
                currentChunk = potentialChunk;
            }
        }

        if (currentChunk.trim().length > 0) {
            chunks.push(currentChunk.trim());
        }

        return chunks.length > 0 ? chunks : [text.trim()];
    }

    /**
     * Split text by sentences
     */
    splitBySentences(text) {
        // Simple sentence splitter based on common punctuation
        const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
        return sentences.map((s) => s.trim()).filter((s) => s.length > 0);
    }

    /**
     * Analyze content and provide statistics
     */
    analyzeContent(text) {
        return {
            totalCharacters: text.length,
            estimatedTokens: this.estimateTokens(text),
            paragraphCount: (text.match(/\n\n+/g) || []).length + 1,
            wordCount: text.split(/\s+/).filter((w) => w.length > 0).length,
        };
    }
}

// Create global instance
const pdfProcessor = new PDFProcessor();
