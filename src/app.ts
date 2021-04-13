import {getInput} from '@actions/core'
import {context} from '@actions/github'
import {request} from '@octokit/request'
import {existsSync, statSync} from 'fs'

interface WorkflowArgs {
  released_artifact_name: string
  artifact_path: string
  max_increase_percentage: number
  owner: string
  repo: string
  token?: string
}

export interface Artifact {
  name: string
  owner: string
  repo: string
}

export type SizeCheckResult =
  | 'decreased'
  | 'same'
  | 'increase_allowed'
  | 'increase_not_allowed'

function resolve_args(): WorkflowArgs {
  const released_artifact_name = getInput('released_artifact_name')
  const artifact_path = getInput('artifact_path')
  const max_increase_percentage = +getInput('max_increase_percentage')
  const github_token = getInput('github_token')

  if (!existsSync(artifact_path)) {
    throw new Error(
      `The artifact could not be found at "${artifact_path}". Have you built it already?`
    )
  }

  if (max_increase_percentage <= 0) {
    throw new Error(
      'The input `max_increase_percentage` must be an integer greater than zero.'
    )
  }

  return {
    released_artifact_name: released_artifact_name,
    artifact_path: artifact_path,
    max_increase_percentage: max_increase_percentage,
    owner: context.repo.owner,
    repo: context.repo.repo,
    token: github_token
  }
}

export async function get_latest_artifact(
  released_artifact: Artifact,
  token?: string
): Promise<any> {
  const response = await request({
    method: 'GET',
    url: '/repos/{owner}/{repo}/releases',
    owner: released_artifact.owner,
    repo: released_artifact.repo,
    ...(token && {
      headers: {
        authorization: `token ${token}`
      }
    })
  })

  const latest_artifact = response.data[0].assets.find((o: any) =>
    o.name.includes(released_artifact.name)
  )

  if (!latest_artifact) {
    throw new Error(
      `The artifact ${released_artifact.name} could not be found.`
    )
  }

  return latest_artifact
}

export function validate_size(
  latest_artifact_size: number,
  current_artifact_size: number,
  max_increase_percentage: number
): SizeCheckResult {
  if (latest_artifact_size > current_artifact_size) {
    console.log('The current artifact size has decreased. Great!')
    return 'decreased'
  }

  if (latest_artifact_size === current_artifact_size) {
    console.log('The current artifact size has not changed.')
    return 'same'
  }

  const increase_percentage = Math.round(
    (current_artifact_size * 100) / latest_artifact_size - 100
  )

  if (increase_percentage <= max_increase_percentage) {
    console.log(
      `The current artifact size has increased ${increase_percentage}%, which *is* allowed.`
    )
    return 'increase_allowed'
  }

  console.log(
    `The current artifact size has increased ${increase_percentage}%, which *is not* allowed.`
  )
  return 'increase_not_allowed'
}

export async function run(): Promise<void> {
  const args = resolve_args()
  const latest_artifact = await get_latest_artifact({
    name: args.released_artifact_name,
    owner: args.owner,
    repo: args.repo
  })
  const current_artifact_stats = statSync(args.artifact_path)
  const result = validate_size(
    latest_artifact.size,
    current_artifact_stats.size,
    args.max_increase_percentage
  )

  if (result === 'increase_not_allowed') {
    throw new Error('Check the artifact size. Less is more!')
  }
}
