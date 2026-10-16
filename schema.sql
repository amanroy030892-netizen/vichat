-- VeilChat Database Schema (PostgreSQL)
-- Supports Masked Social Feed, Friendships, 1-on-1 Calls, KYC Vault & 60s Abuse Evidence

CREATE TABLE users (
    id UUID PRIMARY KEY,
    masked_handle VARCHAR(64) UNIQUE NOT NULL,
    avatar_mask VARCHAR(32) DEFAULT 'neon_fox',
    bio TEXT,
    kyc_verified BOOLEAN DEFAULT TRUE,
    kyc_selfie_encrypted_url TEXT NOT NULL,
    device_fingerprint VARCHAR(128) NOT NULL,
    account_status VARCHAR(24) DEFAULT 'active', -- active, suspended, banned
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE posts (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    mood_tag VARCHAR(40) NOT NULL,
    content TEXT NOT NULL,
    hug_count INT DEFAULT 0,
    support_count INT DEFAULT 0,
    listen_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE comments (
    id UUID PRIMARY KEY,
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE friendships (
    id UUID PRIMARY KEY,
    requester_id UUID REFERENCES users(id) ON DELETE CASCADE,
    addressee_id UUID REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(24) DEFAULT 'accepted', -- pending, accepted, blocked
    mutual_face_reveal BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE call_abuse_reports (
    id UUID PRIMARY KEY,
    call_session_id VARCHAR(64) NOT NULL,
    reporter_id UUID REFERENCES users(id),
    accused_id UUID REFERENCES users(id),
    reason VARCHAR(120) NOT NULL,
    rolling_buffer_clip_url TEXT NOT NULL, -- 60-second encrypted WebM/MP4 proof clip
    buffer_duration_sec INT DEFAULT 60,
    status VARCHAR(24) DEFAULT 'pending_review', -- pending_review, action_taken, dismissed
    auto_delete_at TIMESTAMP NOT NULL, -- Automatically purged 30 days after resolution
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE admin_audit_logs (
    id UUID PRIMARY KEY,
    admin_id VARCHAR(64) NOT NULL,
    action_type VARCHAR(64) NOT NULL, -- UNLOCK_KYC_FACE, REVIEW_CLIP, BAN_USER
    target_user_id UUID REFERENCES users(id),
    report_id UUID REFERENCES call_abuse_reports(id),
    justification TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
