import { Camera } from "lucide-react";

export function FrontYardCameraWidget() {
  return (
    <figure
      aria-label="Front yard camera"
      className="relative h-full min-h-0 overflow-hidden bg-zinc-900"
      data-testid="project-canvas-front-yard-camera"
    >
      <img
        alt="Front yard security camera view with a small parcel by the door"
        className="h-full w-full object-cover"
        data-testid="project-canvas-front-yard-camera-image"
        decoding="async"
        draggable={false}
        src="/project-canvas/front-yard-camera.webp"
      />

      <figcaption className="absolute inset-x-0 bottom-0 bg-black/70 px-3 pb-3 pt-8 text-xs font-medium leading-4 text-white">
        📦 Small delivery arrived at 10:35am
      </figcaption>

      <div
        aria-label="Camera recording"
        className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-black/60 px-2 py-1 text-3xs font-semibold uppercase text-white shadow-sm backdrop-blur-sm"
        role="status"
      >
        <span
          aria-hidden="true"
          className="h-2 w-2 rounded-full bg-red-500 shadow-[0_0_0_3px_rgba(239,68,68,0.25)]"
        />
        Recording
      </div>

      <span
        aria-hidden="true"
        className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-sm"
      >
        <Camera className="h-3.5 w-3.5" />
      </span>
    </figure>
  );
}
