import { expect, test } from 'vitest'
import updateNotifier from '../src/update-notifier.js'

test('Update', () => {
  const timeout = 5000

  return expect(updateNotifier(timeout)).resolves.toBeDefined()
})

test('Update Timeout', () => {
  const timeout = 1

  return expect(updateNotifier(timeout)).rejects.toMatch('请求超时')
})
