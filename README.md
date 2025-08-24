# 🎨 Uniicon - AI Icon Generator & NFT Platform

A modern, AI-powered icon generation platform with blockchain integration. Generate beautiful, custom icons using advanced AI models and mint them as NFTs on the Avalanche blockchain.

## ✨ Features

### 🤖 AI-Powered Generation
- Uses AWS Bedrock Titan Image Generator for high-quality icon creation
- Advanced AI models for prompt interpretation and optimization
- Smart fallbacks for robust icon generation

### 🌐 Blockchain Integration
- **NFT Minting**: Automatically mint generated icons as NFTs on Avalanche Fuji testnet
- **IPFS Storage**: Decentralized storage using Pinata for NFT metadata and images
- **Wallet Integration**: RainbowKit for seamless wallet connection and management
- **Explorer Links**: Direct links to view transactions on SnowTrace

### 🎯 User Experience
- **One-Click Workflow**: Generate icon → Upload to IPFS → Mint NFT automatically
- **Progress Tracking**: Real-time updates during upload and minting process
- **Smart Retry**: Retry failed minting without re-uploading to IPFS
- **Responsive Design**: Beautiful interface built with TailwindCSS

## 🚀 Tech Stack

### Frontend
- **Next.js 15** with React 19 and Turbopack
- **TailwindCSS** for modern UI design
- **RainbowKit** for wallet connection
- **Wagmi** and **Viem** for blockchain interactions

### Blockchain
- **Avalanche Fuji Testnet** for NFT smart contracts
- **Hardhat** for contract development and deployment
- **IPFS/Pinata** for decentralized metadata storage

### AI & Storage
- **AWS Bedrock** (Titan Image Generator, Claude-3-Haiku)
- **AWS S3** for temporary image storage
- **Pinata IPFS** for permanent NFT storage

## 🏗️ Architecture

```
Input → AI Analysis → Icon Generation → IPFS Upload → NFT Minting → SnowTrace Explorer
```

### Pipeline Flow
1. **Extract**: AI agent analyzes user input for icon requirements
2. **Generate**: AWS Titan creates high-quality icon illustrations  
3. **Upload**: Automatic IPFS storage via Pinata with metadata
4. **Mint**: Smart contract deployment on Avalanche Fuji testnet
5. **Track**: Transaction monitoring through SnowTrace explorer

### Smart Contracts
- **UniIconNFT**: ERC-721 compliant contract for icon NFTs
- **Deployed Address**: `0x86233442F5DAA7e0F010BA92f4187D6cb1C35E39` (Fuji Testnet)

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

# Pinata IPFS Configuration
NEXT_PUBLIC_PINATA_JWT=your_pinata_jwt_token
NEXT_PUBLIC_PINATA_GATEWAY=your_pinata_gateway_url

# Blockchain Configuration
NEXT_PUBLIC_NFT_CONTRACT_ADDRESS=0x86233442F5DAA7e0F010BA92f4187D6cb1C35E39
```

### Wallet Setup
1. **Install MetaMask** or compatible Web3 wallet
2. **Add Avalanche Fuji Testnet**:
   - Network Name: Avalanche Fuji C-Chain
   - RPC URL: https://api.avax-test.network/ext/bc/C/rpc
   - Chain ID: 43113
   - Currency Symbol: AVAX
   - Block Explorer: https://testnet.snowtrace.io/

3. **Get Test AVAX**: Visit [Avalanche Faucet](https://faucet.avax.network/)

### Optional Configuration

```bash
# Fallback and Logging
DISABLE_FALLBACKS=0
QUIET_LOGS=0

# Replicate API (for background cleaning)
REPLICATE_API_TOKEN=your_token
```

## 🎯 Usage

### Generate & Mint NFT Icons

1. **Connect Wallet**: Click "Connect Wallet" and select your Web3 wallet
2. **Enter Description**: Describe the icon you want to generate
3. **Generate Icon**: Click "Generate" to start the AI pipeline
4. **Automatic Minting**: The app will:
   - Generate your icon using AI
   - Upload to IPFS via Pinata
   - Mint as NFT on Avalanche
   - Provide SnowTrace transaction link

### Example Prompts

- "A floating hot air balloon with soft shadows"
- "A modern cryptocurrency wallet icon"
- "A star icon with gradient colors and glow effect"
- "A user profile icon with rounded corners"

### NFT Features

- **Permanent Storage**: All icons stored on IPFS for decentralization
- **Ownership Proof**: Blockchain-verified ownership via NFT
- **Transaction History**: View all transactions on SnowTrace
- **Retry Mechanism**: Smart retry for failed minting (reuses IPFS upload)

## 🔧 Development

### Project Structure

```
src/
├── app/                 # Next.js app router
│   ├── api/generate/   # AI generation API endpoint
│   ├── layout.js       # Root layout with wallet providers
│   └── page.js         # Home page
├── components/          # React components
│   ├── result.js       # NFT minting interface
│   ├── header.js       # Navigation with wallet connection
│   └── ...
├── context/            # React context providers
│   ├── AppProvider.js  # Global app state
│   └── WalletProvider.js # Web3 wallet context
├── config/             # Configuration files
│   └── wagmi.js        # Blockchain configuration
├── utils/              # Core functionality
│   ├── generate.js     # Icon generation pipeline
│   ├── ipfs-upload.js  # Pinata IPFS integration
│   ├── s3-upload.js    # AWS S3 integration
│   └── ...
└── contracts/          # Smart contracts
    └── UniIconNFT.sol  # NFT contract
```

### Smart Contract Development

```bash
# Compile contracts
npx hardhat compile

# Deploy to Fuji testnet
npx hardhat run scripts/deployUniIconNFT.js --network fuji

# Verify contract
npx hardhat run scripts/verify.js --network fuji
```

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production  
npm run start    # Start production server
npm run lint     # Run ESLint

# Hardhat commands
npx hardhat compile              # Compile smart contracts
npx hardhat test                # Run contract tests
npx hardhat node               # Start local blockchain
npx hardhat run scripts/deploy.js # Deploy contracts
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

- **Environment Variables**: Never commit `.env.local` files to version control
- **AWS Credentials**: Use IAM roles with minimal required permissions
- **Pinata API Keys**: Store JWT tokens securely in environment variables
- **Smart Contracts**: Audited for security vulnerabilities and gas optimization
- **Wallet Security**: Users maintain full custody of their private keys

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Avalanche Foundation** for the hackathon and blockchain infrastructure  
- **AWS Bedrock** for AI model access and computing power
- **Pinata** for reliable IPFS storage and gateway services
- **RainbowKit** for excellent wallet integration UX
- **Next.js Team** for the amazing React framework
- **TailwindCSS** for beautiful and responsive UI components
- **Hardhat** for smart contract development tools

## 🏆 Avalanche Hackathon

This project was built for the Avalanche Hackathon, showcasing:
- **Avalanche Blockchain Integration**: Full NFT minting on Fuji testnet
- **Decentralized Storage**: IPFS integration for permanent data storage  
- **Modern Web3 UX**: Seamless wallet connection and transaction handling
- **AI + Blockchain**: Combining AI generation with blockchain ownership

## 📞 Support

For support and questions:
- Create an issue in this repository
- Check the documentation in the `/docs` folder
- Review the environment configuration

---

**Built with ❤️ for the Avalanche Hackathon**
