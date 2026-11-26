create or replace function public.get_public_invoice(p_token text)
returns jsonb language sql stable security definer set search_path=''
as $$
 select jsonb_build_object(
  'number',d.number,'type',d.type,'status',d.status,'issue_date',d.issue_date,'due_date',d.due_date,
  'currency',d.currency,'subtotal',d.subtotal,'discount',d.discount,'tax',d.tax,'total',d.total,'notes',d.notes,
  'business',jsonb_build_object('name',b.name,'address',b.address,'phone',b.phone,'email',b.email),
  'client',jsonb_build_object('name',c.name),
  'items',coalesce((select jsonb_agg(jsonb_build_object('description',di.description,'quantity',di.quantity,'unit_price',di.unit_price,'amount',di.amount) order by di.created_at) from public.document_items di where di.document_id=d.id),'[]'::jsonb)
 )
 from public.documents d join public.businesses b on b.id=d.business_id
 left join public.clients c on c.id=d.client_id and c.business_id=d.business_id
 where d.public_token=p_token and d.status in ('sent','viewed','partially_paid','paid') limit 1;
$$;
revoke all on function public.get_public_invoice(text) from public;
grant execute on function public.get_public_invoice(text) to anon,authenticated;

create or replace function public.record_invoice_payment(p_document_id uuid,p_amount numeric,p_method text,p_note text default null)
returns text language plpgsql security invoker set search_path=''
as $$
declare v_doc public.documents%rowtype;v_paid numeric(14,2);v_new_paid numeric(14,2);v_status text;
begin
 if auth.uid() is null then raise exception 'Authentication required';end if;
 if p_amount is null or p_amount<=0 then raise exception 'Payment amount must be greater than zero';end if;
 if p_method not in ('transfer','cash','card','other') then raise exception 'Invalid payment method';end if;
 select * into v_doc from public.documents where id=p_document_id for update;
 if not found then raise exception 'Invoice not found';end if;
 if v_doc.status='draft' then raise exception 'Send the invoice before recording payment';end if;
 select coalesce(sum(amount),0) into v_paid from public.payments where document_id=p_document_id;
 v_new_paid:=v_paid+p_amount;
 if v_new_paid>v_doc.total then raise exception 'Payment exceeds the outstanding balance';end if;
 insert into public.payments(document_id,business_id,amount,method,note) values(p_document_id,v_doc.business_id,p_amount,p_method,p_note);
 v_status:=case when v_new_paid=v_doc.total then 'paid' else 'partially_paid' end;
 update public.documents set status=v_status,updated_at=now() where id=p_document_id;
 return v_status;
end;
$$;
grant execute on function public.record_invoice_payment(uuid,numeric,text,text) to authenticated;