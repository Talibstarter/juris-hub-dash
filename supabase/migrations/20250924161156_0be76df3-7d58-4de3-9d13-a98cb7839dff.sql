-- Create a function to get users by their IDs (which are now telegram_ids)
CREATE OR REPLACE FUNCTION get_users_by_telegram_ids(telegram_ids bigint[])
RETURNS TABLE (
  telegram_id bigint,
  first_name text,
  last_name text,
  username text,
  role text,
  is_active boolean,
  created_at timestamp with time zone
) AS $$
BEGIN
  RETURN QUERY
  SELECT u.id as telegram_id, u.first_name, u.last_name, u.username, u.role::text, u.is_active, u.created_at
  FROM users u
  WHERE u.id = ANY(telegram_ids);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;