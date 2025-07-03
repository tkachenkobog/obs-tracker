<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  export let showWeekNums = false;
  export let selectedId: string | null = null;
  export let weekStart: 'locale' | 'monday' | 'sunday' = 'locale';
  export let today = new Date();
  export let displayedMonth = new Date();
  export let selectedDates: Date[] = []; // New prop for selected dates

  export let onHoverDay: ((date: Date, target: EventTarget) => void) | null = null;
  export let onHoverWeek: ((date: Date, target: EventTarget) => void) | null = null;
  export let onClickDay: ((date: Date, isMetaPressed: boolean) => void) | null = null;
  export let onClickWeek: ((date: Date, isMetaPressed: boolean) => void) | null = null;
  export let onContextMenuDay: ((date: Date, event: MouseEvent) => boolean) | null = null;
  export let onContextMenuWeek: ((date: Date, event: MouseEvent) => boolean) | null = null;

  let currentMonth = displayedMonth.getMonth();
  let currentYear = displayedMonth.getFullYear();

  const months = [
    'Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень',
    'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень'
  ];

  const weekDays = weekStart === 'sunday' 
    ? ['Нд', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']
    : ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'];

  $: calendarData = generateCalendarData(currentYear, currentMonth);
  $: displayedMonth = new Date(currentYear, currentMonth, 1);

  interface DayData {
    date: Date;
    day: number;
    isCurrentMonth: boolean;
    isToday: boolean;
    isSelected: boolean;
    isWeekend: boolean;
    metadata: {
      classes: string[];
      dots: Array<{ color: string; isFilled: boolean }>;
      dataAttributes: Record<string, string>;
    };
  }

  interface WeekData {
    weekNumber: number;
    days: DayData[];
  }

  function generateCalendarData(year: number, month: number): WeekData[] {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();

    let startingDayOfWeek = firstDay.getDay();
    if (weekStart !== 'sunday') {
      startingDayOfWeek = (startingDayOfWeek + 6) % 7;
    }

    const weeks: WeekData[] = [];
    let currentDate = new Date(firstDay);
    currentDate.setDate(1 - startingDayOfWeek);

    for (let week = 0; week < 6; week++) {
      const weekData: WeekData = {
        weekNumber: getWeekNumber(currentDate),
        days: []
      };

      for (let day = 0; day < 7; day++) {
        const date = new Date(currentDate);
        const isCurrentMonth = date.getMonth() === month;
        const isToday = isDateToday(date);
        const isSelected = isDateSelected(date); // Updated to use the new function
        const isWeekend = date.getDay() === 0 || date.getDay() === 6;

        const metadata = generateDayMetadata(date, isCurrentMonth);

        weekData.days.push({
          date: new Date(date),
          day: date.getDate(),
          isCurrentMonth,
          isToday,
          isSelected,
          isWeekend,
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
      dots: [] as Array<{ color: string; isFilled: boolean }>,
      dataAttributes: {} as Record<string, string>
    };

    if (!isCurrentMonth) {
      metadata.classes.push('adjacent-month');
    }

    if (isCurrentMonth && Math.random() > 0.7) {
      const dotCount = Math.floor(Math.random() * 4) + 1;
      for (let i = 0; i < dotCount; i++) {
        metadata.dots.push({
          color: 'var(--color-dot)',
          isFilled: true
        });
      }
    }

    if (isCurrentMonth && Math.random() > 0.85) {
      metadata.dots.push({
        color: 'var(--color-dot)',
        isFilled: false
      });
    }

    return metadata;
  }

  function getWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  }

  function isDateToday(date: Date): boolean {
    return date.toDateString() === today.toDateString();
  }

  function isDateSelected(date: Date): boolean {
    console.log('Checking date:', date.toDateString());
    console.log('Against selectedDates:', selectedDates.map(d => d.toDateString()));
    const isSelected = selectedDates.some(selectedDate => selectedDate.toDateString() === date.toDateString());
    console.log('Is selected:', isSelected);
    return isSelected;
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
    if (onClickDay) {
      onClickDay(dayData.date, event.metaKey || event.ctrlKey);
    }
    dispatch('click-day', { date: dayData.date, isMetaPressed: event.metaKey || event.ctrlKey });
  }

  function handleDayHover(dayData: DayData, event: MouseEvent) {
    if (onHoverDay) {
      onHoverDay(dayData.date, event.target);
    }
  }

  function handleDayContextMenu(dayData: DayData, event: MouseEvent) {
    if (onContextMenuDay) {
      const result = onContextMenuDay(dayData.date, event);
      if (result) {
        event.preventDefault();
      }
    }
  }

  function handleWeekClick(weekData: WeekData, event: MouseEvent) {
    if (onClickWeek) {
      onClickWeek(weekData.days[0].date, event.metaKey || event.ctrlKey);
    }
    dispatch('click-week', { date: weekData.days[0].date, isMetaPressed: event.metaKey || event.ctrlKey });
  }

  function handleWeekHover(weekData: WeekData, event: MouseEvent) {
    if (onHoverWeek) {
      onHoverWeek(weekData.days[0].date, event.target);
    }
  }

  function handleWeekContextMenu(weekData: WeekData, event: MouseEvent) {
    if (onContextMenuWeek) {
      const result = onContextMenuWeek(weekData.days[0].date, event);
      if (result) {
        event.preventDefault();
      }
    }
  }
</script>

<div id="calendar-container" class="calendar-container">
  <div class="calendar-header">
    <div class="nav">
      <button class="nav-button clickable-icon" 
              on:click={previousMonth}
              aria-label="Попередній місяць">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="15,18 9,12 15,6"></polyline>
        </svg>
      </button>
      
      <div class="title">
        <span class="month">{months[currentMonth]}</span>
        <span class="year">{currentYear}</span>
      </div>
      
      <button class="nav-button clickable-icon" 
              on:click={nextMonth}
              aria-label="Наступний місяць">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="9,18 15,12 9,6"></polyline>
        </svg>
      </button>
    </div>
    
    <button class="reset-button clickable-icon" 
            on:click={goToToday}
            aria-label="Сьогодні">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"></circle>
        <polyline points="12,6 12,12 16,14"></polyline>
      </svg>
    </button>
  </div>
  
  <div class="calendar">
    <div class="calendar-weekdays" class:with-weeknums={showWeekNums}>
      {#if showWeekNums}
        <div class="weeknum-header"></div>
      {/if}
      {#each weekDays as day}
        <div class="weekday">{day}</div>
      {/each}
    </div>
    
    {#each calendarData as weekData}
      <div class="week" class:with-weeknums={showWeekNums}>
        {#if showWeekNums}
          <button class="weeknum clickable-icon"
                  on:click={(e) => handleWeekClick(weekData, e)}
                  on:mouseenter={(e) => handleWeekHover(weekData, e)}
                  on:contextmenu={(e) => handleWeekContextMenu(weekData, e)}>
            {weekData.weekNumber}
          </button>
        {/if}
        
        {#each weekData.days as dayData}
          <button class="day"
                  class:today={dayData.isToday}
                  class:selected={dayData.isSelected}
                  class:adjacent-month={!dayData.isCurrentMonth}
                  class:weekend={dayData.isWeekend}
                  class:has-dots={dayData.metadata.dots.length > 0}
                  on:click={(e) => handleDayClick(dayData, e)}
                  on:mouseenter={(e) => handleDayHover(dayData, e)}
                  on:contextmenu={(e) => handleDayContextMenu(dayData, e)}
                  {...dayData.metadata.dataAttributes}>
            <span class="day-number">{dayData.day}</span>
            
            {#if dayData.metadata.dots.length > 0}
              <div class="dots">
                {#each dayData.metadata.dots as dot}
                  <div class="dot" 
                       class:filled={dot.isFilled}
                       class:hollow={!dot.isFilled}
                       style="color: {dot.color}">
                  </div>
                {/each}
              </div>
            {/if}
          </button>
        {/each}
      </div>
    {/each}
  </div>
</div>

<style>

 #calendar-container {
    --color-background-heading: transparent;
    --color-background-day: transparent;
    --color-background-weeknum: transparent;
    --color-background-weekend: transparent;
    --color-dot: var(--text-muted);
    --color-arrow: var(--text-muted);
    --color-button: var(--text-muted);
    --color-text-title: var(--text-normal);
    --color-text-heading: var(--text-muted);
    --color-text-day: var(--text-normal);
    --color-text-today: var(--interactive-accent);
    --color-text-weeknum: var(--text-muted);

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

  .calendar-weekdays.with-weeknums {
    grid-template-columns: 32px repeat(7, 1fr);
  }

  .weeknum-header {
    width: 32px;
  }

  .weekday {
    text-align: center;
    font-size: 11px;
    color: var(--color-text-heading);
    padding: 4px;
    font-weight: 500;
    background: var(--color-background-heading);
  }

  .week {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 2px;
  }

  .week.with-weeknums {
    grid-template-columns: 32px repeat(7, 1fr);
  }

  .weeknum {
    background: var(--color-background-weeknum);
    border: none;
    color: var(--color-text-weeknum);
    cursor: pointer;
    padding: 0;
    border-radius: 4px;
    font-size: 11px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    width: 32px;
    height: 32px;
  }

  .weeknum:hover {
    background: var(--background-modifier-hover);
    color: var(--text-normal);
  }

  .day {
    background: var(--color-background-day);
    border: none;
    color: var(--color-text-day);
    cursor: pointer;
    padding: 0;
    border-radius: 4px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2px;
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

  .day.weekend {
    background: var(--color-background-weekend);
  }

  .day-number {
    font-size: 13px;
    line-height: 1;
  }

  .dots {
    display: flex;
    gap: 2px;
    flex-wrap: wrap;
    justify-content: center;
    max-width: 100%;
  }

  .dot {
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: currentColor;
  }

  .dot.filled {
    background: currentColor;
  }

  .dot.hollow {
    background: transparent;
    border: 1px solid currentColor;
  }

  .clickable-icon {
    cursor: pointer;
  }

  .clickable-icon:hover {
    opacity: 0.8;
  }
</style>