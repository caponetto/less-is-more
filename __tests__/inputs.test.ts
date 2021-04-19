import {join} from 'path'
import {resolveArgs, resolvePath} from '../src/inputs'

describe('Resolve path', () => {
  it('should return a valid path - Full path', async () => {
    const expected = '__tests__/resources/test_artifact_1.1.2.zip'
    const path = await resolvePath(
      '__tests__/resources/test_artifact_1.1.2.zip'
    )
    expect(path).toMatch(expected)
  })
  it('should return a valid path - Full path with wildcard', async () => {
    const expected = join('__tests__', 'resources', 'test_artifact_1.1.2.zip')
    const path = await resolvePath('__tests__/resources/test_artifact_*.zip')
    expect(path).toMatch(expected)
  })
  it('should return a valid path - Any folder', async () => {
    const expected = join('__tests__', 'resources', 'test_artifact_1.1.2.zip')
    const path = await resolvePath('**/test_artifact_1.1.2.zip')
    expect(path).toMatch(expected)
  })
  it('should return a valid path - Any folder with wildcard', async () => {
    const expected = join('__tests__', 'resources', 'test_artifact_1.1.2.zip')
    const path = await resolvePath('**/test_artifact_*.zip')
    expect(path).toMatch(expected)
  })
  it('should not find any path - Invalid full path', async () => {
    const path = await resolvePath(
      '__tests__/resources/test_artifact_1.1.2.tar.gz'
    )
    expect(path).toBeUndefined()
  })
  it('should not find any path - Invalid path with wildcard', async () => {
    const path = await resolvePath('__tests__/resources/test_artifact_*.tar.gz')
    expect(path).toBeUndefined()
  })
})

describe('Resolve args', () => {
  const setInput = (name: string, value: string) =>
    (process.env[`INPUT_${name.replace(/ /g, '_').toUpperCase()}`] = value)

  const setContext = (name: string, value: string) =>
    (process.env[`GITHUB_${name.replace(/ /g, '_').toUpperCase()}`] = value)

  it('should throw an error due to path not found', async () => {
    setInput('released_artifact_name', 'some/path')
    setInput('artifact_path', 'some/path')
    setInput('max_increase_percentage', '10')

    await expect(resolveArgs()).rejects.toThrowError()
  })

  it('should throw an error due to invalid max_increase_percentage', async () => {
    setInput('released_artifact_name', 'some/path')
    setInput('artifact_path', '__tests__/resources/test_artifact_1.1.2.zip')
    setInput('max_increase_percentage', 'invalid_value')

    await expect(resolveArgs()).rejects.toThrowError()
  })

  it('should throw an error due to negative max_increase_percentage', async () => {
    setInput('released_artifact_name', 'some/path')
    setInput('artifact_path', '__tests__/resources/test_artifact_1.1.2.zip')
    setInput('max_increase_percentage', '-10')

    await expect(resolveArgs()).rejects.toThrowError()
  })

  it('should return the resolved args - Default values for optional args', async () => {
    setInput('released_artifact_name', 'some/path')
    setInput('artifact_path', '__tests__/resources/test_artifact_1.1.2.zip')
    setInput('max_increase_percentage', '10')

    setContext('repository', 'caponetto/less-is-more-tests')

    const args = await resolveArgs()

    expect(args).toStrictEqual({
      releasedArtifactName: 'some/path',
      artifactPath: '__tests__/resources/test_artifact_1.1.2.zip',
      maxIncreasePercentage: 10,
      repository: {
        owner: 'caponetto',
        name: 'less-is-more-tests'
      },
      failExecution: true,
      token: ''
    })
  })

  it('should return the resolved args - Optional args set', async () => {
    setInput('released_artifact_name', 'some/path')
    setInput('artifact_path', '__tests__/resources/test_artifact_1.1.2.zip')
    setInput('max_increase_percentage', '10')
    setInput('github_token', 'MY_TOKEN')
    setInput('fail_execution', 'false')

    setContext('repository', 'caponetto/less-is-more-tests')

    const args = await resolveArgs()

    expect(args).toStrictEqual({
      releasedArtifactName: 'some/path',
      artifactPath: '__tests__/resources/test_artifact_1.1.2.zip',
      maxIncreasePercentage: 10,
      repository: {
        owner: 'caponetto',
        name: 'less-is-more-tests'
      },
      failExecution: false,
      token: 'MY_TOKEN'
    })
  })
})
