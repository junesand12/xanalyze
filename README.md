# XAnalyze

Analytics dashboard for monitoring Xandeum pNode network infrastructure in real-time.

## Features

### Dashboard
- Real-time network overview with key metrics (online/offline nodes, total storage, average CPU)
- Node grid with search, filtering, and sorting capabilities
- Detailed node information modal with performance stats and historical charts
- Favorites system for quick access to important nodes

### Topology
- Interactive 2D world map visualization
- Nodes grouped by geographic region and country
- Zoom and pan controls with drill-down navigation (World → Region → Country → Node)
- Connection visualization between nodes (bidirectional/unidirectional)
- Color-coded regions for easy identification

### Leaderboard
- Node rankings by credits, uptime, storage, and efficiency
- Performance tier badges (Elite, Top, High)
- Achievement badges for uptime, storage, and efficiency milestones
- Visual differentiation for top 3 positions (gold, silver, bronze)

### Analytics
- **Current View**: Real-time network statistics
  - Top storage nodes chart
  - Geographic distribution pie chart
  - Network summary statistics
- **Historical View**: Time-series data visualization
  - Network health (online/offline nodes over time)
  - Resource usage (CPU/RAM trends)
  - Storage trends
  - Network comparison across different networks

### Activity Feed
- Real-time event stream
- Node status changes (online/offline)
- New node registrations
- Filterable by event type

### Settings
- Cache management
- Keyboard shortcuts reference

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/xanalyze.git
cd xanalyze

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
npm run build
npm start
```

## Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── page.tsx           # Dashboard (home)
│   ├── topology/          # World map visualization
│   ├── leaderboard/       # Node rankings
│   ├── analytics/         # Charts and statistics
│   ├── activity/          # Event feed
│   └── settings/          # App settings
├── components/
│   ├── analytics/         # Chart components
│   ├── dashboard/         # Dashboard-specific components
│   ├── layout/            # Layout components (Dock, Header)
│   ├── topology/          # Map visualization components
│   └── ui/                # Reusable UI components
├── contexts/              # React contexts
│   └── NodesContext.tsx   # Global node state management
└── lib/                   # Utilities and hooks
    ├── utils.ts           # Helper functions
    ├── cache.ts           # IndexedDB caching
    └── useHistoricalData.ts # Historical data hooks
```

## Caching

XAnalyze implements multi-layer caching for optimal performance:

- **IndexedDB**: Node data, registry pods, geolocation, favorites, activity data
- **localStorage**: Geolocation cache fallback
- **Memory**: Runtime state management

Cache can be cleared from Settings page.

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `1` | Go to Dashboard |
| `2` | Go to Topology |
| `3` | Go to Leaderboard |
| `4` | Go to Analytics |
| `5` | Go to Activity |
| `Esc` | Close modals |

## API Integration

XAnalyze connects to:

1. **Xandeum Registry RPC** - Fetches registered pNode pods
2. **Individual pNode APIs** - Real-time node stats and gossip data
3. **Proxy Server** - Historical data aggregation

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see [LICENSE](LICENSE) for details.
