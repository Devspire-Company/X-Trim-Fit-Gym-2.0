# XTrimFitGym

XTrimFitGym is maintained as one system with three active applications:

- `Api` — Node, Express, Apollo GraphQL, MongoDB, attendance integration, and uploads.
- `Mobile App` — Expo application for members and coaches.
- `Web` — Vite administrator portal.

The active GraphQL schema is always `Api/src/graphql/**/*.graphql`. Mobile and Web code generation must point to that schema; nested historical API copies are not runtime source.

## Required software

- Node.js 22 LTS
- npm 10 or newer
- MongoDB
- MySQL attendance database when biometric attendance is required

## Initial setup

1. Copy each `.env.example` to `.env` in `Api`, `Mobile App`, and `Web`.
2. Fill in environment-specific credentials. Never commit `.env` files.
3. Run `npm run install:all` from this directory.
4. Run `npm run generate` whenever the API GraphQL schema or a client operation changes.
5. Run `npm run check` before deployment.

## Development commands

Run these in separate terminals from the repository root:

```powershell
npm run dev:api
npm run dev:web
npm run dev:mobile
```

For a physical mobile device, set `EXPO_PUBLIC_API_URL` to an HTTPS endpoint reachable by that device. Android production builds intentionally do not permit arbitrary cleartext traffic.

## Architecture rules

- Clerk is the primary user session provider.
- `MembershipTransaction` is the source of truth for active membership; `User.membershipDetails.membership_id` is a compatibility projection.
- Membership activation happens through subscription requests or the explicit administrator direct-subscribe workflow.
- ExerciseDB credentials live only in the API environment. Mobile uses the API proxy.
- API secrets use server-only environment variables. `EXPO_PUBLIC_*` and `VITE_*` values are public by design.
- Do not edit generated GraphQL files manually.

## Deployment checks

- API liveness: `/health`
- API readiness: `/ready`
- Configure the production Clerk publishable and secret keys as a matching pair.
- Configure `EXERCISEDB_API_KEY` only on the API.
- Use a separate read-only MySQL account for the API and a narrowly privileged account for iVMS.
- Run and verify attendance migrations before switching production traffic.

See [SYSTEM_REVIEW.md](SYSTEM_REVIEW.md) for the original risk inventory and [REVISION_REPORT.md](REVISION_REPORT.md) for the implemented remediation and deployment handoff.
