# 🦅 GoPerch HRMS & Operations Platform

> **One platform. Every department.**  
> Next-generation HRMS and Operations Suite designed for GoPerch Leadership, Department HODs, and cross-functional teams.

---

## 🛡️ Core Leadership & Demo Login Accounts

All accounts use standard demo password: **`password123`**

| Executive / Leader | Role & Department | Email Address | Account Protection |
| :--- | :--- | :--- | :--- |
| **Ryan Bantu** | CEO (Executive Leadership) | `ceo@goperch.com` | 🛡️ Protected Core Leader |
| **Jonathan Jaladi** | HOD — Sales | `hod.sales@goperch.com` | 🛡️ Protected Core Leader |
| **Vikram** | HOD — Electronics | `hod.electronics@goperch.com` | 🛡️ Protected Core Leader |
| **Prasanna** | HOD — Software | `hod.software@goperch.com` | 🛡️ Protected Core Leader |
| **Alex Dev** | Software Engineer | `emp.software@goperch.com` | Standard Employee |
| **Priya Patel** | Hardware Engineer | `emp.electronics@goperch.com` | Standard Employee |
| **James Wilson** | Sales Representative | `emp.sales@goperch.com` | Standard Employee |

---

## ✨ Key Features & Capability Matrix

### 🎯 1. CEO Top 3 Strategic Priorities Tray
- **Drag-and-Drop Prioritization**: Executive drag-and-drop slot reallocation to lock in the top 3 company priorities.
- **Visual Rank Badging**: Slot `#1`, `#2`, and `#3` visual badging with immediate demotion/promotion logic.

### 📁 2. Project Management & Live Execution Notes
- **Interactive Projects Feed**: Live project cards with percentage progress sliders and real-time execution notes.
- **1-Click Pull Tray**: Pull project-specific tasks into the main Kanban workspace instantly.

### ⚡ 3. Universal Kanban Drag & Drop
- **Status Workflows**: Seamless column transitions (`TODO` ➔ `IN_PROGRESS` ➔ `IN_REVIEW` ➔ `COMPLETED`).
- **1-Click Push & Pull Buttons**: Quick-action controls on every task card for rapid status changes.

### 🔄 4. Cross-Department Task Delegation
- **Leadership Delegation**: CEO and HODs can assign high-impact tasks across any department.
- **Role Scoped Permissions**: Department-level filtering with department badges and assignee avatars.

### 👥 5. Roster Management & Soft-Delete Backup Protection
- **Add Employee Modal**: Instant onboarding into Sales, Electronics, Software, or Leadership.
- **Soft-Delete Archival**: Archived staff are safely backed up with 1-click restoration from the Backup Roster.
- **Core Leader Guard**: API & UI level protection preventing accidental deletion of core executives.

### 💬 6. Real-Time Chat & Department Channels
- **Integrated Team Channels**: `#general`, `#software-engineering`, `#hardware-lab`, and `#sales-pipeline`.
- **Instant Messaging**: Seamless cross-department communication.

---

## 🛠️ Tech Stack

- **Framework**: Next.js (App Router, Server Actions, API Routes)
- **Styling**: Tailwind CSS & Lucide Icons (GoPerch Light Theme: `#FAFBFD`)
- **Database & ORM**: PostgreSQL & Prisma 7 (with `@prisma/adapter-pg`)
- **Authentication**: JWT & HttpOnly Secure Cookies

---

## 🚀 Local Development Setup

1. **Clone repository**:
   ```bash
   git clone https://github.com/Jawknee-builds/goperch-hrms.git
   cd goperch-hrms
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/goperch_hrms?sslmode=disable"
   JWT_SECRET="goperch_super_secret_jwt_key_2026"
   ```

4. **Push Schema & Seed Database**:
   ```bash
   npx prisma db push
   npx prisma db seed
   ```

5. **Start Dev Server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` and sign in with any of the demo credentials above!

---

## 🌐 Vercel Production Deployment

To seed or reset your Vercel Cloud Postgres / Supabase database:
```bash
# 1. Push Prisma schema to cloud DB
npx prisma db push

# 2. Seed official leadership & sample data
npx prisma db seed
```
