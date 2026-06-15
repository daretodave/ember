-- add optional one-word check-in to entries
alter table public.entries
  add column if not exists checkin_word varchar(30) default null;
