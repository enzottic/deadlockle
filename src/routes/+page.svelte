<script lang="ts">
    import type { PageProps } from "./$types";
    import Game from "./(components)/Game.svelte";

    let { data }: PageProps = $props();
</script>

<main>
    <h1>Deadlockle</h1>

    <Game
        items={data.items}
        dailyItem={data.dailyItem}
    />
</main>

<style>
    :global(html)
    :global(body) {
        min-height: 100%;
        background-color: #1e1e1e;
        color: white;
        font-family: "forevs", sans-serif;
    }
</style>
