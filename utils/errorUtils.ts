
export function extractErrorMessage(err: unknown, fallback: string = 'An unexpected error occurred'): string {
  if (!err) return fallback;
  
  if (typeof err === 'string') return err;
  
  const errorObj = err as Record<string, unknown>; 
  
  if (errorObj.message && typeof errorObj.message === 'string') return errorObj.message;
  
  // Handle Supabase error objects
  if (errorObj.error_description && typeof errorObj.error_description === 'string') return errorObj.error_description;
  
  try {
    const stringified = JSON.stringify(err);
    if (stringified !== '{}') return stringified;
  } catch {
    // ignore
  }
  
  return String(err) || fallback;
}
