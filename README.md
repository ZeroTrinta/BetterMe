# BetterMe v3 — Calistenia & Evolução

Aplicativo Next.js 14 + TypeScript + Tailwind, exportado como site estático para GitHub Pages. O armazenamento principal opcional é a planilha privada do Google Sheets, com funcionamento local independente de servidor.

## Recursos

- Dashboard responsivo com progresso das 12 semanas, peso, treino e metas alimentares.
- Quatro sessões de força com peso corporal e uma sessão de recuperação por semana.
- Registro de cada série e indicação quando avançar de variação. Exercícios isométricos têm cronômetro próprio que permite registrar a duração; descanso de 60–150 s conta pelo relógio real e sobrevive à navegação na mesma aba.
- Alimentação diária (calorias, proteína, água e sono), peso, cintura, testes de flexão e barra.
- Integração Google Sheets com OAuth; não precisa de Firebase ou Supabase.
- Sem login, registros ficam no navegador e são enfileirados para envio após conectar a conta Google.

## Google Sheets

Planilha: https://docs.google.com/spreadsheets/d/16CmKhI08ToWywfIybGsPqW_V5zQcClt0ajh-ELKfW08/edit

Abas sincronizadas: Config, Diário de Treino, Sessões, Pesagens, Diário Alimentar e Medidas. O mapeamento de intervalos é fixo e pressupõe o modelo de 12 semanas da planilha original.

**Não publique a planilha.** O site em GitHub Pages é público, mas os dados somente são acessados pelo usuário com permissão OAuth. O token de acesso de curta duração fica em sessionStorage, apenas na aba atual, e não é enviado ao GitHub.

## Como conectar a conta Google (uma vez)

1. Acesse https://console.cloud.google.com e crie ou escolha um projeto.
2. Ative a Google Sheets API no projeto.
3. Configure a tela de consentimento em Google Auth Platform. Para uso pessoal, mantenha o app em modo Testing e adicione seu e-mail como usuário de teste.
4. Crie um OAuth Client ID do tipo **Web application**.
5. Em Authorized JavaScript origins, cadastre `https://zerotrinta.github.io` e, para testes locais, `http://localhost:3000`.
6. Copie o **Client ID** público, nunca o Client Secret, e cole no BetterMe em **Ajustes**.
7. Clique em Conectar ao Google, escolha a conta com acesso à planilha e autorize o escopo de planilhas.

O token temporário é preservado na sessão da aba, para que um recarregamento não exija novo login enquanto ele estiver válido. O site **não força novo consentimento** nas reconexões. Tokens do Google Sheets expiram (normalmente após cerca de 1 hora): a Google Identity Services exige nova autorização por gesto do usuário quando isso ocorrer. Se a conta já tiver sido autorizada, o BetterMe tenta reautorizar durante o próximo clique em **Salvar**, sem obrigar a abrir a página de Ajustes. **Não é possível oferecer acesso permanente à planilha apenas com uma página estática no GitHub Pages**; isso exigiria um backend seguro que mantenha credenciais de renovação fora do navegador. O app continua salvando dados localmente até ser reconectado. Se o app estiver em modo Testing, pode aparecer aviso de app não verificado.

## Desenvolvimento

```bash
npm ci
npm run dev
```

Abra http://localhost:3000/BetterMe/ (basePath do GitHub Pages).

## Publicação

O workflow em `.github/workflows/deploy.yml` publica automaticamente os commits em `main`. Configure Settings > Pages > Source: GitHub Actions.

URL esperada após publicar: https://zerotrinta.github.io/BetterMe/

## Privacidade

No modo local, os registros usam localStorage deste dispositivo. Não utilize em computador compartilhado e não limpe os dados antes de sincronizar. Não há nenhuma senha, segredo, refresh token, chave de serviço ou conteúdo privado da planilha no repositório.

## Aviso

O plano é educativo e adaptável. Evite exercícios que causem dor, não treine todos os sets até a falha, e ajuste calorias com base na tendência de peso/cintura e orientação profissional quando necessário.