import { ImPure } from "@design-express/fabrica";
import { Button } from "@mui/material";
import { useLayoutEffect, useRef, useState } from "react";

function WrappedComp({ refs, trigger, onLoaded }) {
  const [streaming, setStreaming] = useState(null);
  const inputImageRef = useRef();
  // closing image
  function closeImage() {
    const url = refs.image.src;
    refs.image.src = "#"; // restore image source
    URL.revokeObjectURL(url); // revoke url

    setStreaming(null); // set streaming to null
    inputImageRef.current.value = ""; // reset input image
    refs.image.style.display = "none"; // hide image
  }
  useLayoutEffect(() => {
    onLoaded();
  }, []);
  return (
    <div style={{ height: "100%", width: "100%" }}>
      <input
        ref={inputImageRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={(e) => {
          const url = URL.createObjectURL(e.target.files[0]); // create blob url
          refs.image.src = url; // set video source
          refs.image.style.display = "block"; // show video
          setStreaming("image"); // set streaming to video
        }}
      />
      <Button
        sx={{ position: "absolute", top: 1, left: 1, zIndex: 2 }}
        onClick={() => {
          // if not streaming
          if (streaming === null) inputImageRef.current.click();
          // closing image streaming
          else if (streaming === "image") closeImage();
          else
            alert(
              `Can't handle more than 1 stream\nCurrently streaming : ${streaming}`
            ); // if streaming video or webcam
        }}
      >
        Image
      </Button>
      <div style={{ position: "relative" }}>
        <img
          src="#"
          ref={(_r) => (refs.image = _r)}
          alt="a"
          onLoad={trigger}
          style={{ width: "100%", maxWidth: 720, maxHeight: 500 }}
        />
        <canvas
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
          }}
          ref={(_r) => (refs.canvas = _r)}
        />
      </div>
    </div>
  );
}
export class ComponentWrapper extends ImPure {
  static path = "UI";
  static title = "wrapper_UI";
  constructor() {
    super();
    this.refs = { image: undefined, canvas: undefined };
    this.addOutput("component", "");
    this.addOutput("onLoadedImg", -1);
    this.addOutput("imageRef", "");
    this.addOutput("canvasRef", "");
    this.addOutput("onLoaded", -1);
  }
  onExecute() {
    this.setOutputData(
      1,
      <WrappedComp
        refs={this.refs}
        trigger={() => {
          this.setOutputData(3, this.refs.image);
          this.setOutputData(4, this.refs.canvas);
          this.triggerSlot(2);
        }}
        onLoaded={() => {
          this.setOutputData(3, this.refs.image);
          this.setOutputData(4, this.refs.canvas);
          this.triggerSlot(5);
        }}
      />
    );
    console.log(this.refs);
    this.setOutputData(3, this.refs.image);
    this.setOutputData(4, this.refs.canvas);
  }
}
