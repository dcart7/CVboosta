-- Security/stability schema cutover. This intentionally drops the old
-- keyword cache because it contained raw job descriptions.

CREATE TABLE IF NOT EXISTS idempotency_records (
    id SERIAL PRIMARY KEY,
    operation VARCHAR(64) NOT NULL,
    scope_hash VARCHAR(64) NOT NULL,
    key_hash VARCHAR(64) NOT NULL,
    request_hash VARCHAR(64) NOT NULL,
    status VARCHAR(16) NOT NULL DEFAULT 'in_progress',
    user_id INTEGER NULL,
    resource_id INTEGER NULL,
    response_encrypted TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_idempotency_operation_scope_key
        UNIQUE (operation, scope_hash, key_hash)
);
CREATE INDEX IF NOT EXISTS ix_idempotency_records_operation ON idempotency_records(operation);
CREATE INDEX IF NOT EXISTS ix_idempotency_records_status ON idempotency_records(status);
CREATE INDEX IF NOT EXISTS ix_idempotency_records_user_id ON idempotency_records(user_id);
CREATE INDEX IF NOT EXISTS ix_idempotency_records_created_at ON idempotency_records(created_at);

CREATE TABLE IF NOT EXISTS stripe_payment_applications (
    id SERIAL PRIMARY KEY,
    provider VARCHAR(32) NOT NULL DEFAULT 'stripe_checkout',
    reference_id VARCHAR(255) NOT NULL,
    user_id INTEGER NOT NULL,
    tier VARCHAR(32) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_stripe_payment_provider_reference UNIQUE (provider, reference_id)
);
CREATE INDEX IF NOT EXISTS ix_stripe_payment_applications_reference_id
    ON stripe_payment_applications(reference_id);
CREATE INDEX IF NOT EXISTS ix_stripe_payment_applications_user_id
    ON stripe_payment_applications(user_id);
CREATE INDEX IF NOT EXISTS ix_stripe_payment_applications_created_at
    ON stripe_payment_applications(created_at);

CREATE TABLE IF NOT EXISTS app_store_purchase_owners (
    id SERIAL PRIMARY KEY,
    original_transaction_id VARCHAR(128) NOT NULL UNIQUE,
    user_id INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ix_app_store_purchase_owners_user_id
    ON app_store_purchase_owners(user_id);

DO $$
BEGIN
    IF to_regclass('public.app_store_transactions') IS NOT NULL THEN
        INSERT INTO app_store_purchase_owners (original_transaction_id, user_id, created_at)
        SELECT DISTINCT ON (original_transaction_id)
            original_transaction_id,
            user_id,
            COALESCE(created_at, NOW())
        FROM app_store_transactions
        WHERE original_transaction_id IS NOT NULL
          AND original_transaction_id <> ''
        ORDER BY original_transaction_id, created_at ASC NULLS LAST, id ASC
        ON CONFLICT (original_transaction_id) DO NOTHING;
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS pending_stripe_checkouts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    request_hash VARCHAR(64) NOT NULL,
    status VARCHAR(24) NOT NULL DEFAULT 'creating',
    lease_token VARCHAR(64) NULL,
    generation INTEGER NOT NULL DEFAULT 1,
    session_id VARCHAR(255) NULL,
    response_encrypted TEXT NULL,
    expires_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ix_pending_stripe_checkouts_status ON pending_stripe_checkouts(status);
CREATE INDEX IF NOT EXISTS ix_pending_stripe_checkouts_expires_at ON pending_stripe_checkouts(expires_at);
CREATE INDEX IF NOT EXISTS ix_pending_stripe_checkouts_updated_at ON pending_stripe_checkouts(updated_at);

-- Cache rows are disposable. Dropping them is the only reliable cleanup for
-- legacy plaintext job descriptions before switching to keyed hashes.
DROP TABLE IF EXISTS keyword_lists;
CREATE TABLE keyword_lists (
    id SERIAL PRIMARY KEY,
    source_hash VARCHAR(64) NOT NULL UNIQUE,
    skills JSON NOT NULL,
    requirements JSON NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL
);
CREATE INDEX ix_keyword_lists_source_hash ON keyword_lists(source_hash);
CREATE INDEX ix_keyword_lists_expires_at ON keyword_lists(expires_at);
