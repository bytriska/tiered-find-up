export type SearchKey = string | string[]
export type PriorityList = SearchKey[]

export interface FindOptions {
  cwd?: string
  stopDir?: string
}

export interface FoundResult {
  path: string
  priorityScore: number
  matchedKey: string
  depth: number
}

// eslint-disable-next-line unused-imports/no-unused-vars
export function findTiered(keys: PriorityList, options?: FindOptions): FoundResult[] {
  return []
}

// eslint-disable-next-line unused-imports/no-unused-vars
export function findOne(keys: PriorityList, options?: FindOptions): FoundResult | null {
  return null
}
