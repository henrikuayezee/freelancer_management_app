# Freelancer Management Platform

A comprehensive web-based platform for managing freelancers, projects, performance tracking, tiering systems, and payments.

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher) - ✅ You have v22
- npm (v9 or higher) - ✅ You have v11

### Installation

1. **Clone and Install**
   ```bash
   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

2. **Set Up Environment Variables**

   Create `backend/.env`:
   ```env
   DATABASE_URL="file:./prisma/dev.db"
   JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
   PORT=3000
   NODE_ENV=development
   ALLOWED_ORIGINS=http://localhost:5173
   SENDGRID_API_KEY=your_sendgrid_api_key_here
   EMAIL_FROM=noreply@yourdomain.com
   FRONTEND_URL=http://localhost:5173
   ```

   Create `frontend/.env`:
   ```env
   VITE_API_URL=http://localhost:3000
   ```

3. **Initialize Database**
   ```bash
   cd backend
   npx prisma migrate dev
   npx prisma generate
   ```

4. **Start Development Servers**

   **Terminal 1 - Backend:**
   ```bash
   cd backend
   npm run dev
   ```

   **Terminal 2 - Frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

   **Terminal 3 - Database UI (Optional):**
   ```bash
   cd backend
   npx prisma studio --port 5555
   ```

5. **Access the Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000
   - Prisma Studio: http://localhost:5555

### Default Login Credentials

**Admin User:**
- Email: `admin@test.com`
- Password: `admin123`

**Test Freelancer:**
- Email: `john@test.com`
- Password: `test123`

---

## 📋 Features

### ✅ Phase 1: Core Platform (MVP)
- User authentication with JWT
- Application submission system
- Admin dashboard with application management
- Freelancer profile management

### ✅ Phase 2: Profile & Search
- Advanced filtering and sorting
- CSV import/export
- Detailed freelancer profiles

### ✅ Phase 3: Project Management
- Project CRUD operations
- Project assignment system
- Payment model configuration (hourly/per-asset/per-object)

### ✅ Phase 4: Performance Tracking
- Performance record creation
- Quality scoring system
- Performance metrics dashboard

### ✅ Phase 5: Tiering System
- Automated tier calculation
- Performance-based rate adjustments
- Tier change history

### ✅ Phase 6: Communication System
- In-app notifications
- Email integration (SendGrid)
- Auto-notifications for key events

### ✅ Phase 7: Payment Management
- Automated payment calculation
- Multi-step approval workflow
- Line-item tracking
- CSV export for accounting
- Payment history for freelancers

---

## 🏗️ Tech Stack

### Backend
- **Runtime:** Node.js + Express
- **Database:** SQLite (dev) / PostgreSQL (production-ready)
- **ORM:** Prisma
- **Authentication:** JWT
- **Email:** SendGrid

### Frontend
- **Framework:** React 18
- **Build Tool:** Vite
- **Routing:** React Router v6
- **State Management:** React Context API
- **Styling:** Inline styles (component-scoped)

---

## 📁 Project Structure

```
Freelancer Platform/
├── backend/
│   ├── src/
│   │   ├── controllers/       # Business logic
│   │   ├── routes/            # API endpoints
│   │   ├── middleware/        # Auth, error handling
│   │   ├── utils/             # Helper functions
│   │   └── services/          # Email service
│   ├── prisma/
│   │   ├── schema.prisma      # Database schema
│   │   └── migrations/        # Database migrations
│   └── server.js              # Entry point
├── frontend/
│   ├── src/
│   │   ├── pages/             # Page components
│   │   ├── components/        # Reusable components
│   │   ├── contexts/          # React contexts
│   │   └── services/          # API client
│   └── index.html
├── docs/                      # Original documentation
├── PROJECT_STATUS.md          # Detailed project status
├── PHASE_7_COMPLETION.md      # Latest phase details
└── README.md                  # This file
```

---

## 🔐 User Roles

### ADMIN
- Full access to all features
- Manage applications, freelancers, projects, performance, payments
- User management

### FINANCE
- Payment management access
- View-only for other features

### FREELANCER
- View own dashboard
- Browse and apply to projects
- View own performance and payments
- Edit profile

---

## 🛠️ Development

### Common Commands

```bash
# Backend
cd backend
npm run dev                    # Start dev server
npx prisma studio             # Open database UI
npx prisma migrate dev        # Create migration
npx prisma migrate reset      # Reset database

# Frontend
cd frontend
npm run dev                    # Start dev server
npm run build                  # Build for production
npm run preview                # Preview production build
```

### Database Management

**Create Migration:**
```bash
cd backend
npx prisma migrate dev --name your_migration_name
```

**Reset Database:**
```bash
cd backend
npx prisma migrate reset
```

**Open Database UI:**
```bash
cd backend
npx prisma studio --port 5555
```

---

## 📚 API Documentation

### Base URL
`http://localhost:3000/api`

### Authentication
All protected routes require JWT token in Authorization header:
```
Authorization: Bearer <token>
```

### Key Endpoints

**Authentication:**
- `POST /auth/login` - Login
- `GET /auth/me` - Get current user

**Applications:**
- `POST /applications` - Submit application (public)
- `GET /applications` - Get all (admin)
- `POST /applications/:id/approve` - Approve (admin)
- `POST /applications/:id/reject` - Reject (admin)

**Freelancers:**
- `GET /freelancers` - Get all (admin)
- `GET /freelancers/:id` - Get by ID (admin)
- `POST /freelancers/import/csv` - Import CSV (admin)
- `GET /freelancers/export/csv` - Export CSV (admin)

**Projects:**
- `GET /projects` - Get all (admin)
- `POST /projects` - Create (admin)
- `POST /projects/:id/assign` - Assign freelancer (admin)

**Payments:**
- `GET /payments` - Get all (admin/finance)
- `POST /payments/calculate` - Calculate payment (admin/finance)
- `GET /payments/freelancer/my-payments` - Get own payments (freelancer)
- `GET /payments/export/csv` - Export CSV (admin/finance)

**Freelancer Portal:**
- `GET /freelancer-portal/dashboard` - Dashboard data
- `GET /freelancer-portal/projects/available` - Browse projects
- `GET /freelancer-portal/performance` - Own performance

Full API documentation available in `PROJECT_STATUS.md`

---

## 🧪 Testing

### Manual Testing Checklist

**Admin Flow:**
1. Login as admin
2. Review applications → Approve/Reject
3. View freelancers list
4. Create project
5. Assign freelancer to project
6. Add performance record
7. Calculate tier
8. Calculate payment
9. Approve and mark payment as paid

**Freelancer Flow:**
1. Submit application
2. Wait for approval
3. Login as freelancer
4. Browse available projects
5. View own projects
6. Check performance records
7. View payment history

---

## 🚀 Deployment

### Production Preparation

1. **Switch to PostgreSQL**
   - Update `DATABASE_URL` in `.env`
   - Run migrations: `npx prisma migrate deploy`

2. **Environment Variables**
   - Set `NODE_ENV=production`
   - Set secure `JWT_SECRET`
   - Configure `SENDGRID_API_KEY`
   - Update `ALLOWED_ORIGINS`

3. **Build Frontend**
   ```bash
   cd frontend
   npm run build
   ```

4. **Start Backend**
   ```bash
   cd backend
   npm start
   ```

### Recommended Hosting
- **Backend:** Railway, Render, Heroku, DigitalOcean
- **Frontend:** Vercel, Netlify, Cloudflare Pages
- **Database:** Supabase, Railway, Neon

---

## 📖 Documentation

- **PROJECT_STATUS.md** - Complete project status and detailed documentation
- **PHASE_7_COMPLETION.md** - Latest phase implementation details
- **docs/** - Original documentation folder
- **Prisma Schema** - `backend/prisma/schema.prisma`

---

## 🐛 Troubleshooting

**Database Issues:**
```bash
cd backend
npx prisma migrate reset
npx prisma generate
```

**Port Already in Use:**
```bash
# Change PORT in backend/.env
# Or kill process: npx kill-port 3000
```

**Frontend Build Errors:**
```bash
cd frontend
rm -rf node_modules
npm install
```

---

## 🎯 Current Status

**Phase 7 Complete** - All core features implemented and functional

**Next Steps:**
- Testing & QA
- User documentation
- Production deployment
- Optional enhancements (analytics, reporting)

**Last Updated:** October 1, 2025

---

## 📝 Session Continuation

When starting a new session:
1. Read `PROJECT_STATUS.md` for complete project overview
2. Read `PHASE_7_COMPLETION.md` for latest changes
3. Start all three servers (backend, frontend, prisma studio)
4. Test login to verify everything works
5. Check terminals for any error messages

---

## 👥 Support

For questions or issues:
1. Check `PROJECT_STATUS.md` for detailed documentation
2. Review error logs in terminal
3. Use Prisma Studio to inspect database
4. Check browser console for frontend errors
