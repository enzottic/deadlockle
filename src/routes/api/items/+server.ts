import { json, type RequestHandler } from "@sveltejs/kit";
import type { DeadlockItem } from "$lib/types";

const DEADLOCK_IO_ORIGIN = "https://www.deadlock.io";
const DEADLOCK_IO_ITEMS_URL = `${DEADLOCK_IO_ORIGIN}/api/v1/items.json`;
const IMAGE_CACHE_TTL = 6 * 60 * 60 * 1_000;

interface DeadlockIoAsset {
    publicPath?: string | null;
}

interface DeadlockIoItem {
    displayName?: { english?: string };
    assets?: {
        icon?: DeadlockIoAsset | null;
        shopIcon?: DeadlockIoAsset | null;
    };
}

interface DeadlockIoItemsResponse {
    items?: DeadlockIoItem[];
}

type StoredDeadlockItem = Omit<DeadlockItem, "type"> & {
    type: string;
};

const normalizeItemType = (type: string): DeadlockItem["type"] =>
    type === "Vitality" || type === "Spirit" ? type : "Weapon";

let imageCache: { expiresAt: number; imagesByName: Map<string, string> } | undefined;
let pendingImageLookup: Promise<Map<string, string>> | undefined;

const normalizeItemName = (name: string) =>
    name.normalize("NFKD").toLowerCase().replace(/[^a-z0-9]+/g, "");

const normalizeImageLookupName = (name: string) => {
    const normalizedName = normalizeItemName(name);
    // The current local catalog spells Echo Shard as "Echo Shared".
    return normalizedName === "echoshared" ? "echoshard" : normalizedName;
};

const resolveAssetUrl = (publicPath: string | null | undefined): string | undefined => {
    if (!publicPath?.startsWith("/assets/")) return undefined;
    return new URL(publicPath, DEADLOCK_IO_ORIGIN).toString();
};

const fetchImageLookup = async (requestFetch: typeof fetch): Promise<Map<string, string>> => {
    const response = await requestFetch(DEADLOCK_IO_ITEMS_URL, {
        headers: { accept: "application/json" },
        signal: AbortSignal.timeout(5_000)
    });
    if (!response.ok) {
        throw new Error(`Deadlock.io items request failed with ${response.status}`);
    }

    const payload = await response.json() as DeadlockIoItemsResponse;
    const imagesByName = new Map<string, string>();
    for (const item of payload.items ?? []) {
        const name = item.displayName?.english;
        const imageUrl = resolveAssetUrl(
            item.assets?.shopIcon?.publicPath ?? item.assets?.icon?.publicPath
        );
        if (name && imageUrl) {
            imagesByName.set(normalizeItemName(name), imageUrl);
        }
    }

    imageCache = { expiresAt: Date.now() + IMAGE_CACHE_TTL, imagesByName };
    return imagesByName;
};

const getImageLookup = (requestFetch: typeof fetch): Promise<Map<string, string>> => {
    if (imageCache && imageCache.expiresAt > Date.now()) {
        return Promise.resolve(imageCache.imagesByName);
    }

    pendingImageLookup ??= fetchImageLookup(requestFetch).finally(() => {
        pendingImageLookup = undefined;
    });
    return pendingImageLookup;
};

export const GET: RequestHandler = async ({ platform, fetch }) => {
    try {
        const kv = platform?.env.DEADLOCKLE;
        if (!kv) {
            return json({ error: "KV binding is unavailable" }, { status: 503 });
        }

        const response = await Promise.race([
            kv.get("items"),
            new Promise<never>((_, reject) =>
                setTimeout(() => reject(new Error("KV request timed out")), 8_000)
            )
        ]);
        if (response === null) {
            return json({ error: "Items were not found in KV" }, { status: 404 });
        }
        const storedItems = JSON.parse(response) as StoredDeadlockItem[];
        const items: DeadlockItem[] = storedItems.map((item) => ({
            ...item,
            type: normalizeItemType(item.type)
        }));

        try {
            const imagesByName = await getImageLookup(fetch);
            const enrichedItems = items.map((item) => ({
                ...item,
                image_url: imagesByName.get(normalizeImageLookupName(item.name))
            }));
            return json({ items: enrichedItems });
        } catch (error) {
            console.warn("Unable to enrich items with Deadlock.io images", error);
            return json({ items });
        }
    } catch (error) {
        console.error("Failed to retrieve items from KV", error);
        return json({ error: "Failed to retrieve data" }, { status: 502 });
    }
}
