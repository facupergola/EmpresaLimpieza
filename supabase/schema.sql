-- Ejecutar completo en Supabase > SQL Editor.
create table public.admins(uid uuid primary key references auth.users(id));
create or replace function public.is_admin() returns boolean language sql security definer stable set search_path=public
as $$ select exists(select 1 from public.admins where uid=auth.uid()) $$;
revoke execute on function public.is_admin() from public, anon; grant execute on function public.is_admin() to authenticated;

create table public.sites(id uuid primary key default gen_random_uuid(),
 name text not null check(length(name) between 2 and 120),
 lat double precision not null check(lat between -90 and 90), lng double precision not null check(lng between -180 and 180),
 radius int not null default 150 check(radius between 20 and 1000));
create table public.config(id text primary key check(id='main'), phone text check(length(phone)<=20), email text check(length(email)<=120));
create table public.shifts(id uuid primary key default gen_random_uuid(),
 uid uuid not null references auth.users(id),
 name text not null check(length(name) between 3 and 120), dni text not null check(length(dni) between 4 and 20),
 "siteId" uuid not null references public.sites(id), "siteName" text not null,
 status text not null default 'active' check(status in('active','done')),
 "inAt" bigint not null, "inLat" double precision, "inLng" double precision, "inAcc" int, "inDist" int,
 "outAt" bigint, "outLat" double precision, "outLng" double precision);
create unique index one_active_per_user on public.shifts(uid) where status='active';
create index on public.shifts("inAt" desc);

create function public.haversine(a double precision,b double precision,c double precision,d double precision) returns double precision language sql immutable
as $$ select 2*6371000*asin(sqrt(sin(radians(c-a)/2)^2+cos(radians(a))*cos(radians(c))*sin(radians(d-b)/2)^2)) $$;

-- El servidor decide hora, usuario, lugar y distancia: el cliente no puede falsearlos.
create function public.shifts_ins() returns trigger language plpgsql security definer set search_path=public as $$
declare s record; d double precision;
begin
 select * into s from sites where id=new."siteId"; if not found then raise exception 'Lugar inexistente'; end if;
 if new."inLat" is null or new."inLng" is null then raise exception 'Falta ubicación'; end if;
 if coalesce(new."inAcc",9999)>200 then raise exception 'Ubicación poco precisa'; end if;
 d:=haversine(new."inLat",new."inLng",s.lat,s.lng);
 if d>s.radius+least(new."inAcc",50) then raise exception 'Fuera del radio permitido'; end if;
 new.uid:=auth.uid(); new."siteName":=s.name; new.status:='active'; new."inDist":=round(d);
 new."inAt":=(extract(epoch from clock_timestamp())*1000)::bigint; new."outAt":=null; new."outLat":=null; new."outLng":=null;
 return new; end $$;
create trigger t_ins before insert on public.shifts for each row execute function public.shifts_ins();

-- Solo se puede cerrar el propio turno activo; lo demás queda inmutable.
create function public.shifts_upd() returns trigger language plpgsql security definer set search_path=public as $$
declare la double precision:=new."outLat"; lo double precision:=new."outLng";
begin
 if old.uid<>auth.uid() or old.status<>'active' then raise exception 'No permitido'; end if;
 new:=old; new.status:='done'; new."outLat":=la; new."outLng":=lo;
 new."outAt":=(extract(epoch from clock_timestamp())*1000)::bigint; return new; end $$;
create trigger t_upd before update on public.shifts for each row execute function public.shifts_upd();

alter table public.admins enable row level security;  -- sin políticas: nadie accede desde la app
alter table public.sites enable row level security;
alter table public.config enable row level security;
alter table public.shifts enable row level security;
create policy sites_r on public.sites for select to authenticated using(true);
create policy sites_w on public.sites for all to authenticated using(public.is_admin()) with check(public.is_admin());
create policy cfg_r on public.config for select to authenticated using(true);
create policy cfg_w on public.config for all to authenticated using(public.is_admin()) with check(public.is_admin());
create policy sh_r on public.shifts for select to authenticated using(uid=auth.uid() or public.is_admin());
create policy sh_i on public.shifts for insert to authenticated with check(uid=auth.uid());
create policy sh_u on public.shifts for update to authenticated using(uid=auth.uid()) with check(uid=auth.uid());
-- (no hay política de DELETE ni de UPDATE para admin: los registros no se pueden alterar desde la app)

alter publication supabase_realtime add table public.sites, public.config, public.shifts;

-- Conservación: borra registros más viejos que el plazo definido con tu abogado (ej: '2 years'). Programarlo con pg_cron.
create function public.purge_old_shifts(retain interval) returns int language plpgsql security definer set search_path=public as $$
declare n int; begin
 delete from shifts where "inAt"<extract(epoch from (now()-retain))*1000; get diagnostics n=row_count; return n; end $$;
revoke execute on function public.purge_old_shifts(interval) from public, anon, authenticated;

-- Después de crear tu usuario en Authentication > Users, hacelo admin:
-- insert into public.admins(uid) select id from auth.users where email='TU@EMAIL';
