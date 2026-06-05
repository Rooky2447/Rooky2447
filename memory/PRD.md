# Allô Québec — PRD

## Problem Statement (original, French)
"Créer moi la meilleur idée pour aider les québécois. Pour cela tu devra fouiller les forum pour savoir ce que les jeune québécois veulent, des allégations de manque d'un certain service qui ferais un incroyable différence dans leur façon de vivre. Je veut que tu cela en un statup que je pourrai utiliser et que je vais être sur quil fonctionne"

## The Idea
**Allô Québec** — AI assistant in French Québécois that helps Quebecers navigate complex government services (RAMQ, SAAQ, Revenu Québec, GAMF, logement, AFE, CNESST, Hydro-Québec).

## Architecture
- **Frontend**: React 19 + React Router 7 + Tailwind + lucide-react. Neo-brutalist design.
- **Backend**: FastAPI + Motor (async MongoDB). `/api` prefix.
- **Auth**: Emergent-managed Google OAuth (session_token cookie + Bearer fallback).
- **AI**: Claude Sonnet 4.5 (`claude-sonnet-4-6`) via emergentintegrations + Emergent Universal LLM Key.
- **Payments**: Stripe Checkout via emergentintegrations (test key sk_test_emergent). 4.99 CAD per 30-day pass.
- **DB**: `users`, `user_sessions`, `chat_sessions`, `chat_messages`, `reminders`, `guides`, `payment_transactions`.

## Implemented
### 2026-06-05 (Session 1) — MVP
- Google login via Emergent Auth (with proper error UI on failure)
- Landing page (hero, value props, bottom CTA) — neo-brutalist
- Dashboard (greeting, quick actions, rappels CRUD, recent chats, featured guides)
- AI Chat page (Claude Sonnet 4.5) — multi-turn, history persisted, suggestions
- Guides library (8 démarches: RAMQ, SAAQ, GAMF, impôts, logement, AFE, Hydro, CNESST)
- Guide detail (steps cochables, resources, FAQ, CTA to chat)
- Mobile responsive, sticky header
- Backend: 15/15 tests passing

### 2026-06-05 (Session 2) — Premium / Monetization
- **Pricing page** `/pricing` (Free vs Pro 4.99$ CAD)
- **Stripe Checkout** integration (`/api/payments/checkout`, `/api/payments/status/{id}`, `/api/webhook/stripe`)
- **Free tier limit**: 10 AI messages / mois (returns 402 with upgrade CTA)
- **Premium gating**: `users.premium_until` ISO date; chat bypasses limit when premium active
- `/api/me/usage` endpoint exposes used/remaining/limit
- Header shows "Pro" badge for premium users, "Passe Pro" CTA for free
- ChatPage shows usage counter; limit-hit banner with upgrade link
- Payment success page `/payment/success` with polling
- 30-day passes stack correctly (max of now/current premium_until + 30)
- Idempotency via `payment_transactions.premium_granted` flag
- Backend: 26/26 tests passing

## Backlog (P1/P2)
- **P1** Streaming SSE for chat
- **P1** Email reminders via Resend/SendGrid (Premium only) — pre-promised in Pro plan
- **P1** Dossier privé sécurisé (Premium only) — pre-promised in Pro plan
- **P1** More guides: aide sociale, immigration, NAS, REER/CELI, mariage civil
- **P2** Auto-renewing subscriptions (Stripe native) when growth justifies
- **P2** Crowdsourced tips section
- **P2** B2B portal for CJE/CLSC

## Pricing
- **Free**: 10 AI msgs/month + unlimited guides + unlimited rappels
- **Pro**: $4.99 CAD per 30-day pass (manual renew) — unlimited AI, Pro badge, future email reminders + dossier privé

## Key files
- `/app/backend/server.py` — all API routes (~830 lines)
- `/app/frontend/src/App.js` — routing + AuthProvider
- `/app/frontend/src/pages/{Landing,Dashboard,ChatPage,GuidesPage,GuideDetail,AuthCallback,PricingPage,PaymentSuccess}.jsx`
- `/app/frontend/src/components/{Header,ProtectedRoute}.jsx`
- `/app/frontend/src/context/AuthContext.jsx`
