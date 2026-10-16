/** Text of a caught error for the user; the error itself goes to the log (STYLE.md, "Errors and data"). */
export function errorText(error: unknown): string {
  console.error(error);
  return error instanceof Error ? error.message : String(error);
}
