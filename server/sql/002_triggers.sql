-- ============================================================================
-- UniSphere Triggers
-- 002_triggers.sql — Trigger functions and trigger bindings
-- ============================================================================


-- ============================================================================
-- 1. enforce_campus_isolation()
--    BEFORE INSERT on channel_members
--    Prevents alumni from joining official channels and enforces campus match.
-- ============================================================================

CREATE OR REPLACE FUNCTION enforce_campus_isolation()
RETURNS TRIGGER AS $$
DECLARE
    v_role_name   VARCHAR(50);
    v_user_campus UUID;
    v_chan_campus  UUID;
BEGIN
    -- Look up the user's role by joining users → roles
    SELECT r.name, u.primary_campus_id
      INTO v_role_name, v_user_campus
      FROM users u
      JOIN roles r ON r.id = u.role_id
     WHERE u.id = NEW.user_id;

    -- If the user doesn't exist, reject
    IF NOT FOUND THEN
        RAISE EXCEPTION 'User with id % does not exist', NEW.user_id;
    END IF;

    -- Alumni cannot access official channels
    IF v_role_name = 'ALUMNI' THEN
        RAISE EXCEPTION 'Alumni cannot access official channels';
    END IF;

    -- Look up the channel's campus_id
    SELECT oc.campus_id
      INTO v_chan_campus
      FROM official_channels oc
     WHERE oc.id = NEW.channel_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Official channel with id % does not exist', NEW.channel_id;
    END IF;

    -- Enforce campus isolation: user campus must match channel campus
    IF v_user_campus != v_chan_campus THEN
        RAISE EXCEPTION 'Campus isolation violation: user campus (%) does not match channel campus (%)',
            v_user_campus, v_chan_campus;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_enforce_campus_isolation
    BEFORE INSERT ON channel_members
    FOR EACH ROW
    EXECUTE FUNCTION enforce_campus_isolation();


-- ============================================================================
-- 2. set_updated_at()
--    Generic trigger function to set updated_at = NOW() on every UPDATE.
--    Applied to all tables that have an updated_at column.
-- ============================================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- campuses
CREATE TRIGGER trg_campuses_updated_at
    BEFORE UPDATE ON campuses
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

-- roles
CREATE TRIGGER trg_roles_updated_at
    BEFORE UPDATE ON roles
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

-- users
CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

-- alumni_transitions
CREATE TRIGGER trg_alumni_transitions_updated_at
    BEFORE UPDATE ON alumni_transitions
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

-- official_channels
CREATE TRIGGER trg_official_channels_updated_at
    BEFORE UPDATE ON official_channels
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

-- channel_members
CREATE TRIGGER trg_channel_members_updated_at
    BEFORE UPDATE ON channel_members
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

-- official_messages
CREATE TRIGGER trg_official_messages_updated_at
    BEFORE UPDATE ON official_messages
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

-- social_posts
CREATE TRIGGER trg_social_posts_updated_at
    BEFORE UPDATE ON social_posts
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

-- stories
CREATE TRIGGER trg_stories_updated_at
    BEFORE UPDATE ON stories
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

-- connections
CREATE TRIGGER trg_connections_updated_at
    BEFORE UPDATE ON connections
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

-- media
CREATE TRIGGER trg_media_updated_at
    BEFORE UPDATE ON media
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

-- events
CREATE TRIGGER trg_events_updated_at
    BEFORE UPDATE ON events
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

-- chats
CREATE TRIGGER trg_chats_updated_at
    BEFORE UPDATE ON chats
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

-- chat_participants
CREATE TRIGGER trg_chat_participants_updated_at
    BEFORE UPDATE ON chat_participants
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

-- chat_messages
CREATE TRIGGER trg_chat_messages_updated_at
    BEFORE UPDATE ON chat_messages
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

-- notifications
CREATE TRIGGER trg_notifications_updated_at
    BEFORE UPDATE ON notifications
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

-- content_moderation_logs
CREATE TRIGGER trg_content_moderation_logs_updated_at
    BEFORE UPDATE ON content_moderation_logs
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

-- NOTE: audit_logs has NO updated_at column (append-only), so no trigger is applied.


-- ============================================================================
-- 3. auto_expire_stories()
--    Soft-deletes stories whose expires_at has passed and are not already
--    soft-deleted. Can be called periodically via pg_cron or application code.
-- ============================================================================

CREATE OR REPLACE FUNCTION auto_expire_stories()
RETURNS INTEGER AS $$
DECLARE
    affected_rows INTEGER;
BEGIN
    UPDATE stories
       SET deleted_at = NOW()
     WHERE expires_at <= NOW()
       AND deleted_at IS NULL;

    GET DIAGNOSTICS affected_rows = ROW_COUNT;

    RAISE NOTICE 'auto_expire_stories: soft-deleted % expired stories', affected_rows;

    RETURN affected_rows;
END;
$$ LANGUAGE plpgsql;
