import * as React from "react";

const HENRY_GLOOPIE_SRC = "/project-canvas/henry-hoover-gloopie.mp4";

function paintStackedAlphaFrame(
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement,
  maskCanvas: HTMLCanvasElement,
) {
  const sourceWidth = video.videoWidth;
  const sourceHeight = video.videoHeight;
  if (sourceWidth === 0 || sourceHeight < 2) return;

  const frameHeight = Math.floor(sourceHeight / 2);
  if (canvas.width !== sourceWidth || canvas.height !== frameHeight) {
    canvas.width = sourceWidth;
    canvas.height = frameHeight;
  }
  if (maskCanvas.width !== sourceWidth || maskCanvas.height !== frameHeight) {
    maskCanvas.width = sourceWidth;
    maskCanvas.height = frameHeight;
  }

  const context = canvas.getContext("2d");
  const maskContext = maskCanvas.getContext("2d");
  if (!context || !maskContext) return;

  context.clearRect(0, 0, sourceWidth, frameHeight);
  context.drawImage(
    video,
    0,
    0,
    sourceWidth,
    frameHeight,
    0,
    0,
    sourceWidth,
    frameHeight,
  );
  maskContext.clearRect(0, 0, sourceWidth, frameHeight);
  maskContext.drawImage(
    video,
    0,
    frameHeight,
    sourceWidth,
    frameHeight,
    0,
    0,
    sourceWidth,
    frameHeight,
  );

  const color = context.getImageData(0, 0, sourceWidth, frameHeight);
  const mask = maskContext.getImageData(0, 0, sourceWidth, frameHeight);
  for (let index = 0; index < color.data.length; index += 4) {
    color.data[index + 3] = mask.data[index];
  }
  context.putImageData(color, 0, 0);
}

export function ProjectCanvasHenryGloopie() {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    const maskCanvas = document.createElement("canvas");
    let animationFrame = 0;
    let videoFrame = 0;
    let started = false;

    const drawAnimationFrame = () => {
      paintStackedAlphaFrame(video, canvas, maskCanvas);
      animationFrame = window.requestAnimationFrame(drawAnimationFrame);
    };
    const drawVideoFrame = () => {
      paintStackedAlphaFrame(video, canvas, maskCanvas);
      videoFrame = video.requestVideoFrameCallback(drawVideoFrame);
    };
    const startDrawing = () => {
      if (started) return;
      started = true;
      paintStackedAlphaFrame(video, canvas, maskCanvas);
      if (typeof video.requestVideoFrameCallback === "function") {
        videoFrame = video.requestVideoFrameCallback(drawVideoFrame);
      } else {
        animationFrame = window.requestAnimationFrame(drawAnimationFrame);
      }
    };

    video.addEventListener("loadeddata", startDrawing);
    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      startDrawing();
    }
    void video.play().catch(() => {});

    return () => {
      window.cancelAnimationFrame(animationFrame);
      if (typeof video.cancelVideoFrameCallback === "function") {
        video.cancelVideoFrameCallback(videoFrame);
      }
      video.removeEventListener("loadeddata", startDrawing);
      video.pause();
    };
  }, []);

  return (
    <>
      <canvas
        aria-label="Henry Hoover Gloopie"
        className="size-full object-contain drop-shadow-lg"
        data-testid="project-canvas-henry-gloopie"
        ref={canvasRef}
        role="img"
      />
      <video
        autoPlay
        className="pointer-events-none fixed size-px opacity-0"
        data-testid="project-canvas-henry-gloopie-source"
        loop
        muted
        playsInline
        preload="auto"
        ref={videoRef}
        src={HENRY_GLOOPIE_SRC}
      />
    </>
  );
}
