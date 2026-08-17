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
