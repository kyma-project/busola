export function isValidUUID(uuid) {
  // Standard UUID length
  const UUIDlength = 36;
  // UUID v4 regex pattern
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  return (
    typeof uuid === 'string' &&
    uuid.length === UUIDlength &&
    uuidRegex.test(uuid)
  );
}
