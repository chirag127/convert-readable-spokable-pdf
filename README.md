# PDF2Speech - Convert Readable Speakable PDF

A modern, client-side web application that transforms technical and academic PDFs into Text-to-Speech (TTS) optimized content using Google's Gemini AI. Perfect for use with applications like Moon+ Reader Pro.

## 🌟 Features

- **AI-Powered Content Transformation**: Uses Google Gemini 2.5 Flash (or Pro) to intelligently rewrite content for TTS consumption
- **Code-to-Description**: Automatically converts code snippets into natural language descriptions of functionality
- **Figure & Image Handling**: Transforms captions and image references into descriptive text
- **Smart Chunking**: Intelligently splits large PDFs to respect API token limits
- **Batch Processing**: Sequentially processes chunks and seamlessly reassembles content
- **Privacy-First**: All API keys stored locally in browser localStorage - no server uploads
- **Customizable**: Fine-tune the AI transformation with custom system prompts
- **Mobile-Ready**: Works on any device with a modern web browser
- **Beautiful UI**: Modern, responsive design with intuitive navigation
- **Zero Dependencies**: Pure HTML, CSS, and vanilla JavaScript - minimal deployment costs

## 📋 System Requirements

- Modern web browser (Chrome, Firefox, Safari, Edge)
- Google Gemini API key (free tier available)
- Text-based PDF (OCR not required)

## 🚀 Quick Start

### 1. Get Your Gemini API Key

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy your API key

**Free tier includes**: 15 requests per minute

### 2. Access the Application

1. Open `index.html` in your web browser
2. Go to **Settings** page
3. Paste your Gemini API key in the "API Configuration" section
4. Click "Test Connection" to verify your API key works
5. (Optional) Customize your processing preferences

### 3. Process Your PDF

1. Go to **Home** page
2. Click "Choose File" or drag & drop your PDF
3. Wait for processing to complete
4. Download your TTS-optimized PDF
5. Use it with your favorite TTS reader app

## 🎯 Configuration Guide

### API Configuration

| Setting | Description | Default |
|---------|-------------|---------|
| **API Key** | Your Google Gemini API key (required) | Empty |
| **Model** | Which Gemini model to use | Gemini 2.5 Flash |

### Processing Configuration

| Setting | Description | Default | Range |
|---------|-------------|---------|-------|
| **Chunk Size** | Tokens per chunk (lower = safer, higher = faster) | 4000 | 500-20000 |
| **Temperature** | Creativity level (0=precise, 2=creative) | 0.7 | 0-2 |
| **Max Output Tokens** | Maximum response length per chunk | 2000 | 100-8000 |

### System Prompt Customization

The system prompt controls how Gemini transforms your content. The default prompt is optimized for:
- Converting code examples to descriptions
- Transforming image captions into text
- Ensuring output is speaker-friendly
- Maintaining technical accuracy

You can customize it for your specific needs. For example:
- Academic papers: Focus on clear explanations
- Programming books: Emphasize code descriptions
- Manuals: Maintain structured formats

## 🔐 Privacy & Security

✅ **Privacy-First Design**:
- Your API key is stored ONLY in your browser's localStorage
- PDFs are NOT uploaded to any server
- No data collection or tracking
- All processing happens between your browser and Google's API

✅ **Security Best Practices**:
- Use HTTPS when accessing the application
- Keep your browser up to date
- Never share your API key
- Clear browser data if using a shared computer
- Rotate your API key periodically

## 📱 Supported Models

### Recommended for Most Users
- **Gemini 2.5 Flash** (Default)
  - Fastest response times
  - Most cost-effective
  - Excellent quality
  - Best for general use

### Alternative Options
- **Gemini 2.5 Pro**: More capable, slower, higher cost
- **Gemini 2.0 Flash**: Stable, reliable, good balance
- **Gemini 2.5 Flash Lite**: Lightweight, faster but less capable

## 💡 Tips for Best Results

1. **Start with Default Settings**: The default configuration is optimized for most PDFs
2. **Test First**: Process a small section first to preview the output style
3. **Adjust Temperature**: 
   - Lower (0.5-0.7) for consistent, predictable output
   - Higher (0.8-1.0) for more varied, creative descriptions
4. **Chunk Size**: 
   - Smaller (2000-3000) for technical content
   - Larger (4000-5000) for narrative text
5. **Monitor Usage**: Free tier has rate limits; paid plans available for higher throughput

## 🛠️ Technical Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6+)
- **PDF Processing**: PDF.js (text extraction)
- **PDF Generation**: jsPDF (output creation)
- **AI Engine**: Google Gemini REST API
- **Storage**: Browser localStorage
- **Hosting**: Completely client-side - works anywhere!

## 📁 Project Structure

```
convert-readable-spokable-pdf/
├── index.html              # Main HTML with all pages
├── styles.css              # Modern, responsive styling
├── js/
│   ├── settings.js         # Settings management & localStorage
│   ├── api.js              # Gemini API integration
│   ├── pdf-processor.js    # PDF extraction & chunking
│   └── app.js              # Main application orchestration
└── README.md               # This file
```

## 🔄 How It Works

```
1. PDF Upload
   ↓
2. Text Extraction (PDF.js)
   ↓
3. Content Analysis & Chunking
   ↓
4. Sequential API Processing
   ├─ Chunk 1 → Gemini API → Processed Result
   ├─ Chunk 2 → Gemini API → Processed Result
   ├─ Chunk N → Gemini API → Processed Result
   ↓
5. Content Reassembly
   ↓
6. PDF Generation (jsPDF)
   ↓
7. Download
```

## 🐛 Troubleshooting

### "API Key Not Valid"
- Verify your API key is correct (copy from Google AI Studio)
- Ensure you haven't accidentally included spaces
- Test connection using the "Test Connection" button
- Check if your free tier quota is exceeded

### "Rate Limited (429 Error)"
- Free tier: 15 requests per minute
- Wait a moment and try again
- Consider upgrading to paid tier for higher limits
- The app has automatic retry logic with exponential backoff

### "PDF Extraction Failed"
- Ensure the PDF is text-based (not scanned images)
- Try with a smaller PDF first
- Check browser console for detailed error messages
- Supported PDF.js versions require modern browsers

### "Processing Seems Stuck"
- Check internet connection
- Verify API key is still valid
- Try with smaller chunk size
- Check browser console for errors

### "Downloaded PDF is Empty"
- Ensure processing completed successfully
- Check the preview section first
- Try downloading again
- Contact support if issue persists

## 📊 API Usage & Costs

### Google AI Studio Free Tier
- **15 requests per minute** (15 RPM limit)
- **1.5M input tokens per day**
- **No cost**
- Perfect for testing and small-scale use

### Google Cloud Paid Plans
- Available on Google Cloud Console
- Pay-as-you-go pricing
- Higher rate limits
- Production-ready

### Optimizing API Usage
- Use appropriate chunk sizes (not too small)
- Process during off-peak times
- Consider batch processing for large volumes
- Monitor your usage in Google Cloud Console

## 🎓 Use Cases

1. **Academic Reading**: Transform papers into audio format
2. **Coding Books**: Convert programming examples to descriptions
3. **Technical Manuals**: Create speaker-friendly versions
4. **Research Documents**: Enable multitasking reading
5. **Accessibility**: Better support for screen readers

## 🤝 Contributing

Contributions welcome! Areas for enhancement:
- Additional AI model integrations
- Enhanced error handling
- Performance optimizations
- UI/UX improvements
- Documentation expansion

## 📝 License

This project is open source and available under the MIT License.

## 📞 Support & Contact

- **Report Bugs**: [GitHub Issues](https://github.com/chirag127/convert-readable-spokable-pdf/issues)
- **Feature Requests**: [GitHub Discussions](https://github.com/chirag127/convert-readable-spokable-pdf/discussions)
- **Email**: support@pdf2speech.dev
- **GitHub**: [convert-readable-spokable-pdf](https://github.com/chirag127/convert-readable-spokable-pdf)

## ⚠️ Important Notes

1. **API Key Safety**: Never commit your API key to version control
2. **Daily Limits**: Free tier has daily token limits
3. **PDF Quality**: Works best with well-formatted, text-based PDFs
4. **Browser Storage**: localStorage has size limits (~5-10MB per domain)
5. **Browser Compatibility**: Requires modern browser with ES6 support

## 🚀 Deployment

### Deploy to GitHub Pages (Free)
1. Fork this repository
2. Rename to `yourusername.github.io` (optional)
3. Access via `https://yourusername.github.io/convert-readable-spokable-pdf/`
4. Or enable GitHub Pages in repository settings

### Deploy to Netlify (Free)
1. Connect your GitHub repository
2. Set build command: `echo "No build needed"`
3. Published directory: `/`
4. Deploy automatically on push

### Deploy to Vercel (Free)
1. Connect your GitHub repository
2. Use default settings
3. Deploy automatically

### Self-Host
1. Clone repository
2. Serve over HTTPS
3. Works on any static file server (Apache, Nginx, etc.)

## 📈 Future Roadmap

- [ ] Batch processing multiple PDFs
- [ ] More AI model integrations (Claude, etc.)
- [ ] Cloud sync for settings
- [ ] Advanced prompt templates
- [ ] Export to multiple formats (EPUB, DOCX)
- [ ] Real-time preview
- [ ] API usage analytics dashboard
- [ ] Multi-language support

## 📄 License & Attribution

MIT License - Feel free to use, modify, and distribute

## 🙏 Acknowledgments

- Google Gemini API for powerful AI capabilities
- PDF.js for reliable PDF processing
- jsPDF for PDF generation
- The open-source community

---

**Made with ❤️ for accessibility and innovation**

Last Updated: November 2025
