export interface Artifact {
  name: string
  repository?: RepositoryInfo
  size?: number
}

export type SizeCheckResult =
  | 'decreased'
  | 'same'
  | 'increase_allowed'
  | 'increase_not_allowed'

export interface WorkflowArgs {
  releasedArtifactName: string
  artifactPath: string
  maxIncreasePercentage: number
  repository: RepositoryInfo
  token?: string
}

export interface RepositoryInfo {
  owner: string
  name: string
}
