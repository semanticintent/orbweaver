export interface OrbweaverTheme {
  id: string
  colors: {
    canvas: string
    surface: string
    surfaceRaised: string
    surfaceMuted: string
    text: string
    textMuted: string
    border: string
    borderStrong: string
    edge: string
    edgeLabel: string
    accent: string
    accentSoft: string
    focus: string
    selection: string
    success: string
    warning: string
    danger: string
    shadow: string
  }
  typography: {
    fontFamily: string
    monoFamily: string
    fontSize: number
    labelWeight: number
  }
  geometry: {
    nodeRadius: number
    groupRadius: number
    edgeWidth: number
  }
}
