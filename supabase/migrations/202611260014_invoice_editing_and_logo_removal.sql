create or replace function public.update_invoice(
 p_document_id uuid,p_client_id uuid,p_issue_date date,p_due_date date,
 p_discount numeric,p_tax_rate numeric,p_notes text,p_items jsonb
) returns boolean language plpgsql security invoker set search_path=''
as $$
declare
 v_doc public.documents%rowtype;v_line jsonb;v_qty numeric(12,3);v_price numeric(14,2);v_amount numeric(14,2);v_description text;
 v_subtotal numeric(14,2):=0;v_discount numeric(14,2);v_tax numeric(14,2);v_total numeric(14,2);
begin
 if auth.uid() is null then raise exception 'Authentication required';end if;
 if p_document_id is null or p_client_id is null then raise exception 'Document and client are required';end if;
 if p_discount is null or p_tax_rate is null or p_discount<0 or p_tax_rate<0 or p_tax_rate>100 then raise exception 'Invalid discount or tax rate';end if;
 if p_items is null or jsonb_typeof(p_items)<>'array' or jsonb_array_length(p_items)=0 or jsonb_array_length(p_items)>500 then raise exception 'Document must contain between 1 and 500 items';end if;
 select d.* into v_doc from public.documents d join public.businesses b on b.id=d.business_id
 where d.id=p_document_id and b.owner_id=auth.uid() for update of d;
 if not found then raise exception 'Document not found or access denied';end if;
 if exists(select 1 from public.payments p where p.document_id=p_document_id) then raise exception 'Documents with recorded payments cannot be edited';end if;
 if exists(select 1 from public.document_signatures s where s.document_id=p_document_id) then raise exception 'Signed documents cannot be edited';end if;
 if not exists(select 1 from public.clients c where c.id=p_client_id and c.business_id=v_doc.business_id) then raise exception 'Choose a client in this workspace';end if;
 for v_line in select value from jsonb_array_elements(p_items) loop
  v_description:=nullif(trim(v_line->>'description'),'');
  v_qty:=nullif(v_line->>'quantity','')::numeric;v_price:=nullif(v_line->>'unit_price','')::numeric;
  if v_description is null or v_qty is null or v_qty<=0 or v_price is null or v_price<0 then raise exception 'Invalid invoice item';end if;
  v_amount:=round(v_qty*v_price,2);v_subtotal:=v_subtotal+v_amount;
 end loop;
 v_discount:=least(p_discount,v_subtotal);v_tax:=round((v_subtotal-v_discount)*p_tax_rate/100,2);v_total:=v_subtotal-v_discount+v_tax;
 update public.documents set client_id=p_client_id,issue_date=coalesce(p_issue_date,current_date),due_date=p_due_date,
  discount=v_discount,tax=v_tax,subtotal=v_subtotal,total=v_total,notes=p_notes,updated_at=now()
 where id=p_document_id;
 delete from public.document_items where document_id=p_document_id;
 for v_line in select value from jsonb_array_elements(p_items) loop
  v_qty:=(v_line->>'quantity')::numeric;v_price:=(v_line->>'unit_price')::numeric;v_amount:=round(v_qty*v_price,2);
  insert into public.document_items(document_id,business_id,description,quantity,unit_price,amount)
  values(p_document_id,v_doc.business_id,trim(v_line->>'description'),v_qty,v_price,v_amount);
 end loop;
 return true;
end;
$$;
revoke all on function public.update_invoice(uuid,uuid,date,date,numeric,numeric,text,jsonb) from public;
grant execute on function public.update_invoice(uuid,uuid,date,date,numeric,numeric,text,jsonb) to authenticated;

drop policy if exists "business_logo_delete_own_folder" on storage.objects;
create policy "business_logo_delete_own_folder" on storage.objects for delete to authenticated
using (bucket_id='business-logos' and (storage.foldername(name))[1]=(select auth.uid())::text);
