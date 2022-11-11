export type CustomEditTools =
  | "Copy"
  | "DrawUnion"
  | "DrawDifference"
  | "ConvexHull"
  | "CloseHoles"
  | "Off";

export type GeometryType =
  | undefined
  | "point"
  | "multipoint"
  | "polyline"
  | "polygon"
  | "extent"
  | "mesh";
export type StepId =
  | undefined
  | "awaiting-feature-to-update"
  | "awaiting-update-feature-candidate"
  | "editing-existing-feature"
  | "adding-attachment"
  | "editing-attachment"
  | "creating-features";
