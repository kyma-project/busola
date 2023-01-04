export default function extractErrors(exception) {
  if (exception && exception.message) {
    return exception.message;
  }
  return exception;
}
