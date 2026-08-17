# Angela Imóveis

Sistema de controle de locações para uma corretora individual. Os dados ficam
salvos no **Supabase** (Postgres na nuvem) e o acesso é restrito a uma única
conta, com login por e-mail e senha (Supabase Auth). A aplicação em si é só
front-end estático, pensada para ser hospedada no **Cloudflare Pages**.

## Como rodar localmente

Pré-requisitos: [Node.js](https://nodejs.org) 18+ e um projeto Supabase já
configurado (veja a seção seguinte).

```bash
npm install
cp .env.example .env   # preencha com a URL e a anon key do seu projeto Supabase
npm run dev
```

Abra o endereço mostrado no terminal (geralmente `http://localhost:5173`).

Para gerar a versão de produção (arquivos estáticos):

```bash
npm run build
npm run preview
```

## 1. Configurar o Supabase (banco de dados + login)

1. Crie uma conta em [supabase.com](https://supabase.com) (tem plano gratuito)
   e crie um novo projeto.
2. Abra **SQL Editor** no painel do projeto, cole o conteúdo de
   [`supabase/schema.sql`](supabase/schema.sql) e clique em **Run**. Isso cria
   as tabelas `locacoes` e `clientes`, com as políticas de segurança (RLS)
   que só liberam acesso para usuários autenticados.
3. Restrinja o acesso a uma única pessoa (a corretora):
   - Em **Authentication > Providers > Email**, desative **"Allow new users
     to sign up"**. Isso impede que qualquer e-mail crie conta sozinho.
   - Em **Authentication > Users**, clique em **Add user > Create new user**
     e cadastre o e-mail e a senha da corretora diretamente (marque **Auto
     Confirm User** para que ela já possa entrar sem precisar confirmar o
     e-mail). Essas serão as únicas credenciais que funcionam no sistema.
4. Pegue a URL e a chave pública do projeto em **Project Settings > API**
   (campos "Project URL" e "anon public") e coloque no seu `.env` (veja
   `.env.example`).

O login no app é tradicional, por **e-mail e senha** — sem link por e-mail.
A senha nunca é armazenada pelo sistema: quem valida e guarda a credencial é
o próprio Supabase Auth.

## 2. Hospedar no Cloudflare Pages

1. Suba este projeto para um repositório no GitHub (ou GitLab).
2. Crie uma conta gratuita em [dash.cloudflare.com](https://dash.cloudflare.com),
   vá em **Workers & Pages > Create > Pages > Connect to Git** e selecione o
   repositório.
3. Configure o build:
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
4. Em **Settings > Environment variables**, adicione `VITE_SUPABASE_URL` e
   `VITE_SUPABASE_ANON_KEY` com os mesmos valores do seu `.env`.
5. Clique em **Save and Deploy**. A Cloudflare gera uma URL `https://` própria
   automaticamente, e todo novo `git push` na branch principal atualiza o site
   sozinho.

## O que o sistema faz

- **Cadastro rápido de imóveis**: começa com só 3 campos (local, apartamento
  e proprietário, escolhido entre os clientes já cadastrados); o restante
  (locatário, valores, dados bancários, datas) é preenchido depois, clicando
  no imóvel.
- **Edição direta na tabela**: aluguel, condomínio, IPTU mensal, extras do
  inquilino, multa, taxa ADM e extras do proprietário podem ser editados
  clicando diretamente na célula, sem abrir a ficha do imóvel.
- **Cálculo automático da administração**: 7% sobre (aluguel + multa) para
  imóveis da categoria **PREDINHO**, e 8% para os demais — recalculado
  sozinho sempre que aluguel, multa ou a categoria mudam, mas também pode ser
  ajustado manualmente quando necessário.
- **Botões de pagamento na própria lista**: cada imóvel tem dois botões —
  "Locatário pagou" e "Paguei proprietário" — que funcionam como um
  interruptor: um clique marca o pagamento e preenche a data de hoje
  automaticamente; clicar de novo desmarca. Esses marcadores são zerados
  automaticamente toda vez que o mês vira.
- **Controle automático de IPTU**: o IPTU é sempre parcelado em 10x, de
  fevereiro (1/10) a novembro (10/10). A parcela atual e o valor de cada
  parcela (IPTU anual ÷ 10) são calculados sozinhos a partir do calendário.
- **Controle automático do contrato**: basta informar a data de início e a
  quantidade de meses do contrato — o sistema calcula sozinho em que mês do
  contrato você está (ex.: 4/12).
- **Alerta de reajuste**: quando um contrato completa 12 meses (contado a
  partir da data de início), o sistema avisa no dashboard, na tabela e na
  ficha do imóvel para verificar o reajuste por IPCA ou IGP-M.
- **Aba Clientes**: cadastro próprio de proprietários (nome e telefone), com
  os imóveis vinculados a cada um. Usado para preencher automaticamente o
  proprietário e o telefone na ficha do imóvel.
- **Busca e filtros**: por locatário, proprietário, imóvel ou apartamento, e
  filtros rápidos (ativos, PREDINHO, pagamentos pendentes, reajuste
  pendente).
- **Relatórios**: relatório mensal por imóvel (aluguel, condomínio, IPTU,
  extras, multa, taxa ADM, tempo de contrato e valor a repassar ao
  proprietário, com totais), exportável em HTML ou PDF.

## Onde os dados ficam salvos

Tudo é gravado no Postgres do seu projeto Supabase (tabelas `locacoes` e
`clientes`, ver [`supabase/schema.sql`](supabase/schema.sql)). O acesso só é
permitido para quem estiver autenticado — e só a corretora consegue se
autenticar, já que o cadastro público fica desativado e só a conta dela é
criada manualmente no painel do Supabase.

## Estrutura do projeto

```
supabase/
  schema.sql              tabelas, tipos e políticas de acesso (RLS) do Postgres
src/
  types.ts                 tipos e estrutura de dados de locação/cliente
  storage.ts                funções de leitura/escrita no Supabase
  calc.ts                   regras de negócio (administração, reajuste, formatação)
  theme.ts                  identidade visual (cores, tipografia)
  lib/supabaseClient.ts     cliente do Supabase (lê VITE_SUPABASE_URL/ANON_KEY)
  hooks/useSession.ts       hook que centraliza a sessão do Supabase Auth
  App.tsx                   tela principal, estado e integração dos componentes
  components/
    LoginScreen.tsx          tela de login por e-mail e senha
    Toolbar.tsx               busca, filtros e botão de adicionar imóvel
    LocacaoTable.tsx          tabela principal de imóveis (com edição in-line)
    LocacaoDialog.tsx         ficha de cadastro/edição/visualização
    ClientesTab.tsx           cadastro de proprietários
    ReportsTab.tsx            relatório mensal (tela, HTML, PDF)
```
