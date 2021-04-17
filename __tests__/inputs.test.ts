import {join} from 'path'
import * as inputs from '../src/inputs'

describe('Resolve path', () => {
  it('should return a valid path - Full path', async () => {
    const expected = '__tests__/resources/vscode_diff_viewer_1.1.2.zip'
    const path = await inputs.resolvePath(
      '__tests__/resources/vscode_diff_viewer_1.1.2.zip'
    )
    expect(path).toMatch(expected)
  })
  it('should return a valid path - Full path with wildcard', async () => {
    const expected = join(
      '__tests__',
      'resources',
      'vscode_diff_viewer_1.1.2.zip'
    )
    const path = await inputs.resolvePath(
      '__tests__/resources/vscode_diff_viewer_*.zip'
    )
    expect(path).toMatch(expected)
  })
  it('should return a valid path - Any folder', async () => {
    const expected = join(
      '__tests__',
      'resources',
      'vscode_diff_viewer_1.1.2.zip'
    )
    const path = await inputs.resolvePath('**/vscode_diff_viewer_1.1.2.zip')
    expect(path).toMatch(expected)
  })
  it('should return a valid path - Any folder with wildcard', async () => {
    const expected = join(
      '__tests__',
      'resources',
      'vscode_diff_viewer_1.1.2.zip'
    )
    const path = await inputs.resolvePath('**/vscode_diff_viewer_*.zip')
    expect(path).toMatch(expected)
  })
  it('should not find any path - Invalid full path', async () => {
    const path = await inputs.resolvePath(
      '__tests__/resources/vscode_diff_viewer_1.1.2.tar.gz'
    )
    expect(path).toBeUndefined()
  })
  it('should not find any path - Invalid path with wildcard', async () => {
    const path = await inputs.resolvePath(
      '__tests__/resources/vscode_diff_viewer_*.tar.gz'
    )
    expect(path).toBeUndefined()
  })
})
