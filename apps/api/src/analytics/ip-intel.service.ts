import { Injectable, Logger } from "@nestjs/common";

export interface IpClass {
  /** Datacentre / hosting / VPS address. */
  hosting: boolean;
  /** VPN, public proxy or Tor exit. */
  proxy: boolean;
  /** ISO-3166 alpha-2, when the lookup returned one. */
  country: string | null;
}

// ip-api.com batch endpoint: free, HTTP-only, ~15 requests/min, up to 100 IPs
// per request. We only ask for the fields we mark on.
const BATCH_URL = "http://ip-api.com/batch?fields=status,proxy,hosting,countryCode,query";
const BATCH_SIZE = 100;

/**
 * Classifies IP addresses as datacentre/VPS or VPN/proxy, best-effort, via
 * ip-api.com. Private and reserved addresses are answered locally without a
 * call. Any network, HTTP or parse failure yields nothing for the affected IPs
 * (the caller leaves those rows unclassified and retries on the next view)
 * rather than throwing — analytics must never break on a flaky third party.
 *
 * Note: this sends visitor IPs to ip-api.com. It runs only for the admin
 * visitor-history view and the result is cached on the row, so an IP is sent at
 * most once.
 */
@Injectable()
export class IpIntelService {
  private readonly log = new Logger(IpIntelService.name);

  async classifyMany(ips: readonly string[]): Promise<Map<string, IpClass>> {
    const out = new Map<string, IpClass>();
    const toLookup: string[] = [];
    for (const ip of new Set(ips)) {
      if (!ip) continue;
      if (isPrivate(ip)) out.set(ip, { hosting: false, proxy: false, country: null });
      else toLookup.push(ip);
    }

    for (let i = 0; i < toLookup.length; i += BATCH_SIZE) {
      const batch = toLookup.slice(i, i + BATCH_SIZE);
      try {
        const res = await fetch(BATCH_URL, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(batch),
          signal: AbortSignal.timeout(5000),
        });
        if (!res.ok) {
          this.log.warn(`IP classification HTTP ${res.status}`);
          continue;
        }
        const rows = (await res.json()) as Array<{
          status?: string;
          query?: string;
          proxy?: boolean;
          hosting?: boolean;
          countryCode?: string;
        }>;
        for (const r of rows) {
          if (r.status === "success" && r.query) {
            out.set(r.query, {
              hosting: !!r.hosting,
              proxy: !!r.proxy,
              country: r.countryCode || null,
            });
          }
        }
      } catch (err) {
        this.log.warn(`IP classification failed: ${err instanceof Error ? err.message : String(err)}`);
      }
    }
    return out;
  }
}

/** RFC1918 / loopback / link-local / unique-local — never worth a lookup. */
function isPrivate(raw: string): boolean {
  const ip = raw.startsWith("::ffff:") ? raw.slice(7) : raw;
  if (ip === "127.0.0.1" || ip === "::1") return true;
  if (ip.startsWith("10.") || ip.startsWith("192.168.") || ip.startsWith("169.254.")) return true;
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(ip)) return true;
  const low = ip.toLowerCase();
  return low.startsWith("fc") || low.startsWith("fd") || low.startsWith("fe80");
}
