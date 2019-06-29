import {expect, test} from '@oclif/test'

describe('config', () => {
  test
    .stdout()
    .command(['config', '--format', 'yml', 'path', 'output'])
    .it('runs path output --format yml', ctx => {
      expect(ctx.stdout).to.contain('hello jeff')
    })
})
