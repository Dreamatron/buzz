const BERD_AVATAR_CDN =
  "https://dwwgwmfqqjotj.cloudfront.net/avatars/20260821T192222985Z";

export function ProjectCanvasGloopie({
  ariaLabel = "Gloopie helper",
  avatarId = 22,
  testId = "project-canvas-gloopie",
}: {
  ariaLabel?: string;
  avatarId?: number;
  testId?: string;
} = {}) {
  const avatarSlug = `gloopies-${avatarId}`;

  return (
    <video
      aria-label={ariaLabel}
      autoPlay
      className="h-full w-full object-contain drop-shadow-md"
      data-berd-avatar-id={avatarSlug}
      data-testid={testId}
      loop
      muted
      playsInline
      poster={`${BERD_AVATAR_CDN}/poster/gloopies/${avatarSlug}.png`}
      preload="metadata"
    >
      <source
        src={`${BERD_AVATAR_CDN}/hevc/gloopies/${avatarSlug}.mp4`}
        type='video/mp4; codecs="hvc1"'
      />
      <source
        src={`${BERD_AVATAR_CDN}/webm/gloopies/${avatarSlug}.webm`}
        type='video/webm; codecs="vp9"'
      />
    </video>
  );
}
