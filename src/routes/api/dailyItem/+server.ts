import { json } from "@sveltejs/kit";
import type { RequestHandler } from "../items/$types";
import type { DeadlockItem } from "$lib/types";

export const GET: RequestHandler = async ({ platform }) => {
    try {
        const kv = platform?.env.DEADLOCKLE;
        if (!kv) {
            return json({ error: "KV binding is unavailable" }, { status: 503 });
        }

        const response = await Promise.race([
            kv.get("dailyItem"),
            new Promise<never>((_, reject) =>
                setTimeout(() => reject(new Error("KV request timed out")), 8_000)
            )
        ]);
        if (response === null) {
            return json({ error: "Daily item was not found in KV" }, { status: 404 });
        }
        const items = JSON.parse(response) as DeadlockItem;
        return json({ items: items })
    } catch (error) {
        console.error("Failed to retrieve daily item from KV", error);
        return json({ error: "Failed to retrieve data" }, { status: 502 });
    }
}
