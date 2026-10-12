-- =====================================================================
-- Schema del database per l'app Task.
-- Da eseguire UNA SOLA VOLTA nel SQL Editor di Supabase,
-- DOPO aver creato il proprio utente (Authentication > Users).
-- =====================================================================

-- ---------- Tabelle ----------

create table public.areas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null check (length(trim(name)) > 0),
  color text not null check (color ~ '^#[0-9A-Fa-f]{6}$'),
  logo_url text,
  has_subcategories boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table public.subcategories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  area_id uuid not null references public.areas (id) on delete cascade,
  name text not null check (length(trim(name)) > 0),
  created_at timestamptz not null default now(),
  unique (id, area_id)
);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  area_id uuid not null references public.areas (id) on delete cascade,
  subcategory_id uuid,
  title text not null check (length(trim(title)) > 0),
  notes text,
  due_date date,
  completed_at timestamptz,
  position double precision not null,
  created_at timestamptz not null default now(),
  -- la sottocategoria deve appartenere alla stessa area della task;
  -- eliminando la sottocategoria si eliminano anche le sue task
  foreign key (subcategory_id, area_id)
    references public.subcategories (id, area_id) on delete cascade
);

create index tasks_user_position_idx on public.tasks (user_id, position);
create index tasks_subcategory_idx on public.tasks (subcategory_id);

-- ---------- Permessi ----------

grant select, insert, update, delete on public.areas, public.subcategories, public.tasks to authenticated;

alter table public.areas enable row level security;
alter table public.subcategories enable row level security;
alter table public.tasks enable row level security;

create policy "solo proprietario" on public.areas
  for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "solo proprietario" on public.subcategories
  for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "solo proprietario" on public.tasks
  for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ---------- Sincronizzazione in tempo reale ----------

alter publication supabase_realtime add table public.areas, public.subcategories, public.tasks;

-- ---------- Storage per i loghi ----------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('logos', 'logos', true, 5242880, array['image/png', 'image/jpeg', 'image/webp'])
on conflict (id) do nothing;

create policy "loghi: lettura" on storage.objects
  for select to authenticated using (bucket_id = 'logos');
create policy "loghi: caricamento" on storage.objects
  for insert to authenticated with check (bucket_id = 'logos');
create policy "loghi: eliminazione" on storage.objects
  for delete to authenticated using (bucket_id = 'logos');

-- ---------- Aree iniziali ----------

do $$
declare
  owner uuid;
begin
  select id into owner from auth.users order by created_at limit 1;
  if owner is null then
    raise exception 'Nessun utente trovato: crea prima il tuo utente in Authentication > Users';
  end if;

  insert into public.areas (user_id, name, color, has_subcategories, sort_order) values
    (owner, 'Qubit',     '#2B54C8', false, 1),
    (owner, 'NexoT',     '#B4500F', false, 2),
    (owner, 'Hystrix',   '#6A3FC0', false, 3),
    (owner, 'Personale', '#1E7A5F', true,  4);
end $$;
