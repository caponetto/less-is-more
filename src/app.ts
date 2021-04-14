import {request} from '@octokit/request'
import {statSync} from 'fs'
import {basename} from 'path'
import {WorkflowArgs} from './WorkflowArgs'

interface File {
  name: string
  size: number
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

export async function getLatestArtifactFile(
  releasedArtifact: Artifact,
  token?: string
): Promise<File> {
  const response = await request({
    method: 'GET',
    url: '/repos/{owner}/{repo}/releases',
    owner: releasedArtifact.owner,
    repo: releasedArtifact.repo,
    ...(token && {
      headers: {
        authorization: `token ${token}`
      }
    })
  })

  const latestArtifact = response.data[0].assets.find(
    (o: any) =>
      o.name.includes(releasedArtifact.name) ||
      matchRule(o.name, releasedArtifact.name)
  )

  if (!latestArtifact) {
    throw new Error(`The artifact ${releasedArtifact.name} could not be found.`)
  }

  return {
    name: latestArtifact.name,
    size: latestArtifact.size
  }
}

export function validateSize(
  currentSize: number,
  releasedSize: number,
  maxIncreasePercentage: number
): SizeCheckResult {
  if (releasedSize > currentSize) {
    console.log('The current artifact size has decreased. Great!')
    return 'decreased'
  }

  if (releasedSize === currentSize) {
    console.log('The current artifact size has not changed.')
    return 'same'
  }

  const increasePercentage = Math.round(
    (currentSize * 100) / releasedSize - 100
  )

  if (increasePercentage <= maxIncreasePercentage) {
    console.log(
      `The current artifact size has increased ${increasePercentage}%, which *is* allowed.`
    )
    return 'increase_allowed'
  }

  console.log(
    `The current artifact size has increased ${increasePercentage}%, which *is not* allowed.`
  )
  return 'increase_not_allowed'
}

export function matchRule(target: string, rule: string): boolean {
  return new RegExp(
    '^' +
      rule
        .split('*')
        .map((s: string) => s.replace(/([.*+?^=!:${}()|[\]/\\])/g, '\\$1'))
        .join('.*') +
      '$'
  ).test(target)
}

function printInfo(current: File, released: File): void {
  console.log(
    `The size of the current file "${current.name}" is ${current.size} bytes.`
  )
  console.log(
    `The size of the released file "${released.name}" is ${released.size} bytes.`
  )
}

export async function run(args: WorkflowArgs): Promise<void> {
  const latestReleasedFile = await getLatestArtifactFile(
    {
      name: args.releasedArtifactName,
      owner: args.owner,
      repo: args.repo
    },
    args.token
  )

  const currentFile = {
    name: basename(args.artifactPath),
    size: statSync(args.artifactPath).size
  }

  printInfo(currentFile, latestReleasedFile)

  const result = validateSize(
    currentFile.size,
    latestReleasedFile.size,
    args.maxIncreasePercentage
  )

  if (result === 'increase_not_allowed') {
    throw new Error('Check the artifact size. Less is more!')
  }
}
