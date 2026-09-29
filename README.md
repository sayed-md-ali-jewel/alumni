# Alumni Management System

A modern, full-stack Alumni Association web platform built with **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, **MongoDB & Mongoose**, and **Next-Auth**.

## Features

- **Multi-language Support (i18n)**: English (`en`) and Bengali (`bn`) with `next-intl`.
- **Authentication & Roles**: User registration, login, profile management, and role-based permissions (User / Admin).
- **Alumni Directory**: Searchable directory with batch, department, and blood group filters.
- **Blood Donation Network**: Blood donor registry, emergency blood requests, and real-time eligibility tracking.
- **Events & News Management**: Publish and browse upcoming events and community news.
- **Dynamic Homepage & Slider**: Admin-controllable hero banner, dynamic image slider, and site settings.
- **Donations & Payments**: Integrated donation system.
- **Dark Mode Support**: Seamless light/dark theme switching.
- **Admin Dashboard**: Comprehensive management interface for alumni verification, blood requests, events, news, sliders, and site settings.

## Getting Started

### 1. Prerequisites
- Node.js 18.17+ or 20+
- MongoDB (local instance or MongoDB Atlas URI)

### 2. Installation
```bash
# Clone the repository
git clone <repository-url>
cd alumni

# Install dependencies
npm install
```

### 3. Environment Configuration
Copy `.env.example` to `.env.local` and configure your database and authentication keys:
```bash
cp .env.example .env.local
```

### 4. Running the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.
