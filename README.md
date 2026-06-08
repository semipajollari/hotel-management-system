# Hotel Management System

A modern, full-stack hotel management web application built with **Next.js 14**, **MongoDB**, and **Tailwind CSS**. Role-based access control for four user types: Hotel Manager, Restaurant Manager, Receptionist, and Waiter.

---

## Features

| Role | Features |
|------|----------|
| **Hotel Manager** | Rooms (CRUD), Bookings, Clients, Employees, Dashboard stats |
| **Receptionist** | Room availability, Create/cancel bookings, Register clients |
| **Restaurant Manager** | Products/menu (CRUD), View & mark bills as paid, Employees |
| **Waiter** | View menu, Create bills, View own bills |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Database | MongoDB + Mongoose |
| Auth | NextAuth.js v4 (JWT) |
| Deploy | Vercel |

---

## Deploy on Vercel (no Node.js needed locally)

### Step 1 — MongoDB Atlas (free)

1. Create an account at [cloud.mongodb.com](https://cloud.mongodb.com)
2. Create a free **M0** cluster
3. **Database Access** → Add a user with a password
4. **Network Access** → Add IP `0.0.0.0/0` (allow all)
5. Click **Connect** → **Drivers** → copy the connection string
6. Replace `<password>` with your database user's password

### Step 2 — Push to GitHub

1. Go to [github.com](https://github.com) → **New repository** → create it (empty)
2. Open the `modern-hotel/` folder on your computer
3. Drag and drop all files into the GitHub repository page
4. Click **Commit changes**

### Step 3 — Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Import your GitHub repository
3. Add these **Environment Variables**:

| Name | Value |
|------|-------|
| `MONGODB_URI` | Your MongoDB Atlas connection string |
| `NEXTAUTH_SECRET` | Any random string (e.g. `hotel2026secret`) |
| `NEXTAUTH_URL` | Your Vercel URL (e.g. `https://modern-hotel.vercel.app`) |
| `SEED_SECRET` | Any secret word (e.g. `myseedtoken2026`) |

4. Click **Deploy** — Vercel installs packages and builds automatically.

### Step 4 — Seed the database (one time)

After deploy, open this URL in your browser:

```
https://your-app.vercel.app/api/seed?token=myseedtoken2026
```

Replace `myseedtoken2026` with whatever you set for `SEED_SECRET`.

You will see a JSON response confirming the data was created.

---

## Running Locally (optional — requires Node.js 18+)

```bash
cd modern-hotel
npm install
cp .env.example .env.local
# Edit .env.local with your MongoDB URI and secrets
npm run dev
# Open http://localhost:3000
```

---

## Demo Accounts

| Email | Password | Role |
|-------|----------|------|
| manager@hotel.com | password123 | Hotel Manager |
| restaurant@hotel.com | password123 | Restaurant Manager |
| receptionist@hotel.com | password123 | Receptionist |
| waiter@hotel.com | password123 | Waiter |

---

## Project Structure

```
modern-hotel/
├── app/
│   ├── login/            # Login page
│   ├── dashboard/        # All dashboard pages
│   │   ├── page.tsx      # Dashboard home (stats)
│   │   ├── rooms/        # Room management
│   │   ├── bookings/     # Booking management
│   │   ├── clients/      # Client management
│   │   ├── employees/    # Employee management
│   │   ├── products/     # Restaurant products
│   │   └── bills/        # Restaurant bills
│   └── api/              # Backend API routes
│       ├── auth/         # NextAuth handler
│       ├── rooms/
│       ├── bookings/
│       ├── clients/
│       ├── employees/
│       ├── products/
│       ├── bills/
│       └── stats/
├── components/ui/        # Reusable components
├── lib/                  # Utilities (db, auth, helpers)
├── models/               # Mongoose models
├── scripts/              # seed.ts
└── docs/                 # Requirements & diagrams
```

---

## Deploying to Vercel

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/your-username/modern-hotel.git
git push -u origin main
```

### 2. Import on Vercel

1. Go to [vercel.com](https://vercel.com) → **New Project**
2. Import your GitHub repository
3. Add environment variables:
   - `MONGODB_URI` — your MongoDB Atlas connection string
   - `NEXTAUTH_SECRET` — random secret (32+ chars)
   - `NEXTAUTH_URL` — your Vercel domain (e.g. `https://modern-hotel.vercel.app`)
4. Click **Deploy**

### 3. Seed production database

After deploying, run the seed script locally pointing at your Atlas URI:

```bash
MONGODB_URI="your-atlas-uri" npm run seed
```

---

## MongoDB Atlas Setup (Free Tier)

1. Create account at [cloud.mongodb.com](https://cloud.mongodb.com)
2. Create a free **M0** cluster
3. Under **Database Access** → Add a database user
4. Under **Network Access** → Add IP `0.0.0.0/0` (allow all — fine for dev/school)
5. Click **Connect** → **Connect your application** → copy the connection string
6. Replace `<password>` in the string with your database user's password

---

## Documentation

See the `/docs` folder:
- `requirements.md` — Functional & Non-Functional Requirements, Use Cases
- `diagrams.md` — All Mermaid diagrams (Use Case, ER, Architecture, Sequence, Class, State)
