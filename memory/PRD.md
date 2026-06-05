# Allô Québec — PRD

## Problem Statement (original, French)
"Créer moi la meilleur idée pour aider les québécois. Pour cela tu devra fouiller les forum pour savoir ce que les jeune québécois veulent, des allégations de manque d'un certain service qui ferais un incroyable différence dans leur façon de vivre. Je veut que tu cela en un statup que je pourrai utiliser et que je vais être sur quil fonctionne"

## The Idea
**Allô Québec** — AI assistant in French Québécois that helps Quebecers navigate complex government services (RAMQ, SAAQ, Revenu Québec, GAMF, logement, AFE, CNESST, Hydro-Québec). Young Quebecers constantly complain on r/Quebec and other forums about the confusion of démarches — too many sites, dated UI, no single source of truth.

## User Personas
- **Marc, 24, Montréal** — moves apartments, doesn't know his tenant rights, his RAMQ card expires, anxious about taxes.
- **Sophie, 28, Québec** — wants a family doctor (GAMF), needs help with AFE for grad studies.
- **Étudiant international** — needs to navigate first impôts, ouvrir compte Hydro, etc.

## Architecture
- **Frontend**: React 19 + React Router 7 + Tailwind + lucide-react. Neo-brutalist design (jaune/cyan/rouge sur cream, ombres dures `4px 4px 0 #111`, Outfit/Figtree fonts).
- **Backend**: FastAPI + Motor (async MongoDB). `/api` prefix.
- **Auth**: Emergent-managed Google OAuth (session_token cookie + Bearer fallback).
- **AI**: Claude Sonnet 4.5 (`claude-sonnet-4-6`) via emergentintegrations + Emergent Universal LLM Key.
- **DB**: MongoDB collections: `users`, `user_sessions`, `chat_sessions`, `chat_messages`, `reminders`, `guides`.

## Implemented (2026-06-05)
- ✅ Google login via Emergent Auth, session cookie + Bearer auth
- ✅ Landing page (hero, value props, bottom CTA) — neo-brutalist colorful
- ✅ Dashboard (greeting, quick actions, rappels CRUD, recent chats, featured guides)
- ✅ AI Chat page (Claude Sonnet 4.5) — multi-turn, history persisted, suggestions
- ✅ Guides library (8 seeded démarches: RAMQ, SAAQ, GAMF, impôts, logement, AFE, Hydro, CNESST)
- ✅ Guide detail page (steps with check-off, resources, FAQ, CTA to chat)
- ✅ Mobile responsive, sticky header with mobile menu
- ✅ Auto-seeding of guides on backend startup
- ✅ Backend tested 100% (15/15 tests passing)

## Backlog (P1/P2)
- **P1** Streaming SSE for chat (faster perceived response)
- **P1** Email reminders via SendGrid/Resend when échéance approaches
- **P1** More guides: aide sociale, curateur public, divorce, mariage civil, immigration
- **P2** Crowdsourced tips section (community Q&A)
- **P2** Personal "dossier" upload (store carte soleil photo, bail, etc.)
- **P2** Integration with SAAQ/RAMQ for real status checks
- **P2** Push notifications via web push

## Monetization (smart enhancement)
- Free tier (current): unlimited guides + reminders + 20 AI msgs/month
- **Pro $4.99/mois**: unlimited AI, email reminders, dossier privé, alertes personnalisées
- **B2B**: vendre la plateforme aux organismes communautaires (Carrefour Jeunesse-Emploi, etc.)

## Key files
- `/app/backend/server.py` — all API routes
- `/app/frontend/src/App.js` — routing + AuthProvider
- `/app/frontend/src/pages/{Landing,Dashboard,ChatPage,GuidesPage,GuideDetail,AuthCallback}.jsx`
- `/app/frontend/src/components/{Header,ProtectedRoute}.jsx`
- `/app/frontend/src/context/AuthContext.jsx`
- `/app/design_guidelines.json`
