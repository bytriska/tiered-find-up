import { describe, expect, it } from 'vitest'
import { findOne, findTiered } from '../src'
import { fixtures } from './utils'

const startDir = fixtures('workspace', 'packages', 'backend')

describe('findTiered', () => {
  it('should prioritize files based on array order in the same directory', () => {
    const keys = ['local.env', 'temp.txt']
    const results = findTiered(keys, { cwd: startDir, stopDir: fixtures() })

    expect(results).toHaveLength(2)

    expect(results[0]).toMatchObject({
      matchedKey: 'local.env',
      priorityScore: 0,
      depth: 0,
    })
    expect(results[0].path).toContain('local.env')

    expect(results[1].priorityScore).toBe(1)
    expect(results[1].path).toContain('temp.txt')
  })

  it('should find files in parent directories', () => {
    const keys = ['non-existent.file', 'package.json']
    const results = findTiered(keys, { cwd: startDir, stopDir: fixtures() })

    expect(results).toHaveLength(1)

    expect(results[0].path).toContain('package.json')
    expect(results[0].depth).toBeGreaterThan(0)
    expect(results[0].priorityScore).toBe(1)
  })

  it('should handle nested array keys as a single priority tier', () => {
    const keys = ['non-existent.file', ['config.json', 'local.env']]
    const results = findTiered(keys, { cwd: startDir, stopDir: fixtures() })

    expect(results).toHaveLength(2)

    expect(results[0].path).toContain('local.env')
    expect(results[0].priorityScore).toBe(1)
  })

  it('should stop traversing at stopDir', () => {
    const keys = ['config.json']
    const stopDir = fixtures('workspace')

    const results = findTiered(keys, { cwd: startDir, stopDir })

    expect(results).toHaveLength(0)
  })

  it('should sort result by priority score first, then depth', () => {
    const keys = ['config.json', 'local.env']
    const results = findTiered(keys, { cwd: startDir, stopDir: fixtures() })

    expect(results).toHaveLength(2)

    expect(results[0].path).toContain('config.json')
    expect(results[0].priorityScore).toBe(0)

    expect(results[1].path).toContain('local.env')
    expect(results[1].priorityScore).toBe(1)
  })
})

describe('findOne', () => {
  it('should prioritize files based on array order in the same directory', () => {
    const keys = ['local.env', 'temp.txt']
    const result = findOne(keys, { cwd: startDir, stopDir: fixtures() })

    expect(result).toMatchObject({
      matchedKey: 'local.env',
      priorityScore: 0,
      depth: 0,
    })
    expect(result?.path).toContain('local.env')
  })

  it('should find files in parent directories', () => {
    const keys = ['non-existent.file', 'package.json']
    const result = findOne(keys, { cwd: startDir, stopDir: fixtures() })

    expect(result?.path).toContain('package.json')
    expect(result?.depth).toBeGreaterThan(0)
    expect(result?.priorityScore).toBe(1)
  })

  it('should handle nested array keys as a single priority tier', () => {
    const keys = ['non-existent.file', ['config.json', 'local.env']]
    const result = findOne(keys, { cwd: startDir, stopDir: fixtures() })

    expect(result?.path).toContain('local.env')
    expect(result?.priorityScore).toBe(1)
  })

  it('should stop traversing at stopDir', () => {
    const keys = ['config.json']
    const stopDir = fixtures('workspace')

    const result = findOne(keys, { cwd: startDir, stopDir })

    expect(result).toBeNull()
  })

  it('should sort result by priority score first, then depth', () => {
    const keys = ['config.json', 'local.env']
    const result = findOne(keys, { cwd: startDir, stopDir: fixtures() })

    expect(result?.path).toContain('config.json')
    expect(result?.priorityScore).toBe(0)
  })
})
