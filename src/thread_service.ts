import { z } from "zod";
import { RealtimeClient } from "./realtime_client.js";

export const ThreadEvent = z.object({
  channel: z.string().min(1), account_id: z.string().min(1), player: z.string().min(1),
  kind: z.enum(["typing", "read"]), message_id: z.string().min(1)
});
export type ThreadEvent = z.infer<typeof ThreadEvent>;

export async function publishThreadEvent(input: unknown, client = new RealtimeClient()) {
  const event = ThreadEvent.parse(input);
  return client.request("/v1/realtime/publish", {
    channel: event.channel,
    event: event.kind === "typing" ? "thread.typing" : "thread.read",
    data: { player: event.player, message_id: event.message_id },
    account_id: event.account_id
  });
}

export async function createThreadChannel(channel: string, client = new RealtimeClient()) {
  return client.request("/v1/realtime/channel/create", { channel, type: "thread", vendor: "inhouse" });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const input = { channel: "match-42", account_id: "acct-7", player: "p-9", kind: "typing", message_id: "m-1" };
  await createThreadChannel(input.channel);
  console.log(await publishThreadEvent(input));
}
