import "./EditCmp.css";
import { observer } from "mobx-react";
import * as React from "react";
import { useEditContext } from "./useEditContext";
import { CustomEditTools } from "./types";

export interface CustomEditCmpProps {
  toolName: CustomEditTools;
  actionButtonClassName: string;
  disabled: boolean;
}

const CustomEditCmp: React.FC<CustomEditCmpProps> = observer((props) => {
  const editContext = useEditContext();

  return (
    <button
      title={props.toolName}
      id={props.toolName}
      key={props.toolName}
      className={props.actionButtonClassName}
      onClick={() => {
        if (!props.disabled) {
          editContext.onCustomEditToolButtonClick(props.toolName);
        }
      }}
      disabled={props.disabled}
    />
  );
});

export default CustomEditCmp;
