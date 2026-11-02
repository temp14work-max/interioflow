-- Role boundary self-check. Run in the SQL editor against the seeded database.
-- It always ends by raising an exception so that everything it did is rolled back:
-- "ALL ROLE CHECKS PASSED" means success, any other message names the failing rule.
do $$
declare
  admin_id constant text := 'user_3LYRixiO8Be5rHeLdZkIVsRq4YJ';
  customer_id constant text := 'user_3LYRj9M7RengYB6rlSqpAdifPiu';
  designer_id constant text := 'user_3LYRjBGmRC6XjZgifjhcd9NFASb';
  contractor_id constant text := 'user_3LYRjK6bAUU9mGLBBiskkH44Pi0';
  n integer;
  allowed boolean;
  order_json jsonb;
  project_row public.projects;
  second_project public.projects;
  stock_before integer;
  stock_after integer;
begin
  -- Guest: can browse the shop, nothing else.
  set local role anon;
  perform set_config('request.jwt.claims', '{"role":"anon"}', true);
  select count(*) into n from public.products;
  if n <> 8 then raise exception 'guest should see 8 products, saw %', n; end if;
  allowed := true;
  begin perform 1 from public.profiles limit 1; exception when insufficient_privilege then allowed := false; end;
  if allowed then raise exception 'guest could read profiles'; end if;
  allowed := true;
  begin perform 1 from public.design_requests limit 1; exception when insufficient_privilege then allowed := false; end;
  if allowed then raise exception 'guest could read requests'; end if;
  allowed := true;
  begin perform public.update_user_role(customer_id, 'admin'); exception when insufficient_privilege then allowed := false; end;
  if allowed then raise exception 'guest could call update_user_role'; end if;
  reset role;

  -- A brand new customer: starts as customer, sees only their own (empty) data.
  set local role authenticated;
  perform set_config('request.jwt.claims', '{"sub":"user_test_stranger","role":"authenticated","email":"designer.contractor.admin@example.com","name":"Stranger"}', true);
  if (select role from public.ensure_profile()) <> 'customer' then raise exception 'new signup was not a customer'; end if;
  select count(*) into n from public.design_requests;
  if n <> 0 then raise exception 'stranger saw % requests', n; end if;
  select count(*) into n from public.projects;
  if n <> 0 then raise exception 'stranger saw % projects', n; end if;
  select count(*) into n from public.profiles;
  if n <> 1 then raise exception 'stranger saw % profiles', n; end if;
  allowed := true;
  begin perform public.update_user_role('user_test_stranger', 'admin'); exception when insufficient_privilege then allowed := false; end;
  if allowed then raise exception 'stranger made themselves admin'; end if;
  allowed := true;
  begin perform public.accept_proposal('prop_02'); exception when insufficient_privilege then allowed := false; end;
  if allowed then raise exception 'stranger accepted someone elses proposal'; end if;
  allowed := true;
  begin
    insert into public.design_requests (customer_id, customer_name, customer_email, title, project_type, area_sqft, budget_min_paise, budget_max_paise, city, requirements)
    values (customer_id, 'x', 'x', 'spoofed', 'residential', 100, 1, 2, 'x', 'x');
  exception when insufficient_privilege then allowed := false; end;
  if allowed then raise exception 'stranger created a request for another customer'; end if;
  allowed := true;
  begin update public.profiles set role = 'admin' where id = 'user_test_stranger'; exception when insufficient_privilege then allowed := false; end;
  if allowed then raise exception 'stranger updated their own role column'; end if;
  allowed := true;
  begin update public.products set price_paise = 1 where id = 'prod_01'; get diagnostics n = row_count; allowed := n > 0; exception when insufficient_privilege then allowed := false; end;
  if allowed then raise exception 'stranger changed a price'; end if;
  reset role;

  -- Customer: own data, demo checkout priced by the database, idempotent proposal accept.
  set local role authenticated;
  perform set_config('request.jwt.claims', format('{"sub":"%s","role":"authenticated"}', customer_id), true);
  select count(*) into n from public.design_requests;
  if n <> 15 then raise exception 'customer should see 15 requests, saw %', n; end if;
  select stock_quantity into stock_before from public.products where id = 'prod_05';
  insert into public.cart_items (customer_id, product_id, quantity) values (customer_id, 'prod_05', 2);
  order_json := public.place_demo_order(
    '{"full_name":"T","phone":"9000000000","street":"S","city":"C","state":"St","postal_code":"560001","price_paise":1}',
    '[{"product_id":"prod_05","quantity":2,"price_paise":1}]');
  -- 2 x 480000 = 960000, below free shipping: + 49900 shipping + 172800 GST
  if (order_json->>'total_paise')::bigint <> 1182700 then raise exception 'order total was %', order_json->>'total_paise'; end if;
  select stock_quantity into stock_after from public.products where id = 'prod_05';
  if stock_after <> stock_before - 2 then raise exception 'stock did not decrease'; end if;
  select count(*) into n from public.cart_items;
  if n <> 0 then raise exception 'cart was not cleared'; end if;
  allowed := true;
  begin
    perform public.place_demo_order('{"full_name":"T","phone":"9","street":"S","city":"C","state":"St","postal_code":"5"}', '[{"product_id":"prod_04","quantity":99}]');
  exception when others then allowed := false; end;
  if allowed then raise exception 'order beyond stock was accepted'; end if;
  project_row := public.accept_proposal('prop_02');
  second_project := public.accept_proposal('prop_02');
  if project_row.id <> second_project.id then raise exception 'accepting twice made two projects'; end if;
  allowed := true;
  begin update public.tasks set progress_percent = 1 where id = 'task_02'; get diagnostics n = row_count; allowed := n > 0; exception when insufficient_privilege then allowed := false; end;
  if allowed then raise exception 'customer updated a task'; end if;
  allowed := true;
  begin update public.orders set status = 'delivered'; get diagnostics n = row_count; allowed := n > 0; exception when insufficient_privilege then allowed := false; end;
  if allowed then raise exception 'customer changed an order status'; end if;
  reset role;

  -- Designer: own work plus contractors; no orders, no catalogue.
  set local role authenticated;
  perform set_config('request.jwt.claims', format('{"sub":"%s","role":"authenticated"}', designer_id), true);
  select count(*) into n from public.profiles;
  if n <> 2 then raise exception 'designer should see self and contractor, saw %', n; end if;
  select count(*) into n from public.orders;
  if n <> 0 then raise exception 'designer saw % orders', n; end if;
  allowed := true;
  begin insert into public.products (sku, slug, name, category, price_paise) values ('X', 'x', 'x', 'rugs', 1); exception when insufficient_privilege then allowed := false; end;
  if allowed then raise exception 'designer created a product'; end if;
  insert into public.tasks (project_id, assigned_contractor_id, title, category, due_date, created_by)
  values ('proj_01', contractor_id, 'Check task', 'general', current_date, designer_id);
  select count(*) into n from public.tasks where project_id = 'proj_01';
  if n <> 3 then raise exception 'designer task was not created'; end if;
  reset role;

  -- Contractor: only assigned tasks; progress yes, task identity no.
  set local role authenticated;
  perform set_config('request.jwt.claims', format('{"sub":"%s","role":"authenticated"}', contractor_id), true);
  select count(*) into n from public.design_requests;
  if n <> 0 then raise exception 'contractor saw % requests', n; end if;
  select count(*) into n from public.products where not is_active;
  if n <> 0 then raise exception 'contractor saw archived products'; end if;
  update public.tasks set progress_percent = 100, status = 'completed' where id = 'task_1793280673094';
  get diagnostics n = row_count;
  if n <> 1 then raise exception 'contractor could not update their task'; end if;
  if (select progress_percent from public.projects where id = 'proj_1793280603803') <> 100 then raise exception 'project progress did not roll up'; end if;
  allowed := true;
  begin update public.tasks set title = 'renamed' where id = 'task_02'; exception when insufficient_privilege then allowed := false; end;
  if allowed then raise exception 'contractor renamed a task'; end if;
  insert into public.project_updates (project_id, author_id, author_name, author_role, message)
  values ('proj_01', admin_id, 'Spoofed', 'admin', 'Check update');
  if (select author_id from public.project_updates where message = 'Check update') <> contractor_id then raise exception 'update author could be spoofed'; end if;
  reset role;

  -- Admin: sees everything, role changes are logged, the last admin is protected.
  set local role authenticated;
  perform set_config('request.jwt.claims', format('{"sub":"%s","role":"authenticated"}', admin_id), true);
  select count(*) into n from public.orders;
  if n <> 1 then raise exception 'admin should see the test order, saw %', n; end if;
  perform public.update_user_role(contractor_id, 'designer');
  select count(*) into n from public.role_changes where user_id = contractor_id;
  if n <> 1 then raise exception 'role change was not logged'; end if;
  allowed := true;
  begin perform public.update_user_role(admin_id, 'customer'); exception when others then allowed := false; end;
  if allowed then raise exception 'last admin was demoted'; end if;
  reset role;

  raise exception 'ALL ROLE CHECKS PASSED';
end $$;
