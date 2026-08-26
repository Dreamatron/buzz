const BERD_AVATAR_CDN =
  "https://dwwgwmfqqjotj.cloudfront.net/avatars/20260821T192222985Z";

export function ProjectCanvasGloopie() {
  return (
    <video
      aria-label="Gloopie helper"
      autoPlay
      className="h-full w-full object-contain drop-shadow-md"
      data-testid="project-canvas-gloopie"
      loop
      muted
      playsInline
      poster={`${BERD_AVATAR_CDN}/poster/gloopies/gloopies-22.png`}
      preload="metadata"
    >
      <source
        src={`${BERD_AVATAR_CDN}/hevc/gloopies/gloopies-22.mp4`}
        type='video/mp4; codecs="hvc1"'
      />
      <source
        src={`${BERD_AVATAR_CDN}/webm/gloopies/gloopies-22.webm`}
        type='video/webm; codecs="vp9"'
      />
    </video>
  );
}
