# XTrimFitGym Revision Report

**Revision date:** October 8, 2026  
**Active applications:** `Api`, `Mobile App`, and `Web`

## Outcome

The three applications now share one authoritative API schema, reproducible root commands, CI checks, documented environment contracts, and consistent authentication and membership rules. The critical application-level findings from the original review were remediated. Production deployment still requires credential rotation, environment configuration, attendance-infrastructure work, and hands-on acceptance testing with real external services.

## Implemented revisions

### API security and reliability

- Added validated, expiring legacy JWTs with issuer and audience claims. `JWT_SECRET` is canonical; `JWT_SIKRIT` remains a temporary compatibility fallback.
- Legacy tokens now resolve the current database user and role, and disabled users cannot continue using an old token.
- Development verification and coach sign-in operations are blocked in production; verification codes use cryptographically secure randomness.
- Protected membership, coach-assignment, and biometric-enrollment fields from member self-updates.
- Enforced coach ownership/assignment rules for coach requests, progress access, session creation, and invitations.
- Added request throttling for GraphQL and sensitive authentication operations.
- Added security response headers, request-size limits, `/health`, `/ready`, startup environment validation, and graceful shutdown.
- Secured uploads with authentication, image MIME and size limits, and an explicit Cloudinary folder allowlist.
- Added a server-side ExerciseDB proxy so the mobile app no longer contains the vendor credential.
- Added API authentication-token tests and deterministic clean builds.

### Membership and notifications

- Made `MembershipTransaction` the authoritative membership record.
- Added expiry synchronization that updates expired transactions and maintains the legacy user membership ID only as a compatibility projection.
- Mobile access checks now require an active, unexpired transaction rather than the presence of a plan ID.
- Mobile continues polling authoritative membership state so cancellation and expiry are detected.
- Direct member purchase is disabled; member activation uses administrator-approved subscription requests. The administrator direct-subscribe workflow remains available.
- Implemented the declared `MemberDetails.membershipTransaction` resolver.
- Connected API-backed notifications to Mobile, including read state, and enabled Web system notifications by default.

### Attendance and external integrations

- The attendance monitor now starts even if its first MySQL connection attempt fails and retries at a controlled interval.
- Reduced noisy one-second polling and throttled repeated connection errors.
- Narrowed the iVMS database account to attendance-table operations and added a separate read-only API account.
- Required attendance database passwords during container initialization.
- Corrected initialization ordering so the current index migration is included.

### Mobile App

- Removed the embedded ExerciseDB/RapidAPI credential and routed exercise data and images through the API.
- Removed legacy bearer-token persistence and made Clerk session state authoritative for route access.
- Removed permissive production cleartext-network configuration and hardcoded development service credentials.
- Added environment examples and safe simulator/hosted endpoint selection.
- Repaired the mobile/API cancellation contract, GraphQL generation path, generated types, and Apollo Client compatibility.
- Reduced aggressive polling and stopped closed notification drawers from polling unnecessarily.
- Changed the production Android artifact to an app bundle.
- Removed stale code, fixed invalid icon/type usage, corrected upload typing/retry completion, and excluded the historical nested API snapshot from compilation.
- Mobile strict TypeScript and ESLint now complete with zero findings.

### Web

- Removed Clerk bearer tokens from `localStorage` and persisted Redux state.
- Delayed WebSocket connection until it is needed so Clerk authentication can be registered first.
- Repaired GraphQL generation against the authoritative API schema.
- Enabled system notifications by default and added the missing environment contract.
- Added a non-interactive test command for CI.
- Added page-level lazy loading and targeted vendor/PDF chunking to substantially reduce the initial JavaScript payload.
- Web TypeScript and ESLint now complete without application findings.

### Repository organization

- Added a root README, `.gitignore`, package scripts, environment examples, and GitHub Actions CI.
- Root commands now cover installation, GraphQL generation, type checking, linting, tests, builds, and development entry points.
- CI verifies generated GraphQL output is committed by failing on a post-generation diff.
- API builds clean `dist` before compilation and no longer install dependencies from inside the build command.

### Dependency security

- Applied all available non-breaking npm security updates, including current patched releases of Clerk, Apollo Server, Mongoose, Multer, MySQL2, WebSocket, React Router, and Vite within the existing framework ranges.
- Removed the vulnerable API runtime schema-globbing dependency and replaced implicit discovery with an explicit schema/resolver manifest.
- API and Web production dependency audits now report zero vulnerabilities.
- Mobile's direct Clerk dependency was updated to a patched release. npm still reports transitive advisories inside the Expo/Metro/React Native and Tailwind toolchains; its proposed automatic fixes require incompatible major downgrades/upgrades. Those must be addressed through a tested Expo SDK/toolchain upgrade rather than `npm audit fix --force`.

## Verification performed

| Check | Result |
| --- | --- |
| API GraphQL generation | Passed |
| Mobile GraphQL generation | Passed |
| Web GraphQL generation | Passed |
| API TypeScript | Passed |
| Mobile TypeScript | Passed |
| Web TypeScript | Passed |
| Mobile ESLint | Passed with zero warnings/errors |
| Web ESLint | Passed with zero application warnings/errors |
| API tests | 3 passed |
| Web tests | 12 passed |
| API production build | Passed |
| Web production build | Passed |
| API production dependency audit | 0 vulnerabilities |
| Web production dependency audit | 0 vulnerabilities |
| Mobile dependency audit | Direct critical auth issues fixed; Expo/toolchain transitive advisories remain |

The automated checks do not replace device, browser, database, payment/front-desk, biometric-device, or deployment acceptance testing.

## Required operator actions

These actions need access to external accounts or production infrastructure and cannot be completed from the source tree:

1. Rotate the previously exposed RapidAPI key in the RapidAPI dashboard. Set the replacement only as API `EXERCISEDB_API_KEY`.
2. Create a new random production `JWT_SECRET` of at least 32 characters. Changing it intentionally invalidates all legacy JWT sessions.
3. Configure matching production Clerk keys for API, Mobile, and Web. Do not ship test Clerk keys in a production build.
4. Configure Cloudinary, MongoDB, allowed CORS origins, public GraphQL URLs, and WebSocket URLs in the deployment platforms.
5. Change the MySQL root, iVMS, and API passwords; recreate or alter existing database grants because initialization scripts do not modify an already-created volume.
6. Keep legacy MySQL/iVMS traffic private or place it behind a secure ingestion gateway. The source changes reduce privileges but cannot add TLS support to an old physical device.
7. Run the attendance schema/index migrations against a backup or staging copy, verify them, and only then apply them to production.
8. Build and sign Mobile through EAS with production environment variables, then test on real Android and iOS devices.
9. Perform acceptance tests for administrator approval, cancellation/expiry, coach access boundaries, image uploads, notifications, and biometric attendance.

## Deliberately preserved historical files

The following appear to be stale copies, but they were not deleted because this workspace has no visible Git history and deletion could destroy the only recoverable copy:

- `Api/XTrimFitGym-Api-clean`
- `Mobile App/XTrimFitGym-Api-main`
- the unused top-level `Web/graphql` duplicate
- `Web/src/pages/Attendance_backup.tsx`

They are excluded from active compilation or generation. After making a verified backup or importing the workspace into version control, archive them outside the active repository and run the full check again. The authoritative runtime sources are `Api/src`, `Mobile App`, and `Web/src`.

## Remaining architectural improvements

These are not release-blocking source defects but should be planned as the system grows:

- Replace in-memory GraphQL PubSub, rate-limit buckets, and scheduled jobs with shared Redis/queue infrastructure before running multiple API instances.
- Move multi-document membership/session updates into MongoDB transactions where the deployment supports them.
- Replace the single attendance database connection with a managed pool or ingestion service.
- Split the largest resolver and screen files into policy, service, data-access, and presentation modules.
- Expand automated coverage to authorization policies, membership transitions, subscription approval, attendance ingestion, and mobile navigation.
- Remove the legacy JWT login path after all users and clients exclusively use Clerk.
