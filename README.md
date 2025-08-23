# 🎨 Uniicon AI Icon Generator

A modern, AI-powered icon generation platform built with Next.js 15, React 19, and AWS Bedrock. Generate beautiful, custom icons using advanced AI models with a clean, intuitive interface.

## ✨ Features

- **🤖 AI-Powered Generation**: Uses AWS Bedrock Titan Image Generator for high-quality icon creation
- **☁️ Cloud Storage**: Automatic S3 upload for generated icons
- **🔄 Smart Fallbacks**: Robust fallback system when AWS services are unavailable
- **🎯 Custom Prompts**: Generate icons from natural language descriptions
- **📱 Modern UI**: Beautiful, responsive interface built with TailwindCSS
- **⚡ Fast Performance**: Built with Next.js 15 and Turbopack for optimal speed

## 🚀 Tech Stack

- **Frontend**: Next.js 15, React 19, TailwindCSS
- **AI/ML**: AWS Bedrock (Titan Image Generator, Claude-3-Haiku)
- **Storage**: AWS S3
- **Deployment**: Vercel-ready
- **Development**: TypeScript, ESLint, Turbopack

## 🏗️ Architecture

```
Input → Extract Requirements → Generate Icon → Clean Background → Upload to S3 → Display Result
```

- **Extract**: AI agent analyzes user input for icon requirements
- **Generate**: AWS Titan creates high-quality icon illustrations
- **Clean**: Background removal and enhancement
- **Upload**: Automatic S3 storage with metadata
- **Display**: Beautiful result modal with download options

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/DhanushKenkiri/Uniicon-AvalancheHackthon.git
   cd Uniicon-AvalancheHackthon
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp env.example .env.local
   # Edit .env.local with your AWS credentials
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

## ⚙️ Configuration

### Required Environment Variables

```bash
# AWS Credentials
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key

# Bedrock Configuration
BEDROCK_GENERATE_REGION=ap-south-1
BEDROCK_GENERATE_MODEL_ID=amazon.titan-image-generator-v1
BEDROCK_ANIMATE_REGION=us-east-1

# S3 Configuration
# (Uses AWS credentials above)
```

### Optional Configuration

```bash
# Fallback and Logging
DISABLE_FALLBACKS=0
QUIET_LOGS=0

# Replicate API (for background cleaning)
REPLICATE_API_TOKEN=your_token
```

## 🎯 Usage

1. **Open the application** in your browser
2. **Enter a description** of the icon you want
3. **Click Generate** to start the AI pipeline
4. **Wait for processing** (typically 10-30 seconds)
5. **Download your icon** or view it in S3

### Example Prompts

- "A floating hot air balloon with soft shadows"
- "A modern laptop icon with clean lines"
- "A star icon with gradient colors"
- "A user profile icon with rounded corners"

## 🔧 Development

### Project Structure

```
src/
├── app/                 # Next.js app router
│   ├── api/            # API endpoints
│   ├── layout.js       # Root layout
│   └── page.js         # Home page
├── components/          # React components
├── context/            # React context providers
├── lib/                # Utility libraries
└── utils/              # Core functionality
    ├── generate.js     # Icon generation
    ├── animate.js      # Display processing
    ├── s3-upload.js    # S3 integration
    └── ...
```

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment

1. Build the application: `npm run build`
2. Start production server: `npm run start`
3. Configure your hosting provider

## 🔒 Security

- **Environment Variables**: Never commit `.env.local` files
- **AWS Credentials**: Use IAM roles with minimal required permissions
- **API Keys**: Store sensitive keys in environment variables only

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **AWS Bedrock** for AI model access
- **Next.js Team** for the amazing framework
- **TailwindCSS** for the beautiful UI components
- **Open Source Community** for inspiration and tools

## 📞 Support

For support and questions:
- Create an issue in this repository
- Check the documentation in the `/docs` folder
- Review the environment configuration

---

**Built with ❤️ for the Avalanche Hackathon**
