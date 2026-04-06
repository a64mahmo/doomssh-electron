// Shared ID generation — used for section items, resumes, etc.
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}
