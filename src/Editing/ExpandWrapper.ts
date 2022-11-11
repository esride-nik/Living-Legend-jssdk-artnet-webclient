import Expand from "@arcgis/core/widgets/Expand";
import { reaction } from "mobx";
import { Stores } from "../Stores/Stores";

const createExpandWrapper = (properties: {
  expand: Expand;
}): HTMLDivElement => {
  const div = document.createElement("div");
  div.id = `${properties.expand.id}_wrapper`;
  properties.expand.content = div;

  div.style.overflow = "auto";
  div.style.backgroundColor = "white";

  const setMaxHeight = (): void => {
    if (!properties.expand.expanded) return;
    const expandOffsetY = div.getBoundingClientRect().top;
    const marginReference = document.querySelector(
      ".esri-expand__content--expanded"
    );
    const margin = marginReference
      ? Number(getComputedStyle(marginReference).marginLeft.slice(0, -2))
      : 7;
    // const maxHeight = resizableStore.centerBoxHeight - expandOffsetY - margin;
    // div.style.maxHeight = `${maxHeight}px`;
  };

  //   reaction(() => resizableStore.centerBoxHeight, setMaxHeight);
  properties.expand.watch("expanded", setMaxHeight);
  return div;
};

export default createExpandWrapper;
