import {getInput} from '@actions/core'
import {context} from '@actions/github'
import {create} from '@actions/glob'
import {existsSync} from 'fs'
import {WorkflowArgs} from './api'

export async function resolvePath(path: string): Promise<string | undefined> {
  if (!existsSync(path)) {
    const globber = await create(path)
    const files = await globber.glob()
    if (files.length === 0) {
      return
    }
    return files[0]
  }
  return path
}

export async function resolveArgs(): Promise<WorkflowArgs> {
  const releasedArtifactName = getInput('released_artifact_name', {
    required: true
  })
  const artifactPath = getInput('artifact_path', {
    required: true
  })
  const maxIncreasePercentage = +getInput('max_increase_percentage', {
    required: true
  })
  const githubToken = getInput('github_token', {
    required: false
  })

  const resolvedArtifactPath = await resolvePath(artifactPath)
  if (!resolvedArtifactPath) {
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
    artifactPath: resolvedArtifactPath!,
    maxIncreasePercentage: maxIncreasePercentage,
    repository: {
      owner: context.repo.owner,
      name: context.repo.repo
    },
    token: githubToken
  }
}
