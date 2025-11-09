# 🏠 BODIMA.COM – Student Accommodation Web App

A full-stack **Next.js 14** application that connects students with boarding providers.  
Providers can post and manage listings, and students can browse, view, and get directions to accommodations.

---

## 🚀 Features

### 🎯 Core Functionality

- Provider and Student roles with authentication
- Provider onboarding and listing submission
- Admin approval for listings
- Amenity management (Wi-Fi, A/C, Attached Bathroom, etc.)
- Listing details page with images, map, and provider info

### 🏙️ Provider Dashboard

- Add listings with title, description, address, city, price, room type, and amenities
- Upload up to 5 photos per listing with live preview
- Edit listings and resubmit for admin review
- First photo automatically becomes the cover

### 🌍 Location and Maps

- Interactive **Leaflet Map** for picking latitude and longitude
- Students can view listing locations directly on the map

### 🖼️ Image Uploads

- Upload from local device (no URL needed)
- Drag-and-drop upload interface with previews and delete option

### 🔒 Authentication

- NextAuth.js integration
- Credential-based login and role-based access

### 🗄️ Database

- PostgreSQL (Neon) with Prisma ORM
- Includes Users, Providers, Listings, Photos, Amenities, Bookmarks, and Universities

---

## 🛠️ Tech Stack

| Layer          | Technology                                     |
| -------------- | ---------------------------------------------- |
| Frontend       | Next.js 14, TypeScript, TailwindCSS, shadcn/ui |
| Backend        | Next.js API Routes                             |
| ORM            | Prisma                                         |
| Database       | PostgreSQL (Neon.tech)                         |
| Authentication | NextAuth.js                                    |
| Maps           | Leaflet.js + React-Leaflet                     |
| Notifications  | Sonner                                         |
| Forms          | React Hook Form + Zod                          |

---

## ⚙️ Installation

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/Pasindu9225/BODIMA.COM_webapp
cd bodima.com

Install Dependencies
    npm install

Configure Environment Variables
    Create a .env file in the project root:
        DATABASE_URL="postgresql://<user>:<password>@<host>/<dbname>?sslmode=require"
        NEXTAUTH_SECRET="your-secret-key"
        NEXTAUTH_URL="http://localhost:3000"

Initialize Prisma
    npx prisma migrate dev
    npx prisma db seed

Run the Dev Server
    npm run dev



Project Structure

src/
 ├─ app/
 │   ├─ api/
 │   │   ├─ listings/route.ts
 │   │   └─ upload/route.ts
 │   ├─ provider/
 │   │   └─ listing/
 │   │       ├─ new/
 │   │       │   ├─ page.tsx
 │   │       │   └─ NewListingForm.tsx
 │   │       └─ edit/[id]/page.tsx
 │   └─ listing/[id]/page.tsx
 │
 ├─ components/
 │   └─ ui/
 │
 ├─ lib/
 │   ├─ prisma.ts
 │   └─ actions.ts
 │
 ├─ prisma/
 │   └─ schema.prisma
 │
 └─ styles/
     └─ globals.css

Author

Pasindu Gayan

📧 pasindu9225@gmail.com










```
