import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-backend-webgl";
import aurl from "../model/model.json?url";
import shard1of4 from "../model/group1-shard1of4.bin?url";
import shard2of4 from "../model/group1-shard2of4.bin?url";
import shard3of4 from "../model/group1-shard3of4.bin?url";
import shard4of4 from "../model/group1-shard4of4.bin?url";
import { Pure } from "@design-express/fabrica";
import { detect } from "../shared/detect";

const urlMatcher = {
  "group1-shard1of4.bin": shard1of4,
  "group1-shard2of4.bin": shard2of4,
  "group1-shard3of4.bin": shard3of4,
  "group1-shard4of4.bin": shard4of4,
};

export class yolov8 extends Pure {
  static path = "AI";
  static title = "Detect";
  static description = "Detection by YoloV8";

  constructor() {
    super();
    this.addInput("model", "");
    this.addInput("onChange", -1);
    this.addInput("image", "");
    this.addInput("canvas", "");
    this.addOutput("onProgress", -1);
    this.addOutput("progress", "");
    this.addOutput("onResult", -1);
    this.addOutput("result", "");
    this.tf = undefined;
  }

  async onExecute() {
    const _canvasRef = this.getInputData(4);
    if (!this.tf) {
      const _res = { resolve: undefined, reject: undefined };
      this.tf = new Promise((r, e) => {
        _res.resolve = r;
        _res.reject = e;
      });
      tf.ready()
        .then(async () => {
          const yolov8 = await tf.loadGraphModel(`${aurl}`, {
            onProgress: (fractions) => {
              this.setOutputData(2, fractions);
              this.triggerSlot(1);
            },
            weightUrlConverter: (n) => {
              console.log(n);
              return urlMatcher[n];
            },
          }); // load model

          // warming up model
          const dummyInput = tf.ones(yolov8.inputs[0].shape);
          const warmupResults = yolov8.execute(dummyInput);
          _res.resolve({
            net: yolov8,
            inputShape: yolov8.inputs[0].shape,
          });
          console.log(
            yolov8.inputs[0].shape[1],
            yolov8.inputs[0].shape[2],
            _canvasRef
          );
          _canvasRef.width = yolov8.inputs[0].shape[1];
          _canvasRef.height = yolov8.inputs[0].shape[2];
          tf.dispose([warmupResults, dummyInput]); // cleanup memory
        })
        .catch(_res.reject);
    }
  }
  async onAction(name) {
    if (name === "onChange") {
      const _imageRef = this.getInputData(3);
      const _canvasRef = this.getInputData(4);
      const _model = await this.tf;
      console.log(_imageRef, _canvasRef);
      detect(_imageRef, _model, _canvasRef); // set model & input shape
    } else {
      super.onAction(...arguments);
    }
  }

  onRemoved() {}
}
