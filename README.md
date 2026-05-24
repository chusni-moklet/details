# DETAILS — Digital Educator Talent, Achievement & Identity Library System

Platform identitas digital guru **SMK Telkom Malang** yang modern dan profesional.

![DETAILS](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green?logo=supabase)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Tailwind](https://img.shields.io/badge/Tailwind-v4-cyan?logo=tailwindcss)

---

## Fitur Utama

- 🏠 **Public Website** — Home, Profil Guru, Hall of Fame
- 👨‍🏫 **Teacher Dashboard** — Edit profil, sertifikasi, portfolio, prestasi
- 🔐 **Google OAuth** — Login hanya untuk email sekolah
- 👑 **Admin Panel** — Kelola guru, verifikasi sertifikasi, analytics
- 📱 **Responsive** — Mobile-first design
- 🎨 **Telkom Brand** — Warna resmi SMK Telkom Malang
- 📄 **Auto CV** — Generate CV PDF dari profil
- 🔲 **QR Code** — QR profil otomatis

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript 5 (strict mode) |
| Styling | Tailwind CSS v4 |
| Animation | Framer Motion |
| Backend | Supabase (PostgreSQL + Auth + RLS) |
| Storage | Cloudinary |
| Deployment | Vercel |

---

## Setup

### 1. Clone & Install

```bash
git clone https://github.com/your-org/details.git
cd details
npm install
```

### 2. Environment Variables

Buat file `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Database Setup

Jalankan SQL di Supabase SQL Editor:

```bash
# Schema utama
supabase/schema.sql

# Fix RLS policies
supabase/fix-rls-complete.sql
supabase/fix-rls-select.sql
```

### 4. Google OAuth

1. Buat project di [Google Cloud Console](https://console.cloud.google.com)
2. Enable Google OAuth di Supabase → Authentication → Providers
3. Set redirect URL: `https://your-project.supabase.co/auth/v1/callback`

### 5. Run Development

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000)

---

## Struktur Folder

```
src/
├── app/                    # Next.js App Router
│   ├── actions/            # Server Actions
│   ├── admin/              # Admin pages
│   ├── api/                # API routes (CV, upload)
│   ├── auth/               # Auth pages & callback
│   ├── dashboard/          # Teacher dashboard
│   ├── hall-of-fame/       # Hall of Fame
│   ├── teacher/[slug]/     # Teacher detail
│   └── teachers/           # Teacher catalog
├── components/
│   ├── dashboard/          # Dashboard components
│   ├── layout/             # Navbar, Footer
│   ├── shared/             # Reusable components
│   ├── teacher/            # Teacher components
│   └── ui/                 # Base UI components
├── features/               # Feature-grouped components
├── lib/                    # Utilities & Supabase clients
├── services/               # Data fetching layer
└── types/                  # TypeScript types
```

---

## Domain Whitelist

Login hanya untuk email:
- `@moklet.com`
- `@smktelkom-mlg.sch.id`
- `@student.moklet.com`

---

## Setup Super Admin

```sql
UPDATE public.users
SET role = 'super_admin'
WHERE email = 'admin@smktelkom-mlg.sch.id';
```

---

## Deploy ke Vercel

1. Push ke GitHub
2. Import di [Vercel](https://vercel.com)
3. Tambahkan environment variables
4. Deploy

Lihat [DEPLOYMENT.md](./DEPLOYMENT.md) untuk panduan lengkap.

---

## License

© 2026 SMK Telkom Malang. All rights reserved.
