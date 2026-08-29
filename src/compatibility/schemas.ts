import { graphProposalJsonSchema } from '../proposal/schema.js'
import { contractSchemaIds, contractVersions } from './versions.js'

export interface JsonSchema {
  readonly [key: string]: unknown
  readonly $id?: string
  readonly $schema?: string
  readonly title?: string
  readonly type?: string
  readonly const?: string
  readonly properties?: Record<string, JsonSchema>
}

const graphShape: JsonSchema = graphProposalJsonSchema.properties.graph as unknown as JsonSchema

export const graphJsonSchema: JsonSchema = {
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  $id: contractSchemaIds.graph,
  title: 'Orbweaver Graph v1',
  ...graphShape,
} as const

export const graphDocumentJsonSchema: JsonSchema = {
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  $id: contractSchemaIds.graphDocument,
  title: 'Orbweaver GraphDocument v1',
  type: 'object',
  additionalProperties: false,
  required: ['format', 'version', 'graph'],
  properties: {
    format: { const: 'orbweaver-graph' },
    version: { const: contractVersions.graph },
    graph: graphShape,
  },
} as const

const point = {
  type: 'object',
  additionalProperties: false,
  required: ['x', 'y'],
  properties: { x: { type: 'number' }, y: { type: 'number' } },
} as const

const rectangleProperties = {
  x: { type: 'number' },
  y: { type: 'number' },
  width: { type: 'number', exclusiveMinimum: 0 },
  height: { type: 'number', exclusiveMinimum: 0 },
} as const

export const sceneJsonSchema: JsonSchema = {
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  $id: contractSchemaIds.scene,
  title: 'Orbweaver Scene v1',
  type: 'object',
  additionalProperties: false,
  required: ['width', 'height', 'nodes', 'edges', 'groups', 'graph'],
  properties: {
    width: { type: 'number', exclusiveMinimum: 0 },
    height: { type: 'number', exclusiveMinimum: 0 },
    nodes: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['nodeId', 'x', 'y', 'width', 'height'], properties: { nodeId: { type: 'string' }, ...rectangleProperties } } },
    edges: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['edgeId', 'points'], properties: { edgeId: { type: 'string' }, points: { type: 'array', minItems: 2, items: point }, label: { type: 'object', additionalProperties: false, required: ['x', 'y', 'width', 'height'], properties: rectangleProperties } } } },
    groups: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['groupId', 'x', 'y', 'width', 'height'], properties: { groupId: { type: 'string' }, ...rectangleProperties } } },
    graph: graphShape,
  },
} as const

export const sceneDocumentJsonSchema: JsonSchema = {
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  $id: contractSchemaIds.sceneDocument,
  title: 'Orbweaver SceneDocument v1',
  type: 'object',
  additionalProperties: false,
  required: ['format', 'version', 'scene'],
  properties: {
    format: { const: 'orbweaver-scene' },
    version: { const: contractVersions.scene },
    scene: sceneJsonSchema,
  },
} as const

export const portableHtmlArtifactManifestJsonSchema: JsonSchema = {
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  $id: contractSchemaIds.portableHtml,
  title: 'Orbweaver Portable HTML Manifest v1',
  type: 'object',
  additionalProperties: false,
  required: ['format', 'version', 'graph', 'summary', 'theme', 'allowThemeSwitch', 'themes'],
  properties: {
    format: { const: 'orbweaver-portable-html' },
    version: { const: contractVersions.portableHtml },
    graph: graphShape,
    summary: { type: 'string' },
    theme: { enum: ['dark', 'light'] },
    allowThemeSwitch: { type: 'boolean' },
    themes: { type: 'object' },
    provenance: { type: 'object' },
  },
} as const

const guarantees = {
  type: 'object',
  additionalProperties: false,
  required: ['accessibleText', 'semanticIdentity', 'semanticGraph', 'interaction', 'inspector', 'scalable'],
  properties: {
    accessibleText: { type: 'boolean' },
    semanticIdentity: { type: 'boolean' },
    semanticGraph: { enum: ['embedded', 'companion'] },
    interaction: { enum: ['host-provided', 'none'] },
    inspector: { enum: ['host-provided', 'none'] },
    scalable: { type: 'boolean' },
  },
} as const

export const svgArtifactManifestJsonSchema: JsonSchema = {
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  $id: contractSchemaIds.svg,
  title: 'Orbweaver SVG Manifest v1',
  type: 'object',
  additionalProperties: false,
  required: ['format', 'version', 'graph', 'summary', 'theme', 'guarantees'],
  properties: {
    format: { const: 'orbweaver-svg' },
    version: { const: contractVersions.svg },
    graph: graphShape,
    summary: { type: 'string' },
    theme: { type: 'string' },
    guarantees,
    provenance: { type: 'object' },
  },
} as const

export const pngArtifactManifestJsonSchema: JsonSchema = {
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  $id: contractSchemaIds.png,
  title: 'Orbweaver PNG Manifest v1',
  type: 'object',
  additionalProperties: false,
  required: ['format', 'version', 'graphId', 'summary', 'theme', 'width', 'height', 'scale', 'guarantees'],
  properties: {
    format: { const: 'orbweaver-png' },
    version: { const: contractVersions.png },
    graphId: { type: 'string' },
    summary: { type: 'string' },
    theme: { type: 'string' },
    width: { type: 'number', exclusiveMinimum: 0 },
    height: { type: 'number', exclusiveMinimum: 0 },
    scale: { type: 'number', exclusiveMinimum: 0 },
    guarantees,
    provenance: { type: 'object' },
  },
} as const

export const contractJsonSchemas: Readonly<{
  graph: JsonSchema
  graphDocument: JsonSchema
  scene: JsonSchema
  sceneDocument: JsonSchema
  graphProposal: JsonSchema
  portableHtml: JsonSchema
  svg: JsonSchema
  png: JsonSchema
}> = Object.freeze({
  graph: graphJsonSchema,
  graphDocument: graphDocumentJsonSchema,
  scene: sceneJsonSchema,
  sceneDocument: sceneDocumentJsonSchema,
  graphProposal: graphProposalJsonSchema,
  portableHtml: portableHtmlArtifactManifestJsonSchema,
  svg: svgArtifactManifestJsonSchema,
  png: pngArtifactManifestJsonSchema,
})
