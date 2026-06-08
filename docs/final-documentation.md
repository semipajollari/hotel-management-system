# Hotel Management System
## Final Project Documentation

**Course:** Software Engineering / Web Development  
**Academic Year:** 2025–2026  
**Live Application:** https://hotel-management-system-black-iota.vercel.app  
**GitHub Repository:** https://github.com/semipajollari/hotel-management-system  

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Problem Statement & Objectives](#2-problem-statement--objectives)
3. [Technologies Used](#3-technologies-used)
4. [System Architecture](#4-system-architecture)
5. [User Roles & Access Control](#5-user-roles--access-control)
6. [Functional Requirements](#6-functional-requirements)
7. [Key Features](#7-key-features)
8. [Database Design](#8-database-design)
9. [API Reference](#9-api-reference)
10. [Security Implementation](#10-security-implementation)
11. [User Interface](#11-user-interface)
12. [Deployment](#12-deployment)
13. [Team Work Division](#13-team-work-division)
14. [Conclusion](#14-conclusion)

---

## 1. Introduction

The **Hotel Management System** is a full-stack web application designed to digitalize and streamline the daily operations of a hotel. It provides a centralized platform for managing hotel rooms, guest bookings, restaurant orders, billing, and staff — all accessible from any device with a web browser, without requiring any software installation.

The system was built as a modern rebuild of a previous documentation-only project, transforming the original system designs (UML diagrams, use cases, ER diagrams) into a fully functioning, cloud-deployed application using a contemporary technology stack.

---

## 2. Problem Statement & Objectives

### Problem Statement

Traditional hotel management relies heavily on paper-based or disconnected manual processes: handwritten booking registers, verbal staff communication, and separate systems for the hotel and restaurant. This leads to:

- Booking errors and double-reservations
- Slow check-in/check-out procedures
- Lack of real-time visibility into room availability
- Difficulty tracking restaurant revenue and unpaid bills
- No centralized staff management

### Objectives

- Replace manual workflows with a centralized digital platform
- Provide role-based dashboards tailored to each staff member's responsibilities
- Enable real-time visibility of room availability, active bookings, and revenue
- Support restaurant operations from order creation to payment
- Ensure secure access with encrypted credentials and server-side authorization
- Deploy to the cloud so no local installation is needed

---

## 3. Technologies Used

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 14 (App Router) | React framework with server-side rendering |
| **Language** | TypeScript | Type safety across frontend and backend |
| **Styling** | Tailwind CSS | Utility-first responsive CSS framework |
| **Backend** | Next.js API Routes | Serverless REST API endpoints |
| **Database** | MongoDB Atlas | Cloud NoSQL document database |
| **ODM** | Mongoose 8 | MongoDB object modeling with schema validation |
| **Authentication** | NextAuth.js v4 | JWT-based session management |
| **Password Hashing** | bcryptjs | Secure password encryption |
| **Deployment** | Vercel | Serverless cloud hosting with CI/CD |
| **Version Control** | Git + GitHub | Source control and collaboration |

### Why These Technologies?

**Next.js** combines frontend and backend in one project, eliminating the need for a separate server — ideal for a team with varied experience levels. Its **App Router** provides both server components (fast initial load) and client components (interactive UI) in the same codebase.

**MongoDB** was chosen for its flexible document model, which maps naturally to hotel data (rooms with varying fields, bills with variable item arrays). **MongoDB Atlas** provides a free-tier cloud database accessible from Vercel's serverless functions.

**Vercel** offers zero-configuration deployment directly from GitHub — every `git push` triggers an automatic redeploy, enabling continuous delivery without a DevOps pipeline.

---

## 4. System Architecture

### Overview

The system follows a **three-tier architecture** deployed entirely in the cloud:

```
┌─────────────────────────────────────────────────────────┐
│                    BROWSER (Client Tier)                 │
│         Next.js React UI — Tailwind CSS                 │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTPS
┌──────────────────────▼──────────────────────────────────┐
│                VERCEL (Application Tier)                 │
│  ┌─────────────────┐  ┌──────────────┐  ┌───────────┐  │
│  │  App Router     │  │  API Routes  │  │ NextAuth  │  │
│  │  Pages/Layouts  │  │  /api/*      │  │  JWT Auth │  │
│  └─────────────────┘  └──────────────┘  └───────────┘  │
└──────────────────────┬──────────────────────────────────┘
                       │ Mongoose ODM
┌──────────────────────▼──────────────────────────────────┐
│               MONGODB ATLAS (Data Tier)                  │
│         6 Collections — Cloud Database                   │
└─────────────────────────────────────────────────────────┘
```

### Request Flow

1. User navigates to the app in the browser
2. Next.js serves the page (server-rendered for fast initial load)
3. Client-side React takes over for interactivity
4. User actions trigger `fetch()` calls to `/api/*` endpoints
5. API routes verify the JWT session via NextAuth
6. Authorized requests query MongoDB via Mongoose
7. JSON responses update the UI state

### Key Architectural Decisions

- **JWT sessions** (not database sessions): stateless authentication suitable for serverless deployments where there is no persistent server process
- **Mongoose `.lean()`**: API routes return plain JavaScript objects instead of Mongoose documents, avoiding serialization issues in serverless environments
- **Global connection caching** (`lib/mongodb.ts`): reuses the MongoDB connection across API calls in the same serverless function instance, preventing connection pool exhaustion
- **Server Components for dashboards**: statistics are fetched directly on the server (not via client-side fetch), reducing API calls and improving load time

---

## 5. User Roles & Access Control

The system implements **Role-Based Access Control (RBAC)** with four distinct roles:

### Role Comparison

| Feature | Hotel Manager | Receptionist | Restaurant Manager | Waiter |
|---------|:---:|:---:|:---:|:---:|
| Dashboard statistics | ✅ Full | ✅ Limited | ✅ Restaurant | ✅ Own bills |
| Manage Rooms (CRUD) | ✅ | ❌ | ❌ | ❌ |
| View Rooms | ✅ | ✅ | ❌ | ❌ |
| Create/Cancel Bookings | ✅ | ✅ | ❌ | ❌ |
| Guest Check-out | ✅ | ✅ | ❌ | ❌ |
| Client Registration | ✅ | ✅ | ❌ | ❌ |
| Manage Employees | ✅ | ❌ | ✅ | ❌ |
| Manage Products/Menu | ❌ | ❌ | ✅ | ❌ |
| View Menu | ❌ | ❌ | ✅ | ✅ |
| Create Bills | ❌ | ❌ | ❌ | ✅ |
| Mark Bills as Paid | ❌ | ❌ | ✅ | ❌ |
| Change Password | ✅ | ✅ | ✅ | ✅ |

### Access Control Implementation

Access control is enforced at **two levels**:

1. **UI Level**: Navigation items and action buttons are conditionally rendered based on `session.user.role`
2. **API Level**: Every API route calls `getServerSession()` and checks the role before processing the request — users cannot bypass UI restrictions by calling API endpoints directly

```typescript
// Example: Only hotel_manager can create rooms
const role = (session.user as any).role;
if (role !== "hotel_manager") {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}
```

---

## 6. Functional Requirements

### Authentication (FR-01 to FR-05)
| ID | Requirement | Status |
|----|------------|--------|
| FR-01 | Login with email and password | ✅ Implemented |
| FR-02 | Deny invalid credentials | ✅ Implemented |
| FR-03 | Assign role on account creation | ✅ Implemented |
| FR-04 | Restrict features by role | ✅ Implemented |
| FR-05 | Allow sign out at any time | ✅ Implemented |

### Room Management (FR-10 to FR-15)
| ID | Requirement | Status |
|----|------------|--------|
| FR-10 | Hotel Manager can add rooms | ✅ Implemented |
| FR-11 | Hotel Manager can edit room details | ✅ Implemented |
| FR-12 | Hotel Manager can delete rooms | ✅ Implemented |
| FR-13 | Display all rooms with status | ✅ Implemented |
| FR-14 | Four room types: Single, Double, Deluxe, Suite | ✅ Implemented |
| FR-15 | Three room statuses: Available, Occupied, Maintenance | ✅ Implemented |

### Client Management (FR-20 to FR-22)
| ID | Requirement | Status |
|----|------------|--------|
| FR-20 | Register client with all fields | ✅ Implemented |
| FR-21 | Display all clients | ✅ Implemented |
| FR-22 | Search clients by name, email, ID | ✅ Implemented |

### Booking Management (FR-30 to FR-35)
| ID | Requirement | Status |
|----|------------|--------|
| FR-30 | Create booking with client, room, dates | ✅ Implemented |
| FR-31 | Auto-calculate total (price × nights) | ✅ Implemented |
| FR-32 | Mark room as Occupied on booking | ✅ Implemented |
| FR-33 | Cancel active booking | ✅ Implemented |
| FR-34 | Free room when booking cancelled | ✅ Implemented |
| FR-35 | Display bookings with full details | ✅ Implemented |

### Employee Management (FR-40 to FR-43)
| ID | Requirement | Status |
|----|------------|--------|
| FR-40 | Managers can add employees | ✅ Implemented |
| FR-41 | Managers can remove employees | ✅ Implemented |
| FR-42 | Prevent self-deletion | ✅ Implemented |
| FR-43 | Display all employees with roles | ✅ Implemented |

### Product Management (FR-50 to FR-53)
| ID | Requirement | Status |
|----|------------|--------|
| FR-50 | Add products with all fields | ✅ Implemented |
| FR-51 | Edit and delete products | ✅ Implemented |
| FR-52 | Three categories: Food, Drink, Dessert | ✅ Implemented |
| FR-53 | Mark product unavailable without deleting | ✅ Implemented |

### Billing (FR-60 to FR-64)
| ID | Requirement | Status |
|----|------------|--------|
| FR-60 | Waiter creates bill per table | ✅ Implemented |
| FR-61 | Add multiple products with quantities | ✅ Implemented |
| FR-62 | Auto-calculate bill total | ✅ Implemented |
| FR-63 | Restaurant Manager marks bill as Paid | ✅ Implemented |
| FR-64 | Display bill details | ✅ Implemented |

### Dashboard & Statistics (FR-70 to FR-73)
| ID | Requirement | Status |
|----|------------|--------|
| FR-70 | Hotel Manager: 6 key statistics | ✅ Implemented |
| FR-71 | Receptionist: 4 statistics | ✅ Implemented |
| FR-72 | Restaurant Manager: 5 statistics | ✅ Implemented |
| FR-73 | Waiter: own bill statistics | ✅ Implemented |

---

## 7. Key Features

### 7.1 Public Landing Page

A professional marketing page (accessible without login) featuring:
- Hero section with full-screen hotel photography
- Services section (Luxury Rooms, Fine Dining, Premium Service)
- Statistics bar (50+ rooms, 4.9★ rating, 10+ years, 5000+ guests)
- Room types showcase with pricing (Single, Double, Deluxe, Suite)
- Call-to-action section linking to the dashboard login

### 7.2 Authentication

- **Secure login** with email and password
- **JWT sessions** stored in encrypted cookies (no server-side session storage)
- **Quick-login buttons** on the login page for easy demo access
- **Show/hide password** toggle
- **Automatic redirect**: logged-in users are sent directly to the dashboard

### 7.3 Role-Specific Dashboards

Each role sees a personalized dashboard with:
- Gradient welcome banner with the user's name and greeting
- Statistics cards with color-coded icons relevant to their role
- Quick action shortcuts (e.g., "New Booking", "Add Client")

### 7.4 Room Management

- Full CRUD (Create, Read, Update, Delete) for rooms
- **Filter buttons**: All / Available / Occupied / Maintenance
- Room details: number, type, floor, price per night, capacity, description, status
- Status badge with color coding (green = available, red = occupied, orange = maintenance)

### 7.5 Booking System

- Create booking by selecting client, available room, and dates
- **Live price preview**: shows number of nights and total cost as dates are selected
- Room automatically marked as **Occupied** when booking is created
- **Check Out** action: marks booking as Completed, frees the room
- **Cancel** action: marks booking as Cancelled, frees the room
- Full booking history with client and room details

### 7.6 Client Management

- Register guests with: First Name, Last Name, Email, Phone, ID Number, Nationality
- **Real-time search**: filters client list by name, email, or ID number as you type

### 7.7 Restaurant — Product Menu

- Grid card view of all menu items
- **Category filter**: All / Food / Drink / Dessert
- Mark items as unavailable (greyed out) without deletion
- Full CRUD for Restaurant Manager

### 7.8 Restaurant — Billing

- Waiters create bills for a table number
- Add multiple products with quantities; running total shown
- View bill details in a modal with itemized breakdown
- **Print Bill** button: browser print dialog with print-optimized CSS (hides navigation)
- Restaurant Manager marks bills as Paid

### 7.9 Employee Management

- Add new staff accounts with name, email, password, and role
- Remove staff accounts
- Self-deletion protection (enforced on both frontend and API)

### 7.10 Account Settings

All users can:
- **Update display name** (reflected immediately in the sidebar)
- **Change password** with current password verification, confirmation field, and strength validation

---

## 8. Database Design

The system uses **MongoDB** with **6 collections**:

### 8.1 User Collection

```javascript
{
  _id:       ObjectId,
  name:      String   (required),
  email:     String   (required, unique),
  password:  String   (required, bcrypt hash),
  role:      String   (enum: hotel_manager | restaurant_manager | receptionist | waiter),
  createdAt: Date
}
```

**Pre-save hook**: password is automatically hashed with bcrypt (salt rounds: 10) before every save, preventing plain-text storage.

### 8.2 Room Collection

```javascript
{
  _id:         ObjectId,
  number:      String   (required, unique — e.g., "101", "302"),
  type:        String   (enum: single | double | suite | deluxe),
  price:       Number   (price per night in ALL),
  capacity:    Number   (max guests),
  status:      String   (enum: available | occupied | maintenance),
  floor:       Number,
  description: String,
  createdAt:   Date
}
```

### 8.3 Client Collection

```javascript
{
  _id:         ObjectId,
  firstName:   String   (required),
  lastName:    String   (required),
  email:       String   (required, unique),
  phone:       String   (required),
  idNumber:    String   (required, unique — passport/ID card number),
  nationality: String   (required),
  createdAt:   Date
}
```

### 8.4 Booking Collection

```javascript
{
  _id:        ObjectId,
  client:     ObjectId  → ref: Client,
  room:       ObjectId  → ref: Room,
  checkIn:    Date      (required),
  checkOut:   Date      (required),
  totalPrice: Number    (calculated: nights × room.price),
  notes:      String    (optional),
  status:     String    (enum: active | completed | cancelled),
  createdBy:  ObjectId  → ref: User,
  createdAt:  Date
}
```

**Business rules enforced:**
- Room must be `available` before booking creation
- Room set to `occupied` on creation
- Room set to `available` on cancellation or checkout

### 8.5 Product Collection

```javascript
{
  _id:         ObjectId,
  name:        String   (required),
  category:    String   (enum: food | drink | dessert),
  price:       Number   (price in ALL),
  available:   Boolean  (default: true),
  description: String,
  createdAt:   Date
}
```

### 8.6 Bill Collection

```javascript
{
  _id:         ObjectId,
  tableNumber: Number   (required),
  items: [
    {
      product:     ObjectId → ref: Product,
      productName: String   (snapshot — preserved if product is deleted),
      quantity:    Number,
      price:       Number   (price at time of order)
    }
  ],
  total:     Number    (calculated sum of items),
  status:    String    (enum: open | paid),
  createdBy: ObjectId  → ref: User,
  createdAt: Date
}
```

**Note on product snapshots:** `productName` and `price` are stored directly in each bill item. This preserves the historical record even if the product is later edited or deleted.

### Entity Relationship Overview

```
USER ─────────── creates ──────────> BOOKING
USER ─────────── creates ──────────> BILL
BOOKING ─────── references ────────> CLIENT
BOOKING ─────── references ────────> ROOM
BILL ───────────── contains ────────> PRODUCT (via items[])
```

---

## 9. API Reference

All endpoints require a valid session cookie (set by NextAuth after login). Unauthenticated requests return `401 Unauthorized`.

### Authentication

| Method | Endpoint | Description |
|--------|---------|-------------|
| POST | `/api/auth/signin` | Sign in (handled by NextAuth) |
| POST | `/api/auth/signout` | Sign out |

### Rooms

| Method | Endpoint | Auth Required | Description |
|--------|---------|:---:|-------------|
| GET | `/api/rooms` | Any role | List all rooms |
| POST | `/api/rooms` | hotel_manager | Create a room |
| PUT | `/api/rooms/[id]` | hotel_manager | Update a room |
| DELETE | `/api/rooms/[id]` | hotel_manager | Delete a room |

### Clients

| Method | Endpoint | Auth Required | Description |
|--------|---------|:---:|-------------|
| GET | `/api/clients` | Any role | List all clients |
| POST | `/api/clients` | Any role | Register a client |

### Bookings

| Method | Endpoint | Auth Required | Description |
|--------|---------|:---:|-------------|
| GET | `/api/bookings` | Any role | List all bookings (with populated client/room) |
| POST | `/api/bookings` | Any role | Create a booking (marks room occupied) |
| PATCH | `/api/bookings/[id]` | Any role | Cancel (`action: "cancel"`) or check out (`action: "checkout"`) |

### Employees

| Method | Endpoint | Auth Required | Description |
|--------|---------|:---:|-------------|
| GET | `/api/employees` | Manager roles | List all employees |
| POST | `/api/employees` | Manager roles | Add an employee |
| DELETE | `/api/employees/[id]` | Manager roles | Remove employee (self-delete blocked) |

### Products

| Method | Endpoint | Auth Required | Description |
|--------|---------|:---:|-------------|
| GET | `/api/products` | Any role | List all products |
| POST | `/api/products` | restaurant_manager | Create a product |
| PUT | `/api/products/[id]` | restaurant_manager | Update a product |
| DELETE | `/api/products/[id]` | restaurant_manager | Delete a product |

### Bills

| Method | Endpoint | Auth Required | Description |
|--------|---------|:---:|-------------|
| GET | `/api/bills` | Any role | List bills (waiters: own only; managers: all) |
| POST | `/api/bills` | waiter/manager | Create a bill |
| PATCH | `/api/bills/[id]` | restaurant_manager | Mark bill as paid |

### Profile & Stats

| Method | Endpoint | Auth Required | Description |
|--------|---------|:---:|-------------|
| PATCH | `/api/profile` | Any role | Update name or password |
| GET | `/api/stats` | Any role | Role-specific statistics |
| GET | `/api/seed?token=SECRET` | Token-protected | Seed initial data |

---

## 10. Security Implementation

### Password Security

- Passwords are **never stored in plain text**
- A **bcrypt pre-save hook** on the User model automatically hashes the password before every `save()` call (salt rounds: 10, ~100ms computation time)
- The hook uses a `isModified('password')` check to avoid re-hashing on unrelated updates

```typescript
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});
```

### Session Security

- Sessions use **JWT (JSON Web Tokens)** encrypted with `NEXTAUTH_SECRET`
- Tokens stored in **HttpOnly cookies** (inaccessible to JavaScript)
- The `role` and `id` fields are embedded in the token for fast authorization without database lookups

### API Security

- Every API route calls `getServerSession(authOptions)` — unauthorized requests return `401` immediately
- Role checks are server-side — the frontend role display cannot be manipulated to gain access
- The seed endpoint is protected by a separate `SEED_SECRET` environment variable

### Data Validation

- Mongoose schema types and `required` constraints provide database-level validation
- API routes validate required fields before database operations and return descriptive `400` errors
- All `POST` routes are wrapped in `try/catch` to return proper JSON error responses instead of empty 500 responses

---

## 11. User Interface

### Design System

The UI is built with **Tailwind CSS** using a consistent design system:

| Component | Description |
|-----------|------------|
| `.btn-primary` | Blue filled button with shadow, hover lift |
| `.btn-secondary` | White bordered button |
| `.btn-danger` | Red filled button |
| `.input` | Rounded input with focus ring |
| `.card` | White card with border and shadow |
| `.badge` | Small pill label for status/role display |

### Color System

| Color | Usage |
|-------|-------|
| Blue (`blue-600`) | Primary actions, active nav, hotel stats |
| Green (`green-*`) | Available status, revenue, success states |
| Orange (`orange-*`) | Occupied status, warnings, booking stats |
| Red (`red-*`) | Destructive actions, error messages |
| Purple (`purple-*`) | Client-related stats |
| Amber (`amber-400`) | Landing page accent, premium feel |

### Pages

| Route | Description | Access |
|-------|------------|--------|
| `/` | Public landing page with hotel photos | Public |
| `/login` | Split layout login with quick-login buttons | Public |
| `/dashboard` | Role-specific stats + quick actions | All roles |
| `/dashboard/rooms` | Room list with filter buttons | Hotel roles |
| `/dashboard/bookings` | Booking management with checkout | Hotel roles |
| `/dashboard/clients` | Client list with search | Hotel roles |
| `/dashboard/employees` | Staff management | Managers |
| `/dashboard/products` | Menu grid with category filter | Restaurant roles |
| `/dashboard/bills` | Bill management with print | Restaurant roles |
| `/dashboard/settings` | Change name & password | All roles |

### Responsive Design

The application is fully responsive:
- **Mobile**: Single column layout, stacked cards
- **Tablet**: Two-column grid for stat cards
- **Desktop**: Full sidebar + three-column grids

### Print Support

The `@media print` CSS rule hides navigation elements (sidebar, navbar, action buttons) and shows only the bill content when using the "Print Bill" feature.

---

## 12. Deployment

### Infrastructure

| Service | Provider | Purpose |
|---------|---------|---------|
| Application Hosting | Vercel (Free Tier) | Serverless deployment |
| Database | MongoDB Atlas (M0 Free) | Cloud database |
| Source Control | GitHub | Code repository + CI/CD trigger |

### CI/CD Pipeline

```
Developer git push → GitHub → Vercel detects push
                               → Installs dependencies (npm ci)
                               → Runs TypeScript build (next build)
                               → Deploys to production URL
                               → Previous deployment remains until new one is healthy
```

Zero manual steps are required after `git push`. The entire deployment completes in approximately 60–90 seconds.

### Environment Variables

The following variables must be set in Vercel's project settings:

| Variable | Description |
|---------|------------|
| `MONGODB_URI` | MongoDB Atlas connection string |
| `NEXTAUTH_SECRET` | Random string for JWT encryption (min 32 chars) |
| `NEXTAUTH_URL` | Full production URL with `https://` prefix |
| `SEED_SECRET` | Token to protect the `/api/seed` endpoint |

### Database Setup

After deployment, the database is seeded by calling:
```
GET /api/seed?token=YOUR_SEED_SECRET
```

This creates 5 demo users, 8 rooms, 4 clients, and 12 menu products.

### Demo Accounts

| Email | Password | Role |
|-------|---------|------|
| manager@hotel.com | password123 | Hotel Manager |
| restaurant@hotel.com | password123 | Restaurant Manager |
| receptionist@hotel.com | password123 | Receptionist |
| waiter@hotel.com | password123 | Waiter |

---

## 13. Team Work Division

The project was divided into independent modules to avoid merge conflicts, with each team member responsible for specific files:

### Person 1 — Authentication & Landing Page
- `app/page.tsx` — Public landing page with hotel photos
- `app/login/page.tsx` — Login page with split layout
- `app/api/auth/[...nextauth]/route.ts` — NextAuth configuration
- `lib/auth.ts` — JWT session callbacks and bcrypt authorization

### Person 2 — Dashboard & Statistics
- `app/dashboard/page.tsx` — Dashboard with welcome banner and quick actions
- `app/api/stats/route.ts` — Role-specific statistics endpoint
- `components/ui/StatCard.tsx` — Statistics card component

### Person 3 — Booking System (Checkout Feature)
- `app/api/bookings/[id]/route.ts` — PATCH: cancel and checkout actions
- `app/dashboard/bookings/page.tsx` — Checkout and cancel buttons

### Person 4 — Room Filter & Print Bill
- `app/dashboard/rooms/page.tsx` — Room filter buttons
- `app/dashboard/bills/page.tsx` — Print bill button

### Person 5 — Settings & Profile
- `app/api/profile/route.ts` — Name and password update API
- `app/dashboard/settings/page.tsx` — Settings page UI
- `components/ui/Sidebar.tsx` — Settings link, avatar initials

### Person 6 — Core Data Management (Rooms, Clients, Employees)
- `app/api/rooms/route.ts` & `app/api/rooms/[id]/route.ts`
- `app/api/clients/route.ts`
- `app/api/employees/route.ts` & `app/api/employees/[id]/route.ts`
- Corresponding dashboard pages

---

## 14. Conclusion

The Hotel Management System successfully achieves all stated objectives:

- **All 35 functional requirements** (FR-01 through FR-73) are fully implemented and verified against the original UML diagrams
- The application is **live and accessible** at the Vercel deployment URL
- **Zero local installation** required — the entire stack (app + database) runs in the cloud
- The system handles **4 distinct user roles** with granular permission enforcement at both UI and API levels
- **Security best practices** are applied: bcrypt password hashing, JWT sessions, server-side role checks
- The codebase is written entirely in **TypeScript** for type safety and maintainability
- **Continuous deployment** is configured via GitHub → Vercel, enabling the team to collaborate and ship changes with a simple `git push`

### Future Improvements

The following features could be added in a future iteration:
- Interactive booking calendar with visual room availability
- Revenue charts and analytics with monthly trends
- Email notifications for bookings and check-out reminders
- PDF invoice generation for completed bookings
- Mobile app using React Native sharing the same API

---

*Documentation prepared as part of the Hotel Management System school project, Academic Year 2025–2026.*
