# NVCCake Project 🍰

ระบบบริหารจัดการการสั่งจองและส่งมอบเค้ก (Cake Management System) สำหรับสถานศึกษา พัฒนาด้วย **Bun**, **ElysiaJS**, **Prisma (PostgreSQL)** ในส่วนของ Backend และ **React 19**, **Vite**, **TanStack Router/Query** ในส่วนของ Frontend

---

## 🚀 Tech Stack

### Backend
- **Runtime:** [Bun](https://bun.sh/)
- **Framework:** [ElysiaJS](https://elysiajs.com/)
- **Database ORM:** [Prisma](https://www.prisma.io/) (PostgreSQL)
- **Validation:** [Biome](https://biomejs.dev/)
- **Documentation:** Swagger (at `/docs`)
- **Other:** Husky, Commitlint, ExcelJS, Node-cron

### Frontend
- **Framework:** [React 19](https://react.dev/)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Routing:** [TanStack Router](https://tanstack.com/router)
- **State Management:** [TanStack Query](https://tanstack.com/query)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **UI Components:** Radix UI, Lucide Icons, Shadcn UI (inspired)
- **Charts:** Chart.js
- **Animations:** Framer Motion

---

## 📊 Database Schema (Mermaid)

```mermaid
erDiagram
    Department ||--o{ Classroom : "has"
    Department ||--o{ Teacher : "has"
    Classroom ||--o{ Order : "receives"
    Classroom ||--o{ OrderBook : "uses"
    GradeLevel ||--o{ Classroom : "defines"
    Teacher ||--o{ Classroom : "advises"
    Teacher ||--o{ User : "linked_to"
    User ||--o{ Order : "creates"
    User ||--o{ Order : "prepares"
    User ||--o{ Order : "delivers"
    Order ||--o{ OrderItem : "contains"
    Product ||--o{ OrderItem : "is_sold_as"
    Team ||--o{ Order : "places"
    OrderBook ||--o{ Order : "records"

    Department {
        string id PK
        string name
    }

    Classroom {
        string id PK
        string name
        string teacher_id FK
        string department_id FK
        string grade_level_id FK
        json students
        boolean isOrderFinalized
    }

    Teacher {
        string id PK
        string name
        string department_id FK
    }

    User {
        string id PK
        string firstname
        string lastname
        string username
        string role
        string teacher_id FK
    }

    Order {
        string id PK
        string user_id FK
        string officer_prepare_id FK
        string officer_pickup_id FK
        string customerName
        string classroom_id FK
        string team_id FK
        datetime orderDate
        float totalPrice
        string book_id FK
        string status
    }

    OrderItem {
        string id PK
        string order_id FK
        string product_id FK
        int quantity
        float subtotal
    }

    Product {
        string id PK
        string name
        float price
    }

    OrderBook {
        string id PK
        string bookNumber
        int currentNumber
        boolean isClosed
    }
```

---

## 🛠️ Getting Started

### Prerequisites
- [Bun](https://bun.sh/) (แนะนำ) หรือ Node.js (v20+)
- [Docker](https://www.docker.com/) (สำหรับ Database)

### 1. Database Setup
```bash
cd backend
# ตรวจสอบ .env และตั้งค่า DATABASE_URL
docker-compose up -d
bun prisma migrate dev
```

### 2. Backend Setup
```bash
cd backend
bun install
bun run dev
```
Backend จะทำงานที่ `http://localhost:3000` และ Swagger Docs ที่ `http://localhost:3000/docs`

### 3. Frontend Setup
```bash
cd frontend
# สร้าง .env และตั้งค่า VITE_APP_API_URL=http://localhost:3000
npm install
npm run dev
```
Frontend จะทำงานที่ `http://localhost:5173`

---

## 📂 Project Structure

```text
nvccake_project/
├── backend/            # ElysiaJS + Prisma + Bun
│   ├── prisma/         # Database schema & migrations
│   ├── src/
│   │   ├── features/   # Business logic & controllers
│   │   ├── providers/  # Database & Logger providers
│   │   └── shared/     # Middleware & Utils
├── frontend/           # React + Vite + TypeScript
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   ├── pages/      # Page components
│   │   ├── hooks/      # Custom React hooks
│   │   ├── contexts/   # React Context API
│   │   └── types/      # TypeScript definitions
```

---

## ✨ Features

- **RBAC:** ระบบจัดการบทบาท (SuperAdmin, Admin, Officer, User)
- **Order Management:** การจัดการคำสั่งซื้อเค้กและการพิมพ์ใบเสร็จ (JSBarcode)
- **Team Management:** รองรับการสั่งในนามกลุ่มหรือรายบุคคล
- **Real-time Dashboard:** แสดงสถิติการขายด้วย Chart.js
- **Print System:** รองรับการพิมพ์ใบสั่งจองและใบรับเค้ก
- **Academic Year Isolation:** แยกข้อมูลตามปีการศึกษาผ่าน Header `x-academic-year`
