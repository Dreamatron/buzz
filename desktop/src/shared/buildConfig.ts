export type HostedCommunityProvider = "builderlab" | "dreamatron" | "external";

export function resolveHostedCommunityProvider(
  value: string | null | undefined,
): HostedCommunityProvider {
  const normalized = value?.trim().toLowerCase();
  if (!normalized || normalized === "builderlab") return "builderlab";
  if (normalized === "dreamatron") return "dreamatron";
  return "external";
}

const viteEnv = (
  import.meta as ImportMeta & {
    env?: Record<string, string | undefined>;
  }
).env;

export const hostedCommunityProvider = resolveHostedCommunityProvider(
  viteEnv?.VITE_BUZZ_HOSTED_COMMUNITY_PROVIDER,
);

/**
 * Builderlab is an optional Block-hosted control plane, not a requirement for
 * connecting to a self-hosted Buzz relay. Managed distributions can set
 * `VITE_BUZZ_HOSTED_COMMUNITY_PROVIDER` to keep that account surface out of
 * onboarding and settings while preserving Nostr identity and relay auth.
 */
export const builderlabHostedCommunitiesEnabled =
  hostedCommunityProvider === "builderlab";
