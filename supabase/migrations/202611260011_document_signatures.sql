create table public.document_signatures (
 id uuid primary key default gen_random_uuid(),
 document_id uuid not null,
 business_id uuid not null,
 signer_name text not null check (char_length(signer_name) between 2 and 120),
 signature_data text not null check (char_length(signature_data) <= 500000 and signature_data like 'data:image/png;base64,%'),
 signed_at timestamptz not null default now(),
 created_at timestamptz not null default now(),
 constraint document_signatures_document_fk foreign key(document_id,business_id)
  references public.documents(id,business_id) on delete cascade,
 constraint document_signatures_one_per_document unique(document_id)
);
create index document_signatures_business_id_idx on public.document_signatures(business_id);
alter table public.document_signatures enable row level security;
create policy document_signatures_select_owned_business on public.document_signatures
 for select to authenticated using (exists(select 1 from public.businesses b where b.id=document_signatures.business_id and b.owner_id=(select auth.uid())));
grant select on public.document_signatures to authenticated;

create or replace function public.sign_public_document(p_token text,p_signer_name text,p_signature_data text)
returns jsonb language plpgsql security definer set search_path=''
as $$
declare v_doc public.documents%rowtype;v_signature public.document_signatures%rowtype;
begin
 if p_token is null or length(p_token)<40 or length(p_token)>60 then raise exception 'Invalid signing link';end if;
 if p_signer_name is null or length(trim(p_signer_name))<2 or length(trim(p_signer_name))>120 then raise exception 'Enter your full name';end if;
 if p_signature_data is null or length(p_signature_data)>500000 or p_signature_data not like 'data:image/png;base64,%' then raise exception 'Invalid signature image';end if;
 select * into v_doc from public.documents where public_token=p_token for update;
 if not found or v_doc.type not in ('invoice','quote') or v_doc.status not in ('sent','viewed','partially_paid','paid') then raise exception 'Document cannot be signed';end if;
 insert into public.document_signatures(document_id,business_id,signer_name,signature_data)
 values(v_doc.id,v_doc.business_id,trim(p_signer_name),p_signature_data)
 returning * into v_signature;
 return jsonb_build_object('signer_name',v_signature.signer_name,'signed_at',v_signature.signed_at);
exception when unique_violation then
 raise exception 'Document has already been signed';
end;
$$;
revoke all on function public.sign_public_document(text,text,text) from public;
grant execute on function public.sign_public_document(text,text,text) to anon,authenticated;

create or replace function public.get_public_invoice(p_token text)
returns jsonb language sql stable security definer set search_path=''
as $$
 select jsonb_build_object(
  'number',d.number,'type',d.type,'status',d.status,'issue_date',d.issue_date,'due_date',d.due_date,
  'currency',d.currency,'subtotal',d.subtotal,'discount',d.discount,'tax',d.tax,'total',d.total,'notes',d.notes,
  'business',jsonb_build_object('name',b.name,'logo_url',b.logo_url,'address',b.address,'phone',b.phone,'email',b.email,'bank_details',b.bank_details),
  'client',jsonb_build_object('name',c.name),
  'signature',case when s.id is null then null else jsonb_build_object('signer_name',s.signer_name,'signature_data',s.signature_data,'signed_at',s.signed_at) end,
  'items',coalesce((select jsonb_agg(jsonb_build_object('description',di.description,'quantity',di.quantity,'unit_price',di.unit_price,'amount',di.amount) order by di.created_at) from public.document_items di where di.document_id=d.id),'[]'::jsonb)
 )
 from public.documents d join public.businesses b on b.id=d.business_id
 left join public.clients c on c.id=d.client_id and c.business_id=d.business_id
 left join public.document_signatures s on s.document_id=d.id and s.business_id=d.business_id
 where d.public_token=p_token and d.status in ('sent','viewed','partially_paid','paid') limit 1;
$$;
revoke all on function public.get_public_invoice(text) from public;
grant execute on function public.get_public_invoice(text) to anon,authenticated;
