<script lang="ts">
  import type { PriceTable as PriceTableData } from "../content/types";

  let { table }: { table: PriceTableData } = $props();
</script>

<table class="price-table">
  <caption>{table.title}</caption>
  <thead>
    <tr>
      <th scope="col">Produkt</th>
      <th scope="col">Preis</th>
    </tr>
  </thead>
  <tbody>
    {#each table.rows as row (row.item)}
      <tr>
        <th scope="row" lang="de">{row.item}</th>
        <td lang="de">{row.price}</td>
      </tr>
    {/each}
  </tbody>
</table>
