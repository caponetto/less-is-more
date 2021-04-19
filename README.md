[![CI](https://github.com/caponetto/less-is-more/actions/workflows/CI.yml/badge.svg)](https://github.com/caponetto/less-is-more/actions/workflows/CI.yml)
[![CodeQL](https://github.com/caponetto/less-is-more/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/caponetto/less-is-more/actions/workflows/codeql-analysis.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub release](https://img.shields.io/github/release/caponetto/less-is-more.svg)](https://gitHub.com/caponetto/less-is-more/releases/)

# less-is-more

This workflow will simply fail if the current artifact size has increased more than what is allowed when compared to the latest released artifact. It could be very useful to early identify unwanted size increases, especially on workflows that run for pull requests.

## Required input arguments
- **released_artifact_name**: The filename of the released artifact (or a unique part of it).
- **artifact_path**: The path of the current artifact that has been built (or a unique part of it).
- **max_increase_percentage**: The maximum increase percentage allowed.

## Optional input arguments
- **github_token**: The token to authenticate Octokit (increases your API rate limit).
- **fail_execution**: Fail the execution if the artifact is bigger than allowed (default: true).

## Usage
**Example**: I want this workflow to fail if the artifact size that I'm building at `dist/my-artifact.zip` has increased more than *10%* when compared to `my-released-artifact`, which is located on GitHub's releases page.

**Note**: If your released artifact contains variable parts, such as version, you can omit it. So `my-released-artifact_v1.0.0.zip` can be simply `my-released-artifact`, or even `my-released-artifact_*.zip`.

```yaml
# Build the artifact before using this workflow.

- uses: caponetto/less-is-more@v0.0.6
  with:
    released_artifact_name: my-released-artifact
    artifact_path: dist/my-artifact.zip
    max_increase_percentage: 10
    github_token: ${{ secrets.MY_TOKEN }}

```
## Contribute
All contributions are welcome, so don't hesitate to submit a pull request. ;-)

## License
This code is released under MIT License.

Check [LICENSE](LICENSE) file for more information.
