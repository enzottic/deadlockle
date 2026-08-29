<script lang="ts">
    import type { DeadlockleGuessState } from "$lib/types";

    interface Props {
        guess: DeadlockleGuessState
        index: number;
    }

    let { guess, index }: Props = $props();
</script>

<div class="guess">
    <div class="guess-heading">
        <div class="item-identity">
            {#if guess.item.image_url}
                <img
                    class="item-image"
                    src={guess.item.image_url}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    draggable="false"
                />
            {:else}
                <span class="item-image placeholder" aria-hidden="true"></span>
            {/if}
            <h2>{guess.item.name}</h2>
        </div>
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


<style>
    .guess {
        width: 100%;
        padding: 1rem;
        box-sizing: border-box;
        border: 0;
        border-radius: 0;
        background: #282828;
    }

    .guess-heading {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
    }

    .item-identity {
        display: flex;
        min-width: 0;
        align-items: center;
        gap: 0.75rem;
    }

    .guess-heading h2 {
        margin: 0;
    }

    .item-image {
        width: 3.25rem;
        height: 3.25rem;
        flex: 0 0 auto;
        border-radius: 0.25rem;
        background: #1c1c1c;
        object-fit: cover;
    }

    .item-image.placeholder {
        background: linear-gradient(135deg, #353535, #202020);
    }

    .guess-label {
        color: #a8a8a8;
        font-size: 0.85rem;
    }

    .attribute-grid {
        display: grid;
        grid-template-columns: 0.8fr 0.55fr 1.35fr 1.2fr 1.5fr 0.8fr 0.8fr;
        gap: 0.75rem;
        margin-top: 1rem;
    }

    .attribute {
        display: flex;
        min-width: 0;
        flex-direction: column;
        justify-content: flex-start;
        gap: 0.25rem;
        padding: 0.7rem 0.8rem;
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
        font-size: 0.78rem;
        font-weight: 800;
        letter-spacing: 0.04em;
        text-transform: uppercase;
    }

    .attribute strong {
        font-size: 1rem;
    }

    .attribute-list {
        display: block;
        margin: 0;
        padding: 0;
        list-style: none;
    }

    .attribute-list-item {
        display: inline;
        font-size: 1rem;
        line-height: 1.35;
        overflow-wrap: break-word;
    }

    .attribute-list-item:not(:last-child)::after {
        content: ", ";
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

    @media (max-width: 850px) {
        .guess {
            padding: 0.65rem;
        }

        .guess-heading {
            gap: 0.5rem;
        }

        .item-identity {
            gap: 0.5rem;
        }

        .item-image {
            width: 2.75rem;
            height: 2.75rem;
        }

        .guess-heading h2 {
            font-size: 1.15rem;
        }

        .attribute-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 0.4rem;
            margin-top: 0.65rem;
        }

        .attribute {
            gap: 0.15rem;
            padding: 0.5rem 0.6rem;
        }

        .list-attribute {
            grid-column: span 2;
        }

        .attribute-label {
            font-size: 0.68rem;
        }

        .attribute strong,
        .attribute-list-item {
            font-size: 0.85rem;
        }

        .direction {
            font-size: 0.7rem;
        }
    }

</style>
