-- ============================================================================
-- UniSphere Database Schema
-- 001_schema.sql — Full DDL: extension, enums, tables, indexes
-- ============================================================================

-- ─── UUID Extension ─────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- ENUMS
-- ============================================================================

CREATE TYPE user_status_enum AS ENUM ('ACTIVE', 'SUSPENDED', 'GRADUATED');

CREATE TYPE post_visibility_enum AS ENUM ('ALL_NST', 'CAMPUS_ONLY');

CREATE TYPE connection_status_enum AS ENUM ('PENDING', 'ACCEPTED', 'BLOCKED');

CREATE TYPE channel_type_enum AS ENUM ('ANNOUNCEMENT', 'ACADEMIC', 'BATCH_BRANCH', 'CLUB', 'GENERAL');

CREATE TYPE notification_type_enum AS ENUM ('MENTION', 'REPLY', 'EVENT', 'SYSTEM', 'CHANNEL_INVITE');

CREATE TYPE moderation_action_enum AS ENUM ('FLAGGED', 'REMOVED', 'WARNED', 'BANNED');

CREATE TYPE event_scope_enum AS ENUM ('ALL_NST', 'CAMPUS_ONLY');

CREATE TYPE story_media_type_enum AS ENUM ('TEXT', 'IMAGE', 'VIDEO');

CREATE TYPE chat_type_enum AS ENUM ('DIRECT', 'GROUP');


-- ============================================================================
-- TABLES  (in dependency order)
-- ============================================================================

-- ─── 1. campuses ────────────────────────────────────────────────────────────
CREATE TABLE campuses (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        VARCHAR(255) NOT NULL,
    short_name  VARCHAR(10)  NOT NULL,
    code        VARCHAR(20)  UNIQUE NOT NULL,
    logo_url    TEXT,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    deleted_at  TIMESTAMPTZ
);

-- ─── 2. roles ───────────────────────────────────────────────────────────────
CREATE TABLE roles (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        VARCHAR(50) UNIQUE NOT NULL,   -- STUDENT, FACULTY, ALUMNI, ADMIN
    description TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    -- NO deleted_at
);

-- ─── 3. users ───────────────────────────────────────────────────────────────
CREATE TABLE users (
    id                          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_id                     UUID         NOT NULL REFERENCES roles(id),
    primary_campus_id           UUID         NOT NULL REFERENCES campuses(id),
    official_email              VARCHAR(255) UNIQUE NOT NULL,
    personal_email              VARCHAR(255),
    personal_email_verified     BOOLEAN      DEFAULT FALSE,
    email_verification_token    VARCHAR(255),
    email_verification_expires_at TIMESTAMPTZ,
    password_hash               VARCHAR(255) NOT NULL,
    first_name                  VARCHAR(100) NOT NULL,
    last_name                   VARCHAR(100) NOT NULL,
    display_name                VARCHAR(200) NOT NULL,
    avatar_url                  TEXT,
    branch                      VARCHAR(255),
    batch                       VARCHAR(50),
    bio                         TEXT,
    status                      user_status_enum DEFAULT 'ACTIVE',
    custom_status_text          VARCHAR(255),
    last_seen_at                TIMESTAMPTZ,
    created_at                  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at                  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    deleted_at                  TIMESTAMPTZ
);

-- ─── 4. alumni_transitions ──────────────────────────────────────────────────
CREATE TABLE alumni_transitions (
    id                              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id                         UUID         NOT NULL UNIQUE REFERENCES users(id),
    transitioned_at                 TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    official_email_revoked          BOOLEAN      DEFAULT FALSE,
    personal_email_at_transition    VARCHAR(255) NOT NULL,
    previous_role_id                UUID         NOT NULL REFERENCES roles(id),
    notes                           TEXT,
    created_at                      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at                      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
    -- NO deleted_at
);

-- ─── 5. official_channels ───────────────────────────────────────────────────
CREATE TABLE official_channels (
    id                          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campus_id                   UUID             NOT NULL REFERENCES campuses(id),
    name                        VARCHAR(255)     NOT NULL,
    slug                        VARCHAR(255)     NOT NULL,
    description                 TEXT,
    channel_type                channel_type_enum NOT NULL DEFAULT 'GENERAL',
    is_read_only_for_students   BOOLEAN          DEFAULT FALSE,
    created_by                  UUID             REFERENCES users(id),
    created_at                  TIMESTAMPTZ      NOT NULL DEFAULT NOW(),
    updated_at                  TIMESTAMPTZ      NOT NULL DEFAULT NOW(),
    deleted_at                  TIMESTAMPTZ,
    UNIQUE (campus_id, slug)
);

-- ─── 6. channel_members ─────────────────────────────────────────────────────
CREATE TABLE channel_members (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    channel_id  UUID        NOT NULL REFERENCES official_channels(id),
    user_id     UUID        NOT NULL REFERENCES users(id),
    joined_at   TIMESTAMPTZ DEFAULT NOW(),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at  TIMESTAMPTZ,
    UNIQUE (channel_id, user_id)
);

-- ─── 7. official_messages ───────────────────────────────────────────────────
CREATE TABLE official_messages (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    channel_id        UUID        NOT NULL REFERENCES official_channels(id),
    sender_id         UUID        NOT NULL REFERENCES users(id),
    content           TEXT        NOT NULL,
    parent_message_id UUID        REFERENCES official_messages(id),   -- self-ref for threads
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at        TIMESTAMPTZ
);

-- ─── 8. social_posts ────────────────────────────────────────────────────────
CREATE TABLE social_posts (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_id       UUID                 NOT NULL REFERENCES users(id),
    campus_id       UUID                 NOT NULL REFERENCES campuses(id),
    content         TEXT                 NOT NULL,
    visibility      post_visibility_enum NOT NULL DEFAULT 'CAMPUS_ONLY',
    likes_count     INT                  DEFAULT 0,
    comments_count  INT                  DEFAULT 0,
    created_at      TIMESTAMPTZ          NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ          NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ
);

-- ─── 9. stories ─────────────────────────────────────────────────────────────
CREATE TABLE stories (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_id   UUID                  NOT NULL REFERENCES users(id),
    campus_id   UUID                  NOT NULL REFERENCES campuses(id),
    content     TEXT,
    media_url   TEXT,
    media_type  story_media_type_enum DEFAULT 'TEXT',
    visibility  post_visibility_enum  DEFAULT 'CAMPUS_ONLY',
    expires_at  TIMESTAMPTZ           NOT NULL,
    created_at  TIMESTAMPTZ           NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ           NOT NULL DEFAULT NOW(),
    deleted_at  TIMESTAMPTZ,
    CONSTRAINT chk_stories_expires CHECK (expires_at > created_at)
);

-- ─── 10. connections ────────────────────────────────────────────────────────
CREATE TABLE connections (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    requester_id    UUID                   NOT NULL REFERENCES users(id),
    addressee_id    UUID                   NOT NULL REFERENCES users(id),
    status          connection_status_enum DEFAULT 'PENDING',
    created_at      TIMESTAMPTZ            NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ            NOT NULL DEFAULT NOW(),
    -- NO deleted_at
    UNIQUE (requester_id, addressee_id),
    CONSTRAINT chk_connections_no_self CHECK (requester_id != addressee_id)
);

-- ─── 11. media ──────────────────────────────────────────────────────────────
CREATE TABLE media (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    uploader_id       UUID         NOT NULL REFERENCES users(id),
    entity_type       VARCHAR(50)  NOT NULL,
    entity_id         UUID         NOT NULL,
    url               TEXT         NOT NULL,
    mime_type         VARCHAR(100) NOT NULL,
    file_size_bytes   BIGINT,
    original_filename VARCHAR(255),
    created_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    deleted_at        TIMESTAMPTZ
);

-- ─── 12. events ─────────────────────────────────────────────────────────────
CREATE TABLE events (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campus_id       UUID             REFERENCES campuses(id),   -- nullable for NST-wide
    organizer_id    UUID             NOT NULL REFERENCES users(id),
    title           VARCHAR(255)     NOT NULL,
    description     TEXT,
    location        VARCHAR(255),
    event_date      TIMESTAMPTZ      NOT NULL,
    end_date        TIMESTAMPTZ,
    scope           event_scope_enum DEFAULT 'CAMPUS_ONLY',
    rsvp_count      INT              DEFAULT 0,
    tag             VARCHAR(100),
    created_at      TIMESTAMPTZ      NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ      NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ
);

-- ─── 13. chats ──────────────────────────────────────────────────────────────
CREATE TABLE chats (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chat_type   chat_type_enum NOT NULL,
    name        VARCHAR(255),             -- nullable, for groups
    created_by  UUID           REFERENCES users(id),
    created_at  TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    deleted_at  TIMESTAMPTZ
);

-- ─── 14. chat_participants ──────────────────────────────────────────────────
CREATE TABLE chat_participants (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chat_id     UUID        NOT NULL REFERENCES chats(id),
    user_id     UUID        NOT NULL REFERENCES users(id),
    joined_at   TIMESTAMPTZ DEFAULT NOW(),
    last_read_at TIMESTAMPTZ,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at  TIMESTAMPTZ,
    UNIQUE (chat_id, user_id)
);

-- ─── 15. chat_messages ──────────────────────────────────────────────────────
CREATE TABLE chat_messages (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chat_id     UUID        NOT NULL REFERENCES chats(id),
    sender_id   UUID        NOT NULL REFERENCES users(id),
    content     TEXT        NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at  TIMESTAMPTZ
);

-- ─── 16. notifications ──────────────────────────────────────────────────────
CREATE TABLE notifications (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipient_id    UUID                   NOT NULL REFERENCES users(id),
    sender_id       UUID                   REFERENCES users(id),
    type            notification_type_enum NOT NULL,
    title           VARCHAR(255)           NOT NULL,
    body            TEXT,
    entity_type     VARCHAR(100),
    entity_id       UUID,
    is_read         BOOLEAN                DEFAULT FALSE,
    read_at         TIMESTAMPTZ,
    created_at      TIMESTAMPTZ            NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ            NOT NULL DEFAULT NOW()
    -- NO deleted_at
);

-- ─── 17. audit_logs (append-only) ──────────────────────────────────────────
CREATE TABLE audit_logs (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_id        UUID         REFERENCES users(id),
    action          VARCHAR(255) NOT NULL,
    entity_type     VARCHAR(100) NOT NULL,
    entity_id       UUID,
    details         JSONB        DEFAULT '{}',
    ip_address      VARCHAR(45),
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
    -- ONLY created_at — append-only, no updated_at/deleted_at
);

-- ─── 18. content_moderation_logs ────────────────────────────────────────────
CREATE TABLE content_moderation_logs (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    moderator_id        UUID                   NOT NULL REFERENCES users(id),
    target_entity_type  VARCHAR(100)           NOT NULL,
    target_entity_id    UUID                   NOT NULL,
    action              moderation_action_enum NOT NULL,
    reason              TEXT,
    details             JSONB                  DEFAULT '{}',
    created_at          TIMESTAMPTZ            NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ            NOT NULL DEFAULT NOW()
    -- NO deleted_at
);


-- ============================================================================
-- INDEXES
-- ============================================================================

-- ─── Foreign Key Indexes ────────────────────────────────────────────────────

-- users
CREATE INDEX idx_users_role_id            ON users(role_id);
CREATE INDEX idx_users_primary_campus_id  ON users(primary_campus_id);

-- alumni_transitions
CREATE INDEX idx_alumni_transitions_user_id          ON alumni_transitions(user_id);
CREATE INDEX idx_alumni_transitions_previous_role_id ON alumni_transitions(previous_role_id);

-- official_channels
CREATE INDEX idx_official_channels_campus_id   ON official_channels(campus_id);
CREATE INDEX idx_official_channels_created_by  ON official_channels(created_by);

-- channel_members
CREATE INDEX idx_channel_members_channel_id ON channel_members(channel_id);
CREATE INDEX idx_channel_members_user_id    ON channel_members(user_id);

-- official_messages
CREATE INDEX idx_official_messages_channel_id        ON official_messages(channel_id);
CREATE INDEX idx_official_messages_sender_id         ON official_messages(sender_id);
CREATE INDEX idx_official_messages_parent_message_id ON official_messages(parent_message_id);

-- social_posts
CREATE INDEX idx_social_posts_author_id ON social_posts(author_id);
CREATE INDEX idx_social_posts_campus_id ON social_posts(campus_id);

-- stories
CREATE INDEX idx_stories_author_id ON stories(author_id);
CREATE INDEX idx_stories_campus_id ON stories(campus_id);

-- connections
CREATE INDEX idx_connections_requester_id ON connections(requester_id);
CREATE INDEX idx_connections_addressee_id ON connections(addressee_id);

-- media
CREATE INDEX idx_media_uploader_id ON media(uploader_id);

-- events
CREATE INDEX idx_events_campus_id    ON events(campus_id);
CREATE INDEX idx_events_organizer_id ON events(organizer_id);

-- chats
CREATE INDEX idx_chats_created_by ON chats(created_by);

-- chat_participants
CREATE INDEX idx_chat_participants_chat_id ON chat_participants(chat_id);
CREATE INDEX idx_chat_participants_user_id ON chat_participants(user_id);

-- chat_messages
CREATE INDEX idx_chat_messages_chat_id   ON chat_messages(chat_id);
CREATE INDEX idx_chat_messages_sender_id ON chat_messages(sender_id);

-- notifications
CREATE INDEX idx_notifications_recipient_id ON notifications(recipient_id);
CREATE INDEX idx_notifications_sender_id    ON notifications(sender_id);

-- audit_logs
CREATE INDEX idx_audit_logs_actor_id ON audit_logs(actor_id);

-- content_moderation_logs
CREATE INDEX idx_content_moderation_logs_moderator_id ON content_moderation_logs(moderator_id);

-- ─── Partial Indexes (WHERE deleted_at IS NULL) ─────────────────────────────

CREATE INDEX idx_social_posts_created_at_active
    ON social_posts(created_at)
    WHERE deleted_at IS NULL;

CREATE INDEX idx_official_messages_created_at_active
    ON official_messages(created_at)
    WHERE deleted_at IS NULL;

CREATE INDEX idx_stories_created_at_active
    ON stories(created_at)
    WHERE deleted_at IS NULL;

-- ─── Unique Partial Index ───────────────────────────────────────────────────

CREATE UNIQUE INDEX idx_users_personal_email_unique
    ON users(personal_email)
    WHERE personal_email IS NOT NULL;

-- ─── Composite Indexes ─────────────────────────────────────────────────────

CREATE INDEX idx_channel_members_channel_user
    ON channel_members(channel_id, user_id);

CREATE INDEX idx_chat_participants_chat_user
    ON chat_participants(chat_id, user_id);

CREATE INDEX idx_media_entity
    ON media(entity_type, entity_id);

-- ─── Additional Indexes ────────────────────────────────────────────────────

CREATE INDEX idx_notifications_recipient_read
    ON notifications(recipient_id, is_read);

CREATE INDEX idx_audit_logs_entity
    ON audit_logs(entity_type, entity_id);

CREATE INDEX idx_stories_expires_at_active
    ON stories(expires_at)
    WHERE deleted_at IS NULL;
