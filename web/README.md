# PRG Batch System - Web Frontend

React-based web interface for managing kitchen batch cooking operations.

## Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite 7** - Build tool and dev server
- **TailwindCSS 4** - Styling
- **shadcn/ui** - Component library
- **Socket.io Client** - Real-time updates
- **Lucide React** - Icons

## Features

### Multi-Screen Support
- **FOH (Front of House)** - Customer-facing display
- **Drive-Thru** - Drive-through window display
- **BOH (Back of House)** - Kitchen staff displays by station:
  - Stirfry station
  - Fryer station
  - Sides/Grill stations
- **Menu Management** - Admin interface for menu configuration

### Real-Time Updates
- WebSocket connection to API for live ticket updates
- Server time synchronization for accurate countdowns
- Automatic reconnection handling

### Ticket Management
- Create new cooking tickets
- Start cooking timers
- Complete tickets
- Visual batch size indicators
- Station-specific filtering

## Development

### Prerequisites
- Node.js 22+
- npm or yarn

### Setup

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Environment Variables

Create a `.env.development.local` file:

```env
VITE_API_URL=http://localhost:3333
```

For production, the API URL is set as a Docker build argument.

## Production Deployment

The frontend is deployed as a static site served by nginx in a Docker container.

See [../DEPLOYMENT.md](../DEPLOYMENT.md) for full deployment details.

**Live URL**: http://134.199.223.99:8080

## Project Structure

```
web/
├── src/
│   ├── api/           # API client functions
│   ├── components/    # React components
│   │   ├── ui/       # shadcn/ui components
│   │   ├── Screen*.tsx    # Screen-specific components
│   │   └── ...
│   ├── hooks/         # Custom React hooks
│   │   ├── useSocket.ts   # WebSocket connection
│   │   ├── useMenu.ts     # Menu data fetching
│   │   └── ...
│   ├── types/         # TypeScript type definitions
│   ├── lib/          # Utilities
│   └── App.tsx       # Main app component
├── public/           # Static assets
├── Dockerfile        # Production Docker build
└── package.json
```

## API Integration

The frontend communicates with the AdonisJS API backend:

### REST Endpoints
- `GET /api/menu` - Fetch menu items
- `POST /api/menu` - Create menu item
- `PATCH /api/menu/:id` - Update menu item
- `DELETE /api/menu/:id` - Delete menu item
- `POST /api/tickets` - Create cooking ticket
- `POST /api/tickets/:id/start` - Start cooking timer
- `POST /api/tickets/:id/complete` - Complete ticket

### WebSocket Events

**Received:**
- `snapshot` - Full state on connection
- `ticket_created` - New ticket created
- `timer_started` - Cooking timer started
- `ticket_completed` - Ticket completed
- `menu_updated` - Menu version changed

**Emitted:**
- `join` - Join station-specific rooms

## Component Documentation

### Screen Components

**ScreenFOH** - Front of house customer display
- Shows active tickets organized by section
- Large, readable text for customers
- Auto-refreshes on menu changes

**ScreenDriveThru** - Drive-through window display
- Fixed layout with 12 menu items
- Organized in 3 sections per README spec
- Quick-call buttons for common orders

**ScreenBOH** - Back of house kitchen displays
- Station-specific ticket filtering
- Cooking timers with countdown
- Batch size indicators
- Completed tickets history

**ScreenMenu** - Menu management interface
- CRUD operations for menu items
- Configure cook times per batch size
- Set recommended batches by daypart
- Enable/disable items

## Styling

Uses TailwindCSS 4 with custom configuration:

- **Colors**: Custom brand colors defined in `tailwind.config.js`
- **Components**: Pre-built UI components from shadcn/ui
- **Responsive**: Mobile-first approach
- **Dark mode**: Not currently implemented

## Testing

```bash
# Run linter
npm run lint

# Type check
npx tsc --noEmit
```

## Known Issues

- Socket.io reconnection may cause brief UI flicker
- Menu screen requires manual refresh after bulk updates
- No offline support

## Future Enhancements

- [ ] Offline mode with service workers
- [ ] Print ticket functionality
- [ ] Audio notifications for new tickets
- [ ] Dark mode support
- [ ] Mobile responsive improvements
- [ ] Ticket priority indicators

---

Last Updated: 2026-02-21
