export interface Config {
  webMapItemId: string;
  wkid: number;
  initialMapCenter: [number, number];
  initialMapZoom: number;
  minScale: number;
  maxScale: number;
  basemap: string;
  widgets: WidgetName[];
  editTools: CustomEditTools[];
}

export type WidgetName = "edit" | "home";

export type CustomEditTools =
  | "SingleEdit"
  | "Union"
  | "Difference"
  | "DrawUnion"
  | "DrawDifference"
  | "Cut"
  | "Reshape"
  | "ConvexHull"
  | "CloseHoles"
  | "WeakFit"
  | "StrongFit"
  | "ClearGeometry"
  | "DeleteGeometry"
  | "EditVertices"
  | "Off";
