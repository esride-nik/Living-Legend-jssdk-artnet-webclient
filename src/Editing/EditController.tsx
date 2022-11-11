import * as React from "react";
import Editor from "@arcgis/core/widgets/Editor";
import * as watchUtils from "@arcgis/core/core/watchUtils";
import Graphic from "@arcgis/core/Graphic";
import * as geometryEngine from "@arcgis/core/geometry/geometryEngine";
import Geometry from "@arcgis/core/geometry/Geometry";
import Polygon from "@arcgis/core/geometry/Polygon";
import * as webMercatorUtils from "@arcgis/core/geometry/support/webMercatorUtils";
import Layer from "@arcgis/core/layers/Layer";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import { Stores } from "../Stores/Stores";
import { CustomEditTools, StepId } from "./types";

type SketchCreateEvent = {
  graphic: __esri.Graphic;
  state: "start" | "active" | "complete" | "cancel";
  tool:
    | "point"
    | "multipoint"
    | "polyline"
    | "polygon"
    | "rectangle"
    | "circle";
  toolEventInfo: __esri.CreateToolEventInfo;
  type: "create";
};

export default class EditController {
  editorNode = React.createRef<HTMLDivElement>();
  editComponentNode = React.createRef<HTMLDivElement>();
  public editor!: Editor;
  private sketchHandle!: IHandle;
  private customEditFeatures!: __esri.Collection<Graphic>;
  static instance: EditController;
  private stores!: Stores;

  // Singleton pattern: getInstance and private constructor
  static readonly getInstance = (): EditController => {
    if (EditController.instance === undefined) {
      EditController.instance = new EditController();
    }
    return EditController.instance;
  };

  private constructor() {
    console.debug(
      "EditController: Private constructor called. Editor Widget not yet initialized."
    );
  }

  public readonly init = (stores: Stores): void => {
    this.stores = stores;
    this.editor = new Editor({
      view: this.stores.mapStore.mapView,
      container: this.editorNode.current ?? undefined,
    });

    this.stores.mapStore.mapView?.map.allLayers.map((l: Layer) =>
      console.log(l.id, l.type, l.visible)
    );

    this.editor.when(() => {
      console.debug("Editor initialized.", this.editor);

      this.editor.viewModel.sketchViewModel.defaultUpdateOptions = {
        tool: "reshape",
        reshapeOptions: {
          shapeOperation: "none",
        },
        toggleToolOnClick: false,
      };
      this.editor.viewModel.sketchViewModel.defaultCreateOptions = {
        mode: "hybrid",
      };

      watchUtils.watch(
        this.editor,
        "activeWorkflow.stepId",
        (stepId: StepId | undefined) => {
          console.debug(
            "Editor activeWorkflow.stepId",
            stepId,
            this.editor.activeWorkflow
          );
          this.stores.editStore.editorWorkflowStep = stepId;
          if (stepId !== "editing-existing-feature") {
            this.stores.editStore.activeCustomEditTool = "Off";
            this.removeSketchGraphics();
          }
        }
      );

      watchUtils.watch(
        this.editor,
        "activeWorkflow.data.edits.feature",
        (feature: Graphic | undefined) => {
          if (feature !== undefined && feature !== null) {
            this.stores.editStore.editorFeature = feature;
            this.setShapeOperation(
              (feature.layer as FeatureLayer).geometryType
            );
          }
        }
      );

      watchUtils.watch(this.editor, "activeWorkflow", () => {
        if (this.editor.activeWorkflow === null) return;
        const esriCommit = this.editor.activeWorkflow.commit;
        this.editor.activeWorkflow.commit = async (): Promise<void> => {
          const promises = this.stores.editStore.customCommitCallbacks.map(
            (callback) => {
              return callback(this.editor);
            }
          );
          try {
            await Promise.all(promises);
          } catch (error) {
            throw error;
          }
          return esriCommit.call(this.editor.activeWorkflow);
        };
      });
    });
  };

  private readonly setShapeOperation = (
    geometryType: __esri.FeatureLayer["geometryType"]
  ): void => {
    // if editing a point, allow moving geometry
    if (
      geometryType === "point" &&
      this.editor.viewModel.sketchViewModel.defaultUpdateOptions.reshapeOptions
    ) {
      this.editor.viewModel.sketchViewModel.defaultUpdateOptions.reshapeOptions.shapeOperation =
        "move";
    } else if (
      geometryType !== "point" &&
      this.editor.viewModel.sketchViewModel.defaultUpdateOptions.reshapeOptions
    ) {
      this.editor.viewModel.sketchViewModel.defaultUpdateOptions.reshapeOptions.shapeOperation =
        "none";
    }
  };

  public async onCustomEditToolButtonClick(
    clickedTool: CustomEditTools
  ): Promise<void> {
    if (this.stores.editStore.activeCustomEditTool === clickedTool) {
      this.stores.editStore.activeCustomEditTool = "Off";
      console.debug(`${clickedTool} deactivated`);
      await this.finishCustomEditAndGoBackToReshape(
        this.sketchHandle,
        this.customEditFeatures
      );
    } else {
      if (this.stores.editStore.activeCustomEditTool !== "Off") {
        await this.finishCustomEditAndGoBackToReshape(
          this.sketchHandle,
          this.customEditFeatures
        );
        this.stores.editStore.activeCustomEditTool = "Off";
      }
      console.debug(`${clickedTool} activated`);

      this.customEditFeatures =
        this.editor.viewModel.sketchViewModel.layer.graphics;
      // there shouldn't be more than one features on the sketchVM layer
      const customEditFeature = this.customEditFeatures.getItemAt(0);
      if (customEditFeature) {
        this.addFeatureCloneToSketchLayer(customEditFeature);
      } else {
        console.warn(
          `No sketch feature found, which might indicate that the layer doesn't support geometry editing.`
        );
      }

      this.editor.viewModel.sketchViewModel.activeFillSymbol =
        this.stores.editStore.sketchSymbol;

      switch (clickedTool) {
        case "DrawUnion":
          this.stores.editStore.activeCustomEditTool = clickedTool;
          this.activateDrawUnion();
          break;
        case "DrawDifference":
          this.stores.editStore.activeCustomEditTool = clickedTool;
          this.activateDrawDifference();
          break;
        case "ConvexHull":
          this.executeConvexHull();
          break;
        case "CloseHoles":
          this.executeCloseHoles();
          break;
        default:
      }
    }
  }

  protected readonly projectIfNecessary = (
    geometries: Geometry[],
    targetSpatialReference: __esri.SpatialReference
  ): Geometry[] => {
    const srIssues = geometries.filter(
      (sg: Geometry) => sg.spatialReference !== targetSpatialReference
    );
    if (srIssues.length > 0) {
      console.warn(
        `Spatial reference ${targetSpatialReference.wkid} expected. The following selected features do not match.`,
        srIssues
      );
      geometries = srIssues.map((g: Geometry) => {
        if (
          webMercatorUtils.canProject(
            g.spatialReference,
            targetSpatialReference
          )
        ) {
          g = webMercatorUtils.project(g, targetSpatialReference);
          return g;
        }
        throw new Error(
          `Selected geometry with spatial reference ${g.spatialReference.wkid} cannot be projected into ${targetSpatialReference.wkid}`
        );
      });
    }
    return geometries;
  };

  private readonly activateDrawUnion = (): void => {
    this.editor.viewModel.sketchViewModel.create("polygon");
    this.sketchHandle = this.editor.viewModel.sketchViewModel.on(
      "create",
      async (createEvent: SketchCreateEvent) => {
        if (createEvent.state === "complete") {
          if (
            this.stores.editStore.editorFeature?.geometry?.type === "polygon"
          ) {
            const resultGeometry = geometryEngine.union([
              this.stores.editStore.editorFeature.geometry,
              createEvent.graphic.geometry,
            ]);
            this.stores.editStore.editorFeature.geometry = resultGeometry;

            this.removeSketchGraphics();
            this.customEditFeatures.getItemAt(0).geometry = resultGeometry;

            // activate tool again
            this.addFeatureCloneToSketchLayer(
              this.customEditFeatures.getItemAt(0)
            );
            this.activateDrawUnion();
          }
        }
      }
    );
  };

  private readonly activateDrawDifference = (): void => {
    this.editor.viewModel.sketchViewModel.create("polygon");
    this.sketchHandle = this.editor.viewModel.sketchViewModel.on(
      "create",
      async (createEvent: SketchCreateEvent) => {
        if (createEvent.state === "complete") {
          if (
            this.stores.editStore.editorFeature?.geometry?.type === "polygon"
          ) {
            const resultGeometry = geometryEngine.difference(
              this.stores.editStore.editorFeature.geometry,
              createEvent.graphic.geometry
            ) as Geometry;
            this.stores.editStore.editorFeature.geometry = resultGeometry;

            this.removeSketchGraphics();
            this.customEditFeatures.getItemAt(0).geometry = resultGeometry;
            const resultGraphic = this.stores.editStore.editorFeature;
            resultGraphic.geometry = resultGeometry;

            // activate tool again
            this.addFeatureCloneToSketchLayer(resultGraphic);
            this.activateDrawDifference();
          }
        }
      }
    );
  };

  private readonly executeConvexHull = (): void => {
    this.editor.viewModel.sketchViewModel.complete();
    if (this.stores.editStore.editorFeature?.geometry?.type === "polygon") {
      const resultGeometry = geometryEngine.convexHull(
        this.stores.editStore.editorFeature.geometry
      ) as Geometry;
      this.stores.editStore.editorFeature.geometry = resultGeometry;
      this.customEditFeatures.getItemAt(0).geometry = resultGeometry;
      this.removeSketchGraphics();
    }
  };

  private readonly executeCloseHoles = (): void => {
    this.editor.viewModel.sketchViewModel.complete();

    if (this.stores.editStore.editorFeature?.geometry?.type === "polygon") {
      const closedHolesGeometry = this.stores.editStore.editorFeature
        .geometry as Polygon;
      let allHolesClosed = false;
      while (!allHolesClosed) {
        allHolesClosed = true;
        for (let i = 0; i < closedHolesGeometry.rings.length; i++) {
          if (!closedHolesGeometry.isClockwise(closedHolesGeometry.rings[i])) {
            // when one hole is removed, the process has to be started from the beginning again!
            allHolesClosed = false;
            closedHolesGeometry.removeRing(i);
            break;
          }
        }
      }
      // creating a union with itself removes inner rings
      const resultGeometry = geometryEngine.union([
        closedHolesGeometry,
        closedHolesGeometry,
      ]) as Geometry;

      this.stores.editStore.editorFeature.geometry = resultGeometry;
      this.customEditFeatures.getItemAt(0).geometry = resultGeometry;
      this.removeSketchGraphics();
    }
  };

  private readonly removeSketchGraphics = (): void => {
    const temporaryGraphics =
      this.editor.viewModel.sketchViewModel.layer.graphics.filter(
        (graphic: Graphic) =>
          graphic.attributes === undefined || graphic.attributes === null
      );
    this.editor.viewModel.sketchViewModel.layer.graphics.removeMany(
      temporaryGraphics
    );
  };

  private readonly addFeatureCloneToSketchLayer = (
    originalFeature: Graphic
  ): Graphic => {
    const sketchExistingFeatureClone = originalFeature.clone();
    sketchExistingFeatureClone.symbol = this.stores.editStore.sketchSymbol;
    sketchExistingFeatureClone.attributes = undefined;
    this.editor.viewModel.sketchViewModel.layer.graphics.add(
      sketchExistingFeatureClone
    );
    return sketchExistingFeatureClone;
  };

  private async finishCustomEditAndGoBackToReshape(
    sketchHandle: IHandle,
    sketchExistingFeatures: __esri.Collection<Graphic>
  ): Promise<void> {
    this.stores.editStore.activeCustomEditTool = "Off";
    this.removeSketchGraphics();
    sketchHandle?.remove();

    if (this.stores.editStore.editorFeature !== undefined) {
      await this.editor.viewModel.sketchViewModel.update(
        sketchExistingFeatures?.getItemAt(0),
        {
          tool: "reshape",
          toggleToolOnClick: false,
        }
      );
    }
  }
}
