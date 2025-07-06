<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import Calendar from './Calendar.svelte';

  const dispatch = createEventDispatcher();

  // Initialize internal state for calendar if not passed from parent
  let today = new Date();
  let displayedMonth = new Date(2025, 6, 1); // Set to July 2025 for testing selected dates


  // Forward events from Calendar component
  function handleDayClick(event: CustomEvent) {
    console.log(event.detail);
    dispatch('click-day', event.detail, event.detail.isMetaPressed);
  }

</script>

<div id="right-sidebar-container">
  <Calendar
    {today}
    {displayedMonth}
    selectedId = { "some" }
    on:click-day={handleDayClick}
  />
</div>

<style>
  /* No styles specific to rightSideBar.svelte */
</style>