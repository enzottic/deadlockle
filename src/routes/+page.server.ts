import { error } from "@sveltejs/kit";
import type { DeadlockItem } from "$lib/types";
import type { PageServerLoad } from "./$types"

export const load: PageServerLoad = async ({ fetch }) => {
    const itemResponse = await fetch("/api/items");
    if (!itemResponse.ok) {
        error(itemResponse.status, "Unable to load items");
    }
    const { items } = (await itemResponse.json()) as { items: DeadlockItem[] };

    const dailyItemResponse = await fetch("/api/dailyItem")
    if (!dailyItemResponse.ok) {
        error(dailyItemResponse.status, "Unable to load daily item")
    }

    const { items: dailyItem } = (await dailyItemResponse.json()) as {
        items: DeadlockItem;
    };

    return {
        items,
        dailyItem
    }
}
