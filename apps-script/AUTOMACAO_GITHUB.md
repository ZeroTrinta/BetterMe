# BetterMe — publicação automática do Apps Script

Este repositório já contém o **ID do projeto Apps Script e o ID da implantação atual** no workflow `.github/workflows/deploy-apps-script.yml`. O workflow foi preparado para alterar **a implantação existente** em vez de criar um novo endereço. Ele começa **desabilitado para push automático** até a configuração abaixo.

## 1. Ativar a Apps Script API

Acesse https://script.google.com/home/usersettings com a mesma conta Google que é proprietária do BetterMe. Ative **Google Apps Script API**. Essa configuração é diferente da **Google Sheets API**, que já estava habilitada.

## 2. ID da implantação já configurado

O ID do projeto e o ID da implantação existente já estão cadastrados no workflow. **Não é necessário gerar outra implantação nem criar um segundo Secret**: a automação está preparada para atualizar o mesmo endereço /exec.

## 3. Autorizar clasp uma vez no seu computador

Instale o Node.js LTS (20 ou superior) e abra o PowerShell no Windows:

```powershell
npm install --global @google/clasp@3.4.1
clasp login
```

Faça login na conta que tem acesso ao projeto Apps Script e aceite as permissões solicitadas. O clasp salva os tokens OAuth no arquivo privado `~/.clasprc.json`.

Se precisar localizar o arquivo no Windows, normalmente ele estará em `%USERPROFILE%\.clasprc.json`. Para copiar seu conteúdo para a área de transferência sem mostrá-lo no chat:

```powershell
Get-Content -Raw "$env:USERPROFILE\.clasprc.json" | Set-Clipboard
```

**Nunca compartilhe o conteúdo desse arquivo em conversas, issues ou arquivos públicos.** Ele possui um token de renovação capaz de acessar projetos Apps Script da sua conta. Se for comprometido, revogue a autorização Google e gere novas credenciais.

## 4. Criar um GitHub Actions Secret

Abra https://github.com/ZeroTrinta/BetterMe/settings/secrets/actions e escolha **New repository secret**.

| Nome | Valor |
|---|---|
| `BETTERME_CLASPRC_JSON` | Conteúdo completo e secreto do arquivo `.clasprc.json` |

Depois de colar o token no GitHub, limpe a área de transferência. **Não coloque essas informações no código ou em arquivos versionados.**

## 5. Executar um teste sem publicar

Abra https://github.com/ZeroTrinta/BetterMe/actions/workflows/deploy-apps-script.yml e clique **Run workflow** na branch `main`. Deixe marcado **Somente verificar acesso e arquivos, sem publicar**.

Esse teste se autentica na sua conta, faz `clasp pull` do projeto existente, compara os arquivos e valida que os arquivos BetterMe são reconhecidos. **Não grava nada no Apps Script.** Se falhar, confira a Apps Script API, a conta usada e o Secret.

## 6. Ativar a primeira publicação e a automática

Quando o teste estiver verde, execute **Run workflow** outra vez, desta vez **desmarcando o teste sem publicar**. O workflow enviará o código do GitHub para o mesmo projeto e executará `clasp create-deployment --deploymentId ...`, atualizando o endereço atual sem criar outro.

Depois de validar o aplicativo pelo seu link de sempre, abra https://github.com/ZeroTrinta/BetterMe/settings/variables/actions e crie a variável:

| Nome | Valor |
|---|---|
| `BETTERME_APPS_SCRIPT_AUTO_DEPLOY` | `true` |

Pronto: futuros commits na branch `main` que modifiquem `apps-script/Code.gs` ou `apps-script/Index.html` serão testados e publicados automaticamente.

## Segurança e funcionamento

- O workflow **nunca cria uma implantação nova**: usa o ID da implantação antiga, já configurado no workflow.
- O script primeiro baixa todo o projeto remoto com `clasp pull`, preserva `appsscript.json`, demais arquivos e o nome original `Código.gs`/`Code.gs`, e substitui apenas o backend e HTML BetterMe.
- O comando `clasp push` substitui o conteúdo inteiro do projeto Apps Script; por isso a preparação e os testes são importantes. Não edite manualmente fontes no Google depois de ativar a automação sem trazer as mudanças ao GitHub.
- As credenciais OAuth ficam somente em GitHub Secrets e em um arquivo temporário no executor do GitHub. O repositório e o código cliente não contêm tokens.
- Um token OAuth pode expirar, ser revogado ou exigir nova autorização. Nesse caso, repita `clasp login` e atualize o secret `BETTERME_CLASPRC_JSON`.
- A planilha e seus registros **não são alterados** por essa implantação de código, além do que o aplicativo normalmente fizer quando você o usar.

## Problemas comuns

- **Script API not enabled:** ative o interruptor em https://script.google.com/home/usersettings.
- **401 Unauthorized:** refaça `clasp login` e atualize o secret do GitHub.
- **Arquivo BetterMe não identificado:** confira se o projeto informado é o mesmo já publicado e se `Código.gs`/`Code.gs` contém a constante `BETTERME_SHEET_ID`.
- **Implantação não encontrada:** confira **Implantar → Gerenciar implantações** e compare o ID com o cadastrado no workflow. Não confunda com o ID do script.

Referência oficial: https://developers.google.com/apps-script/guides/clasp
