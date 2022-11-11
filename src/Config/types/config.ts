import { CustomEditTools } from "Editing/types";

export interface Config {
  webMapItemId: string;
  wkid: number;
  initialMapCenter: [number, number];
  initialMapZoom: number;
  minScale: number;
  maxScale: number;
  basemap: string;
  widgets: ConfigWidget[];
}

export type ConfigWidget = {
  name: "edit" | "home";
  editTools?: CustomEditTools[];
};
