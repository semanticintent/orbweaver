export { ArtifactExportError, ContractCompatibilityError, GraphValidationError, LayoutError, OrbweaverError } from './errors.js'
export { renderHtmlArtifact } from './artifact/html.js'
export { portableHtmlArtifactVersion } from './artifact/types.js'
export type {
  HtmlArtifactOptions,
  PortableArtifactProvenance,
  PortableArtifactTheme,
  PortableHtmlArtifactManifest,
} from './artifact/types.js'
export {
  createGraphDocument,
  createSceneDocument,
  graphFromDocument,
  readGraphDocument,
  readSceneDocument,
  sceneFromDocument,
} from './compatibility/documents.js'
export { inspectContractVersion } from './compatibility/inspect.js'
export type { InspectContractVersionOptions } from './compatibility/inspect.js'
export {
  contractJsonSchemas,
  graphDocumentJsonSchema,
  graphJsonSchema,
  pngArtifactManifestJsonSchema,
  portableHtmlArtifactManifestJsonSchema,
  sceneDocumentJsonSchema,
  sceneJsonSchema,
  svgArtifactManifestJsonSchema,
} from './compatibility/schemas.js'
export type { JsonSchema } from './compatibility/schemas.js'
export {
  contractSchemaIds,
  contractVersions,
  graphProposalSchemaVersion,
  graphSchemaVersion,
  sceneSchemaVersion,
} from './compatibility/versions.js'
export type {
  CompatibilityDiagnostic,
  CompatibilitySeverity,
  ContractCompatibilityResult,
  ContractKind,
  ContractReadResult,
  ContractVersion,
  GraphDocument,
  InvalidContractReadResult,
  SceneDocument,
  ValidContractReadResult,
} from './compatibility/types.js'
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
export { deriveLensProjection, getLensMatch, getSemanticLensRecipe, semanticLensRecipes } from './semantic/lenses.js'
export { defaultSemanticDetailThresholds, recommendSemanticDetailLevel } from './semantic/detail.js'
export type { SemanticDetailLevel, SemanticDetailThresholds } from './semantic/detail.js'
export { compareArchitectures, getArchitectureComparisonEntry } from './semantic/comparison.js'
export type {
  ArchitectureChangeState,
  ArchitectureComparison,
  ArchitectureComparisonCounts,
  ArchitectureComparisonEntry,
  ArchitectureEntity,
  ArchitectureFieldChange,
} from './semantic/comparison.js'
export { deriveLegend } from './semantic/legend.js'
export type { LegendContext, LegendItem, LegendModel, LegendSection, LegendSectionId } from './semantic/legend.js'
export { derivePathNarrative, getPathNarrativeMatch, getPathNarrativeRecipe, pathNarrativeRecipes } from './semantic/paths.js'
export type {
  PathNarrativeDiagnostic,
  PathNarrativeDirection,
  PathNarrativeEdgeRule,
  PathNarrativeId,
  PathNarrativeMatch,
  PathNarrativeMetadataRule,
  PathNarrativeOptions,
  PathNarrativeProjection,
  PathNarrativeRecipe,
  PathNarrativeRole,
  PathNarrativeStep,
} from './semantic/paths.js'
export type {
  LensMatch,
  LensProjection,
  LensProjectionRole,
  LensReason,
  SemanticLens,
  SemanticLensAnnotationRule,
  SemanticLensId,
  SemanticLensMetadataRule,
  SemanticLensRule,
} from './semantic/lenses.js'
export { renderGraph } from './render/render-graph.js'
export { renderSvg, SvgRenderer } from './render/svg.js'
export type {
  Renderer,
  RenderGraphOptions,
  SvgArtifactFrameOptions,
  SvgEmbeddedMetadata,
  SvgRenderOptions,
} from './render/types.js'
export { renderSvgArtifact } from './export/svg.js'
export { createBrowserPngRasterizer } from './export/browser-png.js'
export { renderPngArtifact } from './export/png.js'
export { pngArtifactVersion, svgArtifactVersion } from './export/types.js'
export type {
  PngArtifact,
  PngArtifactManifest,
  PngArtifactOptions,
  PngRasterizeInput,
  PngRasterizer,
  StaticArtifactGuarantees,
  SvgArtifact,
  SvgArtifactManifest,
  SvgArtifactOptions,
} from './export/types.js'
export { darkTheme, lightTheme } from './theme/defaults.js'
export type { OrbweaverTheme } from './theme/types.js'
export type {
  ValidationEntityKind,
  ValidationIssue,
  ValidationResult,
  ValidationSeverity,
} from './validation/types.js'
