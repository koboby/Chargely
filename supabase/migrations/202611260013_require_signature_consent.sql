drop function if exists public.sign_public_document(text,text,text);
create or replace function public.sign_public_document(p_token text,p_signer_name text,p_signature_data text,p_consent boolean)
returns jsonb language plpgsql security definer set search_path=''
as $$
declare v_doc public.documents%rowtype;v_signature public.document_signatures%rowtype;
begin
 if p_token is null or length(p_token)<40 or length(p_token)>60 then raise exception 'Invalid signing link';end if;
 if p_signer_name is null or length(trim(p_signer_name))<2 or length(trim(p_signer_name))>120 then raise exception 'Enter your full name';end if;
 if p_signature_data is null or length(p_signature_data)>500000 or p_signature_data not like 'data:image/png;base64,%' then raise exception 'Invalid signature image';end if;
 if p_consent is distinct from true then raise exception 'Electronic signature consent is required';end if;
 select * into v_doc from public.documents where public_token=p_token for update;
 if not found or v_doc.type not in ('invoice','quote') or v_doc.status not in ('sent','viewed','partially_paid','paid') then raise exception 'Document cannot be signed';end if;
 insert into public.document_signatures(document_id,business_id,signer_name,signature_data)
 values(v_doc.id,v_doc.business_id,trim(p_signer_name),p_signature_data) returning * into v_signature;
 return jsonb_build_object('signer_name',v_signature.signer_name,'signed_at',v_signature.signed_at);
exception when unique_violation then raise exception 'Document has already been signed';
end;
$$;
revoke all on function public.sign_public_document(text,text,text,boolean) from public;
grant execute on function public.sign_public_document(text,text,text,boolean) to anon,authenticated;