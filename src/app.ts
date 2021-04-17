import {request} from '@octokit/request'
import {statSync} from 'fs'
import {basename} from 'path'
import {Artifact, SizeCheckResult, WorkflowArgs} from './api'

export async function getLatestArtifact(
  releasedArtifact: Artifact,
  token?: string
): Promise<Artifact> {
  const response = await request({
    method: 'GET',
    url: '/repos/{owner}/{repo}/releases',
    owner: releasedArtifact.repository!.owner,
    repo: releasedArtifact.repository!.name,
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
    size: latestArtifact.size,
    repository: releasedArtifact.repository
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

function printInfo(current: Artifact, released: Artifact): void {
  console.log(
    `The size of the current artifact "${current.name}" is ${current.size} bytes.`
  )
  console.log(
    `The size of the released artifact "${released.name}" is ${released.size} bytes.`
  )
}

export async function run(args: WorkflowArgs): Promise<void> {
  const latestReleasedArtifact = await getLatestArtifact(
    {
      name: args.releasedArtifactName,
      repository: {
        owner: args.repository.owner,
        name: args.repository.name
      }
    },
    args.token
  )

  const currentArtifact = {
    name: basename(args.artifactPath),
    size: statSync(args.artifactPath).size
  }

  printInfo(currentArtifact, latestReleasedArtifact)

  const result = validateSize(
    currentArtifact.size,
    latestReleasedArtifact.size!,
    args.maxIncreasePercentage
  )

  if (result === 'increase_not_allowed') {
    throw new Error('Check the artifact size. Less is more!')
  }
}
