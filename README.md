# AL-HAYAT: Modern Muslimah Wear

A full-stack e-commerce experience for modern, high-fashion modesty.

## 🌟 Overview

AL-HAYAT is a premium e-commerce platform dedicated to modern Muslimah fashion. It combines high-fashion aesthetics with functional modesty, providing a seamless shopping experience from discovery to checkout. The application is built with a focus on bold typography, pink pastel aesthetics, and production-grade performance.

## ✨ Core Features

- **Elegant Landing Page**: Showcases featured collections with a high-fashion, editorial design and smooth animations.
- **Dynamic Product Catalog**: Browse products with category filtering and detailed quick-view modals.
- **Real-time Shopping Cart**: Manage your selection with a slide-out drawer that updates instantly.
- **Secure Checkout**: Integrated with **Midtrans** for reliable and secure payment processing in the Indonesian market.
- **Admin Management Suite**:
  - **Inventory Control**: Manage products, categories, and variants (size/color/stock).
  - **Order Manager**: Track and process customer orders in real-time.
  - **Voucher System**: Create and manage discount codes (percentage or fixed amount).
- **Authentication**: Secure administrative access powered by **Supabase Auth**.
- **Multilingual Support**: Built-in i18n support for English and Indonesian languages.

## 🛠 Tech Stack

- **Frontend**: [React 19](https://react.dev/), [Vite](https://vitejs.dev/), [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/), [Framer Motion](https://www.framer.com/motion/) (Animations)
- **Backend/Database**: [Supabase](https://supabase.com/) (PostgreSQL, Auth, RLS)
- **Server**: [Express](https://expressjs.com/) (API Proxying & Vite Middleware)
- **Payments**: [Midtrans](https://midtrans.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Form Handling**: [React Hook Form](https://react-hook-form.com/), [Zod](https://zod.dev/)

## 📂 File Structure Highlight

```text
├── src/
│   ├── components/
│   │   ├── admin/          # Admin Dashboard & Management components
│   │   ├── ecommerce/      # Core shop components (Cart, ProductCard, etc.)
│   │   └── ui/             # Reusable UI components (Buttons, Inputs, etc.)
│   ├── hooks/              # Custom hooks (useAuth, useMidtrans)
│   ├── lib/                # Client initializations (Supabase, Utils)
│   ├── pages/              # Main application views (Home, Checkout, Login)
│   ├── types.ts            # Global TypeScript definitions
│   └── i18n.ts             # Internationalization config
├── server.ts               # Express server entry point
├── metadata.json           # App metadata & permissions
└── firebase-blueprint.json # Database schema documentation
```

## 🚀 Getting Started

1. **Environment Setup**:
   - Copy `.env.example` to `.env`
   - Configure your Supabase and Midtrans credentials.

2. **Installation**:
   ```bash
   npm install
   ```

3. **Development**:
   ```bash
   npm run dev
   ```

4. **Build**:
   ```bash
   npm run build
   ```

---
*Built with AL-HAYAT Aesthetics.*
