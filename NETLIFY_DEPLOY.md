# Netlify deployment notes

1) Build & plugin

- This project uses Next.js 14 and the Netlify Next.js plugin. The repository includes `netlify.toml` which runs `npm run build` and uses `@netlify/plugin-nextjs` to handle serverless functions and routing.

2) Node version

- `package.json` sets the `engines.node` to `18.x`. Netlify will use Node 18 for builds.

3) Prisma on Netlify (recommended)

- Serverless platforms can exhaust DB connections. For reliable Prisma usage on Netlify use Prisma Data Proxy or a connection pooler.
- Recommended approaches:
  - Use Prisma Data Proxy (recommended): create a Data Proxy in your Prisma Cloud and set `DATABASE_URL` to the Data Proxy connection string.
  - If you use a standard Postgres host, configure a connection pool (PgBouncer) and tune `connection_limit`.

4) Environment variables to set in Netlify UI (Site > Site settings > Build & deploy > Environment)

- DATABASE_URL  (or PRISMA_DATA_PROXY_URL)
- UPSTASH_REDIS_REST_URL (optional)
- UPSTASH_REDIS_REST_TOKEN (optional)
- NEXT_PUBLIC_SOME_KEY (if you have public vars)
- Any JWT or secret keys used by your auth flow

5) Prisma generate

- `package.json` already runs `prisma generate` during build (see `build` and `postinstall`). No further action needed.

6) Local testing before deploy

- Run locally:
  ```powershell
  npm run build
  npm run dev
  ```

7) Push & connect to Netlify

- Push your branch to the repository, then connect the repo in Netlify and select the branch. Netlify will run the build command and deploy.
