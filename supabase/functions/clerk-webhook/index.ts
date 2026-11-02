// Copies Clerk user changes into public.profiles. Authenticated by the Svix signature, not a Supabase JWT.
import { createClient } from 'npm:@supabase/supabase-js@2';
import { Webhook } from 'npm:svix@1';

Deno.serve(async req => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  const secret = Deno.env.get('CLERK_WEBHOOK_SECRET');
  if (!secret) return new Response('Webhook secret is not configured', { status: 500 });

  const body = await req.text();
  let event: { type: string; data: any };
  try {
    event = new Webhook(secret).verify(body, {
      'svix-id': req.headers.get('svix-id') ?? '',
      'svix-timestamp': req.headers.get('svix-timestamp') ?? '',
      'svix-signature': req.headers.get('svix-signature') ?? '',
    }) as { type: string; data: any };
  } catch {
    return new Response('Invalid signature', { status: 401 });
  }

  const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const user = event.data;

  if (event.type === 'user.created' || event.type === 'user.updated') {
    const email = user.email_addresses?.find((e: any) => e.id === user.primary_email_address_id)?.email_address ?? '';
    const phone = user.phone_numbers?.find((p: any) => p.id === user.primary_phone_number_id)?.phone_number ?? null;
    const name = [user.first_name, user.last_name].filter(Boolean).join(' ') || email.split('@')[0] || 'Client';
    // role is left out on purpose: it is only ever changed by update_user_role
    const { error } = await db.from('profiles').upsert(
      { id: user.id, email, display_name: name, phone, avatar_url: user.image_url ?? null, deleted_at: null },
      { onConflict: 'id' },
    );
    if (error) return new Response(error.message, { status: 500 });
  } else if (event.type === 'user.deleted') {
    // Soft delete: orders and projects keep pointing at this profile.
    const { error } = await db.from('profiles').update({ deleted_at: new Date().toISOString() }).eq('id', user.id);
    if (error) return new Response(error.message, { status: 500 });
  }

  return new Response('ok');
});
