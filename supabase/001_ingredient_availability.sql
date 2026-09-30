create table if not exists public.ingredient_availability (
  ingredient_id text primary key,
  is_available boolean not null default true,
  updated_at timestamptz not null default now()
);

create or replace function public.set_ingredient_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists ingredient_updated_at on public.ingredient_availability;
create trigger ingredient_updated_at
before update on public.ingredient_availability
for each row execute function public.set_ingredient_updated_at();

alter table public.ingredient_availability enable row level security;
revoke all on public.ingredient_availability from public, anon, authenticated;
grant select on public.ingredient_availability to anon;
grant update (is_available) on public.ingredient_availability to anon;

drop policy if exists "Public can read ingredient availability" on public.ingredient_availability;
create policy "Public can read ingredient availability"
on public.ingredient_availability for select to anon using (true);

drop policy if exists "Public can update ingredient availability" on public.ingredient_availability;
create policy "Public can update ingredient availability"
on public.ingredient_availability for update to anon using (true) with check (true);
