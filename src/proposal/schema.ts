const metadata = { type: 'object' } as const
const provenance = {
  type: 'object',
  additionalProperties: false,
  properties: {
    uri: { type: 'string' },
    file: { type: 'string' },
    line: { type: 'number' },
    column: { type: 'number' },
    endLine: { type: 'number' },
    endColumn: { type: 'number' },
    path: { type: 'string' },
    recordId: { type: 'string' },
    artifactId: { type: 'string' },
    metadata,
  },
} as const

export const graphProposalJsonSchema = {
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  $id: 'https://orbweaver.semanticintent.dev/schema/graph-proposal-1.json',
  title: 'Orbweaver GraphProposal',
  type: 'object',
  additionalProperties: false,
  required: ['schemaVersion', 'graph', 'generation'],
  properties: {
    schemaVersion: { const: '1' },
    graph: {
      type: 'object',
      additionalProperties: false,
      required: ['id', 'nodes', 'edges'],
      properties: {
        id: { type: 'string', minLength: 1 },
        title: { type: 'string', maxLength: 200 },
        description: { type: 'string', maxLength: 2000 },
        nodes: {
          type: 'array',
          maxItems: 250,
          items: {
            type: 'object',
            additionalProperties: false,
            required: ['id', 'label'],
            properties: {
              id: { type: 'string', minLength: 1 },
              type: { type: 'string' },
              label: { type: 'string', maxLength: 200 },
              description: { type: 'string', maxLength: 2000 },
              group: { type: 'string' },
              layer: { type: 'string' },
              status: { type: 'string' },
              value: { type: ['string', 'number'] },
              metadata,
              source: provenance,
            },
          },
        },
        edges: {
          type: 'array',
          maxItems: 500,
          items: {
            type: 'object',
            additionalProperties: false,
            required: ['from', 'to'],
            properties: {
              id: { type: 'string' },
              from: { type: 'string', minLength: 1 },
              to: { type: 'string', minLength: 1 },
              type: { type: 'string' },
              label: { type: 'string', maxLength: 200 },
              direction: { enum: ['forward', 'backward', 'both', 'none'] },
              metadata,
              source: provenance,
            },
          },
        },
        groups: {
          type: 'array',
          maxItems: 50,
          items: {
            type: 'object',
            additionalProperties: false,
            required: ['id', 'label'],
            properties: {
              id: { type: 'string', minLength: 1 },
              label: { type: 'string', maxLength: 200 },
              description: { type: 'string', maxLength: 2000 },
              parent: { type: 'string' },
              type: { type: 'string' },
              metadata,
              source: provenance,
            },
          },
        },
        annotations: {
          type: 'array',
          maxItems: 500,
          items: {
            type: 'object',
            additionalProperties: false,
            required: ['id', 'body'],
            properties: {
              id: { type: 'string', minLength: 1 },
              target: {
                type: 'object',
                additionalProperties: false,
                required: ['kind'],
                properties: {
                  kind: { enum: ['graph', 'node', 'edge', 'group'] },
                  id: { type: 'string' },
                },
              },
              label: { type: 'string', maxLength: 200 },
              body: { type: 'string', maxLength: 2000 },
              type: { type: 'string' },
              severity: { enum: ['info', 'warning', 'critical'] },
              metadata,
              source: provenance,
            },
          },
        },
        metadata,
        options: {
          type: 'object',
          additionalProperties: false,
          properties: {
            directed: { type: 'boolean' },
            layout: {
              type: 'object',
              additionalProperties: false,
              properties: {
                engine: { type: 'string' },
                direction: { enum: ['LR', 'RL', 'TB', 'BT'] },
              },
            },
          },
        },
      },
    },
    generation: {
      type: 'object',
      additionalProperties: false,
      required: ['adapter'],
      properties: {
        provider: { type: 'string' },
        model: { type: 'string' },
        adapter: { type: 'string', minLength: 1 },
      },
    },
    evidence: {
      type: 'array',
      maxItems: 500,
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['id', 'label'],
        properties: {
          id: { type: 'string', minLength: 1 },
          label: { type: 'string', minLength: 1, maxLength: 200 },
          source: { type: 'string' },
          location: { type: 'string' },
        },
      },
    },
    claims: {
      type: 'array',
      maxItems: 1000,
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['entity', 'evidenceIds'],
        properties: {
          entity: {
            type: 'object',
            additionalProperties: false,
            required: ['kind', 'id'],
            properties: {
              kind: { enum: ['node', 'edge', 'group'] },
              id: { type: 'string', minLength: 1 },
            },
          },
          evidenceIds: { type: 'array', items: { type: 'string' } },
          confidence: { enum: ['low', 'medium', 'high'] },
          rationale: { type: 'string', maxLength: 2000 },
        },
      },
    },
    warnings: { type: 'array', items: { type: 'string' } },
  },
} as const
