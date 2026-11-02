# InterioFlow — Software Catalogue & Claude Build Brief
**Document purpose:** Give Claude the project requirements, implementation boundaries, architecture decisions, and acceptance criteria needed to build InterioFlow consistently.

**Project type:** Student/community-oriented web application  
**Product name:** InterioFlow  
**Full title:** Interior Design Consulting, Project Management & Home Décor Shopping Platform  
**Primary deployment target:** Vercel  
**Prepared:** 26 October 2026

---

## 1. Project vision

InterioFlow is a web platform that connects customers with interior design services and helps manage interior design projects from consultation request through proposal approval, task progress, and completion. It also includes a small direct-to-customer home décor store where customers can purchase extra products such as lamps, chairs, wallpaper, cushions, rugs, and decorative accessories.

**The interior-design service and project-management workflow is the main product.** The store is an additional module, not the entire purpose of the application.

### Problem being solved
Customers often have to coordinate design discussions, quotes, project updates, and décor shopping across separate channels. InterioFlow puts these workflows in one understandable interface.

### Project goals
- Let customers submit a design/consultation request.
- Let designers review requests and prepare proposals/quotes.
- Let customers approve or reject proposals.
- Track project status, milestones, assigned tasks, and contractor updates.
- Let customers browse and buy home décor products.
- Let administrators manage users, product catalogue, stock, orders, and platform operations.
- Support safe online payments for store orders.
- Deploy the application on Vercel with a managed backend.

### Out of scope for the initial release
- Vendor/supplier accounts and vendor dashboards.
- Supplier quotations and vendor purchase orders.
- Multi-vendor marketplace commissions.
- AI room rendering, 3D modelling, or automatic floor-plan generation.
- Real-time courier integrations and complex logistics.
- Native Android/iOS applications.
- Recurring subscriptions.
- Automatic project-service payments unless explicitly approved as a later phase.

---

## 2. User roles and permissions

There are exactly four application roles. Do not add a Vendor role.

### Customer
- Register/sign in and manage own profile.
- Create and view own design consultation requests.
- Upload reference images or documents where enabled.
- View designer proposals and quotes for own requests.
- Accept/reject proposals.
- View own projects, milestones, tasks, progress updates, and project files.
- Browse public product catalogue, filter/search products, view product details.
- Add/remove/update items in cart.
- Checkout and pay for product orders.
- View own orders and payment status.

### Interior Designer
- View design requests assigned to them or available to their workflow, according to the assignment rules.
- Review customer requirements and reference material.
- Create and revise proposals/quotes.
- Manage projects created from accepted proposals.
- Create milestones/tasks and assign work to contractors.
- Post project updates and progress notes.
- Access only the customer/project data required for assigned work.

### Contractor
- View projects and tasks assigned to them.
- Update task status and progress.
- Add completion notes and progress photos if that feature is enabled.
- Cannot change product prices, order payments, user roles, or unrelated projects.

### Admin
- Manage users and assign/approve roles.
- Manage product catalogue, product images, prices, active status, and stock.
- Review and manage store orders and order status.
- View payment records and operational reports.
- Manage consultation requests/projects when support intervention is required.
- Access platform-wide administrative functions.
- Admin-only actions must be checked server-side; hiding a button is not authorization.

### Role assignment rule
Never allow a user to self-assign `admin`, `designer`, or `contractor` by submitting a client-side form. New public signups should default to `customer`. Admin role changes must be protected and audited. A role stored in editable user metadata must not be trusted by itself for authorization.

---

## 3. Recommended technology stack (current, Vercel-oriented)

Use stable, mutually compatible releases available when implementation begins. Keep package versions locked in the lockfile; do not use canary/nightly packages for production.

| Area | Recommended baseline |
|---|---|
| Framework | Next.js 16.x App Router, latest stable patch |
| UI runtime | React 19.3.x, compatible React DOM release |
| Language | Current stable TypeScript 5.x or newer compatible stable |
| Styling | Tailwind CSS 4.x |
| UI components | shadcn/ui selectively; accessible primitives |
| Authentication | Clerk with current compatible `@clerk/nextjs` SDK |
| Database | Supabase PostgreSQL |
| Data access | Supabase JavaScript client; typed database schema |
| Authorization | Clerk identity + server-side role checks + PostgreSQL RLS |
| Files | Supabase Storage with private buckets for project documents |
| Payments | Razorpay Standard Checkout for INR/India-focused checkout |
| Hosting | Vercel, Node.js 24.x runtime if supported by the selected Vercel project |
| Source control | GitHub |
| Testing | Vitest or Jest for unit tests; Playwright for end-to-end flows |
| Validation | Zod or equivalent schema validation |
| Forms | React Hook Form + Zod where forms are complex |
| Icons | Lucide React |
| Date handling | Use a maintained date library only if native Intl/Date is insufficient |

### Important integration decision: Clerk + Supabase
This pairing is supported. Use the **native Clerk third-party auth integration in Supabase**, not the deprecated legacy Clerk Supabase JWT-template setup.

At a high level:
1. Configure Clerk for Supabase in the Clerk dashboard.
2. Add Clerk as a third-party auth provider in the Supabase project.
3. Create a Supabase client that passes the Clerk session token/access token using the currently documented SDK integration pattern.
4. Enable RLS on every table exposed through Supabase APIs.
5. Write and test policies based on the verified Clerk user ID and role claims.
6. Keep privileged server-only operations behind trusted server code. Never expose a Supabase service-role/secret key in the browser.

Clerk authenticates the user. It does not automatically make every database query safe. Supabase RLS and server-side authorization remain essential.

### Version policy
The version numbers above are compatibility targets, not a claim that every exact patch number will remain latest. Before installing, verify current stable versions in the official documentation and package registry. Prefer `create-next-app@latest` for scaffolding, then commit the generated lockfile and test `npm run build`. Avoid Next.js canary, React experimental builds, or unverified adapter features for production.

---

## 4. Application modules

### A. Public website
- Home page explaining design services and platform benefits.
- Services/consultation page.
- Product catalogue and product detail pages.
- About/contact/help pages as needed.
- Responsive navigation and footer.
- SEO metadata for public pages.

### B. Authentication and onboarding
- Sign up, sign in, sign out, account management through Clerk.
- First-time user receives the customer role.
- Admin can assign designer or contractor role.
- Role-based dashboards and route protection.
- Account profile stored in an application profile table keyed by Clerk user ID.

### C. Design consultation requests
Suggested fields:
- Customer ID
- Project type (room, apartment, office, etc.)
- Property type and approximate area
- Preferred style and budget range
- Location at a broad level (avoid unnecessary sensitive details)
- Requirements/description
- Preferred contact details
- Reference file URLs
- Status and timestamps

Statuses: `submitted`, `under_review`, `assigned`, `proposal_sent`, `accepted`, `rejected`, `cancelled`.

### D. Proposal and quotation
- Designer prepares scope, description, estimated cost, validity date, and terms.
- Customer can view a proposal linked to their request.
- Customer can accept or reject.
- Acceptance creates or activates a project; the operation should be transactional or safely idempotent.
- Keep proposal revisions/history if practical.

### E. Project management
- Project linked to the accepted proposal and customer.
- Designer manages milestones and tasks.
- Contractor receives assigned tasks.
- Task status: `todo`, `in_progress`, `blocked`, `completed`.
- Project status: `planned`, `in_progress`, `on_hold`, `completed`, `cancelled`.
- Record progress notes with author and timestamp.
- Only authorized assigned users can view or modify project records.

### F. Home décor product store
- Product categories such as lighting, furniture, wall décor, wallpaper, textiles, and accessories.
- Product detail: name, slug, description, category, price in INR paise, images, stock quantity, active status, SKU, timestamps.
- Search/filter by category and price can be added after the core catalogue works.
- Admin is the direct catalogue manager. There is no vendor account or supplier workflow.
- Cart must be revalidated on the server at checkout. Never trust prices sent from the browser.
- Store order item rows must snapshot product name, unit price, and quantity at purchase time.

### G. Checkout and payment
Use Razorpay Standard Checkout unless the project owner chooses another provider. Keep payment processing server-side.

Recommended flow:
1. Customer submits cart.
2. Server authenticates customer and re-reads current product prices/stock from the database.
3. Server validates quantities and availability; calculates totals using integer paise.
4. Server creates a pending order and a Razorpay order using server-side credentials.
5. Browser opens Razorpay Checkout with the server-created Razorpay order ID.
6. Browser returns payment identifiers/signature to a server endpoint.
7. Server verifies the signature using the secret key and verifies the actual payment/order status.
8. Webhook handler processes payment events idempotently and acts as a second source of truth.
9. Mark the order paid only after trusted verification; update stock safely and record payment events.
10. Show a confirmation page based on server-side order state, not the browser's success message.

Never store card numbers or CVV. Never mark an order paid merely because the checkout callback says success. Do not expose `RAZORPAY_KEY_SECRET`.

Initial release supports **product orders only**. Design-service/project payments should be a separate, explicitly scoped workflow later.

### H. Admin dashboard
- User and role management.
- Product create/edit/archive and inventory management.
- Order list, order detail, payment state, fulfilment status.
- Consultation and project overview.
- Basic counts/reports.
- Audit log for sensitive actions where practical.

---

## 5. Data model (logical starting point)

Use UUID primary keys for application-owned records unless a specific integration requires a string ID. Clerk user IDs should be stored as text because they are external IDs.

### `profiles`
- `id` UUID primary key
- `clerk_user_id` text unique, not null
- `display_name`, `email` (email may be refreshed via webhook)
- `role` enum/text constrained to `customer`, `designer`, `contractor`, `admin`
- `created_at`, `updated_at`

### `design_requests`
- `id`, `customer_id` → profiles
- `assigned_designer_id` → profiles, nullable
- `title`, `project_type`, `area_sqft`, `budget_min_paise`, `budget_max_paise`
- `style_preferences`, `requirements`, `status`
- `created_at`, `updated_at`

### `proposals`
- `id`, `design_request_id`, `designer_id`
- `title`, `scope`, `price_paise`, `valid_until`, `status`, `revision`
- `created_at`, `updated_at`

### `projects`
- `id`, `design_request_id`, `proposal_id`, `customer_id`, `designer_id`
- `title`, `status`, `start_date`, `target_end_date`, `created_at`, `updated_at`

### `tasks`
- `id`, `project_id`, `assigned_contractor_id`
- `title`, `description`, `status`, `due_date`, `progress_percent`
- `created_by`, `created_at`, `updated_at`

### `project_updates`
- `id`, `project_id`, `author_id`, `message`, `attachment_path`, `created_at`

### `products`
- `id`, `sku` unique, `slug` unique, `name`, `description`, `category`
- `price_paise`, `stock_quantity`, `is_active`, `created_at`, `updated_at`

### `product_images`
- `id`, `product_id`, `storage_path`, `alt_text`, `sort_order`

### `orders`
- `id`, `customer_id`, `order_number` unique
- `status`, `subtotal_paise`, `shipping_paise`, `tax_paise`, `total_paise`
- `currency` default `INR`, `shipping_address` (only collect what fulfilment needs)
- `razorpay_order_id` unique nullable, `created_at`, `updated_at`

### `order_items`
- `id`, `order_id`, `product_id` nullable if product is later deleted
- `product_name_snapshot`, `unit_price_paise`, `quantity`, `line_total_paise`

### `payments`
- `id`, `order_id`, `provider`, `provider_payment_id`, `provider_order_id`
- `amount_paise`, `currency`, `status`, `signature_verified`, `created_at`, `updated_at`

### `webhook_events`
- `id`, `provider`, `provider_event_id` unique, `event_type`, `processed_at`, `processing_status`
- Store only necessary payload fields; avoid retaining unnecessary sensitive data.

### Optional later tables
`project_documents`, `addresses`, `audit_logs`, `notifications`, `refunds`, `shipping_events`.

Use foreign keys, indexes on foreign keys/status/timestamps, uniqueness constraints, and database checks for nonnegative prices and quantities. Money must be stored as integer paise (not floating-point rupees). Define migrations in source control.

---

## 6. Security and authorization requirements

These requirements are mandatory:
- Check identity and role on the server for every protected action.
- Apply least privilege: users should access only their own records or records assigned to them.
- Enable RLS for tables exposed through Supabase APIs.
- Test RLS as customer A, customer B, designer, contractor, and admin.
- Do not trust role values submitted by the client.
- Keep all secrets in local environment variables and Vercel project environment settings.
- Never prefix secret values with `NEXT_PUBLIC_`.
- Do not expose Supabase service-role/secret keys to client components.
- Validate all request bodies using a schema and enforce length/range limits.
- Use private storage buckets for customer/project documents and short-lived signed URLs.
- Verify payment signatures server-side and process webhooks idempotently.
- Avoid duplicate order creation and duplicate stock decrement on webhook retries.
- Log sensitive admin actions; do not log passwords, full secrets, or payment card data.
- Use rate limiting for public request/payment endpoints if feasible.
- Apply secure file type/size validation to uploads.
- Use explicit cache controls for user-specific pages and API responses.

Suggested access policy intent:
- Customer: own requests, own proposals, own projects, own orders.
- Designer: assigned requests/projects and related proposals/tasks only.
- Contractor: assigned tasks/projects and the minimum necessary project details.
- Admin: platform-wide operations after server-side admin verification.
- Public visitor: active product catalogue and public pages only.

---

## 7. Suggested route map

```text
/
 /services
 /consultation
 /shop
 /shop/[slug]
 /cart
 /checkout
 /orders
 /orders/[orderId]
 /sign-in
 /sign-up
 /dashboard
 /dashboard/customer
 /dashboard/designer
 /dashboard/contractor
 /dashboard/admin
 /dashboard/requests
 /dashboard/proposals
 /dashboard/projects
 /dashboard/projects/[projectId]
 /dashboard/tasks
 /dashboard/orders
 /dashboard/products
 /api/checkout/create-order
 /api/checkout/verify
 /api/webhooks/razorpay
```

Use route groups/layouts to keep public, account, and dashboard navigation organized. Route names are illustrative and may be refined while preserving behavior.

---

## 8. Recommended source tree

```text
src/
  app/
    (marketing)/
    (auth)/
    dashboard/
    shop/
    cart/
    checkout/
    orders/
    api/
      checkout/
      webhooks/
  components/
    ui/
    layout/
    forms/
    products/
    projects/
  lib/
    auth/
    supabase/
    payments/
    validation/
    permissions/
    utils/
  server/
    actions/
    services/
  types/
supabase/
  migrations/
  seed.sql
tests/
  unit/
  e2e/
```

Adapt the structure to current Next.js 16 conventions. With Next.js 16 and Clerk, follow the current Clerk quickstart's `proxy.ts` convention; do not copy older `middleware.ts` examples blindly.

---

## 9. Environment variables

Use `.env.local` for local development and Vercel Environment Variables for Preview/Production. Never commit real secrets.

Expected names (confirm current SDK names before implementation):
```text
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=
```

Use only public keys in browser-exposed variables. Keep Clerk secret, Razorpay secret, and webhook secret server-only. If the chosen Supabase server-side pattern requires a secret/service-role key for a narrow trusted task, keep it server-only and prefer user-scoped access plus RLS whenever possible. Never include credentials in the Claude prompt or source repository.

---

## 10. Build plan and order of work

### Phase 0 — Inspect and plan
- Determine whether an existing InterioFlow repository exists.
- If it exists, inspect its package manifest and source tree before proposing rewrites.
- Do not delete or replace existing code without explaining the change and getting approval.
- Verify current official docs and stable package versions.

### Phase 1 — Foundation
- Create Next.js 16 App Router TypeScript project.
- Set up linting, formatting, environment validation, base layouts, Tailwind CSS.
- Connect Clerk and test sign-in/sign-up.
- Connect Supabase with the native Clerk integration.
- Add migrations, profiles, roles, and RLS policies.
- Implement role-protected dashboards and test access denial.

### Phase 2 — Design workflow
- Consultation request forms.
- Designer assignment and proposal creation.
- Proposal acceptance/rejection.
- Project creation, milestones/tasks, contractor task updates.
- Project progress timeline.

### Phase 3 — Store and checkout
- Admin product CRUD and image uploads.
- Public product catalogue/detail pages.
- Cart with server-side validation.
- Razorpay order creation, checkout, signature verification, webhook handling.
- Customer order history and admin order management.

### Phase 4 — Polish and deploy
- Loading/empty/error states and responsive design.
- Accessibility, validation, security review.
- Unit and end-to-end tests.
- Production build locally.
- Deploy to Vercel Preview, configure environment variables, test end-to-end, then promote to Production.

---

## 11. Acceptance criteria

The application is not complete until:
1. A new public user defaults to customer and cannot self-promote.
2. A customer cannot access another customer's requests, proposals, projects, or orders by changing an ID.
3. A designer can create a proposal only for an authorized request.
4. Proposal acceptance creates no duplicate project if submitted twice.
5. Contractors can update only tasks assigned to them.
6. Public visitors can browse active products but cannot edit catalogue data.
7. Admin can create/edit/archive products and manage stock.
8. Checkout recalculates price and stock server-side.
9. A forged or invalid payment signature never marks an order paid.
10. Duplicate webhooks do not duplicate payments, orders, or stock changes.
11. User-specific pages are not accidentally shared via cache.
12. `npm run build` succeeds using the committed lockfile.
13. Preview and production deployments work on Vercel with separately configured environment variables.
14. The main design consultation/project-management journey remains more prominent than the store.

---

## 12. Instructions to Claude

Act as a senior full-stack engineer and solution architect. Use this document as the requirements baseline.

**Working rules**
- Start by summarizing the plan and asking whether there is an existing repository if that is unknown.
- Inspect the existing project before changing it. Do not assume it is a blank repository.
- Use current stable releases and current official docs. Do not use deprecated Clerk-Supabase JWT templates, obsolete Next.js middleware examples, or canary builds.
- Build in small, testable phases. After each phase, list files changed, commands run, results, and any remaining setup the user must do.
- Never invent API keys, dashboard values, project IDs, or successful payment events.
- Provide migrations and RLS policies with the application code.
- Include tests for roles, data ownership, payment verification, and webhook idempotency.
- Keep secrets server-side and never print them.
- Do not add vendor/supplier roles or supplier workflows.
- Do not implement project-service payments until the product checkout flow works and the owner explicitly approves that scope.
- Use accessible, responsive UI and meaningful loading, empty, error, and success states.
- Do not claim deployment is successful until a real build/deployment result confirms it.

### First task for Claude
1. Inspect the repository (or confirm that it is empty/new).
2. Propose the final architecture and exact stable dependency versions based on official documentation available at implementation time.
3. Create a phased implementation checklist.
4. Wait for approval before destructive changes or large-scale rewrites.
