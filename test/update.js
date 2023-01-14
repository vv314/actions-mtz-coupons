import updateNotifier from '../lib/update-notifier'

test('检查更新', () => {
  const timeout = 5000

  return expect(updateNotifier(timeout)).resolves.toBeDefined()
})

test('超时设置', () => {
  const timeout = 1

  return expect(updateNotifier(timeout)).rejects.toMatch('请求超时')
})
