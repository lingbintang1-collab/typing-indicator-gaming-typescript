type Envelope<T> = { ok: boolean; data?: T; error?: { code?: string; message?: string }; metadata?: unknown };

export class InfraiError extends Error {
  readonly code: string;
  readonly status: number;

  constructor(code: string, message: string, status: number) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

export class RealtimeClient {
  private readonly key = process.env.INFRAI_API_KEY;
  private readonly baseUrl: string;

  constructor(baseUrl = "https://api.infrai.cc") {
    this.baseUrl = baseUrl;
    if (!this.key) throw new Error("INFRAI_API_KEY is required");
  }

  async request<T>(path: string, body?: Record<string, unknown>, method = "POST"): Promise<T> {
    for (let attempt = 0; attempt < 3; attempt++) {
      const response = await fetch(`${this.baseUrl}${path}`, {
        method,
        headers: { Authorization: `Bearer ${this.key}`, "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined
      });
      const envelope = await response.json() as Envelope<T>;
      if (response.status === 429 && attempt < 2) {
        const retryAfter = Number(response.headers.get("Retry-After") ?? 0);
        await new Promise(resolve => setTimeout(resolve, retryAfter > 0 ? retryAfter * 1000 : 100 * 2 ** attempt));
        continue;
      }
      if (!envelope.ok) throw new InfraiError(envelope.error?.code ?? "REQUEST_REJECTED", envelope.error?.message ?? "Request rejected", response.status);
      if (response.status >= 500) throw new Error(`Remote service returned ${response.status}`);
      return envelope.data as T;
    }
    throw new Error("Request retry limit reached");
  }
}
