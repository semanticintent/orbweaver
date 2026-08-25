export const showcases = [
  {
    slug: 'publishing-flow', kicker: 'Process flow',
    description: 'A compact declarative publishing pipeline with source-linked entities.',
    layout: { direction: 'LR', spacing: 44, layerSpacing: 82, padding: 32 },
    graph: {
      id: 'publishing-flow', title: 'Declarative publishing flow',
      description: 'Source is validated, laid out, rendered, and published as a self-contained artifact.',
      nodes: [
        { id: 'source', type: 'document', label: 'Declarative source', source: { file: 'publish.rcl', line: 12, path: 'DATA-DIVISION' } },
        { id: 'validate', type: 'process', label: 'Validate intent', source: { file: 'publish.rcl', line: 28, path: 'VALIDATE' } },
        { id: 'layout', type: 'process', label: 'Derive layout', source: { file: 'publish.rcl', line: 34, path: 'LAYOUT' } },
        { id: 'render', type: 'process', label: 'Render artifact', source: { file: 'publish.rcl', line: 41, path: 'RENDER' } },
        { id: 'artifact', type: 'document', label: 'Self-contained artifact', status: 'healthy', source: { file: 'publish.rcl', line: 48, path: 'OUTPUT' } },
      ],
      edges: [
        { from: 'source', to: 'validate', type: 'flow' }, { from: 'validate', to: 'layout', type: 'flow' },
        { from: 'layout', to: 'render', type: 'flow' }, { from: 'render', to: 'artifact', type: 'flow' },
      ],
    },
  },
  {
    slug: 'release-decision', kicker: 'Decision flow',
    description: 'A branching release gate demonstrating labels, decisions, and recovery paths.',
    layout: { direction: 'TB', spacing: 52, layerSpacing: 68, padding: 32 },
    graph: {
      id: 'release-decision', title: 'Release readiness decision',
      description: 'A release candidate proceeds only when quality and accessibility gates pass.',
      nodes: [
        { id: 'candidate', type: 'document', label: 'Release candidate', source: { file: 'release.rcl', line: 8 } },
        { id: 'quality', type: 'decision', label: 'Quality gates pass?', source: { file: 'release.rcl', line: 19 } },
        { id: 'accessibility', type: 'decision', label: 'Accessibility verified?', source: { file: 'release.rcl', line: 27 } },
        { id: 'publish', type: 'process', label: 'Publish release', status: 'healthy', source: { file: 'release.rcl', line: 36 } },
        { id: 'revise', type: 'process', label: 'Revise implementation', status: 'warning', source: { file: 'release.rcl', line: 44 } },
      ],
      edges: [
        { from: 'candidate', to: 'quality', type: 'flow' }, { from: 'quality', to: 'accessibility', type: 'flow', label: 'Yes' },
        { from: 'quality', to: 'revise', type: 'error', label: 'No' }, { from: 'accessibility', to: 'publish', type: 'flow', label: 'Yes' },
        { from: 'accessibility', to: 'revise', type: 'error', label: 'No' },
      ],
    },
  },
  {
    slug: 'commerce-platform', kicker: 'Dependency map',
    description: 'A layered service map with typed relationships, status, and semantic groups.',
    layout: { direction: 'LR', spacing: 48, layerSpacing: 88, padding: 32 },
    graph: {
      id: 'commerce-platform', title: 'Commerce platform dependencies',
      description: 'A source-aware service dependency map for a commerce platform.',
      groups: [
        { id: 'experience', label: 'Experience layer' }, { id: 'services', label: 'Service layer' },
        { id: 'data', label: 'Data and events' }, { id: 'external', label: 'External systems' },
      ],
      nodes: [
        { id: 'storefront', type: 'service', label: 'Storefront', group: 'experience', status: 'healthy', source: { file: 'commerce.rcl', line: 21 } },
        { id: 'admin', type: 'service', label: 'Operations console', group: 'experience', source: { file: 'commerce.rcl', line: 27 } },
        { id: 'gateway', type: 'service', label: 'API gateway', group: 'services', source: { file: 'commerce.rcl', line: 36 } },
        { id: 'checkout', type: 'process', label: 'Checkout orchestration', group: 'services', source: { file: 'commerce.rcl', line: 43 } },
        { id: 'inventory', type: 'service', label: 'Inventory', group: 'services', status: 'warning', source: { file: 'commerce.rcl', line: 51 } },
        { id: 'orders', type: 'database', label: 'Order store', group: 'data', source: { file: 'commerce.rcl', line: 62 } },
        { id: 'events', type: 'queue', label: 'Commerce events', group: 'data', source: { file: 'commerce.rcl', line: 68 } },
        { id: 'payment', type: 'external', label: 'Payment provider', group: 'external', status: 'critical', source: { file: 'commerce.rcl', line: 77 } },
      ],
      edges: [
        { from: 'storefront', to: 'gateway', type: 'request' }, { from: 'admin', to: 'gateway', type: 'request' },
        { from: 'gateway', to: 'checkout', type: 'flow' }, { from: 'checkout', to: 'inventory', type: 'dependency', label: 'Reserve' },
        { from: 'checkout', to: 'orders', type: 'data', label: 'Persist' }, { from: 'checkout', to: 'events', type: 'event', label: 'Publish' },
        { from: 'checkout', to: 'payment', type: 'error', label: 'Authorize' },
      ],
    },
  },
  {
    slug: 'trust-architecture', kicker: 'System architecture',
    description: 'A grouped trust architecture spanning nested application, data, and external boundaries.',
    layout: { direction: 'LR', spacing: 46, layerSpacing: 86, padding: 32 },
    graph: {
      id: 'trust-architecture', title: 'Source-aware trust architecture',
      description: 'Requests cross explicit trust boundaries while semantic identity survives the pipeline.',
      groups: [
        { id: 'platform', label: 'Platform' }, { id: 'application', label: 'Application', parent: 'platform' },
        { id: 'data', label: 'Protected data', parent: 'platform' }, { id: 'outside', label: 'External boundary' },
      ],
      nodes: [
        { id: 'user', type: 'actor', label: 'Authorized user', group: 'outside', source: { file: 'trust.rcl', line: 18 } },
        { id: 'identity', type: 'external', label: 'Identity provider', group: 'outside', source: { file: 'trust.rcl', line: 24 } },
        { id: 'edge', type: 'service', label: 'Policy gateway', group: 'application', status: 'healthy', source: { file: 'trust.rcl', line: 35 } },
        { id: 'api', type: 'service', label: 'Application API', group: 'application', source: { file: 'trust.rcl', line: 42 } },
        { id: 'audit', type: 'queue', label: 'Audit stream', group: 'data', source: { file: 'trust.rcl', line: 53 } },
        { id: 'records', type: 'database', label: 'Protected records', group: 'data', source: { file: 'trust.rcl', line: 59 } },
      ],
      edges: [
        { from: 'user', to: 'edge', type: 'request' }, { from: 'edge', to: 'identity', type: 'dependency', label: 'Verify' },
        { from: 'edge', to: 'api', type: 'flow', label: 'Authorize' }, { from: 'api', to: 'records', type: 'data' },
        { from: 'api', to: 'audit', type: 'event' },
      ],
    },
  },
]
