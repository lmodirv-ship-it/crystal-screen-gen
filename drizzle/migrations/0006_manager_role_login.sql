UPDATE auth.users SET email_confirmed_at = now() WHERE id = '71eaa0ad-6456-467a-99d9-8b1a1953e84e' AND email_confirmed_at IS NULL;
DELETE FROM public.customers WHERE user_id = '71eaa0ad-6456-467a-99d9-8b1a1953e84e';
DELETE FROM public.user_roles WHERE user_id = '71eaa0ad-6456-467a-99d9-8b1a1953e84e';
INSERT INTO public.user_roles(user_id, role) VALUES ('71eaa0ad-6456-467a-99d9-8b1a1953e84e', 'manager');
UPDATE public.profiles SET full_name = 'Mouylay Ismail El Hassani' WHERE id = '71eaa0ad-6456-467a-99d9-8b1a1953e84e';
INSERT INTO public.role_logins(display_email, login_email, role) SELECT 'lmodirv@gmail.com', 'lmodirv+manager@gmail.com', 'manager'
  WHERE NOT EXISTS (SELECT 1 FROM public.role_logins WHERE login_email = 'lmodirv+manager@gmail.com');