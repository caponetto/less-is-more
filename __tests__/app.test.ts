import {get_latest_artifact, validate_size} from '../src/app'

describe('Get latest artifact', () => {
  it('Invalid artifact', async () => {
    await expect(
      get_latest_artifact({
        name: 'invalid',
        owner: 'caponetto',
        repo: 'vscode-diff-viewer'
      })
    ).rejects.toThrowError()
  })
  it('Invalid owner', async () => {
    await expect(
      get_latest_artifact({
        name: 'artifact-name',
        owner: 'invalid-owner-12345',
        repo: 'vscode-diff-viewer'
      })
    ).rejects.toThrowError()
  })
  it('Invalid repo', async () => {
    await expect(
      get_latest_artifact({
        name: 'artifact-name',
        owner: 'caponetto',
        repo: 'invalid-repo-12345'
      })
    ).rejects.toThrowError()
  })
  it('Latest artifact found', async () => {
    const name = 'vscode_diff_viewer'
    const artifact = await get_latest_artifact({
      name: name,
      owner: 'caponetto',
      repo: 'vscode-diff-viewer'
    })
    expect(artifact.name).toMatch(name)
  })
})

describe('Validate size', () => {
  it('Current size has decreased', async () => {
    expect(validate_size(100, 50, 100)).toBe('decreased')
    expect(validate_size(100, 50, 10)).toBe('decreased')
    expect(validate_size(100, 50, 0)).toBe('decreased')
  })
  it('Current size is the same', async () => {
    expect(validate_size(100, 100, 100)).toBe('same')
    expect(validate_size(100, 100, 10)).toBe('same')
    expect(validate_size(100, 100, 0)).toBe('same')
  })
  it('Current size has increased - allowed', async () => {
    expect(validate_size(100, 120, 100)).toBe('increase_allowed')
    expect(validate_size(100, 120, 21)).toBe('increase_allowed')
    expect(validate_size(100, 120, 20)).toBe('increase_allowed')
  })

  it('Current size has increased - not allowed', async () => {
    expect(validate_size(100, 121, 20)).toBe('increase_not_allowed')
    expect(validate_size(100, 250, 100)).toBe('increase_not_allowed')
  })
})
