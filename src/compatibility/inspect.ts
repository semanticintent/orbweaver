import type { ContractCompatibilityResult, ContractKind } from './types.js'
import { contractVersions } from './versions.js'

export interface InspectContractVersionOptions {
  allowUnversioned?: boolean
}

export function inspectContractVersion(
  kind: ContractKind,
  version: unknown,
  options: InspectContractVersionOptions = {},
): ContractCompatibilityResult {
  const currentVersion = contractVersions[kind]
  if (version === undefined) {
    if (options.allowUnversioned === true) {
      return {
        compatible: true,
        kind,
        currentVersion,
        diagnostics: [{
          code: 'contract-version-assumed',
          severity: 'warning',
          message: `Unversioned ${kind} data is treated as version ${currentVersion}.`,
          action: `Persist the data in an Orbweaver ${kind} version ${currentVersion} envelope on the next write.`,
          path: '$.version',
        }],
      }
    }
    return {
      compatible: false,
      kind,
      currentVersion,
      diagnostics: [{
        code: 'contract-version-required',
        severity: 'error',
        message: `${kind} data must declare a version.`,
        action: `Provide version "${currentVersion}" or migrate the document with the Orbweaver release that created it.`,
        path: '$.version',
      }],
    }
  }
  if (typeof version !== 'string' || version.trim() === '') {
    return {
      compatible: false,
      kind,
      currentVersion,
      diagnostics: [{
        code: 'contract-version-invalid',
        severity: 'error',
        message: `${kind} version must be a non-empty string.`,
        action: `Use the supported version string "${currentVersion}".`,
        path: '$.version',
      }],
    }
  }
  if (version === currentVersion) {
    return { compatible: true, kind, currentVersion, detectedVersion: version, diagnostics: [] }
  }

  const numericVersion = Number(version)
  const numericCurrent = Number(currentVersion)
  const newer = Number.isInteger(numericVersion) && numericVersion > numericCurrent
  return {
    compatible: false,
    kind,
    currentVersion,
    detectedVersion: version,
    diagnostics: [{
      code: newer ? 'contract-version-newer' : 'contract-version-unsupported',
      severity: 'error',
      message: newer
        ? `${kind} version ${version} is newer than supported version ${currentVersion}.`
        : `${kind} version ${version} is not supported; this release supports version ${currentVersion}.`,
      action: newer
        ? 'Upgrade Orbweaver before opening this document.'
        : 'Open the document with a compatible Orbweaver release and migrate it explicitly.',
      path: '$.version',
    }],
  }
}
