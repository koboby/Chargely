create or replace function public.admin_overview()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_email text;
  v_users bigint;
  v_businesses bigint;
  v_documents bigint;
begin
  if auth.uid() is null then
    raise exception 'Not authorized' using errcode = '42501';
  end if;
  select lower(u.email) into v_email from auth.users u where u.id = auth.uid();
  if v_email is distinct from 'blundigold@gmail.com' then
    raise exception 'Not authorized' using errcode = '42501';
  end if;
  select count(*) into v_users from auth.users;
  select count(*) into v_businesses from public.businesses;
  select count(*) into v_documents from public.documents;
  return jsonb_build_object(
    'total_users', v_users,
    'total_businesses', v_businesses,
    'total_documents', v_documents,
    'subscriptions_enabled', false,
    'active_subscriptions', null
  );
end;
$$;
revoke all on function public.admin_overview() from public, anon;
grant execute on function public.admin_overview() to authenticated;
