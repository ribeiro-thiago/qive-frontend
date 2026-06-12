# Fluxo Git no Cursor — Guia para o time de design

## Introdução

Este guia explica como usar o Git diretamente pelo Cursor, **sem usar o terminal**. Há dois cenários: **quem envia o projeto** para outro repositório Git (por exemplo, para o time de design) e **quem vai clonar e trabalhar** nesse repositório em outra máquina. Em ambos os casos, tudo é feito com botões e menus do Cursor.

---

## Pré-requisitos

- **Cursor** instalado no computador.
- **URL do repositório** (você recebe de quem criou o repositório no GitHub, GitLab, Bitbucket etc.).
- Se o repositório for privado: **login** na conta do serviço (GitHub, GitLab etc.) — o Cursor costuma pedir isso na primeira vez que você clona ou faz push.

---

## Parte A — Quem envia o projeto para outro Git

Se você tem o projeto aberto no Cursor e quer **enviar uma cópia** dele para um novo repositório (por exemplo, o repositório do time de design), siga estes passos **somente pela interface**:

1. **Abrir o painel Source Control**
   - Clique no ícone de **ramificação** (branch) na barra lateral esquerda do Cursor.
   - Ou use o menu **View > Source Control**.

2. **Adicionar o repositório de destino**
   - No painel Source Control, clique no menu **"..."** (três pontinhos).
   - Escolha **Add Remote...**.
   - Informe um **nome** para o remote (por exemplo: `design`).
   - Informe a **URL** do novo repositório (a que o time de design vai usar).
   - Confirme.

3. **Enviar o projeto para esse repositório**
   - No mesmo menu **"..."** do Source Control, escolha **Push to...**.
   - Selecione o remote que você criou (ex.: `design`) e a branch (geralmente `main`).
   - Confirme. O Cursor envia todo o histórico do projeto para o outro repositório.

**Para atualizar o repositório do design no futuro:** repita o passo 3 (menu **"..."** → **Push to...** → escolher o remote `design` e a branch `main`).

---

## Parte B — Quem vai trabalhar no repositório (time, outras máquinas)

Se você vai **clonar** o repositório e **contribuir** com melhorias a partir do seu computador, use estes passos **somente pela interface**:

### 1. Clonar o repositório

- No Cursor: **File > Clone Repository...** (ou abra a Command Palette e procure por “Clone”).
- Cole a **URL** do repositório e escolha a **pasta** onde o projeto será salvo.
- Quando terminar, **abra a pasta** no Cursor (se não abrir automaticamente).

### 2. Fazer alterações

- Edite os arquivos normalmente (design, código, textos etc.).
- Salve os arquivos (Ctrl+S / Cmd+S).

### 3. Salvar no Git (commit)

- Abra o painel **Source Control** (ícone de ramificação na barra lateral ou **View > Source Control**).
- No campo de texto em cima da lista de arquivos, escreva uma **mensagem** que descreva o que você alterou (ex.: “Atualizei o ícone do menu”).
- Clique no botão **Commit** (ícone de check ao lado do campo de mensagem).

Assim suas alterações ficam registradas no Git, ainda só na sua máquina.

### 4. Atualizar com o que os outros fizeram (pull)

- **Antes de enviar** suas alterações para o servidor, é importante puxar o que outras pessoas já enviaram.
- No painel Source Control, clique no menu **"..."** e escolha **Pull**.
- O Cursor atualiza sua cópia com as mudanças do repositório remoto. Suas alterações locais não são apagadas; se houver conflito, o Cursor avisa e você resolve na interface.

**Dica:** Sempre que for enviar suas alterações, faça primeiro um **Pull** para evitar conflitos.

### 5. Enviar para o servidor (push)

- No menu **"..."** do Source Control, escolha **Push** (ou use o botão **Sync**, se estiver configurado para a sua branch).
- Suas alterações e commits passam a ficar disponíveis no repositório para o resto do time.

---

## Conflitos

**O que é um conflito?** Quando duas pessoas alteram o **mesmo trecho** do **mesmo arquivo**, o Git não sabe qual versão manter. Isso é um “conflito de merge”.

**O que fazer?** O Cursor mostra os arquivos em conflito e abre uma interface onde você pode:
- Escolher **manter a sua versão**,
- Escolher **manter a versão que veio do servidor**, ou
- **Juntar as duas** manualmente, editando o arquivo.

Não é necessário usar comandos; basta seguir as opções que o Cursor exibe na tela.

---

## Resumo visual — Cola do dia a dia

| O que você quer fazer | Onde no Cursor |
|-----------------------|----------------|
| **Clonar** o projeto | **File > Clone Repository...** → colar URL → escolher pasta → abrir pasta |
| **Ver e commitar** alterações | **Source Control** (ícone de branch) → mensagem → botão **Commit** |
| **Atualizar** com o que os outros fizeram | Source Control → menu **"..."** → **Pull** |
| **Enviar** suas alterações | Source Control → menu **"..."** → **Push** (ou **Sync**) |

Ordem recomendada antes de enviar: **Pull** → depois **Push**.

---

*Este guia usa apenas a interface do Cursor (menus e botões). Se em algum momento você precisar usar o terminal, peça ajuda a alguém do time ou consulte a seção “Alternativa pelo terminal” da documentação do projeto.*
