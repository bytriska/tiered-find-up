import { describe, expect, it } from 'vitest'
import { findUp, findUpAll } from '../src'
import { fixtures } from './utils'

const startDir = fixtures('workspace', 'packages', 'backend')

describe('findUpAll', () => {
  it('should prioritize files based on array order in the same directory', async () => {
    const keys = ['local.env', 'temp.txt']
    const results = await findUpAll(keys, { cwd: startDir, stopDir: fixtures() })

    expect(results).toHaveLength(2)

    expect(results[0]).toMatchObject({
      key: 'local.env',
      priority: 0,
      depth: 0,
    })
    expect(results[0].path).toContain('local.env')

    expect(results[1].priority).toBe(1)
    expect(results[1].path).toContain('temp.txt')
  })

  it('should find files in parent directories', async () => {
    const keys = ['non-existent.file', 'package.json']
    const results = await findUpAll(keys, { cwd: startDir, stopDir: fixtures() })

    expect(results).toHaveLength(1)

    expect(results[0].path).toContain('package.json')
    expect(results[0].depth).toBeGreaterThan(0)
    expect(results[0].priority).toBe(1)
  })

  it('should handle nested array keys as a single priority tier', async () => {
    const keys = ['non-existent.file', ['config.json', 'local.env']]
    const results = await findUpAll(keys, { cwd: startDir, stopDir: fixtures() })

    expect(results).toHaveLength(2)

    expect(results[0].path).toContain('local.env')
    expect(results[0].priority).toBe(1)
  })

  it('should stop traversing at stopDir', async () => {
    const keys = ['config.json']
    const stopDir = fixtures('workspace')

    const results = await findUpAll(keys, { cwd: startDir, stopDir })

    expect(results).toHaveLength(0)
  })

  it('should sort result by priority score first, then depth', async () => {
    const keys = ['config.json', 'local.env']
    const results = await findUpAll(keys, { cwd: startDir, stopDir: fixtures() })

    expect(results).toHaveLength(2)

    expect(results[0].path).toContain('config.json')
    expect(results[0].priority).toBe(0)

    expect(results[1].path).toContain('local.env')
    expect(results[1].priority).toBe(1)
  })

  it('should resolve to process.cwd() when no options provided', async () => {
    const keys = ['package.json']
    const results = await findUpAll(keys)

    expect(results.length).toBeGreaterThan(0)

    expect(results[0].path).toContain('package.json')
    expect(results[0].depth).toBe(0)
  })
})

describe('findUp', () => {
  it('should prioritize files based on array order in the same directory', async () => {
    const keys = ['local.env', 'temp.txt']
    const result = await findUp(keys, { cwd: startDir, stopDir: fixtures() })

    expect(result).not.toBeNull()

    expect(result).toMatchObject({
      key: 'local.env',
      priority: 0,
      depth: 0,
    })
    expect(result?.path).toContain('local.env')
  })

  it('should find files in parent directories', async () => {
    const keys = ['non-existent.file', 'package.json']
    const result = await findUp(keys, { cwd: startDir, stopDir: fixtures() })

    expect(result).not.toBeNull()

    expect(result?.path).toContain('package.json')
    expect(result?.depth).toBeGreaterThan(0)
    expect(result?.priority).toBe(1)
  })

  it('should handle nested array keys as a single priority tier', async () => {
    const keys = ['non-existent.file', ['config.json', 'local.env']]
    const result = await findUp(keys, { cwd: startDir, stopDir: fixtures() })

    expect(result).not.toBeNull()

    expect(result?.path).toContain('local.env')
    expect(result?.priority).toBe(1)
  })

  it('should stop traversing at stopDir', async () => {
    const keys = ['config.json']
    const stopDir = fixtures('workspace')

    const result = await findUp(keys, { cwd: startDir, stopDir })

    expect(result).toBeNull()
  })

  it('should sort result by priority score first, then depth', async () => {
    const keys = ['config.json', 'local.env']
    const result = await findUp(keys, { cwd: startDir, stopDir: fixtures() })

    expect(result).not.toBeNull()

    expect(result?.path).toContain('config.json')
    expect(result?.priority).toBe(0)
  })

  it('should resolve to process.cwd() when no options provided', async () => {
    const keys = ['package.json']
    const results = await findUp(keys)

    expect(results).not.toBeNull()

    expect(results?.path).toContain('package.json')
    expect(results?.depth).toBe(0)
  })
})
