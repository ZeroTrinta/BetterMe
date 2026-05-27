# BetterMe v2 — Performance Hub

Sistema pessoal de calistenia, nutrição e BI.
Stack: **Next.js 14 (App Router) + TypeScript + Tailwind + Firebase Firestore + PWA**.

Mantém compatibilidade com o Firebase já em produção (coleções `historico_alimentacao`, `historico_treino`, `compras_mercado`).

## Stack escolhida — por quê

- **Next.js export estático** → continua publicando no GitHub Pages, zero custo.
- **PWA** (next-pwa) → instalável no celular, ícone na home, funciona offline.
- **TypeScript** → tipos do domínio impedem bugs típicos de dieta/treino.
- **Framer Motion** → animações fluidas (anel, timer, swipe, celebração).
- **Recharts** → gráficos de BI já com tema dark.
- **Tailwind + tokens próprios** → design system consistente com a identidade BetterMe (dark + neon lime).

## Estrutura

```
src/
├── app/                  # rotas (App Router)
│   ├── page.tsx          # Hub principal (dashboard)
│   ├── dieta/            # Aba dieta
│   ├── treino/           # Aba treino (A/B/C + timer)
│   ├── mercado/          # Lista swipe + financeiro
│   └── insights/         # BI / gráficos
├── components/
│   ├── ui/               # Card, ProgressRing, RestTimer, SwipeItem
│   ├── layout/           # BottomNav, PageHeader
│   └── charts/           # ConsistencyHeatmap
├── lib/
│   ├── firebase.ts       # init do app
│   ├── firestore.ts      # repositório (todas as queries)
│   ├── treinos.ts        # dados A/B/C
│   └── utils.ts
├── types/                # tipos de domínio
└── styles/globals.css
```

## Setup local

```bash
npm install
cp .env.example .env.local   # já preenchi com seu projeto Firebase
npm run dev
```

Abrir em `http://localhost:3000`.

## Deploy no GitHub Pages

1. Crie um repositório (ex: `BetterMe`) e suba o código.
2. Vá em **Settings → Pages → Source: GitHub Actions**.
3. Em **Settings → Secrets and variables → Actions**, adicione os 6 secrets:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`
4. Push na branch `main` → o workflow `.github/workflows/deploy.yml` builda e publica automaticamente.

> Se o repo for `usuario/BetterMe` e não um `usuario.github.io`, descomente `basePath` e `assetPrefix` em `next.config.js`.

## Domínio das coleções (Firestore)

| Coleção | ID do doc | Campos |
|---|---|---|
| `historico_alimentacao` | `YYYY-MM-DD` | `cafe_manha`, `almoco`, `pre_treino`, `jantar` (bool) + `data` (string) |
| `historico_treino` | `YYYY-MM-DD_X` | `data`, `tipo_treino` (`A`\|`B`\|`C`), `registrado_em` |
| `compras_mercado` | auto | `data`, `mes` (`YYYY-MM`), `valor_pago`, `descricao` |

## Próximos passos sugeridos (Roadmap)

- [ ] **Firebase Auth** (Google Sign-In) — hoje os dados são compartilhados publicamente
- [ ] **Regras de segurança** Firestore por `request.auth.uid`
- [ ] Dashboard de volume semanal (séries × reps)
- [ ] Notificações push de descanso ativo
