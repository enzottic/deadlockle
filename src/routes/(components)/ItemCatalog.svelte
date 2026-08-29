<script lang="ts">
    import type { DeadlockItem, DeadlockItemType } from "$lib/types";
    import paperTexture from "$lib/assets/paper.jpg";

    interface Props {
        items: DeadlockItem[];
        onselect: (item: DeadlockItem) => void;
    }

    interface TierGroup {
        tier: string;
        items: DeadlockItem[];
    }

    const itemTypes: DeadlockItemType[] = ["Gun", "Vitality", "Spirit"];

    let { items, onselect }: Props = $props();
    let activeType = $state<DeadlockItemType>("Gun");

    const groupItemsByTypeAndTier = (catalogItems: DeadlockItem[]): Record<DeadlockItemType, TierGroup[]> => {
        const itemsByType = catalogItems.reduce<Record<DeadlockItemType, DeadlockItem[]>>(
            (groups, item) => {
                groups[item.type].push(item);
                return groups;
            },
            { Gun: [], Vitality: [], Spirit: [] }
        );

        return Object.fromEntries(
            itemTypes.map((type) => {
                const tiers = Map.groupBy(itemsByType[type], (item) => String(item.tier));
                const tierGroups = Array.from(tiers, ([tier, tierItems]) => ({
                    tier,
                    items: tierItems.toSorted((a, b) => a.name.localeCompare(b.name))
                })).toSorted((a, b) => Number(a.tier) - Number(b.tier));

                return [type, tierGroups];
            })
        ) as Record<DeadlockItemType, TierGroup[]>;
    };

    let groupedItems = $derived(groupItemsByTypeAndTier(items));
</script>

<div
    class="picker-shell"
    class:gun={activeType === "Gun"}
    class:vitality={activeType === "Vitality"}
    class:spirit={activeType === "Spirit"}
    style:--paper-texture={`url(${paperTexture})`}
>
    <div class="type-tabs" role="tablist" aria-label="Item types">
        {#each itemTypes as type}
            <button
                class="type-tab"
                class:gun={type === "Gun"}
                class:vitality={type === "Vitality"}
                class:spirit={type === "Spirit"}
                class:active={activeType === type}
                type="button"
                role="tab"
                aria-selected={activeType === type}
                aria-controls="item-picker-panel"
                onclick={() => activeType = type}
            >
                {type}
            </button>
        {/each}
    </div>

    <section id="item-picker-panel" class="item-group" role="tabpanel">
        <div class="tier-groups">
            {#each groupedItems[activeType] as tierGroup}
                <section class={`tier-group tier-${tierGroup.tier}`}>
                    <h2>Tier {tierGroup.tier}</h2>
                    <div class="item-buttons">
                        {#each tierGroup.items as item}
                            <button class="item-button" type="button" onclick={() => onselect(item)}>
                                {#if item.image_url}
                                    <span class="item-icon-slot">
                                        <img class="item-icon" src={item.image_url} alt="" loading="lazy" decoding="async" draggable="false" />
                                    </span>
                                {:else}
                                    <span class="item-icon-slot placeholder" aria-hidden="true"></span>
                                {/if}
                                <span class="item-name">{item.name}</span>
                            </button>
                        {/each}
                    </div>
                </section>
            {/each}
        </div>
    </section>
</div>

<style>
    .picker-shell {
        --type-color: #a8a8a8;
        --type-surface: #303030;
        --type-surface-hover: #3b3b3b;
        position: relative;
        left: 50%;
        width: min(calc(100vw - 6rem), 1350px);
        margin: 0 auto;
        transform: translateX(-50%);
    }

    .picker-shell.gun {
        --type-color: #DFB016;
        --type-surface: #49331f;
        --type-surface-hover: #5b4027;
        --item-group-background: #867662;
    }

    .picker-shell.vitality {
        --type-color: #A3CD3E;
        --type-surface: #244232;
        --type-surface-hover: #2d533e;
        --item-group-background: #747162;
    }

    .picker-shell.spirit {
        --type-color: #AF75B8;
        --type-surface: #3b2c4e;
        --type-surface-hover: #4a3762;
        --item-group-background: #847679;
    }

    .type-tabs {
        position: absolute;
        top: 0;
        right: 100%;
        display: flex;
        width: 5rem;
        flex-direction: column;
        gap: 0.35rem;
        padding-top: 1rem;
    }

    .type-tab {
        --tab-color: #a8a8a8;
        min-height: 3.25rem;
        padding: 0.7rem 0.5rem;
        border: 0;
        border-radius: 0.5rem 0 0 0.5rem;
        background: var(--tab-color);
        color: #171717;
        cursor: pointer;
        font: inherit;
        font-size: 0.72rem;
        font-weight: 800;
        letter-spacing: 0.04em;
        opacity: 0.78;
        position: relative;
        text-align: left;
        text-transform: uppercase;
        transform: translateX(1px);
        transition: opacity 120ms ease, transform 120ms ease;
    }

    .type-tab.gun {
        --tab-color: #DFB016;
    }

    .type-tab.vitality {
        --tab-color: #A3CD3E;
    }

    .type-tab.spirit {
        --tab-color: #AF75B8;
    }

    .type-tab:hover,
    .type-tab:focus-visible,
    .type-tab.active {
        background: var(--tab-color);
        color: #171717;
        opacity: 1;
    }

    .type-tab.active {
        transform: translateX(0.4rem);
    }

    .type-tab.active::after {
        position: absolute;
        top: 0;
        right: -0.7rem;
        width: 0.75rem;
        height: 100%;
        background: var(--tab-color);
        content: "";
    }

    .item-group {
        position: relative;
        min-width: 0;
        min-height: 28rem;
        padding: 1.25rem;
        border: 0;
        background: var(--item-group-background);
        overflow: hidden;
    }

    .item-group::before {
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        width: 0.45rem;
        background: var(--type-color);
        content: "";
        z-index: 2;
    }

    .item-group::after {
        position: absolute;
        inset: 0;
        background-image: var(--paper-texture);
        background-position: center;
        background-repeat: no-repeat;
        background-size: cover;
        content: "";
        mix-blend-mode: multiply;
        opacity: 0.4;
        pointer-events: none;
        z-index: 1;
    }

    .tier-groups {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 1rem;
        margin-top: 1rem;
    }

    .tier-group {
        --tier-surface: var(--type-surface);
        --tier-surface-hover: var(--type-surface-hover);
        --tier-text-color: #f3f3f3;
        min-width: 0;
        padding: 0.8rem;
        /*border: 2px solid #202020;*/
        border-radius: 0.35rem;
        /*background: #202020;*/
    }

    .tier-group.tier-1 {
        --tier-surface: color-mix(in srgb, var(--type-color) 42%, #777);
        --tier-surface-hover: color-mix(in srgb, var(--type-color) 48%, #858585);
    }

    .tier-group.tier-2 {
        --tier-surface: color-mix(in srgb, var(--type-color) 34%, #3d3d3d);
        --tier-surface-hover: color-mix(in srgb, var(--type-color) 40%, #494949);
    }

    .tier-group.tier-3 {
        --tier-surface: color-mix(in srgb, var(--type-color) 23%, #202020);
        --tier-surface-hover: color-mix(in srgb, var(--type-color) 29%, #2c2c2c);
    }

    .tier-group.tier-4 {
        --tier-surface: color-mix(in srgb, var(--type-color) 10%, #080808);
        --tier-surface-hover: color-mix(in srgb, var(--type-color) 16%, #141414);
    }

    .picker-shell.gun .tier-group {
        --tier-text-color: #261C00;
    }

    .picker-shell.gun .tier-group.tier-1 {
        --tier-surface: #E7CA8E;
        --tier-surface-hover: color-mix(in srgb, #E7CA8E 90%, white);
    }

    .picker-shell.gun .tier-group.tier-2 {
        --tier-surface: #C29B61;
        --tier-surface-hover: color-mix(in srgb, #C29B61 90%, white);
    }

    .picker-shell.gun .tier-group.tier-3 {
        --tier-surface: #BB7E40;
        --tier-surface-hover: color-mix(in srgb, #BB7E40 90%, white);
    }

    .picker-shell.gun .tier-group.tier-4 {
        --tier-surface: #5A4F45;
        --tier-surface-hover: color-mix(in srgb, #5A4F45 90%, white);
        --tier-text-color: #E7C4A3;
    }

    .picker-shell.vitality .tier-group {
        --tier-text-color: #131A00;
    }

    .picker-shell.vitality .tier-group.tier-1 {
        --tier-surface: #B9CF95;
        --tier-surface-hover: color-mix(in srgb, #B9CF95 90%, white);
    }

    .picker-shell.vitality .tier-group.tier-2 {
        --tier-surface: #8DA678;
        --tier-surface-hover: color-mix(in srgb, #8DA678 90%, white);
    }

    .picker-shell.vitality .tier-group.tier-3 {
        --tier-surface: #5B7449;
        --tier-surface-hover: color-mix(in srgb, #5B7449 90%, white);
    }

    .picker-shell.vitality .tier-group.tier-4 {
        --tier-surface: #494940;
        --tier-surface-hover: color-mix(in srgb, #494940 90%, white);
        --tier-text-color: #6E9888;
    }

    .picker-shell.spirit .tier-group {
        --tier-text-color: #2B1F28;
    }

    .picker-shell.spirit .tier-group.tier-1 {
        --tier-surface: #ECC2D9;
        --tier-surface-hover: color-mix(in srgb, #ECC2D9 90%, white);
    }

    .picker-shell.spirit .tier-group.tier-2 {
        --tier-surface: #A88FAD;
        --tier-surface-hover: color-mix(in srgb, #A88FAD 90%, white);
    }

    .picker-shell.spirit .tier-group.tier-3 {
        --tier-surface: #9180AC;
        --tier-surface-hover: color-mix(in srgb, #9180AC 90%, white);
    }

    .picker-shell.spirit .tier-group.tier-4 {
        --tier-surface: #4F4A45;
        --tier-surface-hover: color-mix(in srgb, #4F4A45 90%, white);
        --tier-text-color: #DCC5D7;
    }

    .tier-group h2 {
        margin: 0 0 0.5rem;
        color: var(--tier-text-color);
        font-size: 1rem;
        letter-spacing: 0.1em;
        text-transform: uppercase;
    }

    .item-buttons {
        display: grid;
        grid-template-columns: repeat(6, minmax(0, 1fr));
        gap: 0.4rem;
    }

    .item-button {
        display: flex;
        min-width: 0;
        align-items: center;
        justify-content: flex-start;
        flex-direction: column;
        gap: 0;
        padding: 0;
        overflow: hidden;
        border: 0;
        border-radius: 0.75rem;
        background: var(--tier-surface);
        color: var(--tier-text-color);
        cursor: pointer;
        font: inherit;
        text-align: center;
    }

    .item-button:hover,
    .item-button:focus-visible {
        background: var(--tier-surface-hover);
    }

    .item-button:hover .item-name,
    .item-button:focus-visible .item-name {
        background: var(--tier-surface-hover);
    }

    .item-icon-slot {
        display: grid;
        aspect-ratio: 1;
        width: 100%;
        min-height: 0;
        flex: 0 0 auto;
        place-items: center;
        border: 0;
        background:
            linear-gradient(135deg, transparent 48%, color-mix(in srgb, var(--type-color) 15%, transparent) 48% 52%, transparent 52%),
            rgb(0 0 0 / 18%);
    }

    .item-icon-slot.placeholder::after {
        width: 2.25rem;
        height: 2.25rem;
        border: 0;
        border-radius: 50%;
        background: rgb(255 255 255 / 14%);
        content: "";
        opacity: 0.55;
    }

    .item-icon {
        display: block;
        width: 100%;
        height: 100%;
        object-fit: contain;
        object-position: center;
        user-select: none;
    }

    .item-name {
        display: flex;
        width: 100%;
        min-height: 2.75rem;
        flex: 1 1 auto;
        align-items: center;
        justify-content: center;
        padding: 0.35rem 0.4rem;
        box-sizing: border-box;
        background: var(--tier-surface);
        font-size: 0.9rem;
        font-weight: 700;
        line-height: 1.2;
    }

    @media (max-width: 1050px) {
        .item-buttons {
            grid-template-columns: repeat(3, minmax(0, 1fr));
        }
    }

    @media (max-width: 560px) {
        .picker-shell {
            left: auto;
            width: 100%;
            padding-top: 3.15rem;
            box-sizing: border-box;
            transform: none;
        }

        .type-tabs {
            top: 0;
            right: auto;
            left: 0;
            width: 100%;
            flex-direction: row;
            gap: 0.35rem;
            padding: 0 0.5rem;
            box-sizing: border-box;
        }

        .type-tab {
            min-height: auto;
            flex: 1 1 0;
            border: 0;
            border-radius: 0.5rem 0.5rem 0 0;
            font-size: 0.72rem;
            text-align: center;
            transform: translateY(1px);
        }

        .type-tab.active {
            transform: translateY(0.4rem);
        }

        .type-tab.active::after {
            top: auto;
            right: 0;
            bottom: -0.7rem;
            width: 100%;
            height: 0.75rem;
        }

        .tier-groups {
            grid-template-columns: 1fr;
        }

        .item-buttons {
            grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        .item-group {
            width: 100%;
            min-height: 0;
            box-sizing: border-box;
        }

        .item-group::before {
            right: 0;
            bottom: auto;
            width: auto;
            height: 0.45rem;
        }
    }
</style>
