import {run} from '../src/app'

describe('Entire flow', () => {
  it('should pass without errors', async () => {
    await run({
      releasedArtifactName: 'vscode_diff_viewer*.vsix',
      artifactPath: '__tests__/resources/vscode_diff_viewer_1.1.2.zip',
      maxIncreasePercentage: 70,
      owner: 'caponetto',
      repo: 'vscode-diff-viewer'
    })
  })
  it('should throw an error', async () => {
    await expect(
      run({
        releasedArtifactName: 'vscode_diff_viewer*.vsix',
        artifactPath: 'test-resources/vscode_diff_viewer_1.1.2.zip',
        maxIncreasePercentage: 10,
        owner: 'caponetto',
        repo: 'vscode-diff-viewer'
      })
    ).rejects.toThrowError()
  })
})
