import type { Graph } from '../src/index.js'

export const fixtures: readonly Graph[] = [
  {
    id: 'basic-flow',
    title: 'Basic flow',
    nodes: [
      { id: 'author', type: 'actor', label: 'Author' },
      { id: 'compiler', type: 'process', label: 'Compiler' },
      { id: 'artifact', type: 'document', label: 'Artifact' },
    ],
    edges: [
      { from: 'author', to: 'compiler', type: 'flow' },
      { from: 'compiler', to: 'artifact', type: 'flow' },
    ],
  },
  {
    id: 'decision-flow',
    title: 'Decision flow',
    nodes: [
      { id: 'request', type: 'event', label: 'Request' },
      { id: 'valid', type: 'decision', label: 'Valid?' },
      { id: 'accept', type: 'process', label: 'Accept' },
      { id: 'reject', type: 'process', label: 'Reject' },
    ],
    edges: [
      { from: 'request', to: 'valid', type: 'flow' },
      { from: 'valid', to: 'accept', type: 'flow', label: 'Yes' },
      { from: 'valid', to: 'reject', type: 'flow', label: 'No' },
    ],
  },
  {
    id: 'dependency-map',
    title: 'Service dependencies',
    nodes: [
      { id: 'checkout', type: 'service', label: 'Checkout' },
      { id: 'payment', type: 'service', label: 'Payment', status: 'critical' },
      { id: 'ledger', type: 'database', label: 'Ledger' },
      { id: 'events', type: 'queue', label: 'Events' },
    ],
    edges: [
      { from: 'checkout', to: 'payment', type: 'dependency' },
      { from: 'payment', to: 'ledger', type: 'data' },
      { from: 'payment', to: 'events', type: 'event' },
    ],
  },
  {
    id: 'system-architecture',
    title: 'System architecture',
    groups: [
      { id: 'application', label: 'Application' },
      { id: 'data', label: 'Data' },
      { id: 'external', label: 'External systems' },
    ],
    nodes: [
      { id: 'web', type: 'service', label: 'Web application', group: 'application' },
      { id: 'api', type: 'service', label: 'API', group: 'application' },
      { id: 'database', type: 'database', label: 'Database', group: 'data' },
      { id: 'provider', type: 'external', label: 'Payment provider', group: 'external' },
    ],
    edges: [
      { from: 'web', to: 'api', type: 'request' },
      { from: 'api', to: 'database', type: 'data' },
      { from: 'api', to: 'provider', type: 'integration' },
    ],
  },
]
