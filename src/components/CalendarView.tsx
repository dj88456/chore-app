import { useEffect, useRef, useState } from 'react'
import {
  startOfMonth, endOfMonth,
  startOfWeek, endOfWeek,
  eachDayOfInterval, isSameMonth, isSameDay, isToday, isWeekend,
  addMonths, subMonths,
  addWeeks, subWeeks,
  addDays, subDays,
  addYears, subYears,
  format, parseISO, setMonth, setYear,
} from 'date-fns'
import { clsx } from 'clsx'
import { useStore } from '../store'
import type { Chore, Employee } from '../types'

type CalView = 'month' | 'week' | 'day'

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MAX_MONTH_VISIBLE = 3

const STATUS_LABEL: Record<Chore['status'], string> = {
  pending: 'To Do',
  'in-progress': 'In Progress',
  done: 'Done',
}

interface Props {
  onEditChore: (chore: Chore) => void
  onNewChore: (dueDate?: string) => void
}

// ── Shared event chip ────────────────────────────────────────
function EventChip({
  chore, assignee, onClick, size = 'sm',
}: {
  chore: Chore
  assignee: Employee | undefined
  onClick: () => void
  size?: 'sm' | 'lg'
}) {
  return (
    <button
      className={clsx('cal__event', `cal__event--${chore.status}`, size === 'lg' && 'cal__event--lg')}
      title={`${chore.title}${assignee ? ` · ${assignee.name}` : ''}`}
      onClick={(e) => { e.stopPropagation(); onClick() }}
    >
      {assignee && <span className="cal__event-dot" style={{ background: assignee.color }} />}
      <span className="cal__event-title">{chore.title}</span>
      {assignee && <span className="cal__event-assignee">{assignee.name}</span>}
    </button>
  )
}

// ── Detail card (weekly + daily) ─────────────────────────────
function ChoreDetail({ chore, assignee, onEdit }: {
  chore: Chore
  assignee: Employee | undefined
  onEdit: () => void
}) {
  return (
    <div className={clsx('chore-detail', `chore-detail--${chore.status}`)}>
      <div className="chore-detail__top">
        <span className={clsx('priority-badge', `priority-badge--${chore.priority}`)}>{chore.priority}</span>
        <span className="freq-badge">{chore.frequency}</span>
        {assignee && (
          <span className="assignee-dot assignee-dot--sm" style={{ background: assignee.color }} title={assignee.name}>
            {assignee.name[0]}
          </span>
        )}
        <span className={clsx('cal-status-tag', `cal-status-tag--${chore.status}`)}>{STATUS_LABEL[chore.status]}</span>
        <button className="icon-btn" onClick={onEdit}>✏️</button>
      </div>
      <p className={clsx('chore-detail__title', { 'chore-detail__title--done': chore.status === 'done' })}>
        {chore.title}
      </p>
      {chore.description && <p className="chore-detail__desc">{chore.description}</p>}
      {assignee && <p className="chore-detail__assignee">Assigned to <strong>{assignee.name}</strong></p>}
    </div>
  )
}

// ── Main component ───────────────────────────────────────────
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

export function CalendarView({ onEditChore, onNewChore }: Props) {
  const { chores, employees } = useStore()
  const [view, setView] = useState<CalView>('month')
  const [current, setCurrent] = useState(new Date())
  const [selected, setSelected] = useState<Date | null>(null)
  const [showPicker, setShowPicker] = useState(false)
  const [pickerYear, setPickerYear] = useState(current.getFullYear())
  const pickerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!showPicker) return
    const handler = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node))
        setShowPicker(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showPicker])

  const choresOnDay = (day: Date) =>
    chores.filter((c) => isSameDay(parseISO(c.dueDate), day))

  const goBack = () => {
    if (view === 'month') setCurrent(subMonths(current, 1))
    else if (view === 'week') setCurrent(subWeeks(current, 1))
    else setCurrent(subDays(current, 1))
  }
  const goForward = () => {
    if (view === 'month') setCurrent(addMonths(current, 1))
    else if (view === 'week') setCurrent(addWeeks(current, 1))
    else setCurrent(addDays(current, 1))
  }
  const navLabel = () => {
    if (view === 'month') return format(current, 'MMMM yyyy')
    if (view === 'week') {
      const ws = startOfWeek(current)
      const we = endOfWeek(current)
      return isSameMonth(ws, we)
        ? `${format(ws, 'MMM d')} – ${format(we, 'd, yyyy')}`
        : `${format(ws, 'MMM d')} – ${format(we, 'MMM d, yyyy')}`
    }
    return format(current, 'EEEE, MMMM d, yyyy')
  }

  // ── Month view ─────────────────────────────────────────────
  const MonthView = () => {
    const days = eachDayOfInterval({
      start: startOfWeek(startOfMonth(current)),
      end: endOfWeek(endOfMonth(current)),
    })
    const selectedChores = selected ? choresOnDay(selected) : []

    return (
      <div className="cal-wrap">
        <div className="cal">
          <div className="cal__grid cal__grid--header">
            {WEEKDAYS.map((d) => <div key={d} className="cal__weekday">{d}</div>)}
          </div>
          <div className="cal__grid">
            {days.map((day) => {
              const dayChores = choresOnDay(day)
              const isSelected = selected ? isSameDay(day, selected) : false
              const visible = dayChores.slice(0, MAX_MONTH_VISIBLE)
              const overflow = dayChores.length - MAX_MONTH_VISIBLE
              return (
                <div
                  key={day.toISOString()}
                  className={clsx('cal__day', {
                    'cal__day--outside': !isSameMonth(day, current),
                    'cal__day--today': isToday(day),
                    'cal__day--selected': isSelected,
                    'cal__day--weekend': isWeekend(day),
                  })}
                  onClick={() => setSelected(isSelected ? null : day)}
                >
                  <span className="cal__day-num">{format(day, 'd')}</span>
                  <div className="cal__events">
                    {visible.map((c) => (
                      <EventChip
                        key={c.id} chore={c}
                        assignee={employees.find((e) => e.id === c.assigneeId)}
                        onClick={() => onEditChore(c)}
                      />
                    ))}
                    {overflow > 0 && <span className="cal__overflow">+{overflow} more</span>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Side panel */}
        <div className="cal-panel">
          {selected ? (
            <>
              <div className="cal-panel__header">
                <h3>{format(selected, 'EEEE, MMMM d')}</h3>
                <button
                  className="btn btn--primary btn--sm"
                  onClick={() => onNewChore(format(selected, 'yyyy-MM-dd'))}
                >
                  + Add
                </button>
              </div>
              {selectedChores.length === 0
                ? <p className="empty-hint">No chores due this day.</p>
                : <ul className="cal-panel__list">
                    {selectedChores.map((c) => (
                      <li key={c.id}>
                        <ChoreDetail
                          chore={c}
                          assignee={employees.find((e) => e.id === c.assigneeId)}
                          onEdit={() => onEditChore(c)}
                        />
                      </li>
                    ))}
                  </ul>
              }
            </>
          ) : (
            <div className="cal-panel__empty">
              <span className="cal-panel__empty-icon">📅</span>
              <p>Click a day to see details</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  // ── Week view ──────────────────────────────────────────────
  const WeekView = () => {
    const days = eachDayOfInterval({
      start: startOfWeek(current),
      end: endOfWeek(current),
    })
    return (
      <div className="week-grid">
        {days.map((day) => {
          const dayChores = choresOnDay(day)
          return (
            <div
              key={day.toISOString()}
              className={clsx('week-col', {
                'week-col--today': isToday(day),
                'week-col--selected': selected ? isSameDay(day, selected) : false,
                'week-col--weekend': isWeekend(day),
              })}
            >
              <div className="week-col__header" onClick={() => { setSelected(day); setView('day') }}>
                <span className="week-col__dow">{format(day, 'EEE')}</span>
                <span className={clsx('week-col__num', { 'week-col__num--today': isToday(day) })}>
                  {format(day, 'd')}
                </span>
                {dayChores.length > 0 && (
                  <span className="week-col__badge">{dayChores.length}</span>
                )}
              </div>
              <div className="week-col__events">
                {dayChores.length === 0
                  ? <span className="week-col__empty">—</span>
                  : dayChores.map((c) => (
                      <EventChip
                        key={c.id} chore={c} size="lg"
                        assignee={employees.find((e) => e.id === c.assigneeId)}
                        onClick={() => onEditChore(c)}
                      />
                    ))
                }
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  // ── Day view ───────────────────────────────────────────────
  const DayView = () => {
    const dayChores = choresOnDay(current)
    const pending = dayChores.filter((c) => c.status === 'pending')
    const inProgress = dayChores.filter((c) => c.status === 'in-progress')
    const done = dayChores.filter((c) => c.status === 'done')

    const Section = ({ label, items }: { label: string; items: Chore[] }) =>
      items.length === 0 ? null : (
        <div className="day-section">
          <h4 className="day-section__label">{label} <span>({items.length})</span></h4>
          {items.map((c) => (
            <ChoreDetail
              key={c.id} chore={c}
              assignee={employees.find((e) => e.id === c.assigneeId)}
              onEdit={() => onEditChore(c)}
            />
          ))}
        </div>
      )

    return (
      <div className="day-view">
        {dayChores.length === 0
          ? <div className="cal-panel__empty" style={{ flex: 1 }}>
              <span className="cal-panel__empty-icon">✅</span>
              <p>No chores due today</p>
            </div>
          : <>
              <Section label="To Do" items={pending} />
              <Section label="In Progress" items={inProgress} />
              <Section label="Done" items={done} />
            </>
        }
      </div>
    )
  }

  return (
    <div className="cal-shell">
      {/* Top nav bar */}
      <div className="cal-topbar">
        <div className="cal-topbar__left">
          <button className="icon-btn cal-nav-arrow" onClick={goBack}>‹</button>

          {/* Clickable month/year label → picker dropdown */}
          <div className="month-picker-wrap" ref={pickerRef}>
            <button
              className="cal__month-btn"
              onClick={() => {
                setPickerYear(current.getFullYear())
                setShowPicker(v => !v)
              }}
            >
              {navLabel()} <span className="cal__month-caret">{showPicker ? '▲' : '▼'}</span>
            </button>

            {showPicker && (
              <div className="month-picker">
                <div className="month-picker__year-nav">
                  <button className="icon-btn" onClick={() => setPickerYear(y => y - 1)}>‹</button>
                  <span className="month-picker__year">{pickerYear}</span>
                  <button className="icon-btn" onClick={() => setPickerYear(y => y + 1)}>›</button>
                </div>
                <div className="month-picker__grid">
                  {MONTHS.map((label, idx) => {
                    const isActive =
                      idx === current.getMonth() && pickerYear === current.getFullYear()
                    return (
                      <button
                        key={label}
                        className={clsx('month-picker__cell', { 'month-picker__cell--active': isActive })}
                        onClick={() => {
                          setCurrent(setYear(setMonth(current, idx), pickerYear))
                          setShowPicker(false)
                        }}
                      >
                        {label}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          <button className="icon-btn cal-nav-arrow" onClick={goForward}>›</button>
          <button
            className="btn btn--ghost btn--sm"
            onClick={() => { setCurrent(new Date()); setSelected(new Date()) }}
          >
            Today
          </button>
          <button className="btn btn--primary btn--sm" onClick={() => onNewChore()}>
            + New Chore
          </button>
        </div>

        <div className="cal-topbar__right">
          {/* View switcher */}
          <div className="view-switcher">
            {(['month', 'week', 'day'] as CalView[]).map((v) => (
              <button
                key={v}
                className={clsx('view-switcher__btn', { 'view-switcher__btn--active': view === v })}
                onClick={() => setView(v)}
              >
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      {employees.length > 0 && (
        <div className="cal__legend">
          {employees.map((emp) => (
            <span key={emp.id} className="cal__legend-item">
              <span className="cal__legend-dot" style={{ background: emp.color }} />
              {emp.name}
            </span>
          ))}
        </div>
      )}

      {/* View content */}
      {view === 'month' && <MonthView />}
      {view === 'week' && <WeekView />}
      {view === 'day'  && <DayView />}
    </div>
  )
}
