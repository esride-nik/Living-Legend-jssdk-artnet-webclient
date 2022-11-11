import "./EditCmp.css";

import { observer } from "mobx-react";
import * as React from "react";

import { useEffect } from "react";
import { useStores } from "../Stores/useStores";
import { useEditContext } from "./useEditContext";
import CustomEditCmp from "./CustomEditCmp";
import { CustomEditTools } from "./EditStore";
// import { useMainContext } from '../../core/Main/useMainContext';

interface EditCmpProps {}

const EditCmp: React.FC<EditCmpProps> = observer(() => {
  const editContext = useEditContext();
  const stores = useStores();
  const { editStore, appStore, mapStore } = useStores();

  // Editor Widget must be initialized after first render, because we need the DOM node ref. (So this wouldn't work in EditEsriElement right after new Expand().)
  useEffect(() => {
    console.log("EditCmp effect");
    if (mapStore.mapView && editContext.editor === undefined) {
      editContext.init(stores);
    }
  }, [mapStore.mapView, editContext, stores]);

  if (editStore.activeCustomEditTool === undefined) {
    return <div>{editStore.activeCustomEditTool}</div>;
  }
  if (
    editStore.activeCustomEditTool !== undefined ||
    editStore.unsavedEditsAvailable
  ) {
    return (
      <div id="editorWrapper">
        <div
          ref={editContext.editorWrapperWrapperNode}
          id="editComponent"
          className="esri-widget esri-editor-widget"
        >
          {appStore.config.editTools.map((toolName: CustomEditTools) => (
            <CustomEditCmp
              toolName={toolName}
              actionButtonClassName={editStore.getActionButtonClassName(
                toolName
              )}
              disabled={!editStore.isToolEnabled(toolName)}
            />
          ))}
        </div>
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
