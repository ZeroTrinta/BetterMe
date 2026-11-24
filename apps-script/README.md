# BetterMe — Google Apps Script

Versão independente do BetterMe hospedada no Google Apps Script e conectada à planilha de 12 semanas. Não precisa de Firebase, Supabase, Cloudflare nem OAuth Client ID próprio.

**Segurança:** o Web App deve executar com sua conta Google e ter acesso **Somente eu**. Não use 'Qualquer pessoa' ou 'Qualquer pessoa com o link'.

Planilha: https://docs.google.com/spreadsheets/d/16CmKhI08ToWywfIybGsPqW_V5zQcClt0ajh-ELKfW08/edit

## Publicação automática (sem copiar e colar)

O GitHub já tem um workflow seguro para publicar no Apps Script, inicialmente desativado até configurar as credenciais. Veja [guia de automação via clasp](./AUTOMACAO_GITHUB.md) para ativar com teste sem publicação, preservando a mesma URL do BetterMe.

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

## Refeições com um toque

Na aba **Nutrição**, toque no card da refeição consumida. Ela fica destacada em verde e adiciona automaticamente as calorias e proteínas de referência aos totais do dia. Toque novamente para desmarcar e descontar. As seleções são salvas na coluna **K — Refeições consumidas (IDs)** da aba **Diário Alimentar**, sem substituir água, sono, notas ou fórmulas.

- Cada refeição só entra uma vez por dia; reenviar a mesma seleção não duplica calorias.
- Totais registrados manualmente continuam disponíveis como complementos. Exemplo: se você informou 1000 kcal incluindo 720 kcal do almoço marcado, ao desmarcar o almoço o restante fica em 280 kcal.
- O card contabiliza a **porção de referência descrita nele**, não verifica automaticamente quanto você realmente comeu. Se a porção foi diferente, ajuste o total no campo de registro ou desmarque o card e anote a quantidade manualmente.
- A seleção continua separada por semana e dia e é recuperada ao abrir o aplicativo.

### Atualizar uma implantação existente (mesmo endereço)

1. Na planilha, abra **Extensões → Apps Script**.
2. Substitua o conteúdo de **Código.gs** pelo código atualizado de [Code.gs](./Code.gs).
3. Substitua o conteúdo de **Index.html** pelo código atualizado de [Index.html](./Index.html).
4. Salve e acesse **Implantar → Gerenciar implantações → Editar**.
5. Em **Versão**, selecione **Nova versão** e confirme. **Não crie uma implantação diferente** se deseja preservar o link atual.
6. Atualize a página BetterMe e teste marcando o café da manhã. A planilha deve registrar **450 kcal, 25 g de proteína e [0] na coluna K**, caso o dia ainda esteja vazio.

## Cronômetro flutuante e progressão semanal

- O cronômetro de descanso aparece **recolhido no canto inferior direito** da aba Treinos. Toque no botão com o tempo para abrir, iniciar, pausar, escolher entre 60/90/120/150 segundos ou reiniciar. Recolher o painel **não interrompe a contagem**.
- Os exercícios principais continuam consistentes durante as 12 semanas. A quantidade de séries varia por semana: **2, 3, 3, 2, 4, 4, 4, 2, 4, 4, 4, 3** (limitada às séries próprias de cada exercício).
- As **semanas 4 e 8** são de recuperação, e a **semana 12** é de avaliação.
- A partir do último treino completo registrado para o mesmo exercício, o site sugere **até +1 repetição ou segundo** por série, sem passar do topo da faixa. Se não houve treino completo, mantém o alvo básico. Em semanas de recuperação e de avaliação não aumenta o alvo.
- Ao atingir o topo da faixa mantendo a técnica, avalie experimentar uma variação mais difícil; isso não é automático e nunca deve provocar dor.
- A progressão exibida é orientativa. O aplicativo não altera as entradas registradas nem exige que você conclua uma semana incompleta antes de continuar.

**Para publicar a atualização mantendo o endereço do seu Apps Script:** copie somente o [Index.html](./Index.html) atualizado para o arquivo HTML do projeto em **Extensões → Apps Script**, salve, depois vá a **Implantar → Gerenciar implantações → Editar → Nova versão → Implantar**. Não é necessário alterar o arquivo Code.gs nesta atualização.

## Ajuda dos exercícios (sem timer de descanso)

Cada um dos **20 exercícios de força** (5 por dia, às segundas, terças, quintas e sextas) possui um botão **Como fazer / progressões**. Ele expande o próprio card com posição inicial, instruções, erros a evitar, variações mais fáceis e mais difíceis e link externo para demonstração em vídeo ou guia. Quando há um vídeo/guia validado, abre diretamente; nos demais exercícios o botão abre uma pesquisa específica no YouTube, claramente identificada como pesquisa. Os links abrem em outra aba.

O **cronômetro de descanso foi totalmente removido**, inclusive seu botão flutuante. Os cronômetros individuais de prancha, sustentação na barra, hollow hold e isometria na parede continuam disponíveis para registrar as séries por tempo.

Esta atualização altera **somente o arquivo [Index.html](./Index.html)** do Apps Script. Não modifica o backend, as fórmulas ou seus registros na planilha. Se o deploy automático não estiver ativado, atualize o Index.html no projeto Google e use **Implantar → Gerenciar implantações → Editar → Nova versão**, para manter o mesmo endereço.

## Recursos

- Interface escura responsiva com painel, progresso e calendário de aderência.
- Treinos segunda, terça, quinta e sexta; recuperação ativa às quartas.
- Progressão semanal e histórico de séries/repetições.
- Botão de instruções e links demonstrativos nos 20 exercícios; sem cronômetro de descanso e com cronômetros próprios somente nos exercícios por tempo.
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
