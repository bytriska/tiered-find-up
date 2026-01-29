import fsp from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

export type SearchKey = string | string[]
export type PriorityManifest = SearchKey[]

export interface FindOptions {
  cwd?: string
  stopDir?: string
}

export interface FoundResult {
  path: string
  priority: number
  key: string
  depth: number
}

async function* lookup(
  keys: SearchKey,
  options: Required<FindOptions> & { data?: { depth: number } }
): AsyncGenerator<{ path: string; key: string; depth: number }> {
  const depth = options.data?.depth ?? 0
  let keyList = keys
  if (typeof keyList === 'string') {
    keyList = [keyList]
  }

  for (const key of keyList) {
    const filepath = path.join(options.cwd, key)
    const stat = await fsp.stat(filepath).catch(() => null)
    if (stat) {
      yield {
        path: filepath,
        key,
        depth,
      }
    }
  }

  if (path.resolve(options.cwd) !== path.resolve(options.stopDir)) {
    yield* lookup(keys, { ...options, cwd: path.dirname(options.cwd), data: { depth: depth + 1 } })
  }
}

export async function findUpAll(
  manifest: PriorityManifest,
  options?: FindOptions
): Promise<FoundResult[]> {
  const normalizedOptions = {
    cwd: options?.cwd ?? process.cwd(),
    stopDir: options?.stopDir ?? path.parse(options?.cwd ?? process.cwd()).root,
  }

  const results: FoundResult[] = []
  for (const [priority, searchKey] of manifest.entries()) {
    for await (const found of lookup(searchKey, normalizedOptions)) {
      results.push({
        path: found.path,
        key: found.key,
        depth: found.depth,
        priority,
      })
    }
  }

  return results
}

export async function findUp(
  manifest: PriorityManifest,
  options?: FindOptions
): Promise<FoundResult | null> {
  const normalizedOptions = {
    cwd: options?.cwd ?? process.cwd(),
    stopDir: options?.stopDir ?? path.parse(options?.cwd ?? process.cwd()).root,
  }

  for (const [priority, searchKey] of manifest.entries()) {
    const found = await lookup(searchKey, normalizedOptions).next()
    if (found.value) {
      return {
        path: found.value.path,
        key: found.value.key,
        depth: found.value.depth,
        priority,
      }
    }
  }

  return null
}
