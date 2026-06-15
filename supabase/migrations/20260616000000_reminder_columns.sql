-- Phase 33: daily reminder opt-in
-- Adds reminder preference columns to profiles.
-- reminder_opt_in: OFF by default — users must explicitly enable.
-- reminder_hour: 0-23 local hour to receive the reminder (default 8am).
-- last_reminder_sent_at: deduplication timestamp; prevents double-send within a UTC day.

alter table public.profiles
  add column if not exists reminder_opt_in boolean not null default false,
  add column if not exists reminder_hour smallint not null default 8
    constraint reminder_hour_range check (reminder_hour >= 0 and reminder_hour <= 23),
  add column if not exists last_reminder_sent_at timestamptz;
