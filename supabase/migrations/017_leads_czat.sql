-- Rozmowa z czatu przy leadzie (27.11.2026).
-- chat_id = losowy identyfikator jednej rozmowy w okienku czatu. Po nim kolejne
-- wiadomości dopisują się do tego samego leada, a powtórzony [LEAD] nie robi duplikatu.
-- Treść rozmowy trafia do leads.details (widać ją w /lab/crm i w mailu).
alter table public.leads add column if not exists chat_id text;

create unique index if not exists leads_chat_id_key
    on public.leads (chat_id)
    where chat_id is not null;
