# InterioFlow

Interior design consulting, project management and home décor shopping for customers, designers, contractors and admins.

- **Frontend:** React, Vite and Tailwind. There is no separate backend server.
- **Database, backend logic, file storage, realtime:** Supabase (Row Level Security, database functions, Storage, Realtime).
- **Login:** Clerk, connected through Supabase third-party auth. Clerk users are copied into `public.profiles`.
- **Payments:** demo only. No money moves. `place_demo_order` must be replaced before real payments are added.

## Run locally

```bash
npm install
```

Copy `.env.example` to `.env.local` and fill in the values, then:

```bash
npm run dev
```

The app runs at http://localhost:3000.

## Demo accounts

These work only on the Clerk development instance. Sign in with the email, then enter the test code `424242`.

| Role | Email |
| --- | --- |
| Customer | `demo.customer+clerk_test@example.com` |
| Designer | `demo.designer+clerk_test@example.com` |
| Contractor | `demo.contractor+clerk_test@example.com` |

## Database

- `supabase/migrations/`: schema, access rules and functions.
- `supabase/seed.sql`: demo data. It references the Clerk user ids of the demo accounts.
- `supabase/functions/clerk-webhook/`: copies Clerk user changes into `profiles`. Needs the `CLERK_WEBHOOK_SECRET` secret in Supabase.
- `supabase/tests/role_boundaries.sql`: checks what each role can and cannot do. Run it in the SQL editor. It rolls itself back and ends with `ALL ROLE CHECKS PASSED`.

Roles live in `profiles.role`. New sign-ups are customers, and only an admin can change a role.
