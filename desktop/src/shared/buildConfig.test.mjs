import assert from "node:assert/strict";
import test from "node:test";

import { resolveHostedCommunityProvider } from "./buildConfig.ts";

test("hosted community provider defaults to Builderlab for upstream builds", () => {
  assert.equal(resolveHostedCommunityProvider(undefined), "builderlab");
  assert.equal(resolveHostedCommunityProvider(""), "builderlab");
  assert.equal(resolveHostedCommunityProvider(" BUILDERLAB "), "builderlab");
});

test("managed builds can replace the Builderlab account surface", () => {
  assert.equal(resolveHostedCommunityProvider("dreamatron"), "dreamatron");
  assert.equal(resolveHostedCommunityProvider("self-hosted"), "external");
});
