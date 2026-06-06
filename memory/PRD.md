# Allô Québec — PRD

## Problem Statement (original, French)
"Créer moi la meilleur idée pour aider les québécois. Pour cela tu devra fouiller les forum pour savoir ce que les jeune québécois veulent, des allégations de manque d'un certain service qui ferais un incroyable différence dans leur façon de vivre. Je veut que tu cela en un statup que je pourrai utiliser et que je vais être sur quil fonctionne"

## The Idea
**Allô Québec** — AI assistant in French Québécois that helps Quebecers navigate complex government services (RAMQ, SAAQ, Revenu Québec, GAMF, logement, AFE, CNESST, Hydro-Québec).

## Architecture
- **Frontend**: React 19 + React Router 7 + Tailwind + lucide-react. Neo-brutalist design.
- **Backend**: FastAPI + Motor (async MongoDB). `/api` prefix.
- **Auth**: Emergent-managed Google OAuth.
- **AI**: Claude Sonnet 4.5 (`claude-sonnet-4-6`) via emergentintegrations.
- **Payments**: Stripe Checkout via emergentintegrations. 4.99 CAD per 30-day pass.
- **DB**: `users`, `user_sessions`, `chat_sessions`, `chat_messages`, `reminders`, `guides`, `payment_transactions`.

## Implemented Timeline

### Session 1 — MVP (2026-06-05)
- Google OAuth, Dashboard, AI Chat (Claude), 8 guides seedés, rappels CRUD
- Tests: 15/15

### Session 2 — Premium (2026-06-05)
- Pricing page, Stripe Checkout, 10 msg/mois limit gratuit, premium unlimited
- Tests: 26/26

### Session 3 — Code Quality (2026-06-06)
- Variables initialisées avant try blocks
- `react/no-unescaped-entities` réglé (`&apos;` dans JSX text)
- useMemo pour AuthContext value, useCallback pour logout
- Catch blocks: console.error ajouté
- Keys stables (content-based au lieu d'index)
- `eslint.config.mjs` créé
- Tests: 26/26

### Session 4 — Refactor (2026-06-06)
- **Dashboard.jsx** divisé en `QuickActions`, `RemindersSection` (avec `ReminderItem`), `RecentChats`, `FeaturedGuides`, `ReminderForm`
- **ChatPage.jsx** divisé en `ChatHeader`, `ChatEmptyState`, `MessageBubble`, `ChatInput`
- **Header.jsx** : `MobileMenu` extrait
- Backend: helper `_make_stripe_checkout(request)` partagé entre create_checkout, get_payment_status, stripe_webhook
- Linters: 0 blocking, 0 advisory (Python + JS)
- Tests: 26/26 (zéro régression)

## Pricing
- **Gratuit**: 10 msg IA/mois + tous les guides + rappels illimités
- **Pro**: $4.99 CAD / 30 jours (renouvellement manuel) — IA illimitée + Pro badge

## Backlog
- **P1** Email reminders (Resend) — promesse Pro à honorer
- **P1** Dossier privé sécurisé — promesse Pro à honorer
- **P1** Streaming SSE pour le chat
- **P1** Plus de guides : aide sociale, immigration, REER/CELI
- **P2** Subscription auto-récurrent Stripe natif
- **P2** Splitter server.py en routes/{auth,chat,payments,reminders,guides}.py (~837 lignes)
- **P2** Sentry pour monitoring d'erreurs

## Key files
- Backend: `/app/backend/server.py`
- Frontend pages: `/app/frontend/src/pages/{Landing,Dashboard,ChatPage,GuidesPage,GuideDetail,AuthCallback,PricingPage,PaymentSuccess}.jsx`
- Components: `/app/frontend/src/components/{Header,MobileMenu,ProtectedRoute}.jsx`, `/app/frontend/src/components/dashboard/*.jsx`, `/app/frontend/src/components/chat/*.jsx`
- Context: `/app/frontend/src/context/AuthContext.jsx`
- Lint: `/app/frontend/eslint.config.mjs`
