import fsp from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

export type ResolutionCandidate = string | string[]
export type ResolutionManifest = ResolutionCandidate[]

export interface ResolveOptions {
  cwd?: string
  boundaryDir?: string
}

export interface ResolutionEntry {
  path: string
  priority: number
  identifier: string
  distance: number
}

async function* discover(
  candidates: ResolutionCandidate,
  options: Required<ResolveOptions> & { context?: { distance: number } },
): AsyncGenerator<{ path: string, identifier: string, distance: number }> {
  const distance = options.context?.distance ?? 0
  const list = Array.isArray(candidates) ? candidates : [candidates]

  for (const identifier of list) {
    const filepath = path.join(options.cwd, identifier)
    const stat = await fsp.stat(filepath).catch(() => null)
    if (stat) {
      yield { path: filepath, identifier, distance }
    }
  }

  if (path.resolve(options.cwd) !== path.resolve(options.boundaryDir)) {
    yield* discover(candidates, {
      ...options,
      cwd: path.dirname(options.cwd),
      context: { distance: distance + 1 },
    })
  }
}

export async function resolveAll(
  manifest: string | ResolutionManifest,
  options?: ResolveOptions,
): Promise<ResolutionEntry[]> {
  const config = {
    cwd: options?.cwd ?? process.cwd(),
    boundaryDir: options?.boundaryDir ?? path.parse(options?.cwd ?? process.cwd()).root,
  }

  const entries: ResolutionEntry[] = []
  manifest = typeof manifest === 'string' ? [manifest] : manifest
  for (const [priority, candidate] of manifest.entries()) {
    for await (const match of discover(candidate, config)) {
      entries.push({
        ...match,
        priority,
      })
    }
  }

  return entries
}

export async function resolveOne(
  manifest: string | ResolutionManifest,
  options?: ResolveOptions,
): Promise<ResolutionEntry | null> {
  const config = {
    cwd: options?.cwd ?? process.cwd(),
    boundaryDir: options?.boundaryDir ?? path.parse(options?.cwd ?? process.cwd()).root,
  }

  manifest = typeof manifest === 'string' ? [manifest] : manifest
  for (const [priority, candidate] of manifest.entries()) {
    const result = await discover(candidate, config).next()
    if (result.value) {
      return {
        ...result.value,
        priority,
      }
    }
  }

  return null
}

export default {
  resolveAll,
  resolveOne,
}
