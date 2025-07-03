
# 🚇 Hyderabad Metro PWA

[![License: MIT](https://i.ytimg.com/vi/xt4SuGd2pnY/hqdefault.jpg)
[![Next.js](https://i.ytimg.com/vi/4cgpu9L2AE8/maxresdefault.jpg)
[![TypeScript](https://i.ytimg.com/vi/uUalQbg-TGA/maxresdefault.jpg)
[![Tailwind CSS](https://i.pinimg.com/originals/d4/fe/fc/d4fefc25a38fec7c092681f86525b807.jpg)

A modern, responsive Progressive Web Application (PWA) for the Hyderabad Metro Rail system. Built with Next.js, TypeScript, and Tailwind CSS to provide users with real-time metro information, route planning, and station details.

## ✨ Features

- 🗺️ **Interactive Metro Map** - Visual representation of all metro lines and stations
- 🚉 **Station Information** - Detailed information about each metro station
- 🛤️ **Route Planning** - Find the best routes between stations
- ⏰ **Real-time Updates** - Live metro timings and service status
- 📱 **Progressive Web App** - Install on mobile devices for native app experience
- 🌙 **Dark/Light Mode** - Toggle between themes for better user experience
- 📍 **Location Services** - Find nearest metro stations
- 🔍 **Smart Search** - Quick search for stations and routes
- 📊 **Fare Calculator** - Calculate travel costs between stations
- 🚨 **Service Alerts** - Important announcements and service disruptions

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/hyderabad-metro-pwa.git
   cd hyderabad-metro-pwa
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` with your configuration values.

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) with App Router
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **PWA**: [next-pwa](https://github.com/shadowwalker/next-pwa)
- **Database**: [Prisma](https://www.prisma.io/) (if applicable)
- **Deployment**: [Vercel](https://vercel.com/) / [Netlify](https://netlify.com/)

## 📁 Project Structure

```
hyderabad-metro-pwa/
├── app/                    # Next.js App Router pages
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # Reusable UI components
│   ├── ui/               # shadcn/ui components
│   ├── metro-map/        # Metro map components
│   ├── station-info/     # Station information components
│   └── route-planner/    # Route planning components
├── lib/                  # Utility functions and configurations
├── hooks/                # Custom React hooks
├── public/               # Static assets
│   ├── icons/           # PWA icons
│   ├── images/          # Images and graphics
│   └── manifest.json    # PWA manifest
├── prisma/              # Database schema (if applicable)
└── types/               # TypeScript type definitions
```

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file in the root directory:

```env
# App Configuration
NEXT_PUBLIC_APP_NAME=Hyderabad Metro PWA
NEXT_PUBLIC_APP_URL=https://your-domain.com

# API Configuration (if applicable)
NEXT_PUBLIC_API_BASE_URL=https://api.your-domain.com
API_SECRET_KEY=your-secret-key

# Database (if applicable)
DATABASE_URL=your-database-url

# Analytics (optional)
NEXT_PUBLIC_GA_ID=your-google-analytics-id
```

### PWA Configuration

The app is configured as a Progressive Web App with:
- Service Worker for offline functionality
- Web App Manifest for installation
- Responsive design for all devices
- Optimized performance and caching

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect your GitHub repository to Vercel**
2. **Configure environment variables in Vercel dashboard**
3. **Deploy automatically on every push to main branch**

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Netlify

1. **Connect your GitHub repository to Netlify**
2. **Set build command**: `npm run build`
3. **Set publish directory**: `out` (for static export) or `.next` (for SSR)

### Docker

```bash
# Build Docker image
docker build -t hyderabad-metro-pwa .

# Run container
docker run -p 3000:3000 hyderabad-metro-pwa
```

## 📱 PWA Installation

Users can install the app on their devices:

1. **Mobile (Android/iOS)**: Tap "Add to Home Screen" when prompted
2. **Desktop (Chrome/Edge)**: Click the install icon in the address bar
3. **Manual**: Go to browser menu → "Install Hyderabad Metro PWA"

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests and linting (`npm run test && npm run lint`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Hyderabad Metro Rail Limited for metro system data
- Next.js team for the amazing framework
- shadcn for the beautiful UI components
- All contributors who help improve this project

## 📞 Support

- 📧 Email: support@hyderabadmetropwa.com
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/hyderabad-metro-pwa/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/yourusername/hyderabad-metro-pwa/discussions)

---

Made with ❤️ for the people of Hyderabad
