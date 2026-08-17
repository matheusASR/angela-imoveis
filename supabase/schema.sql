-- Angela Imóveis — schema Supabase (Postgres)
--
-- Como aplicar: Supabase Dashboard > SQL Editor > cole este arquivo inteiro > Run.
-- Pode ser rodado mais de uma vez com segurança (idempotente).
--
-- Modelo de acesso: acesso de escrita/leitura liberado para qualquer usuário
-- autenticado (role "authenticated"). Como o cadastro público fica desativado
-- (Authentication > Sign In / Providers > Email > "Allow new users to sign
-- up" desligado) e a conta da corretora é criada manualmente com e-mail e
-- senha (Authentication > Users > Add user), na prática só ela consegue
-- obter uma sessão válida — por isso não é necessário checar o e-mail
-- dentro das políticas.

-- OBS.: id/id_proprietario usam "integer" (não "bigint") e os valores
-- monetários usam "double precision" (não "numeric") de propósito: a API
-- REST do Supabase (PostgREST) serializa bigint e numeric como string em
-- JSON (para não perder precisão), o que quebraria silenciosamente as
-- comparações de id e as contas do app, que esperam number do JavaScript.
-- Um imóvel de agência não precisa da precisão arbitrária de numeric nem da
-- faixa de bigint, então essa troca é segura aqui.

create table if not exists public.clientes (
  id integer generated always as identity primary key,
  nome text not null default '',
  telefone text not null default '',
  created_at timestamptz not null default now()
);

-- Dados bancários do cliente: cadastrados/editados só na aba Clientes e
-- propagados (denormalizados) para locacoes.banco_proprietario etc. abaixo,
-- da mesma forma que nome/telefone já eram propagados.
alter table public.clientes add column if not exists banco text not null default '';
alter table public.clientes add column if not exists agencia text not null default '';
alter table public.clientes add column if not exists conta_corrente text not null default '';

create table if not exists public.locacoes (
  id integer generated always as identity primary key,
  local text not null default '',
  numero_ap text not null default '',
  meio_pagamento text not null default '',
  dia_vencimento text not null default '',
  nome_locatario text not null default '',
  data_pagamento_locatario text not null default '',
  valor_aluguel double precision not null default 0,
  valor_adm double precision not null default 0,
  valor_condominio double precision not null default 0,
  valor_iptu double precision not null default 0,
  valor_extras double precision not null default 0,
  valor_multa double precision not null default 0,
  valor_extra_proprietario double precision not null default 0,
  pagamento_condominio text not null default 'adm' check (pagamento_condominio in ('inquilino', 'adm')),
  pagamento_iptu text not null default 'adm' check (pagamento_iptu in ('inquilino', 'adm')),
  pagamento_extras text not null default 'adm' check (pagamento_extras in ('inquilino', 'adm')),
  nome_proprietario text not null default '',
  telefone_proprietario text not null default '',
  data_pagamento_proprietario text not null default '',
  meses_contrato integer not null default 12,
  mes_contrato_atual integer not null default 0,
  parcela_iptu_atual integer not null default 0,
  data_revisao_reajuste text not null default '',
  -- Copiados de clientes.banco/agencia/conta_corrente ao selecionar o
  -- proprietário e sincronizados quando editados na aba Clientes — não são
  -- editáveis diretamente no imóvel (ver comentário em public.clientes).
  banco_proprietario text not null default '',
  agencia_proprietario text not null default '',
  conta_corrente_proprietario text not null default '',
  predinho smallint not null default 0 check (predinho in (0, 1)),
  data_inicio_contrato text not null default '',
  observacoes text not null default '',
  ativo boolean not null default true,
  id_proprietario integer references public.clientes (id) on delete set null,
  mes_referencia text not null default to_char(now(), 'YYYY-MM'),
  created_at timestamptz not null default now()
);

create index if not exists locacoes_id_proprietario_idx on public.locacoes (id_proprietario);

-- Histórico mensal: "id" identifica uma linha (um registro de um mês
-- específico de um imóvel); "imovel_id" é a chave estável que agrupa todas
-- as linhas mensais do mesmo imóvel ao longo do tempo. Toda virada de mês
-- insere uma linha nova com o mesmo imovel_id em vez de sobrescrever a
-- anterior — por isso o histórico de meses passados fica preservado.
alter table public.locacoes add column if not exists imovel_id integer;
update public.locacoes set imovel_id = id where imovel_id is null;
alter table public.locacoes alter column imovel_id set not null;

-- A sequence garante que todo imóvel NOVO (criado pelo app sem informar
-- imovel_id) ganhe uma chave própria; a virada de mês, ao inserir a linha
-- do mês novo, informa explicitamente o imovel_id já existente do imóvel,
-- então não consome a sequence nesse caso.
create sequence if not exists public.imovel_id_seq;
select setval(
  'public.imovel_id_seq',
  greatest((select coalesce(max(imovel_id), 0) from public.locacoes), 1)
);
alter table public.locacoes alter column imovel_id set default nextval('public.imovel_id_seq');

-- Nunca pode haver duas linhas do mesmo imóvel para o mesmo mês de
-- referência — é essa constraint que impede duplicidade na virada de mês.
alter table public.locacoes drop constraint if exists locacoes_imovel_mes_unique;
alter table public.locacoes
  add constraint locacoes_imovel_mes_unique unique (imovel_id, mes_referencia);

create index if not exists locacoes_imovel_id_idx on public.locacoes (imovel_id);

alter table public.clientes enable row level security;
alter table public.locacoes enable row level security;

drop policy if exists "authenticated_full_access" on public.clientes;
create policy "authenticated_full_access" on public.clientes
  for all
  to authenticated
  using (true)
  with check (true);

drop policy if exists "authenticated_full_access" on public.locacoes;
create policy "authenticated_full_access" on public.locacoes
  for all
  to authenticated
  using (true)
  with check (true);
