# PRG Batch System

Kitchen batch cooking management system for restaurant operations.

## 🚀 Live Deployment

**Production**: http://134.199.223.99:8080

- Frontend: Port 8080
- API: Port 3333
- Database: PostgreSQL 16

See [DEPLOYMENT.md](./DEPLOYMENT.md) for full deployment documentation.

## 📋 Overview

The PRG Batch System helps kitchen staff manage batch cooking operations efficiently. It provides:

- **Multiple Display Screens**: FOH, Drive-Thru, and station-specific BOH displays
- **Real-time Updates**: WebSocket-powered live ticket updates
- **Timer Management**: Automatic cooking countdown timers
- **Menu Configuration**: Admin interface for menu management
- **Batch Size Tracking**: Support for multiple batch sizes per item

## 🏗️ Architecture

```
┌─────────────────────────────────────────────┐
│              Monorepo Structure             │
├─────────────────────────────────────────────┤
│                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐ │
│  │   Web    │  │   API    │  │ Database │ │
│  │  (React) │◄─┤(AdonisJS)│◄─┤(Postgres)│ │
│  │  + Vite  │  │+ Socket  │  │   16     │ │
│  └──────────┘  └──────────┘  └──────────┘ │
│                                             │
└─────────────────────────────────────────────┘
```

### Tech Stack

**Frontend** (`/web`)
- React 19 + TypeScript
- Vite 7
- TailwindCSS 4
- shadcn/ui
- Socket.io Client

**Backend** (`/api`)
- AdonisJS 6
- TypeScript
- Lucid ORM
- Socket.io
- PostgreSQL driver

**Database**
- PostgreSQL 16
- Migrations & Seeders included

**Deployment**
- Docker & Docker Compose
- nginx (for static frontend)
- DigitalOcean Droplet

## 🚦 Quick Start

### Prerequisites

- Node.js 22+
- Docker & Docker Compose
- PostgreSQL 16 (or use Docker)

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/olegkuftyrev/PRG-batch-system.git
   cd PRG-batch-system
   ```

2. **Start the database**
   ```bash
   docker-compose up -d postgres
   ```

3. **Setup API**
   ```bash
   cd api
   npm install
   cp .env.example .env
   # Edit .env with your database credentials
   node ace migration:run
   node ace db:seed
   npm run dev
   ```

4. **Setup Web**
   ```bash
   cd web
   npm install
   npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:5173
   - API: http://localhost:3333
   - API Health: http://localhost:3333/health

### Docker Development

Run everything with Docker:

```bash
docker-compose up -d
```

Access:
- Frontend: http://localhost:8080
- API: http://localhost:3333

## 📚 Documentation

- [DEPLOYMENT.md](./DEPLOYMENT.md) - Production deployment guide
- [deploy-droplet.md](./deploy-droplet.md) - DigitalOcean droplet setup
- [web/README.md](./web/README.md) - Frontend documentation
- [api/.env.example](./api/.env.example) - Environment variables reference

## 🎯 Features

### Kitchen Displays

**Front of House (FOH)**
- Customer-facing display showing active orders
- Organized by menu sections
- Large, readable interface

**Drive-Thru**
- Fixed layout with 12 common items
- Quick-call functionality
- Optimized for drive-through operations

**Back of House (BOH)**
- Station-specific displays (Stirfry, Fryer, Sides, Grill)
- Cooking countdown timers
- Batch size indicators
- Completed tickets history

### Menu Management

- CRUD operations for menu items
- Configure cooking times per batch size
- Set recommended batches by daypart (breakfast, lunch, dinner, etc.)
- Enable/disable items
- Real-time sync across all displays

### Ticket System

- Create tickets with batch sizes
- Automatic timer start
- WebSocket-powered real-time updates
- Station-based filtering
- Source tracking (FOH vs Drive-Thru)

## 🗄️ Database

### Schema

**menu_items**
- id, code, title, station
- batch_sizes (array)
- cook_times (JSON)
- enabled, recommended_batch (JSON)

**menu_versions**
- id, version

**tickets**
- id, station, seq, state, source
- menu item snapshot data
- timestamps

### Seeded Data

16 menu items included:
- 3 Appetizers (Egg Roll, Rangoon, Spring Roll)
- 3 Beef dishes (Beijing Beef, Black Pepper Steak, Broccoli Beef)
- 6 Chicken dishes (Orange, Kung Pao, Mushroom, etc.)
- 1 Seafood (Honey Walnut Shrimp)
- 2 Sides (Chow Mein, Fried Rice)
- 1 Vegetable (Super Greens)

## 🔌 API Endpoints

### Menu
- `GET /api/menu` - List all items
- `POST /api/menu` - Create item
- `PATCH /api/menu/:id` - Update item
- `DELETE /api/menu/:id` - Delete item

### Tickets
- `GET /api/tickets` - List tickets
- `POST /api/tickets` - Create ticket
- `POST /api/tickets/:id/start` - Start timer
- `POST /api/tickets/:id/complete` - Complete ticket

### Health
- `GET /health` - Health check with DB status

### WebSocket
- `ws://localhost:3333/socket.io`
- Events: `snapshot`, `ticket_created`, `timer_started`, `ticket_completed`, `menu_updated`

## 🛠️ Development

### Project Structure

```
PRG-batch-system/
├── api/                   # AdonisJS backend
│   ├── app/
│   │   ├── controllers/  # HTTP controllers
│   │   ├── models/       # Database models
│   │   └── services/     # Business logic
│   ├── database/
│   │   ├── migrations/   # Database migrations
│   │   └── seeders/      # Data seeders
│   ├── start/            # Bootstrap files
│   └── Dockerfile
├── web/                   # React frontend
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── hooks/        # Custom hooks
│   │   ├── api/          # API client
│   │   └── types/        # TypeScript types
│   └── Dockerfile
├── docker-compose.yml     # Docker orchestration
├── DEPLOYMENT.md          # Deployment docs
└── README.md             # This file
```

### Commands

**API:**
```bash
cd api
npm run dev          # Development with HMR
npm run build        # Build for production
npm run start        # Run production build
node ace migration:run    # Run migrations
node ace db:seed          # Seed database
```

**Web:**
```bash
cd web
npm run dev          # Development server
npm run build        # Production build
npm run preview      # Preview production build
npm run lint         # Run linter
```

**Docker:**
```bash
docker-compose up -d              # Start all services
docker-compose down               # Stop all services
docker-compose logs -f            # View logs
docker-compose restart api        # Restart API
docker-compose exec api sh        # Shell into API container
```

## 🐛 Troubleshooting

### API won't start
- Check PostgreSQL is running
- Verify `.env` file exists with correct credentials
- Run migrations: `node ace migration:run`

### Frontend can't connect to API
- Verify API is running on port 3333
- Check `VITE_API_URL` environment variable
- Check browser console for CORS errors

### Database connection errors
- Verify PostgreSQL credentials in `.env`
- Check database exists: `psql -U prg -d prg_batch`
- For Docker: `docker-compose logs postgres`

### WebSocket not connecting
- Check Socket.io path: `/socket.io`
- Verify API URL includes protocol (http://)
- Check browser network tab for WebSocket connection

## 📝 License

Private project - All rights reserved

## 👥 Contributing

Internal project - Contact repository owner for contribution guidelines

## 📞 Support

- **Issues**: GitHub Issues
- **Deployment**: See [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Live Site**: http://134.199.223.99:8080

---

**Deployed**: February 21, 2026  
**Status**: ✅ Production Ready  
**Version**: 1.0.0
