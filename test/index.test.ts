import { describe, expect, it } from 'vitest'
import { resolveAll, resolveOne } from '../src'
import { fixtures } from './utils'

const startDir = fixtures('workspace', 'packages', 'backend')

describe('resolveAll', () => {
  it('should prioritize files based on array order in the same directory', async () => {
    const keys = ['local.env', 'temp.txt']
    const results = await resolveAll(keys, { cwd: startDir, boundaryDir: fixtures() })

    expect(results).toHaveLength(2)

    expect(results[0]).toMatchObject({
      identifier: 'local.env',
      priority: 0,
      distance: 0,
    })
    expect(results[0].path).toContain('local.env')

    expect(results[1].priority).toBe(1)
    expect(results[1].path).toContain('temp.txt')
  })

  it('should find files in parent directories', async () => {
    const keys = ['non-existent.file', 'package.json']
    const results = await resolveAll(keys, { cwd: startDir, boundaryDir: fixtures() })

    expect(results).toHaveLength(1)

    expect(results[0].path).toContain('package.json')
    expect(results[0].distance).toBeGreaterThan(0)
    expect(results[0].priority).toBe(1)
  })

  it('should handle nested array keys as a single priority tier', async () => {
    const keys = ['non-existent.file', ['config.json', 'local.env']]
    const results = await resolveAll(keys, { cwd: startDir, boundaryDir: fixtures() })

    expect(results).toHaveLength(2)

    expect(results[0].path).toContain('local.env')
    expect(results[0].priority).toBe(1)
  })

  it('should stop traversing at boundaryDir', async () => {
    const keys = ['config.json']
    const stopDir = fixtures('workspace')

    const results = await resolveAll(keys, { cwd: startDir, boundaryDir: stopDir })

    expect(results).toHaveLength(0)
  })

  it('should sort result by priority score first, then distance', async () => {
    const keys = ['config.json', 'local.env']
    const results = await resolveAll(keys, { cwd: startDir, boundaryDir: fixtures() })

    expect(results).toHaveLength(2)

    expect(results[0].path).toContain('config.json')
    expect(results[0].priority).toBe(0)
    expect(results[0].distance).toBeGreaterThan(0)

    expect(results[1].path).toContain('local.env')
    expect(results[1].priority).toBe(1)
  })

  it('should resolve to process.cwd() when no options provided', async () => {
    const keys = ['package.json']
    const results = await resolveAll(keys)

    expect(results.length).toBeGreaterThan(0)

    expect(results[0].path).toContain('package.json')
    expect(results[0].distance).toBe(0)
  })
})

describe('resolveOne', () => {
  it('should prioritize files based on array order in the same directory', async () => {
    const keys = ['local.env', 'temp.txt']
    const result = await resolveOne(keys, { cwd: startDir, boundaryDir: fixtures() })

    expect(result).not.toBeNull()

    expect(result).toMatchObject({
      identifier: 'local.env',
      priority: 0,
      distance: 0,
    })
    expect(result?.path).toContain('local.env')
  })

  it('should find files in parent directories', async () => {
    const keys = ['non-existent.file', 'package.json']
    const result = await resolveOne(keys, { cwd: startDir, boundaryDir: fixtures() })

    expect(result).not.toBeNull()

    expect(result?.path).toContain('package.json')
    expect(result?.distance).toBeGreaterThan(0)
    expect(result?.priority).toBe(1)
  })

  it('should handle nested array keys as a single priority tier', async () => {
    const keys = ['non-existent.file', ['config.json', 'local.env']]
    const result = await resolveOne(keys, { cwd: startDir, boundaryDir: fixtures() })

    expect(result).not.toBeNull()

    expect(result?.path).toContain('local.env')
    expect(result?.priority).toBe(1)
  })

  it('should stop traversing at boundaryDir', async () => {
    const keys = ['config.json']
    const stopDir = fixtures('workspace')

    const result = await resolveOne(keys, { cwd: startDir, boundaryDir: stopDir })

    expect(result).toBeNull()
  })

  it('should sort result by priority score first, then distance', async () => {
    const keys = ['config.json', 'local.env']
    const result = await resolveOne(keys, { cwd: startDir, boundaryDir: fixtures() })

    expect(result).not.toBeNull()

    expect(result?.path).toContain('config.json')
    expect(result?.priority).toBe(0)
  })

  it('should resolve to process.cwd() when no options provided', async () => {
    const keys = ['package.json']
    const results = await resolveOne(keys)

    expect(results).not.toBeNull()

    expect(results?.path).toContain('package.json')
    expect(results?.distance).toBe(0)
  })
})
