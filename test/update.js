import updateNotifier from '../src/update-notifier.js'

test('Test Update', () => {
  const timeout = 5000

  return expect(updateNotifier(timeout)).resolves.toBeDefined()
})

test('Test Update Timeout', () => {
  const timeout = 1

  return expect(updateNotifier(timeout)).rejects.toMatch('请求超时')
})
