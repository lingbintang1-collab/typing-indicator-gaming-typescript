import { strict as assert } from "node:assert";
import { ThreadEvent } from "./thread_service.js";

const valid = ThreadEvent.safeParse({ channel: "match-42", account_id: "acct-7", player: "p-9", kind: "read", message_id: "m-1" });
assert.equal(valid.success, true);
const invalid = ThreadEvent.safeParse({ channel: "", account_id: "acct-7", player: "p-9", kind: "typing", message_id: "m-1" });
assert.equal(invalid.success, false);
console.log("thread event boundary checks passed");
