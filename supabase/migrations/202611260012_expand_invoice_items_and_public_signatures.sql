create or replace function public.create_invoice(p_business_id uuid,p_client_id uuid,p_issue_date date,p_due_date date,p_currency text,p_discount numeric,p_tax_rate numeric,p_notes text,p_items jsonb)
returns uuid language plpgsql security invoker set search_path=''
as $$
declare v_prefix text;v_number bigint;v_invoice_id uuid:=gen_random_uuid();v_subtotal numeric(14,2):=0;v_discount numeric(14,2);v_tax numeric(14,2);v_total numeric(14,2);v_line jsonb;v_qty numeric(12,3);v_price numeric(14,2);v_amount numeric(14,2);v_description text;
begin
 if auth.uid() is null then raise exception 'Authentication required';end if;
 if p_business_id is null or p_client_id is null then raise exception 'Business and client are required';end if;
 if p_discount is null or p_tax_rate is null or p_discount<0 or p_tax_rate<0 or p_tax_rate>100 then raise exception 'Invalid discount or tax rate';end if;
 if coalesce(p_currency,'NGN') not in ('NGN','USD','GBP','EUR','GHS','KES') then raise exception 'Unsupported currency';end if;
 if p_items is null or jsonb_typeof(p_items)<>'array' or jsonb_array_length(p_items)=0 or jsonb_array_length(p_items)>500 then raise exception 'Invoice must contain between 1 and 500 line items';end if;
 update public.businesses set next_number=next_number+1,updated_at=now() where id=p_business_id and owner_id=auth.uid() returning invoice_prefix,next_number-1 into v_prefix,v_number;
 if v_number is null then raise exception 'Business not found or access denied';end if;
 for v_line in select value from jsonb_array_elements(p_items) loop
  v_description:=nullif(trim(v_line->>'description'),'');v_qty:=nullif(v_line->>'quantity','')::numeric;v_price:=nullif(v_line->>'unit_price','')::numeric;
  if v_description is null or v_qty is null or v_qty<=0 or v_price is null or v_price<0 then raise exception 'Invalid invoice line';end if;
  v_amount:=round(v_qty*v_price,2);v_subtotal:=v_subtotal+v_amount;
 end loop;
 v_discount:=least(p_discount,v_subtotal);v_tax:=round((v_subtotal-v_discount)*p_tax_rate/100,2);v_total:=v_subtotal-v_discount+v_tax;
 insert into public.documents(id,business_id,client_id,type,number,status,issue_date,due_date,currency,subtotal,discount,tax,total,notes) values(v_invoice_id,p_business_id,p_client_id,'invoice',coalesce(v_prefix,'INV')||'-'||lpad(v_number::text,4,'0'),'draft',coalesce(p_issue_date,current_date),p_due_date,coalesce(p_currency,'NGN'),v_subtotal,v_discount,v_tax,v_total,p_notes);
 for v_line in select value from jsonb_array_elements(p_items) loop v_qty:=(v_line->>'quantity')::numeric;v_price:=(v_line->>'unit_price')::numeric;v_amount:=round(v_qty*v_price,2);insert into public.document_items(document_id,business_id,description,quantity,unit_price,amount) values(v_invoice_id,p_business_id,trim(v_line->>'description'),v_qty,v_price,v_amount);end loop;
 return v_invoice_id;
end;$$;
grant execute on function public.create_invoice(uuid,uuid,date,date,text,numeric,numeric,text,jsonb) to authenticated;
create or replace function public.get_public_invoice(p_token text)
returns jsonb language sql stable security definer set search_path=''
as $$
 select jsonb_build_object('number',d.number,'type',d.type,'status',d.status,'issue_date',d.issue_date,'due_date',d.due_date,'currency',d.currency,'subtotal',d.subtotal,'discount',d.discount,'tax',d.tax,'total',d.total,'notes',d.notes,'template',b.default_template,'business',jsonb_build_object('name',b.name,'logo_url',b.logo_url,'address',b.address,'phone',b.phone,'email',b.email,'bank_details',b.bank_details),'client',jsonb_build_object('name',c.name),'signature',case when s.id is null then null else jsonb_build_object('signer_name',s.signer_name,'signature_data',s.signature_data,'signed_at',s.signed_at) end,'items',coalesce((select jsonb_agg(jsonb_build_object('description',di.description,'quantity',di.quantity,'unit_price',di.unit_price,'amount',di.amount) order by di.created_at) from public.document_items di where di.document_id=d.id),'[]'::jsonb))
 from public.documents d join public.businesses b on b.id=d.business_id left join public.clients c on c.id=d.client_id and c.business_id=d.business_id left join public.document_signatures s on s.document_id=d.id and s.business_id=d.business_id where d.public_token=p_token and d.status in ('sent','viewed','partially_paid','paid') limit 1;
$$;
revoke all on function public.get_public_invoice(text) from public;
grant execute on function public.get_public_invoice(text) to anon,authenticated;