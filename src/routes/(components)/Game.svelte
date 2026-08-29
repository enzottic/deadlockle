<script lang="ts">
    import type { DeadlockItem, DeadlockleGuessState, HigherLowerResult, ResultColor } from "$lib/types";
    import { onMount } from "svelte";
    import ItemCatalog from "./ItemCatalog.svelte";

    interface Props {
      items: DeadlockItem[];
      dailyItem: DeadlockItem;
    }
    let { items }: Props = $props();

    let guesses = $state<DeadlockleGuessState[]>([]);
    let dailyItem = $state<DeadlockItem>();
    let hasWon = $state<boolean>(false)

    onMount(() => {
        dailyItem = items[Math.floor(Math.random() * items.length)]
    });

    const handleGuess = (item: DeadlockItem) => {
        const targetItem = dailyItem;
        if (!targetItem) return;

        console.log(`Guessed item ${item.name}`)
        let guessState: DeadlockleGuessState = {
            item: item,
            typeResult: item.type === targetItem.type ? "green" : "red",
            tierResult: item.tier === targetItem.tier ? "green" : "red",
            statsResult: calculateListResult(item.stats, targetItem.stats),
            upgradesFromResult: calculateHigherLowerResult(item.upgrades_from, targetItem.upgrades_from, 1),
            upgradesToResult: calculateHigherLowerResult(item.upgrades_to, targetItem.upgrades_to, 1),
            triggerResult: calculateListResult(item.item_trigger, targetItem.item_trigger),
            effectResult: calculateListResult(item.item_effect, targetItem.item_effect),
        }
        guesses = [...guesses, guessState]
        if (item.name === targetItem.name) {
            hasWon = true
        }
    }

    // guess (n1) = 3
    // dailyItem (n2) = 1
    // 3 - 1 = 2 (positive = lower, negative = higher, 0 = correct)
    // delta = 1
    const calculateHigherLowerResult = (n1: number, n2: number, delta: number): HigherLowerResult => {
        let diff = n1 - n2;
        let distance = Math.abs(diff);
        return {
            colorResult: diff === 0 ? "green" : (distance <= delta ? "yellow" : "red"),
            direction: diff === 0 ? "correct" : (diff > 0 ? "lower" : "higher")
        }
    }

    // a1 = ["Bonus Health"]
    // a2 = ["Bonus Health", "Increased Regen"]
    // result = "yellow"
    const calculateListResult = (a1: string[] | undefined, a2: string[] | undefined): ResultColor => {
        if (a1 === undefined && a2 === undefined) return "green"
        if (a1 === undefined || a2 === undefined) return "red"

        // if all elements match, return green
        if (a1.length === a2.length && a1.every(value => a2.includes(value))) {
            return "green";
        }

        // if no elements match, return red
        if (!a1.some(value => a2.includes(value))) {
            return "red";
        }

        // if at least one element matches, but not all, return "yellow"
        return "yellow";
    }

</script>

<main>
    <div class="guesses">
        {#if guesses.length === 0}
            <p class="empty-state">Choose an item below to make your first guess.</p>
        {/if}

        {#each guesses as guess, index}
            <div class="guess">
                <div class="guess-heading">
                    <h2>{guess.item.name}</h2>
                    <span class="guess-label">Guess {index + 1}</span>
                </div>

                <div class="attribute-grid">
                    <div
                        class="attribute"
                        class:green={guess.typeResult === "green"}
                        class:red={guess.typeResult === "red"}
                        class:yellow={guess.typeResult === "yellow"}
                    >
                        <span class="attribute-label">Type</span>
                        <strong>{guess.item.type}</strong>
                    </div>

                    <div
                        class="attribute"
                        class:green={guess.tierResult === "green"}
                        class:red={guess.tierResult === "red"}
                        class:yellow={guess.tierResult === "yellow"}
                    >
                        <span class="attribute-label">Tier</span>
                        <strong>{guess.item.tier}</strong>
                    </div>

                    <div
                        class="attribute list-attribute"
                        class:green={guess.statsResult === "green"}
                        class:red={guess.statsResult === "red"}
                        class:yellow={guess.statsResult === "yellow"}
                    >
                        <span class="attribute-label">Stats</span>
                        {#if guess.item.stats?.length}
                            <ul class="attribute-list">
                                {#each guess.item.stats as stat}
                                    <li class="attribute-list-item">{stat}</li>
                                {/each}
                            </ul>
                        {:else}
                            <strong>None</strong>
                        {/if}
                    </div>

                    <div
                        class="attribute list-attribute"
                        class:green={guess.triggerResult === "green"}
                        class:red={guess.triggerResult === "red"}
                        class:yellow={guess.triggerResult === "yellow"}
                    >
                        <span class="attribute-label">Triggers</span>
                        {#if guess.item.item_trigger?.length}
                            <ul class="attribute-list">
                                {#each guess.item.item_trigger as trigger}
                                    <li class="attribute-list-item">{trigger}</li>
                                {/each}
                            </ul>
                        {:else}
                            <strong>None</strong>
                        {/if}
                    </div>

                    <div
                        class="attribute list-attribute"
                        class:green={guess.effectResult === "green"}
                        class:red={guess.effectResult === "red"}
                        class:yellow={guess.effectResult === "yellow"}
                    >
                        <span class="attribute-label">Effects</span>
                        {#if guess.item.item_effect?.length}
                            <ul class="attribute-list">
                                {#each guess.item.item_effect as effect}
                                    <li class="attribute-list-item">{effect}</li>
                                {/each}
                            </ul>
                        {:else}
                            <strong>None</strong>
                        {/if}
                    </div>

                    <div
                        class="attribute"
                        class:green={guess.upgradesFromResult.colorResult === "green"}
                        class:red={guess.upgradesFromResult.colorResult === "red"}
                        class:yellow={guess.upgradesFromResult.colorResult === "yellow"}
                    >
                        <span class="attribute-label">Upgrades from</span>
                        <strong>{guess.item.upgrades_from}</strong>
                        <span class="direction">
                            {guess.upgradesFromResult.direction === "correct"
                                ? ""
                                : `Mystery is ${guess.upgradesFromResult.direction}`}
                        </span>
                    </div>

                    <div
                        class="attribute"
                        class:green={guess.upgradesToResult.colorResult === "green"}
                        class:red={guess.upgradesToResult.colorResult === "red"}
                        class:yellow={guess.upgradesToResult.colorResult === "yellow"}
                    >
                        <span class="attribute-label">Upgrades to</span>
                        <strong>{guess.item.upgrades_to}</strong>
                        <span class="direction">
                            {guess.upgradesToResult.direction === "correct"
                                ? ""
                                : `Mystery is ${guess.upgradesToResult.direction}`}
                        </span>
                    </div>

                </div>
            </div>
        {/each}
    </div>

    {#if hasWon}
        <h3 class="win-message">You won! The item was {dailyItem?.name}.</h3>
    {/if}

    <ItemCatalog {items} onselect={handleGuess} />
</main>

<style>
    main {
        width: min(100% - 2rem, 1100px);
        margin: 0 auto;
        padding: 1rem 0 3rem;
    }

    .guesses {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        margin-bottom: 1.5rem;
    }

    .guess {
        width: 100%;
        padding: 1rem;
        box-sizing: border-box;
        border: 1px solid #424242;
        border-radius: 0.75rem;
        background: #282828;
    }

    .guess-heading {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        gap: 1rem;
    }

    .guess-heading h2 {
        margin: 0;
    }

    .guess-label {
        color: #a8a8a8;
        font-size: 0.85rem;
    }

    .attribute-grid {
        display: grid;
        grid-template-columns: repeat(5, minmax(0, 1fr));
        gap: 0.75rem;
        margin-top: 1rem;
    }

    .attribute {
        display: flex;
        min-width: 0;
        min-height: 5.5rem;
        flex-direction: column;
        justify-content: flex-start;
        gap: 0.35rem;
        padding: 0.9rem 1rem;
        box-sizing: border-box;
        border: 0;
        border-radius: 0.15rem;
        background: #26343d;
        clip-path: polygon(4% 0, 100% 0, 96% 100%, 0 100%);
        transform: rotate(-1.5deg);
    }

    .attribute:nth-child(2) {
        transform: rotate(1.2deg);
    }

    .attribute:nth-child(3) {
        transform: rotate(-0.8deg);
    }

    .attribute:nth-child(4) {
        transform: rotate(1.8deg);
    }

    .attribute:nth-child(5) {
        transform: rotate(-1deg);
    }

    .attribute-label {
        color: #9caeb7;
        font-size: 0.95rem;
        font-weight: 800;
        letter-spacing: 0.04em;
        text-transform: uppercase;
    }

    .attribute strong {
        font-size: 1rem;
    }

    .attribute-list {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 0.45rem;
        margin: 0;
        padding: 0;
        list-style: none;
    }

    .attribute-list-item {
        min-width: 0;
        padding: 0.45rem 0.55rem;
        background: rgb(0 0 0 / 20%);
        clip-path: polygon(5% 0, 100% 0, 95% 100%, 0 100%);
        font-size: 0.82rem;
        line-height: 1.2;
        overflow-wrap: anywhere;
        transform: rotate(-1deg);
    }

    .attribute-list-item:nth-child(even) {
        transform: rotate(1.5deg);
    }

    .direction {
        margin-top: auto;
        color: inherit;
        font-size: 0.8rem;
        opacity: 0.9;
    }

    .green {
        color: #8bf0b4;
        background: #214a3a;
    }

    .red {
        color: #ff9a9a;
        background: #552b32;
    }

    .yellow {
        color: #f5d978;
        background: #51451f;
    }

    .empty-state,
    .win-message {
        margin: 0;
        padding: 1rem;
        border-radius: 0.5rem;
        background: #282828;
        color: #c8c8c8;
        text-align: center;
    }

    .win-message {
        margin-bottom: 1.5rem;
        color: #72e6a2;
    }

    @media (max-width: 850px) {
        .attribute-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
        }

        .list-attribute {
            grid-column: span 2;
        }

    }

    @media (max-width: 560px) {
        main {
            width: min(100% - 1rem, 1100px);
        }

        .attribute-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        .list-attribute {
            grid-column: span 2;
        }

    }

</style>
