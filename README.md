# XAnalyze - Xandeum pNodes Analytics Platform

A comprehensive analytics platform for monitoring and visualizing the Xandeum pNode network infrastructure. Built for the **Xandeum Labs Bounty** on Superteam Earn.

![XAnalyze Dashboard](./xanalyze/public/og-image.png)

## Live Demo

**[https://xanalyze.online](https://xanalyze.online)**

## Features

### Dashboard

- **Real-time Network Overview** - Monitor total nodes, online/offline counts, total storage, and uptime across the network
- **Individual Node Cards** - View detailed information for each pNode including:
  - Status (online/offline)
  - Version information
  - CPU & RAM usage
  - Storage capacity
  - Geographic location with country flags
  - Pod credits (reputation)
- **Network Selector** - Switch between Devnet 1, Devnet 2, Mainnet 1, and Mainnet 2
- **Intelligent Caching** - IndexedDB caching for faster load times and offline support

### Topology Map

- **Interactive World Map** - Visualize the global distribution of pNodes
- **Geographic Clustering** - Nodes grouped by country/region
- **Node Details on Click** - Tap any node to view its information
- **Zoom & Pan Controls** - Navigate the map with touch and mouse gestures

### Analytics

- **Current Metrics**
  - Node status distribution (pie chart)
  - Version distribution across nodes
  - Geographic distribution (top 5 regions)
  - Top storage nodes ranking
- **Historical Data** (requires proxy server)
  - Node status over time (online/offline trends)
  - Resource utilization (CPU & RAM)
  - Storage and streams trends
  - Network comparison across all endpoints
  - Configurable time periods: 1H, 6H, 24H, 7D, 30D

### Leaderboard

- **Node Rankings** by multiple metrics:
  - Pod Credits (reputation)
  - Uptime
  - Storage capacity
  - CPU Efficiency
- **Achievement Badges**:
  - Performance tiers (ELITE, TOP, HIGH)
  - Uptime achievements (99%+, 95%+)
  - Storage achievements
  - Efficiency achievements
- **Country Flags** - Visual indicator of node locations

### AI Assistant (Optional)

- **Xanalyze AI** powered by Gemini 2.0 Flash
- Natural language queries about network status
- Example questions:
  - "How many nodes are online?"
  - "Which network has the highest online ratio?"
  - "Top 5 nodes by reputation credits"
  - "Compare devnet and mainnet performance"

### Telegram Bot (Optional)

- Real-time network monitoring via Telegram
- Node status alerts and subscriptions
- Commands: `/stats`, `/node <pubkey>`, `/top`, `/compare`, `/ask`

### Settings

- Theme customization (Light/Dark mode)
- Network preferences
- Cache management

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **UI**: React 19, Tailwind CSS 4
- **Design System**: Neobrutalist aesthetic with bold borders and vivid colors
- **Animations**: Framer Motion
- **Charts**: Recharts
- **Maps**: react-simple-maps with TopoJSON
- **State Management**: React Context API
- **Caching**: IndexedDB for client-side persistence

## How It Works

The platform retrieves pNode data using **pRPC (pNode RPC)** calls:

1. **Registry Query**: Fetches all pods from the network registry via `get-pods` RPC call
2. **Individual Node Data**: Queries each node for:
   - `get-version` - Node software version
   - `get-stats` - CPU, RAM, storage, uptime metrics
   - `get-pods` - Connected peers information
3. **Geolocation**: IP addresses are batch geolocated for map visualization
4. **Pod Credits**: Fetched from the Xandeum network for leaderboard rankings

### Supported Networks

| Network   | RPC Endpoint                     |
| --------- | -------------------------------- |
| Devnet 1  | `https://rpc1.pchednode.com/rpc` |
| Devnet 2  | `https://rpc2.pchednode.com/rpc` |
| Mainnet 1 | `https://rpc3.pchednode.com/rpc` |
| Mainnet 2 | `https://rpc4.pchednode.com/rpc` |

## Quick Start

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm

### Installation

```bash
# Clone the repository
git clone https://github.com/junesand12/xanalyze.git
cd xanalyze/xanalyze

# Install dependencies
pnpm install

# Run development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
# Build the application
pnpm build

# Start production server
pnpm start
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the project in [Vercel](https://vercel.com)
3. Deploy with default settings

### Environment Variables (Optional)

To enable historical data, AI, and Telegram features, connect the frontend to the backend:

```env
NEXT_PUBLIC_PROXY_URL=https://your-backend-server.com
```

## Backend Server (Optional)

For historical analytics, AI assistant, and Telegram bot features, deploy the XAnalyze Backend:

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Edit with your credentials (see below)

# Start the server
npm start
```

### Backend Environment Variables

| Variable             | Description                                              |
| -------------------- | -------------------------------------------------------- |
| `MONGODB_URI`        | MongoDB connection string (required for historical data) |
| `GEMINI_API_KEY`     | Google Gemini API key (optional, for AI features)        |
| `TELEGRAM_BOT_TOKEN` | Telegram bot token (optional, for bot features)          |
| `ALLOWED_ORIGINS`    | Frontend domains for CORS                                |

### Backend Features

- **RPC Proxy** - Bypasses Cloudflare restrictions on Xandeum RPC endpoints
- **Historical Data** - Collects network snapshots every 5 minutes, 30-day retention
- **Chart APIs** - Pre-formatted data for Recharts visualization
- **AI Assistant** - Gemini 2.0 Flash for natural language network queries
- **Telegram Bot** - Monitor nodes, receive alerts, query stats via Telegram
- **Pod Credits** - Fetches reputation credits from Xandeum network

See [`backend/README.md`](./backend/README.md) for full documentation.

## Project Structure

```
xanalyze/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── page.tsx           # Dashboard
│   │   ├── analytics/         # Analytics page
│   │   ├── topology/          # Topology map
│   │   ├── leaderboard/       # Node rankings
│   │   ├── settings/          # Settings page
│   │   └── api/               # API routes (pRPC proxy)
│   ├── components/
│   │   ├── dashboard/         # Dashboard components
│   │   ├── analytics/         # Chart components
│   │   ├── topology/          # Map visualization
│   │   ├── layout/            # Navigation, headers
│   │   └── ui/                # Reusable UI components
│   ├── contexts/              # React Context providers
│   │   ├── NodesContext.tsx   # Node data state
│   │   └── ThemeContext.tsx   # Theme state
│   └── lib/                   # Utilities
│       ├── indexedDB.ts       # Caching layer
│       ├── geolocation.ts     # IP geolocation
│       └── useHistoricalData.ts # Historical data hooks
└── public/                    # Static assets
```

## API Reference

### pRPC Methods Used

| Method        | Description                                  |
| ------------- | -------------------------------------------- |
| `get-pods`    | Retrieve all pods from network registry      |
| `get-version` | Get node software version                    |
| `get-stats`   | Get node metrics (CPU, RAM, storage, uptime) |

### Internal API Routes

| Route              | Description                        |
| ------------------ | ---------------------------------- |
| `/api/prpc`        | Proxy for pRPC calls (avoids CORS) |
| `/api/pod-credits` | Fetch pod credit balances          |

## Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

## Author

**junesand12** - [GitHub](https://github.com/junesand12)

## License

MIT License - feel free to use this project as you wish.

---

Built with care for the Xandeum ecosystem.
