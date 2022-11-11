import "./EditCmp.css";

import { observer } from "mobx-react";
import * as React from "react";

import { useEffect } from "react";
import { useStores } from "../Stores/useStores";
import { useEditContext } from "./useEditContext";
import CustomEditCmp from "./CustomEditCmp";
import { ConfigWidget, CustomEditTools } from "Config/types/config";

interface EditCmpProps {}

const EditCmp: React.FC<EditCmpProps> = observer(() => {
  const editContext = useEditContext();
  const stores = useStores();
  const { editStore, appStore, mapStore } = useStores();

  // Editor Widget must be initialized after first render, because we need the DOM node ref. (So this wouldn't work in EditEsriElement right after new Expand().)
  useEffect(() => {
    console.log("EditCmp effect");
    if (mapStore && mapStore.mapView && editContext.editor === undefined) {
      editContext.init(stores);
    }
  }, [mapStore, editContext, stores]);

  if (editStore && editStore.activeCustomEditTool === undefined) {
    return <div>{editStore.activeCustomEditTool}</div>;
  }
  if (
    editStore &&
    (editStore.activeCustomEditTool !== undefined ||
      editStore.unsavedEditsAvailable)
  ) {
    const editWidget = appStore.config.widgets.filter(
      (w: ConfigWidget) => w.name === "edit"
    )
      ? appStore.config.widgets.filter(
          (w: ConfigWidget) => w.name === "edit"
        )[0]
      : undefined;
    const editTools =
      editWidget && editWidget.editTools ? editWidget.editTools : [];
    return (
      <div
        ref={editContext.editComponentNode}
        id="editComponent"
        className="esri-widget esri-editor-widget"
      >
        {editTools.map((toolName: CustomEditTools) => (
          <CustomEditCmp
            toolName={toolName}
            actionButtonClassName={editStore.getActionButtonClassName(toolName)}
            disabled={!editStore.isToolEnabled(toolName)}
          />
        ))}
        <div
          ref={editContext.editorNode}
          id="editorWidget"
          className="esri-editor-widget"
        />
      </div>
    );
  }
  return <div />;
});

export default EditCmp;
