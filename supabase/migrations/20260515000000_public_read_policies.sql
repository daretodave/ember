-- Public read access for /u/[username] routes
-- These permissive SELECT policies are OR'd with the existing user-owned
-- policies, so authenticated users retain full access to their own data.

-- Anyone can read a profile row where a public username is set
create policy "public profiles are readable by username"
  on public.profiles for select
  using (username is not null);

-- Anyone can read published entries
create policy "published entries are publicly readable"
  on public.entries for select
  using (is_published = true);
