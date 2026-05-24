# DETAILS — Deployment Guide

## Tech Stack
- **Frontend**: Next.js 16 (App Router, Turbopack)
- **Backend**: Supabase (PostgreSQL + Auth + RLS)
- **Storage**: Cloudinary
- **Deployment**: Vercel

---

## 1. Supabase Setup

### 1.1 Create Project
1. Buka [supabase.com](https://supabase.com) → New Project
2. Pilih region terdekat (Singapore)
3. Catat **Project URL** dan **anon key**

### 1.2 Run Schema
1. Buka **SQL Editor** di Supabase Dashboard
2. Copy-paste isi file `supabase/schema.sql`
3. Klik **Run** — semua tabel, RLS, dan seed data akan dibuat

### 1.3 Configure Google OAuth
1. Supabase Dashboard → **Authentication** → **Providers** → Google
2. Enable Google provider
3. Masukkan **Client ID** dan **Client Secret** dari Google Cloud Console
4. Set **Authorized redirect URI**: `https://your-project.supabase.co/auth/v1/callback`

### 1.4 Google Cloud Console
1. Buka [console.cloud.google.com](https://console.cloud.google.com)
2. Create OAuth 2.0 Client ID (Web application)
3. Authorized JavaScript origins: `https://your-domain.vercel.app`
4. Authorized redirect URIs:
   - `https://your-project.supabase.co/auth/v1/callback`

---

## 2. Cloudinary Setup

1. Daftar di [cloudinary.com](https://cloudinary.com)
2. Dashboard → Settings → catat:
   - **Cloud Name**
   - **API Key**
   - **API Secret**
3. Buat upload preset (optional, untuk unsigned uploads)

---

## 3. Environment Variables

Isi `.env.local` (development) atau Vercel Environment Variables (production):

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=123456789
CLOUDINARY_API_SECRET=abc123...

# App
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

---

## 4. Deploy ke Vercel

### 4.1 Push ke GitHub
```bash
git init
git add .
git commit -m "feat: initial DETAILS system"
git remote add origin https://github.com/your-org/details.git
git push -u origin main
```

### 4.2 Import di Vercel
1. Buka [vercel.com](https://vercel.com) → New Project
2. Import repository dari GitHub
3. Framework: **Next.js** (auto-detected)
4. Tambahkan semua environment variables dari step 3
5. Klik **Deploy**

### 4.3 Update Supabase Auth Redirect
Setelah deploy, update di Supabase:
- **Authentication** → **URL Configuration**
- Site URL: `https://your-domain.vercel.app`
- Redirect URLs: `https://your-domain.vercel.app/auth/callback`

---

## 5. Setup Admin Pertama

Setelah deploy, buat akun super_admin:

```sql
-- Jalankan di Supabase SQL Editor setelah user pertama login
UPDATE public.users
SET role = 'super_admin'
WHERE email = 'admin@moklet.com';
```

---

## 6. Turbopack Root Warning Fix (Optional)

Jika ada warning tentang workspace root, tambahkan ke `next.config.ts`:

```ts
const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  // ... rest of config
};
```

---

## 7. Routes Summary

| Route | Type | Deskripsi |
|-------|------|-----------|
| `/` | Dynamic | Home page |
| `/teachers` | Dynamic | Profil Guru |
| `/teacher/[slug]` | Dynamic | Profil guru |
| `/hall-of-fame` | Dynamic | Ranking guru |
| `/auth/login` | Dynamic | Login page |
| `/auth/callback` | API | OAuth callback |
| `/dashboard` | Protected | Dashboard guru |
| `/dashboard/profile` | Protected | Edit profil |
| `/dashboard/certifications` | Protected | Kelola sertifikasi |
| `/dashboard/portfolio` | Protected | Kelola portfolio |
| `/dashboard/achievements` | Protected | Kelola prestasi |
| `/dashboard/settings` | Protected | Pengaturan |
| `/admin` | Admin only | Admin dashboard |
| `/admin/teachers` | Admin only | Kelola guru |
| `/admin/certifications` | Admin only | Verifikasi sertifikasi |
| `/admin/analytics` | Admin only | Analytics |
| `/admin/departments` | Admin only | Kelola jurusan |
| `/admin/users` | Admin only | User management |
| `/api/cv/[slug]` | API | Generate CV HTML |
| `/api/upload/photo` | API | Upload foto Cloudinary |

---

## 8. Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Type check
npx tsc --noEmit

# Build
npm run build
```

---

## 9. Folder Structure

```
src/
├── app/                    # Next.js App Router pages & API routes
│   ├── actions/            # Server Actions (auth, teacher)
│   ├── admin/              # Admin pages
│   ├── api/                # API routes (cv, upload)
│   ├── auth/               # Auth pages & callback
│   ├── dashboard/          # Teacher dashboard
│   ├── hall-of-fame/       # Hall of Fame page
│   ├── teacher/[slug]/     # Teacher detail page
│   ├── teachers/           # Teacher catalog
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Home page
├── components/
│   ├── dashboard/          # Dashboard-specific components
│   ├── layout/             # Navbar, Footer
│   ├── shared/             # Reusable: SearchBar, FilterDropdown, AnalyticsCard
│   ├── teacher/            # Teacher: Card, SkillBadge, CertCard, etc.
│   └── ui/                 # Base UI: Button, Input, Badge, etc.
├── features/               # Feature-grouped components
│   ├── admin/              # Admin feature components
│   ├── auth/               # Auth feature components
│   ├── catalog/            # Catalog feature
│   ├── dashboard/          # Dashboard feature components
│   ├── home/               # Home page sections
│   └── teacher/            # Teacher profile feature
├── lib/
│   ├── supabase/           # Supabase client (browser, server, middleware)
│   └── utils.ts            # Utility functions
├── services/
│   └── teachers.ts         # Data fetching layer
├── types/
│   ├── index.ts            # App types
│   └── supabase.ts         # Database types
└── proxy.ts                # Next.js 16 Proxy (auth guard)
```
