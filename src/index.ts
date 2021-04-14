import {getInput, setFailed} from '@actions/core'
import {context} from '@actions/github'
import {existsSync} from 'fs'
import {run} from './app'
import {WorkflowArgs} from './WorkflowArgs'

function resolveArgs(): WorkflowArgs {
  const releasedArtifactName = getInput('released_artifact_name')
  const artifactPath = getInput('artifact_path')
  const maxIncreasePercentage = +getInput('max_increase_percentage')
  const githubToken = getInput('github_token')

  if (!existsSync(artifactPath)) {
    throw new Error(
      `The artifact could not be found at "${artifactPath}". Have you built it already?`
    )
  }

  if (maxIncreasePercentage <= 0) {
    throw new Error(
      'The input `max_increase_percentage` must be an integer greater than zero.'
    )
  }

  return {
    releasedArtifactName: releasedArtifactName,
    artifactPath: artifactPath,
    maxIncreasePercentage: maxIncreasePercentage,
    owner: context.repo.owner,
    repo: context.repo.repo,
    token: githubToken
  }
}

run(resolveArgs()).catch(e => setFailed(e.message))
