create or replace function public.create_invoice(
  p_business_id uuid,p_client_id uuid,p_issue_date date,p_due_date date,
  p_currency text,p_discount numeric,p_tax_rate numeric,p_notes text,p_items jsonb
) returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_prefix text; v_number bigint; v_invoice_id uuid := gen_random_uuid();
  v_subtotal numeric(14,2) := 0; v_discount numeric(14,2);
  v_tax numeric(14,2); v_total numeric(14,2);
  v_line jsonb; v_qty numeric(12,3); v_price numeric(14,2);
  v_amount numeric(14,2); v_description text;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if p_items is null or jsonb_typeof(p_items)<>'array' or jsonb_array_length(p_items)=0 then raise exception 'At least one invoice line is required'; end if;
  if p_discount<0 or p_tax_rate<0 or p_tax_rate>100 then raise exception 'Invalid discount or tax rate'; end if;
  update public.businesses set next_number=next_number+1,updated_at=now()
    where id=p_business_id and owner_id=auth.uid()
    returning invoice_prefix,next_number-1 into v_prefix,v_number;
  if v_number is null then raise exception 'Business not found or access denied'; end if;
  for v_line in select value from jsonb_array_elements(p_items) loop
    v_description:=nullif(trim(v_line->>'description'),'');
    v_qty:=(v_line->>'quantity')::numeric; v_price:=(v_line->>'unit_price')::numeric;
    if v_description is null or v_qty<=0 or v_price<0 then raise exception 'Invalid invoice line'; end if;
    v_amount:=round(v_qty*v_price,2); v_subtotal:=v_subtotal+v_amount;
  end loop;
  v_discount:=least(p_discount,v_subtotal);
  v_tax:=round((v_subtotal-v_discount)*p_tax_rate/100,2);
  v_total:=v_subtotal-v_discount+v_tax;
  insert into public.documents(id,business_id,client_id,type,number,status,issue_date,due_date,currency,subtotal,discount,tax,total,notes)
  values(v_invoice_id,p_business_id,p_client_id,'invoice',coalesce(v_prefix,'INV')||'-'||lpad(v_number::text,4,'0'),'draft',coalesce(p_issue_date,current_date),p_due_date,coalesce(p_currency,'NGN'),v_subtotal,v_discount,v_tax,v_total,p_notes);
  for v_line in select value from jsonb_array_elements(p_items) loop
    v_qty:=(v_line->>'quantity')::numeric;v_price:=(v_line->>'unit_price')::numeric;v_amount:=round(v_qty*v_price,2);
    insert into public.document_items(document_id,business_id,description,quantity,unit_price,amount)
    values(v_invoice_id,p_business_id,trim(v_line->>'description'),v_qty,v_price,v_amount);
  end loop;
  return v_invoice_id;
end;
$$;
grant execute on function public.create_invoice(uuid,uuid,date,date,text,numeric,numeric,text,jsonb) to authenticated;