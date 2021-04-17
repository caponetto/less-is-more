import {getLatestArtifact, matchRule, run, validateSize} from '../src/app'

describe('Get latest artifact', () => {
  it('should throw an error due to invalid name', async () => {
    await expect(
      getLatestArtifact({
        name: 'invalid',
        repository: {
          owner: 'caponetto',
          name: 'vscode-diff-viewer'
        }
      })
    ).rejects.toThrowError()
  })
  it('should throw an error due to invalid owner', async () => {
    await expect(
      getLatestArtifact({
        name: 'artifact-name',
        repository: {
          owner: 'invalid-owner-12345',
          name: 'vscode-diff-viewer'
        }
      })
    ).rejects.toThrowError()
  })
  it('should throw an error due to invalid repository', async () => {
    await expect(
      getLatestArtifact({
        name: 'artifact-name',
        repository: {
          owner: 'caponetto',
          name: 'invalid-repo-12345'
        }
      })
    ).rejects.toThrowError()
  })
  it('should find the expected artifact - Part of the name', async () => {
    const name = 'vscode_diff_viewer'
    const file = await getLatestArtifact({
      name: name,
      repository: {
        owner: 'caponetto',
        name: 'vscode-diff-viewer'
      }
    })
    expect(file.name).toMatch(name)
  })
  it('should find the expected artifact - Wildcard', async () => {
    const file = await getLatestArtifact({
      name: 'vscode_diff_viewer*.vsix',
      repository: {
        owner: 'caponetto',
        name: 'vscode-diff-viewer'
      }
    })
    expect(file.name).toMatch('vscode_diff_viewer')
  })
})

describe('Validate size', () => {
  it('should return decreased', async () => {
    expect(validateSize(50, 100, 100)).toBe('decreased')
    expect(validateSize(50, 100, 10)).toBe('decreased')
    expect(validateSize(50, 100, 0)).toBe('decreased')
  })
  it('should return same', async () => {
    expect(validateSize(100, 100, 100)).toBe('same')
    expect(validateSize(100, 100, 10)).toBe('same')
    expect(validateSize(100, 100, 0)).toBe('same')
  })
  it('should return increase_allowed', async () => {
    expect(validateSize(120, 100, 100)).toBe('increase_allowed')
    expect(validateSize(120, 100, 21)).toBe('increase_allowed')
    expect(validateSize(120, 100, 20)).toBe('increase_allowed')
  })

  it('should return increase_not_allowed', async () => {
    expect(validateSize(121, 100, 20)).toBe('increase_not_allowed')
    expect(validateSize(250, 100, 100)).toBe('increase_not_allowed')
  })
})

describe('Match rule', () => {
  it('should all be TRUE', () => {
    expect(matchRule('SameString', 'SameString')).toBeTruthy()
    expect(matchRule('StartABCD', 'Start*')).toBeTruthy()
    expect(matchRule('ABCDEnd', '*End')).toBeTruthy()
    expect(matchRule('StartABCDEnd', 'Start*End')).toBeTruthy()
    expect(matchRule('StartABCDMiddleABCDEnd', 'Start*Middle*End')).toBeTruthy()
  })
  it('should all be FALSE', () => {
    expect(matchRule('SameStringDiffCASE', 'SameStringDiffcase')).toBeFalsy()
    expect(matchRule('StartABCD', '*Start')).toBeFalsy()
    expect(matchRule('StartABCD', 'Start*DD')).toBeFalsy()
    expect(matchRule('ABCDEnd', 'End*')).toBeFalsy()
    expect(matchRule('StartABCDEnd', '*Start*End*')).toBeTruthy()
  })
})

describe('App run flow', () => {
  const testArtifactPath = '__tests__/resources/vscode_diff_viewer_1.1.2.zip'
  const testReleasedArtifactName = 'vscode_diff_viewer*.vsix'
  const testRepository = {
    owner: 'caponetto',
    name: 'vscode-diff-viewer'
  }
  it('should pass without errors', async () => {
    await run({
      releasedArtifactName: testReleasedArtifactName,
      artifactPath: testArtifactPath,
      maxIncreasePercentage: 70,
      repository: testRepository
    })
  })
  it('should throw an error', async () => {
    await expect(
      run({
        releasedArtifactName: testReleasedArtifactName,
        artifactPath: testArtifactPath,
        maxIncreasePercentage: 10,
        repository: testRepository
      })
    ).rejects.toThrowError()
  })
})
