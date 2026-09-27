-- Off-season pricing (product change, post-Phase-2 handoff)
--
-- Previously, a trek marked 'off-season' was completely unbookable —
-- reserve_trek() raised an exception outright. The new behaviour: off-season
-- treks stay bookable, but at a separate, guide-set price
-- (treks.off_season_price) instead of the normal price (treks.price). The
-- price actually charged is locked onto the booking row at the moment it's
-- created (bookings.price_per_person), so later price changes on the trek
-- never retroactively change what a past booking cost.
--
-- If a guide has marked a trek off-season but never set an off-season
-- price, the trek stays unbookable until they do — we never silently charge
-- ₹0 or fall back to the normal price.

-- 1. New columns -------------------------------------------------------

alter table public.treks
  add column if not exists off_season_price numeric;

alter table public.bookings
  add column if not exists price_per_person numeric;

-- 2. Updated reserve_trek() --------------------------------------------
-- Same function as before, with the hard off-season block replaced by a
-- price lookup, and price_per_person added to the inserted booking row.
-- RETURNS bookings is a composite (whole-row) type, so it automatically
-- picks up the new price_per_person column — no signature change needed.

create or replace function public.reserve_trek(p_trek_id uuid, p_date date, p_group_size integer)
returns bookings
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_trek public.treks;
  v_row public.trek_availability;
  v_booking public.bookings;
  v_name text;
  v_price numeric;
begin
  if auth.uid() is null then
    raise exception 'You must be logged in to book a trek';
  end if;

  if p_group_size is null or p_group_size < 1 or p_group_size > 100 then
    raise exception 'Group size must be between 1 and 100';
  end if;

  if p_date is null or p_date < current_date then
    raise exception 'Please choose a date from today onwards';
  end if;

  select * into v_trek from public.treks where id = p_trek_id;
  if not found then
    raise exception 'Trek not found';
  end if;

  -- Off-season treks are now bookable, at the guide's off-season price.
  -- If that price hasn't been set yet, keep the trek unbookable rather
  -- than guessing a price.
  if v_trek.status = 'on-season' then
    v_price := v_trek.price;
  else
    v_price := v_trek.off_season_price;
    if v_price is null then
      raise exception 'This trek does not have off-season pricing set yet. Please contact the guide.';
    end if;
  end if;

  -- Block a tourist from booking the same trek + date twice while
  -- an existing booking is still active (audit §3.7).
  if exists (
    select 1 from public.bookings
    where trek_id = p_trek_id
      and tourist_id = auth.uid()
      and date = p_date
      and status <> 'cancelled'
  ) then
    raise exception 'You already have a booking for this trek on that date';
  end if;

  -- Lazily create the availability row for this date, seeded from
  -- the trek's advertised slot count, then lock it for update.
  insert into public.trek_availability (trek_id, date, capacity, booked)
  values (p_trek_id, p_date, coalesce(v_trek.slots, 0), 0)
  on conflict (trek_id, date) do nothing;

  select * into v_row from public.trek_availability
  where trek_id = p_trek_id and date = p_date
  for update;

  if (v_row.capacity - v_row.booked) < p_group_size then
    raise exception 'Only % seat(s) left for that date', (v_row.capacity - v_row.booked);
  end if;

  update public.trek_availability
  set booked = booked + p_group_size
  where trek_id = p_trek_id and date = p_date;

  select full_name into v_name from public.profiles where id = auth.uid();

  insert into public.bookings (
    trek_id, trek_name, tourist_id, tourist_name, date, group_size,
    status, payment_status, guide_decision, price_per_person
  ) values (
    p_trek_id, v_trek.name, auth.uid(), v_name, p_date, p_group_size,
    'reserved', 'pending', 'pending', v_price
  )
  returning * into v_booking;

  return v_booking;
end;
$function$;

-- Verify after running:
--   select column_name from information_schema.columns
--   where table_name = 'treks' and column_name = 'off_season_price';
--   select column_name from information_schema.columns
--   where table_name = 'bookings' and column_name = 'price_per_person';
-- both should return one row each.
