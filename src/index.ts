export { GraphValidationError, LayoutError, OrbweaverError } from './errors.js'
export { summarizeGraph } from './accessibility/summarize.js'
export {
  getGroupNodes,
  getAnnotations,
  getIncidentEdges,
  getIncomingEdges,
  getNeighbors,
  getOutgoingEdges,
} from './graph/queries.js'
export { mountSvgInteraction } from './interaction/controller.js'
export type { SvgInteractionController, SvgInteractionOptions } from './interaction/controller.js'
export { mountSvgViewport } from './interaction/viewport.js'
export type {
  SvgViewportController,
  SvgViewportOptions,
  SvgViewportPoint,
  SvgViewportState,
} from './interaction/viewport.js'
export { inspectEntity } from './interaction/inspection.js'
export type {
  EntityRef,
  InspectableEntityKind,
  Inspection,
  InspectionRelationships,
} from './interaction/inspection.js'
export { ElkLayoutEngine } from './layout/elk.js'
export { layoutGraph } from './layout/layout.js'
export { estimateNodeSize } from './layout/sizing.js'
export type {
  LayoutEngine,
  LayoutGraphInput,
  LayoutGraphOptions,
  LayoutOptions,
} from './layout/types.js'
export { createGraph } from './model/create.js'
export { normalizeGraph } from './model/normalize.js'
export { graphProposalJsonSchema } from './proposal/schema.js'
export { defaultProposalValidationLimits, validateGraphProposal } from './proposal/validate.js'
export type {
  EvidenceReference,
  GraphProposal,
  ProposalClaim,
  ProposalEntityReference,
  ProposalGeneration,
  ProposalValidationIssue,
  ProposalValidationLimits,
  ProposalValidationOptions,
  ProposalValidationResult,
  ValidProposalValidationResult,
  InvalidProposalValidationResult,
} from './proposal/types.js'
export type {
  Annotation,
  AnnotationKind,
  AnnotationSeverity,
  AnnotationTarget,
  Edge,
  EdgeDirection,
  Graph,
  GraphOptions,
  Group,
  LayoutDirection,
  LayoutPreference,
  Metadata,
  Node,
  NormalizedEdge,
  NormalizedGraph,
  Provenance,
} from './model/types.js'
export { validateGraph } from './validation/validate.js'
export type { Point, Scene, SceneEdge, SceneEdgeLabel, SceneGroup, SceneNode } from './scene/types.js'
export { renderGraph } from './render/render-graph.js'
export { renderSvg, SvgRenderer } from './render/svg.js'
export type {
  Renderer,
  RenderGraphOptions,
  SvgArtifactFrameOptions,
  SvgRenderOptions,
} from './render/types.js'
export { darkTheme, lightTheme } from './theme/defaults.js'
export type { OrbweaverTheme } from './theme/types.js'
export type {
  ValidationEntityKind,
  ValidationIssue,
  ValidationResult,
  ValidationSeverity,
} from './validation/types.js'
