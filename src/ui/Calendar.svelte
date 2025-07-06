<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  export let selectedId: string | null = "null";
  export let today = new Date();
  export let displayedMonth = new Date();
  export let selectedDates: Date[] = [];

  let currentMonth = displayedMonth.getMonth();
  let currentYear = displayedMonth.getFullYear();

  const months = [
    'Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень',
    'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень'
  ];

  const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'];

  $: calendarData = generateCalendarData(currentYear, currentMonth);
  $: displayedMonth = new Date(currentYear, currentMonth, 1);
  $: selectedDates, updateCalendar();

  function updateCalendar() {
    calendarData = generateCalendarData(currentYear, currentMonth);
  }

  interface DayData {
    date: Date;
    day: number;
    isCurrentMonth: boolean;
    isToday: boolean;
    isSelected: boolean;
    metadata: {
      classes: string[];
      dataAttributes: Record<string, string>;
    };
  }

  interface WeekData {
    days: DayData[];
  }

  function generateCalendarData(year: number, month: number): WeekData[] {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startingDayOfWeek = (firstDay.getDay() + 6) % 7;
    const weeks: WeekData[] = [];
    let currentDate = new Date(firstDay);
    currentDate.setDate(1 - startingDayOfWeek);

    for (let week = 0; week < 6; week++) {
      const weekData: WeekData = { days: [] };

      for (let day = 0; day < 7; day++) {
        const date = new Date(currentDate);
        const isCurrentMonth = date.getMonth() === month;
        const isToday = isDateToday(date);
        const isSelected = isDateSelected(date);
        const metadata = generateDayMetadata(date, isCurrentMonth);

        weekData.days.push({
          date: new Date(date),
          day: date.getDate(),
          isCurrentMonth,
          isToday,
          isSelected,
          metadata
        });

        currentDate.setDate(currentDate.getDate() + 1);
      }

      weeks.push(weekData);
    }

    return weeks;
  }

  function generateDayMetadata(date: Date, isCurrentMonth: boolean) {
    const metadata = {
      classes: [] as string[],
      dataAttributes: {} as Record<string, string>
    };

    if (!isCurrentMonth) {
      metadata.classes.push('adjacent-month');
    }

    return metadata;
  }

  function isDateToday(date: Date): boolean {
    return date.toDateString() === today.toDateString();
  }

  function isDateSelected(date: Date): boolean {
    return selectedDates.some(selectedDate => selectedDate.toDateString() === date.toDateString());
  }

  function previousMonth() {
    if (currentMonth === 0) {
      currentMonth = 11;
      currentYear -= 1;
    } else {
      currentMonth -= 1;
    }
  }

  function nextMonth() {
    if (currentMonth === 11) {
      currentMonth = 0;
      currentYear += 1;
    } else {
      currentMonth += 1;
    }
  }

  function goToToday() {
    currentMonth = today.getMonth();
    currentYear = today.getFullYear();
  }

  function handleDayClick(dayData: DayData, event: MouseEvent) {
    const clickedDate = dayData.date;
    const isCurrentlySelected = selectedDates.some(selectedDate => selectedDate.toDateString() === clickedDate.toDateString());
    
    if (isCurrentlySelected) {
      selectedDates = selectedDates.filter(selectedDate => selectedDate.toDateString() !== clickedDate.toDateString());
      console.log('Дата анселектована:', clickedDate.toDateString());
    } else {
      selectedDates = [...selectedDates, new Date(clickedDate)];
      console.log('Дата селектована:', clickedDate.toDateString());
    }
    
    console.log('Всі селектовані дати:', selectedDates.map(d => d.toDateString()));
    
    dispatch('click-day', { date: dayData.date, isMetaPressed: event.metaKey || event.ctrlKey });
  }
</script>

<div id="calendar-container" class="calendar-container">
  <div class="calendar-header">
    <div class="nav">
      <button class="nav-button clickable-icon" on:click={previousMonth} aria-label="Попередній місяць">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="15,18 9,12 15,6"></polyline>
        </svg>
      </button>
      
      <div class="title">
        <span class="month">{months[currentMonth]}</span>
        <span class="year">{currentYear}</span>
      </div>
      
      <button class="nav-button clickable-icon" on:click={nextMonth} aria-label="Наступний місяць">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="9,18 15,12 9,6"></polyline>
        </svg>
      </button>
    </div>
    
    <button class="reset-button clickable-icon" on:click={goToToday} aria-label="Сьогодні">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"></circle>
        <polyline points="12,6 12,12 16,14"></polyline>
      </svg>
    </button>
  </div>
  
  <div class="calendar">
    <div class="calendar-weekdays">
      {#each weekDays as day}
        <div class="weekday">{day}</div>
      {/each}
    </div>
    
    {#each calendarData as weekData}
      <div class="week">
        {#each weekData.days as dayData}
          <button class="day"
                  class:today={dayData.isToday}
                  class:selected={dayData.isSelected}
                  class:adjacent-month={!dayData.isCurrentMonth}
                  on:click={(e) => handleDayClick(dayData, e)}
                  {...dayData.metadata.dataAttributes}>
            <span class="day-number">{dayData.day}</span>
          </button>
        {/each}
      </div>
    {/each}
  </div>
</div>

<style>
  #calendar-container {
    --color-arrow: var(--text-muted);
    --color-text-title: var(--text-normal);
    --color-text-heading: var(--text-muted);
    --color-text-day: var(--text-normal);
    --color-text-today: var(--interactive-accent);

    font-family: var(--font-interface);
    color: var(--text-normal);
    background: var(--background-primary);
    border-radius: 8px;
    padding: 16px;
    width: 280px;
    user-select: none;
  }

  .calendar-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
  }

  .nav {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .nav-button,
  .reset-button {
    background: none;
    border: none;
    color: var(--color-arrow);
    cursor: pointer;
    padding: 6px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
  }

  .nav-button:hover,
  .reset-button:hover {
    background: var(--background-modifier-hover);
    color: var(--text-normal);
  }

  .title {
    display: flex;
    align-items: center;
    gap: 6px;
    font-weight: 600;
    font-size: 14px;
  }

  .month {
    color: var(--color-text-title);
  }

  .year {
    color: var(--text-muted);
    font-weight: 400;
  }

  .calendar {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .calendar-weekdays {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 2px;
    margin-bottom: 4px;
  }

  .weekday {
    text-align: center;
    font-size: 11px;
    color: var(--color-text-heading);
    padding: 4px;
    font-weight: 500;
    background: transparent;
  }

  .week {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 2px;
  }

  .day {
    background: transparent;
    border: none;
    color: var(--color-text-day);
    cursor: pointer;
    padding: 0;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    aspect-ratio: 1;
    position: relative;
    min-height: 32px;
  }

  .day:hover {
    background: var(--background-modifier-hover);
  }

  .day.today {
    color: var(--color-text-today);
    font-weight: 600;
  }

  .day.selected {
    background: var(--interactive-accent);
    color: var(--text-on-accent);
  }

  .day.adjacent-month {
    color: var(--text-faint);
  }

  .day-number {
    font-size: 13px;
    line-height: 1;
  }

  .clickable-icon {
    cursor: pointer;
  }

  .clickable-icon:hover {
    opacity: 0.8;
  }
</style>