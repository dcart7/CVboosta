# Database migrations

Run this as a single pre-deploy job before starting new API instances:

```bash
python backend/scripts/run_migrations.py
```

The API never creates or alters tables during startup or request handling.

## Native auth rollout

Browser requests (identified by `Origin`/Fetch Metadata headers) receive only an
HttpOnly cookie. Existing native clients without browser headers continue to
receive the legacy token response. New native releases should migrate to
`POST /auth/native/token` with `X-Native-Client-Key`; configure and rotate
`NATIVE_AUTH_CLIENT_KEY`. The exchange rejects every request carrying browser
`Origin` or `Sec-Fetch-*` headers.
