create or replace function public.get_public_invoice(p_token text)
returns jsonb language sql stable security definer set search_path=''
as $$
 select jsonb_build_object(
  'number',d.number,'type',d.type,'status',d.status,'issue_date',d.issue_date,'due_date',d.due_date,
  'currency',d.currency,'subtotal',d.subtotal,'discount',d.discount,'tax',d.tax,'total',d.total,'notes',d.notes,
  'template',b.default_template,
  'business',jsonb_build_object(
    'name',b.name,'logo_url',b.logo_url,'address',b.address,'phone',b.phone,'email',b.email,
    'bank_details',jsonb_build_object(
      'bank_name',coalesce(b.bank_details->>'bank_name',''),
      'account_name',coalesce(b.bank_details->>'account_name',''),
      'account_number',coalesce(b.bank_details->>'account_number',''),
      'payment_instructions',coalesce(b.bank_details->>'payment_instructions',''),
      'paypal_email',coalesce(b.bank_details->>'paypal_email','')
    )
  ),
  'client',jsonb_build_object('name',c.name),
  'items',coalesce((select jsonb_agg(jsonb_build_object('description',di.description,'quantity',di.quantity,'unit_price',di.unit_price,'amount',di.amount) order by di.created_at) from public.document_items di where di.document_id=d.id),'[]'::jsonb)
 )
 from public.documents d join public.businesses b on b.id=d.business_id
 left join public.clients c on c.id=d.client_id and c.business_id=d.business_id
 where d.public_token=p_token and d.status in ('sent','viewed','partially_paid','paid') limit 1;
$$;
revoke all on function public.get_public_invoice(text) from public;
grant execute on function public.get_public_invoice(text) to anon,authenticated;
