-- Add antonellobordoni@gmail.com as super admin
INSERT INTO public.admin_users (user_id, role, is_active, created_at) 
VALUES ('86b0171e-0611-4580-abc8-8ff4ff0af414', 'super_admin', true, now());