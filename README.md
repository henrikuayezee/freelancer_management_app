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

✅ **Phase 1 - MVP**: COMPLETED! (Day 1)

- [x] Project setup
- [x] Database schema (15+ tables)
- [x] Authentication system (JWT)
- [x] Application form (public)
- [x] Admin panel (applications & freelancers)
- [x] Approval/rejection workflow

## What Works Right Now

### For Freelancers
1. Visit http://localhost:5173 or http://localhost:5173/apply
2. Fill out the application form
3. Submit and wait for admin approval
4. Once approved, receive login credentials via the admin panel

### For Admins
1. Visit http://localhost:5173/login
2. Login with default credentials:
   - Email: `admin@ayadata.com`
   - Password: `Admin@123`
3. View pending applications
4. Click "View" to see full application details
5. Approve or reject applications
6. View all approved freelancers in "All Freelancers" tab

## Testing the Application

### Test Flow 1: Submit an Application
```bash
# 1. Open browser to http://localhost:5173
# 2. Fill out the form with test data
# 3. Submit
# 4. You should see a success message
```

### Test Flow 2: Approve an Application
```bash
# 1. Login as admin at http://localhost:5173/login
# 2. Go to "Pending Applications" tab
# 3. Click "View" on an application
# 4. Click "✓ Approve Application"
# 5. Note the temporary password shown
# 6. Check "All Freelancers" tab to see the new freelancer
```

## API Endpoints (Backend)

### Public Endpoints
- `POST /api/applications` - Submit freelancer application

### Protected Endpoints (Require Authentication)
- `POST /api/auth/login` - Admin login
- `GET /api/auth/me` - Get current user
- `GET /api/applications` - List all applications (admin)
- `GET /api/applications/:id` - Get application details (admin)
- `POST /api/applications/:id/approve` - Approve application (admin)
- `POST /api/applications/:id/reject` - Reject application (admin)
- `GET /api/freelancers` - List all freelancers (admin)
- `GET /api/freelancers/:id` - Get freelancer details (admin)

## Support

For questions or issues, refer to the [Development Log](docs/04-DEVELOPMENT-LOG.md) or contact the project team.

## License

Proprietary - Aya Data

---

**Last Updated**: 2025-09-30