-- Phase 38: prompt pack preference
-- adds prompt_pack column to profiles; default 'standard'

alter table public.profiles
  add column if not exists prompt_pack text not null default 'standard';
