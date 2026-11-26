create index if not exists documents_client_business_idx on public.documents(client_id,business_id);
create index if not exists document_items_document_business_idx on public.document_items(document_id,business_id);
create index if not exists payments_document_business_idx on public.payments(document_id,business_id);