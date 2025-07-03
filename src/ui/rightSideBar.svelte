<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import Calendar from './Calendar.svelte';

  const dispatch = createEventDispatcher();

  // Initialize internal state for calendar if not passed from parent
  let showWeekNums = false;
  let selectedId: string | null = null;
  let weekStart: 'locale' | 'monday' | 'sunday' = 'locale';
  let sources: any[] = [];
  let today = new Date();
  let displayedMonth = new Date(2025, 6, 1); // Set to July 2025 for testing selected dates

  // Mock selected dates for demonstration
  const mockSelectedDates: Date[] = [
    new Date(2025, 6, 3), // July 3, 2025
    new Date(2025, 6, 4), // July 4, 2025
    new Date(2025, 6, 5)  // July 5, 2025
  ];

  let onHoverDay: ((date: Date, target: EventTarget) => void) | null = null;
  let onHoverWeek: ((date: Date, target: EventTarget) => void) | null = null;
  let onClickDay: ((date: Date, isMetaPressed: boolean) => void) | null = null;
  let onClickWeek: ((date: Date, isMetaPressed: boolean) => void) | null = null;
  let onContextMenuDay: ((date: Date, event: MouseEvent) => boolean) | null = null;
  let onContextMenuWeek: ((date: Date, event: MouseEvent) => boolean) | null = null;

  // Forward events from Calendar component
  function handleDayClick(event: CustomEvent) {
    dispatch('click-day', event.detail);
  }

  function handleWeekClick(event: CustomEvent) {
    dispatch('click-week', event.detail);
  }
</script>

<div id="right-sidebar-container">
  <Calendar
    {showWeekNums}
    {selectedId}
    {weekStart}
    {sources}
    {today}
    {displayedMonth}
    selectedDates={mockSelectedDates}
    {onHoverDay}
    {onHoverWeek}
    {onClickDay}
    {onClickWeek}
    {onContextMenuDay}
    {onContextMenuWeek}
    on:click-day={handleDayClick}
    on:click-week={handleWeekClick}
  />
</div>

<style>
  /* No styles specific to rightSideBar.svelte */
</style>