-- InterioFlow schema. Clerk is the identity provider: auth.jwt()->>'sub' is the Clerk user id.
-- The browser talks to Supabase directly, so every rule lives here: RLS, column grants and RPCs.

-- ---------------------------------------------------------------- tables

create table public.profiles (
  id text primary key,
  email text not null default '',
  display_name text not null default 'Client',
  role text not null default 'customer' check (role in ('customer', 'designer', 'contractor', 'admin')),
  phone text,
  avatar_url text,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index profiles_role_idx on public.profiles (role);

create table public.role_changes (
  id text primary key default gen_random_uuid()::text,
  user_id text not null references public.profiles (id),
  old_role text not null,
  new_role text not null,
  changed_by text not null references public.profiles (id),
  created_at timestamptz not null default now()
);

create table public.design_requests (
  id text primary key default gen_random_uuid()::text,
  customer_id text not null references public.profiles (id),
  customer_name text not null,
  customer_email text not null,
  customer_phone text,
  assigned_designer_id text references public.profiles (id),
  assigned_designer_name text,
  title text not null check (char_length(title) between 1 and 200),
  project_type text not null check (project_type in ('residential', 'commercial', 'apartment', 'renovation', 'single_room', 'full_villa')),
  area_sqft integer not null check (area_sqft > 0),
  budget_min_paise bigint not null check (budget_min_paise >= 0),
  budget_max_paise bigint not null,
  style_preferences text[] not null default '{}',
  city text not null,
  requirements text not null,
  status text not null default 'submitted' check (status in ('submitted', 'under_review', 'meeting_scheduled', 'proposal_sent', 'accepted', 'rejected', 'cancelled')),
  meeting jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (budget_max_paise >= budget_min_paise)
);
create index design_requests_customer_idx on public.design_requests (customer_id);
create index design_requests_designer_idx on public.design_requests (assigned_designer_id);

create table public.proposals (
  id text primary key default gen_random_uuid()::text,
  design_request_id text not null references public.design_requests (id),
  request_title text not null,
  designer_id text not null references public.profiles (id),
  designer_name text not null,
  title text not null,
  scope text not null,
  deliverables text[] not null default '{}',
  price_paise bigint not null check (price_paise > 0),
  estimated_duration_weeks integer not null check (estimated_duration_weeks > 0),
  valid_until timestamptz not null,
  status text not null default 'sent' check (status in ('draft', 'sent', 'accepted', 'rejected')),
  revision integer not null default 1,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index proposals_request_idx on public.proposals (design_request_id);
create index proposals_designer_idx on public.proposals (designer_id);

create table public.projects (
  id text primary key default gen_random_uuid()::text,
  design_request_id text not null references public.design_requests (id),
  proposal_id text not null unique references public.proposals (id),
  customer_id text not null references public.profiles (id),
  customer_name text not null,
  designer_id text not null references public.profiles (id),
  designer_name text not null,
  title text not null,
  status text not null default 'planned' check (status in ('planned', 'in_progress', 'on_hold', 'completed', 'cancelled')),
  start_date date not null,
  target_end_date date not null,
  progress_percent integer not null default 0 check (progress_percent between 0 and 100),
  budget_paise bigint not null,
  image_url text,
  gallery_images text[],
  location text,
  scope_summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index projects_customer_idx on public.projects (customer_id);
create index projects_designer_idx on public.projects (designer_id);

create table public.tasks (
  id text primary key default gen_random_uuid()::text,
  project_id text not null references public.projects (id),
  project_title text not null default '',
  assigned_contractor_id text not null references public.profiles (id),
  assigned_contractor_name text not null default '',
  title text not null,
  description text not null default '',
  category text not null check (category in ('electrical', 'carpentry', 'painting', 'flooring', 'plumbing', 'general', 'civil')),
  status text not null default 'todo' check (status in ('todo', 'in_progress', 'blocked', 'completed')),
  due_date date not null,
  progress_percent integer not null default 0 check (progress_percent between 0 and 100),
  created_by text not null references public.profiles (id),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index tasks_project_idx on public.tasks (project_id);
create index tasks_contractor_idx on public.tasks (assigned_contractor_id);

create table public.project_updates (
  id text primary key default gen_random_uuid()::text,
  project_id text not null references public.projects (id),
  author_id text not null references public.profiles (id),
  author_name text not null default '',
  author_role text not null default 'customer',
  message text not null check (char_length(message) between 1 and 2000),
  attachment_name text,
  created_at timestamptz not null default now()
);
create index project_updates_project_idx on public.project_updates (project_id);

create table public.task_progress_images (
  id text primary key default gen_random_uuid()::text,
  task_id text not null references public.tasks (id) on delete cascade,
  project_id text not null references public.projects (id),
  uploader_id text not null references public.profiles (id),
  uploader_name text not null default '',
  uploader_role text not null default 'contractor',
  image_url text not null,
  caption text,
  stage_tag text,
  progress_percent_at_upload integer not null default 0,
  created_at timestamptz not null default now()
);
create index task_progress_images_task_idx on public.task_progress_images (task_id);
create index task_progress_images_project_idx on public.task_progress_images (project_id);

create table public.products (
  id text primary key default gen_random_uuid()::text,
  sku text not null unique,
  slug text not null unique,
  name text not null,
  description text not null default '',
  category text not null check (category in ('lighting', 'furniture', 'rugs', 'wall_decor', 'accessories')),
  price_paise bigint not null check (price_paise > 0),
  stock_quantity integer not null default 0 check (stock_quantity >= 0),
  is_active boolean not null default true,
  dimensions text,
  material text,
  color text,
  featured boolean not null default false,
  image_color_tone text,
  image_url text,
  gallery_images text[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.project_showcases (
  id text primary key,
  sort_order integer not null default 0,
  title text not null,
  subtitle text not null,
  category text not null,
  location text not null,
  carpet_area_sqft integer not null,
  duration_weeks integer not null,
  budget_paise bigint not null,
  designer_name text not null,
  hero_image text not null,
  gallery_images text[] not null default '{}',
  before_image text,
  after_image text,
  scope_highlights text[] not null default '{}',
  materials_used text[] not null default '{}',
  client_review jsonb not null
);

create table public.cart_items (
  customer_id text not null references public.profiles (id),
  product_id text not null references public.products (id),
  quantity integer not null check (quantity between 1 and 100),
  updated_at timestamptz not null default now(),
  primary key (customer_id, product_id)
);
create index cart_items_product_idx on public.cart_items (product_id);

create table public.orders (
  id text primary key default gen_random_uuid()::text,
  customer_id text not null references public.profiles (id),
  customer_name text not null,
  customer_email text not null,
  order_number text not null unique,
  status text not null default 'paid' check (status in ('pending', 'processing', 'paid', 'shipped', 'delivered', 'cancelled')),
  subtotal_paise bigint not null,
  shipping_paise bigint not null,
  tax_paise bigint not null,
  total_paise bigint not null,
  currency text not null default 'INR',
  shipping_address jsonb not null,
  payment_reference text,
  payment_method text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index orders_customer_idx on public.orders (customer_id);

create table public.order_items (
  id text primary key default gen_random_uuid()::text,
  order_id text not null references public.orders (id) on delete cascade,
  product_id text not null references public.products (id),
  product_name_snapshot text not null,
  sku_snapshot text not null,
  unit_price_paise bigint not null,
  quantity integer not null check (quantity > 0),
  line_total_paise bigint not null
);
create index order_items_order_idx on public.order_items (order_id);
create index order_items_product_idx on public.order_items (product_id);

create table public.payments (
  id text primary key default gen_random_uuid()::text,
  order_id text not null references public.orders (id) on delete cascade,
  order_number text not null,
  provider text not null default 'demo' check (provider in ('demo', 'razorpay')),
  provider_payment_id text not null,
  provider_order_id text not null,
  payment_method text,
  amount_paise bigint not null,
  currency text not null default 'INR',
  status text not null check (status in ('captured', 'failed', 'pending')),
  signature_verified boolean not null default false,
  created_at timestamptz not null default now()
);
create index payments_order_idx on public.payments (order_id);

-- ---------------------------------------------------------------- identity helpers

create function public.current_user_id() returns text
language sql stable set search_path = '' as $$ select auth.jwt()->>'sub' $$;

-- security definer so policies can read profiles and projects without recursing through their RLS
create function public.current_app_role() returns text
language sql stable security definer set search_path = '' as $$
  select role from public.profiles where id = auth.jwt()->>'sub' and deleted_at is null
$$;

create function public.is_admin() returns boolean
language sql stable set search_path = '' as $$ select coalesce(public.current_app_role() = 'admin', false) $$;

create function public.is_project_member(p_project_id text) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.projects p
    where p.id = p_project_id
      and (p.customer_id = auth.jwt()->>'sub' or p.designer_id = auth.jwt()->>'sub' or public.is_admin())
  )
$$;

create function public.can_manage_project(p_project_id text) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.projects p
    where p.id = p_project_id
      and (p.designer_id = auth.jwt()->>'sub' or public.is_admin())
  )
$$;

create function public.can_access_project(p_project_id text) returns boolean
language sql stable security definer set search_path = '' as $$
  select public.is_project_member(p_project_id) or exists (
    select 1 from public.tasks t
    where t.project_id = p_project_id and t.assigned_contractor_id = auth.jwt()->>'sub'
  )
$$;

-- ---------------------------------------------------------------- triggers

create function public.set_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  return new;
end $$;

create trigger profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger design_requests_updated_at before update on public.design_requests for each row execute function public.set_updated_at();
create trigger proposals_updated_at before update on public.proposals for each row execute function public.set_updated_at();
create trigger projects_updated_at before update on public.projects for each row execute function public.set_updated_at();
create trigger tasks_updated_at before update on public.tasks for each row execute function public.set_updated_at();
create trigger products_updated_at before update on public.products for each row execute function public.set_updated_at();
create trigger orders_updated_at before update on public.orders for each row execute function public.set_updated_at();
create trigger cart_items_updated_at before update on public.cart_items for each row execute function public.set_updated_at();

create function public.stamp_project_update() returns trigger
language plpgsql security definer set search_path = '' as $$
declare me public.profiles;
begin
  select * into me from public.profiles where id = auth.jwt()->>'sub';
  if me.id is null then raise exception 'Profile not found'; end if;
  new.author_id := me.id;
  new.author_name := me.display_name;
  new.author_role := me.role;
  return new;
end $$;
create trigger project_updates_stamp before insert on public.project_updates
  for each row when (auth.jwt() is not null) execute function public.stamp_project_update();

create function public.stamp_progress_image() returns trigger
language plpgsql security definer set search_path = '' as $$
declare me public.profiles; task_project text;
begin
  select * into me from public.profiles where id = auth.jwt()->>'sub';
  select project_id into task_project from public.tasks where id = new.task_id;
  if me.id is null or task_project is null then raise exception 'Profile or task not found'; end if;
  new.uploader_id := me.id;
  new.uploader_name := me.display_name;
  new.uploader_role := me.role;
  new.project_id := task_project;
  return new;
end $$;
create trigger task_progress_images_stamp before insert on public.task_progress_images
  for each row when (auth.jwt() is not null) execute function public.stamp_progress_image();

create function public.stamp_task() returns trigger
language plpgsql security definer set search_path = '' as $$
declare contractor public.profiles; project_name text;
begin
  select * into contractor from public.profiles where id = new.assigned_contractor_id and role = 'contractor';
  select title into project_name from public.projects where id = new.project_id;
  if contractor.id is null then raise exception 'Tasks can only be assigned to a contractor'; end if;
  new.assigned_contractor_name := contractor.display_name;
  new.project_title := project_name;
  new.created_by := auth.jwt()->>'sub';
  return new;
end $$;
create trigger tasks_stamp before insert on public.tasks
  for each row when (auth.jwt() is not null) execute function public.stamp_task();

create function public.rollup_project_progress() returns trigger
language plpgsql security definer set search_path = '' as $$
declare target text := coalesce(new.project_id, old.project_id); avg_progress integer;
begin
  select round(avg(progress_percent)) into avg_progress from public.tasks where project_id = target;
  update public.projects p
  set progress_percent = coalesce(avg_progress, 0),
      status = case
        when p.status in ('on_hold', 'cancelled') then p.status
        when avg_progress = 100 then 'completed'
        when avg_progress > 0 then 'in_progress'
        else p.status
      end
  where p.id = target;
  return null;
end $$;
create trigger tasks_rollup after insert or update of progress_percent or delete on public.tasks
  for each row execute function public.rollup_project_progress();

create function public.mark_request_proposal_sent() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  update public.design_requests set status = 'proposal_sent' where id = new.design_request_id;
  return null;
end $$;
create trigger proposals_mark_request after insert on public.proposals
  for each row when (new.status = 'sent' and auth.jwt() is not null) execute function public.mark_request_proposal_sent();

-- ---------------------------------------------------------------- row level security

alter table public.profiles enable row level security;
alter table public.role_changes enable row level security;
alter table public.design_requests enable row level security;
alter table public.proposals enable row level security;
alter table public.projects enable row level security;
alter table public.tasks enable row level security;
alter table public.project_updates enable row level security;
alter table public.task_progress_images enable row level security;
alter table public.products enable row level security;
alter table public.project_showcases enable row level security;
alter table public.cart_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.payments enable row level security;

-- Supabase's default grants are ALL; start from nothing and give back only what each policy needs.
revoke all on all tables in schema public from anon, authenticated;

grant select on public.profiles to authenticated;
create policy "read own profile, admins all, designers see contractors" on public.profiles for select to authenticated
  using (id = public.current_user_id() or public.is_admin()
    or (role = 'contractor' and deleted_at is null and public.current_app_role() = 'designer'));

grant select on public.role_changes to authenticated;
create policy "admins read role changes" on public.role_changes for select to authenticated using (public.is_admin());

grant select, insert on public.design_requests to authenticated;
grant update (assigned_designer_id, assigned_designer_name, status, meeting) on public.design_requests to authenticated;
create policy "customer, assigned designer, admin read; designers read unassigned" on public.design_requests for select to authenticated
  using (customer_id = public.current_user_id() or assigned_designer_id = public.current_user_id() or public.is_admin()
    or (assigned_designer_id is null and public.current_app_role() = 'designer'));
create policy "customers submit their own request" on public.design_requests for insert to authenticated
  with check (customer_id = public.current_user_id() and status = 'submitted' and assigned_designer_id is null and meeting is null);
create policy "designers claim and work requests, admins all" on public.design_requests for update to authenticated
  using (public.is_admin() or (public.current_app_role() = 'designer' and (assigned_designer_id = public.current_user_id() or assigned_designer_id is null)))
  with check (public.is_admin() or (public.current_app_role() = 'designer' and assigned_designer_id = public.current_user_id()));

grant select, insert on public.proposals to authenticated;
create policy "designer, admin, and the request's customer read" on public.proposals for select to authenticated
  using (designer_id = public.current_user_id() or public.is_admin()
    or (status <> 'draft' and exists (select 1 from public.design_requests r where r.id = design_request_id and r.customer_id = public.current_user_id())));
create policy "assigned designer issues proposals" on public.proposals for insert to authenticated
  with check (designer_id = public.current_user_id() and status = 'sent' and revision = 1
    and exists (select 1 from public.design_requests r where r.id = design_request_id and (r.assigned_designer_id = public.current_user_id() or public.is_admin())));

grant select on public.projects to authenticated;
grant update (status) on public.projects to authenticated;
create policy "project participants read" on public.projects for select to authenticated using (public.can_access_project(id));
create policy "designer and admin change status" on public.projects for update to authenticated
  using (public.can_manage_project(id)) with check (public.can_manage_project(id));

grant select, insert on public.tasks to authenticated;
grant update (status, progress_percent, notes) on public.tasks to authenticated;
create policy "contractor reads own tasks, members read all" on public.tasks for select to authenticated
  using (assigned_contractor_id = public.current_user_id() or public.is_project_member(project_id));
create policy "designer and admin create tasks" on public.tasks for insert to authenticated
  with check (public.can_manage_project(project_id));
create policy "contractor, designer and admin update tasks" on public.tasks for update to authenticated
  using (assigned_contractor_id = public.current_user_id() or public.can_manage_project(project_id))
  with check (assigned_contractor_id = public.current_user_id() or public.can_manage_project(project_id));

grant select, insert on public.project_updates to authenticated;
create policy "participants read updates" on public.project_updates for select to authenticated using (public.can_access_project(project_id));
create policy "participants post updates" on public.project_updates for insert to authenticated with check (public.can_access_project(project_id));

grant select, insert, delete on public.task_progress_images to authenticated;
create policy "participants read images" on public.task_progress_images for select to authenticated using (public.can_access_project(project_id));
create policy "assigned contractor, designer, admin upload" on public.task_progress_images for insert to authenticated
  with check (public.can_manage_project(project_id)
    or exists (select 1 from public.tasks t where t.id = task_id and t.assigned_contractor_id = public.current_user_id()));
create policy "uploader, designer, admin delete" on public.task_progress_images for delete to authenticated
  using (uploader_id = public.current_user_id() or public.can_manage_project(project_id));

grant select on public.products to anon, authenticated;
grant insert, update on public.products to authenticated;
create policy "anyone reads active products, admins all" on public.products for select to anon, authenticated using (is_active or public.is_admin());
create policy "admins create products" on public.products for insert to authenticated with check (public.is_admin());
create policy "admins update products" on public.products for update to authenticated using (public.is_admin()) with check (public.is_admin());

grant select on public.project_showcases to anon, authenticated;
create policy "anyone reads showcases" on public.project_showcases for select to anon, authenticated using (true);

grant select, insert, update, delete on public.cart_items to authenticated;
create policy "customers manage their own cart" on public.cart_items for all to authenticated
  using (customer_id = public.current_user_id()) with check (customer_id = public.current_user_id());

grant select on public.orders to authenticated;
grant update (status) on public.orders to authenticated;
create policy "customer and admin read orders" on public.orders for select to authenticated using (customer_id = public.current_user_id() or public.is_admin());
create policy "admins update order status" on public.orders for update to authenticated using (public.is_admin()) with check (public.is_admin());

grant select on public.order_items to authenticated;
create policy "read items of readable orders" on public.order_items for select to authenticated
  using (exists (select 1 from public.orders o where o.id = order_id));

grant select on public.payments to authenticated;
create policy "read payments of readable orders" on public.payments for select to authenticated
  using (exists (select 1 from public.orders o where o.id = order_id));

-- ---------------------------------------------------------------- RPCs

-- Mirrors the signed-in Clerk user into profiles from the verified token. Never touches role.
create function public.ensure_profile() returns public.profiles
language plpgsql security definer set search_path = '' as $$
declare
  uid text := auth.jwt()->>'sub';
  mail text := coalesce(auth.jwt()->>'email', '');
  full_name text := nullif(trim(coalesce(auth.jwt()->>'name', '')), '');
  result public.profiles;
begin
  if uid is null then raise exception 'Not signed in' using errcode = '28000'; end if;
  insert into public.profiles (id, email, display_name, phone, avatar_url)
  values (uid, mail, coalesce(full_name, nullif(split_part(mail, '@', 1), ''), 'Client'),
          nullif(auth.jwt()->>'phone', ''), nullif(auth.jwt()->>'avatar_url', ''))
  on conflict (id) do update set
    email = coalesce(nullif(excluded.email, ''), public.profiles.email),
    display_name = coalesce(full_name, public.profiles.display_name),
    phone = coalesce(excluded.phone, public.profiles.phone),
    avatar_url = coalesce(excluded.avatar_url, public.profiles.avatar_url),
    deleted_at = null
  returning * into result;
  return result;
end $$;

create function public.update_user_role(p_user_id text, p_role text) returns public.profiles
language plpgsql security definer set search_path = '' as $$
declare target public.profiles; result public.profiles;
begin
  if not public.is_admin() then raise exception 'Only admins can change roles' using errcode = '42501'; end if;
  if p_role not in ('customer', 'designer', 'contractor', 'admin') then raise exception 'Unknown role'; end if;
  select * into target from public.profiles where id = p_user_id for update;
  if target.id is null then raise exception 'User not found'; end if;
  if target.role = 'admin' and p_role <> 'admin'
     and (select count(*) from public.profiles where role = 'admin' and deleted_at is null) <= 1 then
    raise exception 'The last admin cannot be demoted';
  end if;
  update public.profiles set role = p_role where id = p_user_id returning * into result;
  if target.role <> p_role then
    insert into public.role_changes (user_id, old_role, new_role, changed_by)
    values (p_user_id, target.role, p_role, auth.jwt()->>'sub');
  end if;
  return result;
end $$;

-- Row lock plus the unique proposal_id make repeated accepts return the same project.
create function public.accept_proposal(p_proposal_id text) returns public.projects
language plpgsql security definer set search_path = '' as $$
declare prop public.proposals; req public.design_requests; result public.projects;
begin
  select * into prop from public.proposals where id = p_proposal_id for update;
  if prop.id is null then raise exception 'Proposal not found'; end if;
  select * into req from public.design_requests where id = prop.design_request_id;
  if req.customer_id <> auth.jwt()->>'sub' and not public.is_admin() then
    raise exception 'Only the customer can accept this proposal' using errcode = '42501';
  end if;
  select * into result from public.projects where proposal_id = prop.id;
  if result.id is not null then return result; end if;
  if prop.status <> 'sent' then raise exception 'This proposal is no longer open'; end if;
  if prop.valid_until < now() then raise exception 'This proposal has expired'; end if;

  update public.proposals set status = 'accepted' where id = prop.id;
  update public.design_requests set status = 'accepted' where id = req.id;
  insert into public.projects (design_request_id, proposal_id, customer_id, customer_name, designer_id, designer_name,
                               title, start_date, target_end_date, budget_paise)
  values (req.id, prop.id, req.customer_id, req.customer_name, prop.designer_id, prop.designer_name,
          prop.request_title, current_date, current_date + prop.estimated_duration_weeks * 7, prop.price_paise)
  returning * into result;
  insert into public.project_updates (project_id, author_id, author_name, author_role, message)
  values (result.id, prop.designer_id, prop.designer_name, 'designer', 'Proposal accepted. Project is now active.');
  return result;
end $$;

create function public.reject_proposal(p_proposal_id text) returns public.proposals
language plpgsql security definer set search_path = '' as $$
declare prop public.proposals; req public.design_requests;
begin
  select * into prop from public.proposals where id = p_proposal_id for update;
  if prop.id is null then raise exception 'Proposal not found'; end if;
  select * into req from public.design_requests where id = prop.design_request_id;
  if req.customer_id <> auth.jwt()->>'sub' and not public.is_admin() then
    raise exception 'Only the customer can reject this proposal' using errcode = '42501';
  end if;
  if prop.status <> 'sent' then raise exception 'This proposal is no longer open'; end if;
  update public.proposals set status = 'rejected' where id = prop.id returning * into prop;
  return prop;
end $$;

-- Demo payment: no money moves. Prices, tax and stock are decided here, never by the browser.
-- A real gateway must replace this with an Edge Function that verifies the provider signature first.
create function public.place_demo_order(p_address jsonb, p_items jsonb) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  me public.profiles;
  line record;
  subtotal bigint := 0;
  shipping bigint;
  tax bigint;
  new_order public.orders;
  field text;
begin
  select * into me from public.profiles where id = auth.jwt()->>'sub' and deleted_at is null;
  if me.id is null then raise exception 'Please sign in to place an order' using errcode = '28000'; end if;
  foreach field in array array['full_name', 'phone', 'street', 'city', 'state', 'postal_code'] loop
    if length(trim(coalesce(p_address->>field, ''))) = 0 then raise exception 'Delivery address is incomplete'; end if;
  end loop;
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then raise exception 'Your bag is empty'; end if;

  insert into public.orders (customer_id, customer_name, customer_email, order_number, subtotal_paise, shipping_paise, tax_paise,
                             total_paise, shipping_address, payment_reference, payment_method)
  values (me.id, p_address->>'full_name', me.email,
          'IF-' || to_char(now(), 'YYYY') || '-' || upper(substr(md5(gen_random_uuid()::text), 1, 8)),
          0, 0, 0, 0, p_address, 'demo_' || substr(md5(gen_random_uuid()::text), 1, 16), 'demo')
  returning * into new_order;

  -- locking in product order keeps two concurrent checkouts from deadlocking
  for line in
    select i.product_id, sum(i.quantity)::integer as quantity
    from jsonb_to_recordset(p_items) as i (product_id text, quantity integer)
    group by i.product_id order by i.product_id
  loop
    declare prod public.products;
    begin
      if line.quantity is null or line.quantity not between 1 and 100 then raise exception 'Invalid quantity'; end if;
      select * into prod from public.products where id = line.product_id for update;
      if prod.id is null or not prod.is_active then raise exception 'A product in your bag is no longer available'; end if;
      if prod.stock_quantity < line.quantity then
        raise exception 'Only % left of "%"', prod.stock_quantity, prod.name;
      end if;
      update public.products set stock_quantity = stock_quantity - line.quantity where id = prod.id;
      insert into public.order_items (order_id, product_id, product_name_snapshot, sku_snapshot, unit_price_paise, quantity, line_total_paise)
      values (new_order.id, prod.id, prod.name, prod.sku, prod.price_paise, line.quantity, prod.price_paise * line.quantity);
      subtotal := subtotal + prod.price_paise * line.quantity;
    end;
  end loop;

  shipping := case when subtotal >= 1000000 then 0 else 49900 end;
  tax := round(subtotal * 0.18);
  update public.orders
  set subtotal_paise = subtotal, shipping_paise = shipping, tax_paise = tax, total_paise = subtotal + shipping + tax
  where id = new_order.id returning * into new_order;

  insert into public.payments (order_id, order_number, provider, provider_payment_id, provider_order_id, payment_method, amount_paise, status)
  values (new_order.id, new_order.order_number, 'demo', new_order.payment_reference, new_order.id, 'demo', new_order.total_paise, 'captured');
  delete from public.cart_items where customer_id = me.id;

  return to_jsonb(new_order) || jsonb_build_object('items',
    (select jsonb_agg(to_jsonb(oi)) from public.order_items oi where oi.order_id = new_order.id));
end $$;

-- Functions are executable by PUBLIC by default.
revoke execute on all functions in schema public from public, anon, authenticated;
grant execute on function public.current_user_id(), public.current_app_role(), public.is_admin(),
  public.is_project_member(text), public.can_manage_project(text), public.can_access_project(text) to anon, authenticated;
grant execute on function public.ensure_profile(), public.update_user_role(text, text), public.accept_proposal(text),
  public.reject_proposal(text), public.place_demo_order(jsonb, jsonb) to authenticated;

-- ---------------------------------------------------------------- realtime

alter publication supabase_realtime add table
  public.profiles, public.design_requests, public.proposals, public.projects, public.tasks, public.project_updates,
  public.task_progress_images, public.products, public.cart_items, public.orders, public.payments;

-- ---------------------------------------------------------------- storage

-- shortcut: public bucket with unguessable paths so stored image_url values work directly; switch to signed URLs if site photos become sensitive.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('progress-images', 'progress-images', true, 8388608, array['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

create policy "site staff upload to their own folder" on storage.objects for insert to authenticated
  with check (bucket_id = 'progress-images'
    and public.current_app_role() in ('contractor', 'designer', 'admin')
    and (storage.foldername(name))[1] = public.current_user_id());
create policy "owners and admins see files" on storage.objects for select to authenticated
  using (bucket_id = 'progress-images' and ((storage.foldername(name))[1] = public.current_user_id() or public.is_admin()));
create policy "owners and admins delete files" on storage.objects for delete to authenticated
  using (bucket_id = 'progress-images' and ((storage.foldername(name))[1] = public.current_user_id() or public.is_admin()));
