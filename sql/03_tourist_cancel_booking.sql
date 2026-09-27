-- Phase 2, item 3.1: Tourist "Cancel booking" button
--
-- Problem: Bookings.jsx calls
--   base44.entities.Booking.update(booking.id, { status: 'cancelled' })
-- as the tourist, but no RLS UPDATE policy on `bookings` currently allows a
-- tourist to update their own row (only guides-via-treks and admins can).
-- This produces "Cannot coerce the result to a single JSON object" because
-- the update matches 0 rows under RLS, so .select().single() gets nothing
-- back.
--
-- Fix: allow a tourist to update ONLY their own booking, and ONLY while it
-- is still 'reserved' (a booking that's already 'paid' or 'cancelled' can't
-- be touched this way). The USING clause gates which existing rows they can
-- target; the WITH CHECK clause gates what the resulting row is allowed to
-- look like after the update.

create policy "Tourists can cancel their own reserved bookings"
on public.bookings
for update
to public
using (
  auth.uid() = tourist_id
  and status = 'reserved'
)
with check (
  auth.uid() = tourist_id
  and status = 'cancelled'
);

-- Verify after running:
--   select policyname, cmd, roles, qual, with_check
--   from pg_policies
--   where tablename = 'bookings';
-- should now show this new policy alongside the existing four.
