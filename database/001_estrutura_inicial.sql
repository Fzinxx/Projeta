begin;

-- Negócios pertencentes a cada usuário.

create table public.negocios (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null default auth.uid()
    references auth.users(id) on delete cascade,
  nome text not null
    check (char_length(trim(nome)) between 1 and 100),
  descricao text not null default ''
    check (char_length(descricao) <= 500),
  despesas_fixas numeric(14, 2) not null default 0
    check (despesas_fixas >= 0 and despesas_fixas < 1000000000000),
  criado_em timestamptz not null default now()
);

create index negocios_usuario_id_idx
  on public.negocios(usuario_id);

-- Produtos do negócio.

create table public.produtos (
  id uuid primary key default gen_random_uuid(),
  negocio_id uuid not null
    references public.negocios(id) on delete cascade,
  nome text not null
    check (char_length(trim(nome)) between 1 and 100),
  preco_venda numeric(14, 2) not null default 0
    check (preco_venda >= 0 and preco_venda < 1000000000000),
  custo_variavel numeric(14, 2) not null default 0
    check (custo_variavel >= 0 and custo_variavel < 1000000000000),
  quantidade bigint not null default 0
    check (quantidade between 0 and 9007199254740991),
  ordem integer not null default 0
    check (ordem >= 0),
  criado_em timestamptz not null default now()
);

create index produtos_negocio_id_idx
  on public.produtos(negocio_id);

-- O cenário guarda uma cópia dos dados da simulação.
-- Alterar produtos depois não modifica essa cópia.

create table public.cenarios (
  id uuid primary key default gen_random_uuid(),
  negocio_id uuid not null
    references public.negocios(id) on delete cascade,
  nome text not null
    check (char_length(trim(nome)) between 1 and 100),
  dados jsonb not null
    check (jsonb_typeof(dados) = 'object'),
  criado_em timestamptz not null default now()
);

create index cenarios_negocio_id_idx
  on public.cenarios(negocio_id);

-- Ativa a proteção por linha nas três tabelas.

alter table public.negocios enable row level security;
alter table public.produtos enable row level security;
alter table public.cenarios enable row level security;

-- Cada usuário só pode acessar e modificar os próprios negócios.

create policy negocios_do_usuario
  on public.negocios
  for all
  to authenticated
  using (
    usuario_id = (select auth.uid())
  )
  with check (
    usuario_id = (select auth.uid())
  );

-- Produtos só podem ser acessados pelo dono do negócio.

create policy produtos_do_usuario
  on public.produtos
  for all
  to authenticated
  using (
    exists (
      select 1
      from public.negocios as negocio
      where negocio.id = produtos.negocio_id
        and negocio.usuario_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1
      from public.negocios as negocio
      where negocio.id = produtos.negocio_id
        and negocio.usuario_id = (select auth.uid())
    )
  );

-- Cenários seguem a mesma regra de propriedade.

create policy cenarios_do_usuario
  on public.cenarios
  for all
  to authenticated
  using (
    exists (
      select 1
      from public.negocios as negocio
      where negocio.id = cenarios.negocio_id
        and negocio.usuario_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1
      from public.negocios as negocio
      where negocio.id = cenarios.negocio_id
        and negocio.usuario_id = (select auth.uid())
    )
  );

-- Libera somente as operações necessárias para usuários autenticados.

revoke all privileges
  on table public.negocios, public.produtos, public.cenarios
  from public, anon, authenticated;

grant usage on schema public to authenticated;

grant select, insert, update, delete
  on table public.negocios, public.produtos, public.cenarios
  to authenticated;

commit;