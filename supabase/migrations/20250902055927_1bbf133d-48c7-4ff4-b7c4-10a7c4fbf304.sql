-- Create assessments table for saving completed profiles
create table if not exists public.assessments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  variant text not null default 'full',
  responses jsonb,
  profile jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable Row Level Security
alter table public.assessments enable row level security;

-- Timestamp update function
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql set search_path = public;

-- Trigger to auto-update updated_at
create trigger trg_assessments_updated_at
before update on public.assessments
for each row execute function public.update_updated_at_column();

-- Policies: Users can only access their own rows
create policy if not exists "Users can view their own assessments"
  on public.assessments for select
  using (auth.uid() = user_id);

create policy if not exists "Users can insert their own assessments"
  on public.assessments for insert
  with check (auth.uid() = user_id);

create policy if not exists "Users can update their own assessments"
  on public.assessments for update
  using (auth.uid() = user_id);

create policy if not exists "Users can delete their own assessments"
  on public.assessments for delete
  using (auth.uid() = user_id);

-- Helpful index on user_id
create index if not exists idx_assessments_user_id on public.assessments(user_id);
