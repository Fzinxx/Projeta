begin;

create or replace function public.salvar_negocio(
  p_id uuid,
  p_nome text,
  p_descricao text,
  p_despesas_fixas numeric,
  p_produtos jsonb
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  produto jsonb;
  quantidade_informada numeric;
begin
  if auth.uid() is null then
    raise exception 'Entre na sua conta para salvar.';
  end if;

  if p_id is null then
    raise exception 'O identificador do negócio é obrigatório.';
  end if;

  if p_produtos is null
     or pg_catalog.jsonb_typeof(p_produtos) <> 'array' then
    raise exception 'Informe uma lista de produtos.';
  end if;

  if pg_catalog.jsonb_array_length(p_produtos) = 0 then
    raise exception 'Adicione pelo menos um produto.';
  end if;

  -- Valida antes de converter para bigint,
  -- evitando arredondar quantidades fracionadas.
  for produto in
    select value
    from pg_catalog.jsonb_array_elements(p_produtos)
  loop
    if pg_catalog.jsonb_typeof(produto) <> 'object' then
      raise exception 'Produto inválido.';
    end if;

    quantidade_informada :=
      (produto ->> 'quantidade')::numeric;

    if quantidade_informada is null
       or not (
         quantidade_informada between 0 and 9007199254740991
       )
       or quantidade_informada <>
          pg_catalog.trunc(quantidade_informada) then
      raise exception 'A quantidade deve ser um número inteiro válido.';
    end if;
  end loop;

  -- Cria ou atualiza o negócio.
  -- As políticas RLS continuam verificando o proprietário.
  insert into public.negocios (
    id,
    usuario_id,
    nome,
    descricao,
    despesas_fixas
  )
  values (
    p_id,
    auth.uid(),
    pg_catalog.btrim(p_nome),
    coalesce(p_descricao, ''),
    p_despesas_fixas
  )
  on conflict (id) do update
  set
    nome = excluded.nome,
    descricao = excluded.descricao,
    despesas_fixas = excluded.despesas_fixas;

  -- Substitui a lista de produtos dentro da mesma operação.
  delete from public.produtos
  where negocio_id = p_id;

  insert into public.produtos (
    negocio_id,
    nome,
    preco_venda,
    custo_variavel,
    quantidade,
    ordem
  )
  select
    p_id,
    pg_catalog.btrim(item.value ->> 'nome'),
    (item.value ->> 'precoVenda')::numeric,
    (item.value ->> 'custoVariavel')::numeric,
    (item.value ->> 'quantidade')::bigint,
    (item.ordinality - 1)::integer
  from pg_catalog.jsonb_array_elements(p_produtos)
    with ordinality as item(value, ordinality);

  return p_id;
end;
$$;

revoke all privileges
  on function public.salvar_negocio(
    uuid, text, text, numeric, jsonb
  )
  from public, anon, authenticated;

grant execute
  on function public.salvar_negocio(
    uuid, text, text, numeric, jsonb
  )
  to authenticated;

commit;