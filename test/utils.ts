import path from 'node:path'

export function fixtures(...p: string[]): string {
  return path.join(path.dirname(import.meta.filename), 'fixtures', ...p)
}
