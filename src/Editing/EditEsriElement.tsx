import Expand from "@arcgis/core/widgets/Expand";
import * as ReactDOM from "react-dom";
import { StoreProvider } from "../Stores/StoreProvider";
import EditCmp from "./EditCmp";
import EditController from "./EditController";
import { Config } from "Config/types/config";
import MapStore from "Map/MapStore";
import createExpandWrapper from "./ExpandWrapper";

const getEditEsriElement = (config: Config, mapStore: MapStore): Expand => {
  const editController = EditController.getInstance();
  const expand = new Expand({
    view: mapStore.mapView,
    id: "edit_expand",
  });
  expand.watch("expanded", (expanded: boolean) => {
    console.debug("Editor expand", expanded);
    if (!expanded && editController.editor.activeWorkflow) {
      editController.editor.cancelWorkflow();
    }
  });
  const wrapperDiv = createExpandWrapper({ expand });
  ReactDOM.render(
    <StoreProvider config={config}>
      {/* <MainProvider> */}
      <EditCmp expandedOnInit={true} />
      {/* </MainProvider> */}
    </StoreProvider>,
    wrapperDiv
  );
  return expand;
};

export default getEditEsriElement;
