# BetterMe — Google Apps Script

Versão independente do BetterMe hospedada no Google Apps Script e conectada à planilha de 12 semanas. Não precisa de Firebase, Supabase, Cloudflare nem OAuth Client ID próprio.

**Segurança:** o Web App deve executar com sua conta Google e ter acesso **Somente eu**. Não use 'Qualquer pessoa' ou 'Qualquer pessoa com o link'.

Planilha: https://docs.google.com/spreadsheets/d/16CmKhI08ToWywfIybGsPqW_V5zQcClt0ajh-ELKfW08/edit

## Instalação sem terminal

1. Abra a planilha acima com a conta Google proprietária.
2. No menu, clique em **Extensões → Apps Script**. Isso cria um projeto vinculado à planilha.
3. Abra **Código.gs** (ou Code.gs), apague seu conteúdo e cole todo o código de **apps-script/Code.gs** deste repositório.
4. Clique **+ → HTML**, crie um arquivo chamado **Index** e substitua todo o conteúdo pelo código de **apps-script/Index.html**.
5. Salve o projeto e dê a ele o nome **BetterMe**.
6. Clique em **Implantar → Nova implantação → Selecionar tipo → Aplicativo da Web**.
7. Escolha **Executar como: Eu** e **Quem tem acesso: Somente eu**.
8. Clique **Implantar**, autorize o script com a própria conta e copie a URL do Aplicativo da Web (termina em **/exec**).
9. Abra esse endereço estando conectado à mesma conta Google. Esse será seu BetterMe principal.

Arquivos que você precisa copiar: **Code.gs** e **Index.html**. Não é necessário copiar o arquivo de testes.

## Recursos

- Interface escura responsiva com painel, progresso e calendário de aderência.
- Treinos segunda, terça, quinta e sexta; recuperação ativa às quartas.
- Progressão semanal e histórico de séries/repetições.
- Timers de descanso de 60, 90, 120 e 150 segundos e cronômetros nos exercícios por tempo.
- Alimentação, peso, cintura, testes de barra/flexão e gráfico de evolução.
- Chamadas assíncronas google.script.run para ler e escrever na mesma planilha.
- Cache local e fila de gravação para falhas breves de conexão.

## Atualizar o aplicativo no futuro

Após alterar os arquivos no editor do Apps Script, use **Implantar → Gerenciar implantações → Editar → Nova versão**. Isso preserva o endereço /exec. O GitHub armazena o código, mas não publica automaticamente no Apps Script.

## Privacidade

- Use **Somente eu** na implantação.
- Mantenha a planilha privada.
- Não coloque senhas, chaves ou tokens no código.
- A primeira implantação pede autorização do seu script; os treinos posteriores não exigem novo OAuth do Sheets.
- O acesso continua sujeito à sessão da sua conta Google.

## Compatibilidade

A planilha precisa manter as abas originais Config, Diário de Treino, Sessões, Pesagens, Diário Alimentar e Medidas. O cronômetro calcula o tempo por horários reais, resistindo à suspensão de temporizadores quando o navegador fica em segundo plano.

## Testes

Rodar: node apps-script/test.mjs

O teste valida a sintaxe e simula chamadas ao Google Sheets. A execução real ainda precisa ser verificada pela implantação privada na conta Google.

O plano de treino e a alimentação são educativos. Adapte exercícios que causem dor e procure aconselhamento profissional quando necessário.
