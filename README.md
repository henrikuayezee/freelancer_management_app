# Freelancer Management Platform

A comprehensive web-based platform to manage 4000+ data annotation freelancers through their complete lifecycle.

## Quick Start

### Prerequisites
- Node.js v18+ (you have v22 ✅)
- npm v9+ (you have v11 ✅)

### Installation

1. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Install Frontend Dependencies**
   ```bash
   cd frontend
   npm install
   ```

3. **Set Up Database**
   ```bash
   cd backend
   npx prisma generate
   npx prisma migrate dev
   ```

4. **Start Development Servers**

   Terminal 1 (Backend):
   ```bash
   cd backend
   npm run dev
   ```

   Terminal 2 (Frontend):
   ```bash
   cd frontend
   npm run dev
   ```

5. **Access the Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000

### Default Admin Account
After running the database migration, a default admin account will be created:
- **Email**: admin@ayadata.com
- **Password**: Admin@123 (change this immediately!)

## Project Structure

```
/Freelancer Platform/
├── docs/                    # Comprehensive documentation
├── backend/                 # Node.js + Express API
│   ├── prisma/             # Database schema & migrations
│   ├── src/                # Source code
│   └── server.js           # Entry point
├── frontend/               # React application
│   ├── public/            # Static assets
│   └── src/               # Source code
└── README.md              # This file
```

## Documentation

- [Project Overview](docs/00-PROJECT-OVERVIEW.md) - High-level summary
- [Requirements](docs/01-REQUIREMENTS.md) - Detailed requirements (coming soon)
- [Database Schema](docs/02-DATABASE-SCHEMA.md) - Database structure (coming soon)
- [API Documentation](docs/03-API-DOCUMENTATION.md) - API endpoints (coming soon)
- [Development Log](docs/04-DEVELOPMENT-LOG.md) - Progress tracking
- [Setup Guide](docs/05-SETUP-GUIDE.md) - Detailed setup (coming soon)
- [Deployment Guide](docs/06-DEPLOYMENT-GUIDE.md) - Production deployment (coming soon)
- [TODO Roadmap](docs/07-TODO-ROADMAP.md) - Feature roadmap

## Technology Stack

- **Backend**: Node.js, Express, Prisma, SQLite/PostgreSQL
- **Frontend**: React, Vite, Tailwind CSS, Shadcn/ui
- **Authentication**: JWT + bcrypt

## Development Status

🚧 **Phase 1 - MVP**: In Progress (Day 1)

- [x] Project setup
- [ ] Database schema
- [ ] Authentication system
- [ ] Application form
- [ ] Admin panel

## Support

For questions or issues, refer to the [Development Log](docs/04-DEVELOPMENT-LOG.md) or contact the project team.

## License

Proprietary - Aya Data

---

**Last Updated**: 2025-09-30