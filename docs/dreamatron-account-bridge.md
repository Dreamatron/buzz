# Dreamatron account bridge

The Dreamatron desktop distribution connects directly to the Dreamatron Buzz
relay. Builderlab is Block's optional hosted-community control plane and is not
part of this path.

## Current boundary

- The desktop build bakes in the reviewed Lucifer relay URL and enables Buzz's
  first-run auto-connect path.
- Buzz creates or restores a Nostr key locally and uses that key for NIP-42 and
  NIP-98 relay authentication.
- The private key remains in the operating-system keyring (with Buzz's existing
  local-file fallback) and is never sent to Dreamatron's account service.
- The Builderlab creation and settings surfaces are hidden in the Dreamatron
  build. Joining another relay by URL or invite remains available.

This removes the unrelated Builderlab sign-in without weakening relay
authentication. It does not yet claim that a Dreamatron web account is linked
to a Buzz identity.

## Account-link contract

When the Dreamatron account service exposes an application authentication API,
the bridge should use Authorization Code with PKCE in the system browser and a
short-lived callback to Desktop. The resulting Dreamatron session identifies
the account; Buzz still proves possession of the local Nostr identity.

The binding handshake should be:

1. Desktop signs in to Dreamatron with PKCE and receives a short-lived account
   access token.
2. Desktop requests a one-time binding challenge containing the account id,
   Buzz public key, intended relay, nonce, and expiry.
3. Desktop signs the challenge with the local Nostr key.
4. The account service verifies the signature and atomically records a unique
   `(dreamatron_account_id, buzz_pubkey, relay)` binding.
5. Lucifer grants or reconciles relay membership from that server-side binding.

Required safety properties:

- Never upload or escrow the Buzz private key.
- Bind only an exact relay origin and expire unused challenges quickly.
- Prevent one public key from silently binding to multiple Dreamatron accounts.
- Make account sign-out revoke the web session without deleting the local Buzz
  identity.
- Treat key replacement and account recovery as explicit, audited operations.
- Keep relay membership authoritative for Buzz data access; the account layer
  provisions membership but does not bypass it.

The concrete endpoint paths and token issuer are intentionally unspecified
until the Dreamatron account API is stable. This keeps the desktop seam honest
and avoids coupling the fork to DreamTrack's current browser cookie.
