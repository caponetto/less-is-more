export interface WorkflowArgs {
  releasedArtifactName: string
  artifactPath: string
  maxIncreasePercentage: number
  owner: string
  repo: string
  token?: string
}
