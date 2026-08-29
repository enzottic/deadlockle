<script lang="ts">
    import type { DeadlockItem, DeadlockleGuessState, HigherLowerResult, ResultColor } from "$lib/types";
    import { onMount } from "svelte";
    import ItemCatalog from "./ItemCatalog.svelte";
    import Guess from "./Guess.svelte";

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
            <Guess {guess} {index}/>
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
</style>
