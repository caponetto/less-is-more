import {getLatestArtifactFile, matchRule, validateSize, run} from '../src/app'
import {WorkflowArgs} from '../src/WorkflowArgs'

describe('Get latest artifact', () => {
  it('should throw an error due to invalid name', async () => {
    await expect(
      getLatestArtifactFile({
        name: 'invalid',
        owner: 'caponetto',
        repo: 'vscode-diff-viewer'
      })
    ).rejects.toThrowError()
  })
  it('should throw an error due to invalid owner', async () => {
    await expect(
      getLatestArtifactFile({
        name: 'artifact-name',
        owner: 'invalid-owner-12345',
        repo: 'vscode-diff-viewer'
      })
    ).rejects.toThrowError()
  })
  it('should throw an error due to invalid repository', async () => {
    await expect(
      getLatestArtifactFile({
        name: 'artifact-name',
        owner: 'caponetto',
        repo: 'invalid-repo-12345'
      })
    ).rejects.toThrowError()
  })
  it('should find the expected artifact - Part of the name', async () => {
    const name = 'vscode_diff_viewer'
    const file = await getLatestArtifactFile({
      name: name,
      owner: 'caponetto',
      repo: 'vscode-diff-viewer'
    })
    expect(file.name).toMatch(name)
  })
  it('should find the expected artifact - Wildcard', async () => {
    const file = await getLatestArtifactFile({
      name: 'vscode_diff_viewer*.vsix',
      owner: 'caponetto',
      repo: 'vscode-diff-viewer'
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
