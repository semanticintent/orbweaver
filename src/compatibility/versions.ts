export const contractVersions = Object.freeze({
  graph: '1',
  scene: '1',
  graphProposal: '1',
  portableHtml: '1',
  svg: '1',
  png: '1',
} as const)

export const contractSchemaIds = Object.freeze({
  graph: 'https://orbweaver.semanticintent.dev/schema/graph-1.json',
  graphDocument: 'https://orbweaver.semanticintent.dev/schema/graph-document-1.json',
  scene: 'https://orbweaver.semanticintent.dev/schema/scene-1.json',
  sceneDocument: 'https://orbweaver.semanticintent.dev/schema/scene-document-1.json',
  graphProposal: 'https://orbweaver.semanticintent.dev/schema/graph-proposal-1.json',
  portableHtml: 'https://orbweaver.semanticintent.dev/schema/portable-html-manifest-1.json',
  svg: 'https://orbweaver.semanticintent.dev/schema/svg-manifest-1.json',
  png: 'https://orbweaver.semanticintent.dev/schema/png-manifest-1.json',
} as const)

export const graphSchemaVersion = contractVersions.graph
export const sceneSchemaVersion = contractVersions.scene
export const graphProposalSchemaVersion = contractVersions.graphProposal
