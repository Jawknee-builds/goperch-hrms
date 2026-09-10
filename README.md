# 🦅 GoPerch HRMS & Operations

> **Clutter-free. No fluff. Precise project tracking.**

GoPerch HRMS is an ultra-lean operational management system built for high-velocity execution. Unlike bloated traditional enterprise tools, GoPerch focuses on **radical clarity, zero friction, and high-impact accountability** across Software, Electronics, Sales, and Leadership.

---

## ⚡ Design Philosophy

1. **Top 3 Strategic Priority Lock**: Executive leadership is restricted to 3 active top priorities at any time. Forces focus over noise.
2. **1-Click Execution Workflows**: Move tasks between status columns or pull project backlogs with a single click. No multi-step modal friction.
3. **Cross-Department Visibility**: Instant real-time view of hardware, software, and sales execution under one unified roof.
4. **Resilient Leadership Guard**: Protected core accounts ensure key leadership infrastructure remains immutable while supporting soft-delete roster backups.

---

## 🔑 Core Team Access & Credentials

Password across all demo accounts: `password123`

| Leader / Employee | Role | Department | Email | Protection |
| :--- | :--- | :--- | :--- | :--- |
| **Ryan Bantu** | CEO | Leadership | `ceo@goperch.com` | 🛡️ Protected Core Leader |
| **Jonathan Jaladi** | HOD | Sales | `hod.sales@goperch.com` | 🛡️ Protected Core Leader |
| **Vikram** | HOD | Electronics | `hod.electronics@goperch.com` | 🛡️ Protected Core Leader |
| **Prasanna** | HOD | Software | `hod.software@goperch.com` | 🛡️ Protected Core Leader |
| **Alex Dev** | Engineer | Software | `emp.software@goperch.com` | Standard Member |
| **Priya Patel** | Hardware Eng | Electronics | `emp.electronics@goperch.com` | Standard Member |
| **James Wilson** | Sales Rep | Sales | `emp.sales@goperch.com` | Standard Member |

---

## 🛠️ Feature Modules

### 🎯 CEO Top 3 Focus Tray
- Interactive drag-and-drop slot assignment (`#1`, `#2`, `#3`).
- Automatic demotion when promoting new high-priority initiatives.

### 📊 Project Tracking & Live Execution Feed
- Granular progress sliders & milestone indicators.
- Live execution notes feed attached directly to projects.
- **1-Click Pull Tray**: Load project-specific tasks into the main Kanban board instantly.

### 📋 Universal Kanban Workspace
- Statuses: `TODO` ➔ `IN_PROGRESS` ➔ `IN_REVIEW` ➔ `COMPLETED`.
- Supports drag-and-drop or **1-Click Push/Pull** quick buttons.
- Filterable by department (Software, Electronics, Sales, Leadership).

### 👥 Roster & Soft-Delete Archival
- Onboard new employees via **Add Employee** modal.
- Soft-delete archival preserves user history with 1-click restore.
- `🛡️ Core Leader` protection prevents accidental removal of CEO and HODs.

### 💬 Real-Time Department Channels
- `#general`, `#software-engineering`, `#hardware-lab`, `#sales-pipeline`.
- In-context messaging per department.

---

## 🚀 Quickstart

### Prerequisites
- Node.js 18+
- PostgreSQL database (or local SQLite/Postgres)

### Environment Variables (`.env`)
```env
DATABASE_URL="postgresql://user:password@localhost:5432/goperch_hrms?sslmode=disable"
JWT_SECRET="goperch_super_secret_jwt_key_2026"
```

### Installation & Run
```bash
# 1. Install dependencies
npm install

# 2. Push database schema & seed leadership accounts
npx prisma db push
npx prisma db seed

# 3. Launch development server
npm run dev
```

Visit `http://localhost:3000` to access the platform.

---

## 🏗️ Architecture

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS & Lucide Icons
- **Database & ORM**: PostgreSQL + Prisma 7 (`@prisma/adapter-pg`)
- **Authentication**: JWT via HTTP-only secure cookies
