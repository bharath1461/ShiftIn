# ShiftIn — The Part-Time Career Hub for Students

A mobile-first Progressive Web App (PWA) connecting students with verified part-time employers.

## 🚀 Live Features

- **Dual-role platform** — Students find jobs, Employers post & manage listings
- **Firebase Authentication** — Google Sign-In + Phone OTP
- **Supabase Backend** — Real-time database, file storage, RLS-secured
- **AI Identity Verification** — Groq Vision API for document analysis & selfie matching
- **14 fully designed screens** — Splash, Role Selection, Login, Onboarding, Dashboard, Job Details, Application Flow, Post Job, Applicant Management, Profile

## 📁 Project Structure

```
ShiftIn/
├── index.html          # Entry point
├── style.css           # Kinetic Clarity design system
├── app.js              # Main app — route registration & bootstrap
├── router.js           # Hash-based SPA router
├── config.js           # Reads API keys from env.js
├── env.example.js      # Template for API keys (copy → env.js)
├── env.js              # Your real API keys (gitignored)
├── sw.js               # Service Worker (offline caching)
├── manifest.json       # PWA manifest
├── schema.sql          # Supabase database schema
├── screens-auth.js     # Splash, Login, Onboarding, Verification screens
├── screens-dashboard.js# Employee & Employer dashboards
├── screens-features.js # Job Details, Apply, Post Job, Applicants, Profile
├── lib/
│   ├── auth.js         # Firebase Auth service
│   ├── supabase.js     # Supabase CRUD service
│   ├── groq.js         # Groq AI verification service
│   ├── state.js        # Global state manager
│   └── ui.js           # Toast, loader, formatting utilities
└── icons/
    ├── icon-192.png    # PWA icon
    └── icon-512.png    # PWA icon
```

## ⚡ Setup

1. **Clone the repo**
   ```bash
   git clone https://github.com/YOUR_USER/ShiftIn.git
   cd ShiftIn
   ```

2. **Create your env file**
   ```bash
   cp env.example.js env.js
   ```
   Fill in your Firebase, Supabase, and Groq API keys.

3. **Set up Supabase**
   - Run `schema.sql` in your Supabase SQL Editor
   - Create storage buckets: `avatars` (public), `resumes` (private), `documents` (private)

4. **Enable Firebase Auth**
   - Enable Google Sign-In in Firebase Console → Authentication → Sign-in method

5. **Run locally**
   ```bash
   npx serve .
   ```

## 🎨 Design System

Built on the **Kinetic Clarity** design language:
- **Manrope** typography
- **Trustworthy Blue** (#0052CC) primary
- **Soft Teal** (#006A65) secondary
- 16px card radius, pill buttons, ambient shadows
- Mobile-first responsive layout

## 📄 License

MIT
