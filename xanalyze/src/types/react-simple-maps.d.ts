declare module 'react-simple-maps' {
  import { ComponentType, ReactNode, CSSProperties } from 'react'

  export interface ComposableMapProps {
    projection?: string
    projectionConfig?: {
      scale?: number
      center?: [number, number]
      rotate?: [number, number, number]
    }
    width?: number
    height?: number
    style?: CSSProperties
    className?: string
    children?: ReactNode
  }

  export interface ZoomableGroupProps {
    center?: [number, number]
    zoom?: number
    minZoom?: number
    maxZoom?: number
    onMoveStart?: (position: { coordinates: [number, number]; zoom: number }) => void
    onMove?: (position: { coordinates: [number, number]; zoom: number }) => void
    onMoveEnd?: (position: { coordinates: [number, number]; zoom: number }) => void
    translateExtent?: [[number, number], [number, number]]
    children?: ReactNode
  }

  export interface GeographiesProps {
    geography: string | object
    children: (data: { geographies: GeographyType[] }) => ReactNode
  }

  export interface GeographyType {
    rsmKey: string
    properties: Record<string, unknown>
    geometry: object
  }

  export interface GeographyProps {
    geography: GeographyType
    fill?: string
    stroke?: string
    strokeWidth?: number
    style?: {
      default?: CSSProperties
      hover?: CSSProperties
      pressed?: CSSProperties
    }
    onMouseEnter?: (event: React.MouseEvent) => void
    onMouseLeave?: (event: React.MouseEvent) => void
    onClick?: (event: React.MouseEvent) => void
    className?: string
  }

  export interface MarkerProps {
    coordinates: [number, number]
    children?: ReactNode
    style?: CSSProperties
    onMouseEnter?: (event: React.MouseEvent) => void
    onMouseLeave?: (event: React.MouseEvent) => void
    onClick?: (event: React.MouseEvent) => void
    className?: string
  }

  export interface LineProps {
    from: [number, number]
    to: [number, number]
    stroke?: string
    strokeWidth?: number
    strokeLinecap?: 'butt' | 'round' | 'square'
    strokeOpacity?: number
    strokeDasharray?: string
    fill?: string
    className?: string
  }

  export interface AnnotationProps {
    subject: [number, number]
    dx?: number
    dy?: number
    curve?: number
    connectorProps?: object
    children?: ReactNode
  }

  export interface GraticuleProps {
    step?: [number, number]
    stroke?: string
    strokeWidth?: number
    fill?: string
    className?: string
  }

  export interface SphereProps {
    fill?: string
    stroke?: string
    strokeWidth?: number
    className?: string
  }

  export const ComposableMap: ComponentType<ComposableMapProps>
  export const ZoomableGroup: ComponentType<ZoomableGroupProps>
  export const Geographies: ComponentType<GeographiesProps>
  export const Geography: ComponentType<GeographyProps>
  export const Marker: ComponentType<MarkerProps>
  export const Line: ComponentType<LineProps>
  export const Annotation: ComponentType<AnnotationProps>
  export const Graticule: ComponentType<GraticuleProps>
  export const Sphere: ComponentType<SphereProps>
}
