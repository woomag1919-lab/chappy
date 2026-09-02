-- =========================================================
-- CoreLingual DB setup v32
-- 既存テーブルを削除せず、必要な列・索引を整えます。
-- =========================================================

-- 通常の共有結果：リンク有効期限は7日。
CREATE TABLE IF NOT EXISTS corelingual_shares (
  id BIGSERIAL PRIMARY KEY,
  token_hash CHAR(64) NOT NULL UNIQUE,
  kind VARCHAR(20) NOT NULL CHECK (kind IN ('analysis','diagnosis')),
  title VARCHAR(120) NOT NULL DEFAULT 'CoreLingualの共有結果',
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  deleted_at TIMESTAMPTZ NULL
);

CREATE INDEX IF NOT EXISTS corelingual_shares_expires_idx
  ON corelingual_shares (expires_at);
CREATE INDEX IF NOT EXISTS corelingual_shares_kind_idx
  ON corelingual_shares (kind);

-- 2人で特性チェック：作成から30日で期限切れ。
CREATE TABLE IF NOT EXISTS corelingual_invites (
  id BIGSERIAL PRIMARY KEY,
  token_hash TEXT UNIQUE NOT NULL,
  owner_hash TEXT NOT NULL,
  host_name TEXT,
  host_profile JSONB,
  host_share BOOLEAN NOT NULL DEFAULT FALSE,
  partner_profile JSONB,
  partner_share BOOLEAN NOT NULL DEFAULT FALSE,
  partner_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 days')
);

ALTER TABLE corelingual_invites
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 days');

CREATE INDEX IF NOT EXISTS corelingual_invites_expires_idx
  ON corelingual_invites (expires_at);
