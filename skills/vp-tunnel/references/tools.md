# Tunnel Tools

Facts about each tool that affect choosing, installing, or wiring it. Commands
and flags belong to each tool's documentation. Behavior was verified with
cloudflared 2026.10.0, the ngrok 3.39.11 agent, and the tmole 2.4.0 client;
recheck a fact after a major upgrade or a plan change.

## Comparison

| Behavior                     | `cloudflared` Quick Tunnel     | `ngrok` (free plan)                              | `tmole`                                     |
| ---------------------------- | ------------------------------ | ------------------------------------------------ | ------------------------------------------- |
| Account                      | None                           | Required, with a verified email                  | None                                        |
| HTTP                         | Yes                            | Yes                                              | Yes                                         |
| WebSocket                    | Yes                            | Yes                                              | No: the upgrade arrives as `GET`, then `404` |
| Server-Sent Events (SSE)     | Buffered until the stream ends | Live                                             | Buffered until the stream ends              |
| `Host` header at the service | Tunnel hostname                | Tunnel hostname, plus `X-Forwarded-Host`         | Tunnel hostname                             |
| `X-Forwarded-Proto`          | `https`                        | `https`                                          | Not sent                                    |
| New URL ready                | Can take a minute or more      | Immediately                                      | Immediately                                 |
| URL on restart               | New random hostname            | New, unless the dev domain is requested          | New random prefix                           |
| URL contents                 | Random words                   | Default: hex prefix and the public IP address    | Random prefix and the public IP address     |

## `cloudflared` Quick Tunnel

- Docs: [Quick Tunnels](https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/do-more-with-tunnels/trycloudflare/),
  [downloads](https://developers.cloudflare.com/tunnel/downloads/).
- Needs no Cloudflare account or domain.
- Intended for testing and development, with no uptime guarantee.
- Allows 200 requests in flight; further requests receive `429`.
- Does not support SSE; streams arrive only after they end.
- The hostname changes on every start and stops working when the process stops.
  A new hostname may resolve late, and a lookup made too early can be cached as
  a failure, so poll it from this machine before handing it out.
- The optional email restriction needs an interactive browser and blocks
  scripted clients.
- A fixed hostname needs an account-backed named Cloudflare Tunnel.

## `ngrok`

- Docs: [ngrok docs](https://ngrok.com/docs/),
  [free plan limits](https://ngrok.com/docs/pricing-limits/free-plan-limits),
  [WebSockets](https://ngrok.com/docs/using-ngrok-with/websockets),
  [agent version policy](https://ngrok.com/docs/gateway/agent/version-support-policy).
- Needs the v3 agent: `ngrok version` must report 3.x. Some package-manager
  wrappers, such as `npm:ngrok`, ship the retired v2 agent.
- Needs a signed-in account with a verified email. An unverified account is
  refused with `ERR_NGROK_123`, and only a person can verify it in the ngrok
  dashboard.
- Free-plan limits: 1 GB of data transfer, 20,000 HTTP requests, and 5,000 TCP
  connections a month; 4,000 HTTP requests a minute; three online endpoints.
- Each free account has one development domain, `<name>.ngrok-free.dev`, listed
  on the dashboard's Domains page. A default start ignores it and gets a new
  `<hex>-<public IP>.ngrok-free.app` URL. Passing the development domain to
  `--url` keeps the same URL across restarts and leaves the IP address out.
- ngrok documents a warning page before HTML browser traffic on the free plan.
  It does not affect `fetch`, WebSocket, or other non-HTML traffic, and it may
  not appear at all. The `ngrok-skip-browser-warning` request header skips it.

## `tmole` (Tunnelmole)

- Docs: [Tunnelmole docs](https://tunnelmole.com/docs/).
- Needs no account for the hosted service.
- Installs through a `curl` piped to `sudo bash` installer or a global npm
  package; review the installer and ask before running either.
- Sends anonymized telemetry by default; `TUNNELMOLE_TELEMETRY=0` turns it off.
- Does not carry WebSocket and buffers SSE.
- The client is MIT licensed; the service is AGPLv3 and can be self-hosted.
  Custom subdomains on the hosted service need a subscription.
