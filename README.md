# less-is-more v0.0.2

This workflow will simply fail if the current artifact size has increased more than what is allowed when compared to the latest released artifact. It could be very useful to early identify unwanted size increases, especially on workflows that run for pull requests.

## Required input arguments
- **released_artifact_name**: The filename of the released artifact (or part of it).
- **artifact_path**: The path of the current artifact that has been built.
- **max_increase_percentage**: The maximum increase percentage allowed.
## Usage
**Example**: I want this workflow to fail if the artifact size that I'm building at `dist/my-artifact.zip` has increased more than *10%* when compared to `my-released-artifact`, which is located on GitHub's releases page.

**Note**: If your released artifact contains variable parts, such as version, you can omit it. So `my-released-artifact_v1.0.0.zip` can be simply `my-released-artifact`.

```yaml
# Build the artifact before using this workflow.

- uses: caponetto/less-is-more@v0.0.2
  with:
    released_artifact_name: my-released-artifact
    artifact_path: dist/my-artifact.zip
    max_increase_percentage: 10

```
## Contribute
All contributions are welcome, so don't hesitate to submit a pull request. ;-)

## License
This code is released under MIT License.

Check [LICENSE](LICENSE) file for more information.
