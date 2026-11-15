# Welcome to your Lovable project

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Open your project in the [Lovable editor](https://lovable.dev) and keep building.

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: connect the project to GitHub and every change made in Lovable is committed straight to your repository.
- **Full ownership**: this code is yours. Push to your repository and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

## Built with

- TanStack Start
- TypeScript
- React
- Tailwind CSS

## Real accounts stage

Real account routes: `/dashboard`, `/profile`, `/settings`, `/saved`, `/tracker`, `/alerts`, `/opportunities`.
`/demo/*` remains fictional and never imports into accounts. Email/password sign-in is enabled with verification required.
All account requests use authenticated server functions and owner-scoped database policies. Roles are separate and cannot be assigned by browser requests.

### Initial administrator

Register and verify the project owner's account first. In Lovable's trusted Cloud database table editor, add a `user_roles` record with the verified account's user ID and `role = admin`, or ask Lovable to assign the role to that specific verified account. Never use a public signup form or make the first signup an admin. No administrator is assigned automatically.

### Verification results and manual checks

- Passed real isolated-account browser checks: login, logout, refresh restoration, protected-route redirect, profile/preferences updates, application creation/readback, alerts, zero-count dashboard, empty discovery, mobile navigation and persistence after re-login.
- Passed six live security regression tests in `tests/account_security.py`: profile isolation; no self-admin grants; admin-only source/opportunity writes; anonymous private reads blocked/empty; unique private saves; isolated tracker/alert reads and writes. Temporary users and source/opportunity fixtures were removed.
- Passed 26 frontend tests. Registration confirmation and recovery redirects are also covered by mocked regression tests, not claimed as email delivery tests.
- Registration with a reserved test address was rejected clearly by the hosted auth service. Actual inbox delivery, verification-link completion and password reset remain manual checks: register with a real address in the Lovable preview, open its confirmation email, log in, request Forgot password, open its email link, set a new password, then log out and log in with that new password.
- Preview and existing hosted domain redirect URLs were read and are allowed. No agent tool changes that list. Local email-link testing additionally needs `http://127.0.0.1:8080/**` in More → Users → Auth settings → Advanced → Redirect URLs; do not use localhost for email return links.
- The security advisor flags the role-check security-definer helper, which intentionally supports RLS role checks. It has a fixed search path and no writes.

Live platform connectors, AI processing, resume uploads, billing, automatic notification scheduling/delivery and administrator management screens remain deferred. The private storage bucket is reserved with owner-folder policies; no upload control is enabled. Nothing was published during this stage.
