import { useState } from 'react'
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, isSameMonth, isSameDay, isToday,
  addMonths, subMonths, format, parseISO,
} from 'date-fns'
import { clsx } from 'clsx'
import { useStore } from '../store'
import type { Chore } from '../types'

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const STATUS_DOT: Record<Chore['status'], string> = {
  pending: 'dot--pending',
  'in-progress': 'dot--progress',
  done: 'dot--done',
}

interface Props {
  onEditChore: (chore: Chore) => void
}

export function CalendarView({ onEditChore }: Props) {
  const { chores, employees } = useStore()
  const [current, setCurrent] = useState(new Date())
  const [selected, setSelected] = useState<Date | null>(null)

  const monthStart = startOfMonth(current)
  const monthEnd = endOfMonth(current)
  const gridStart = startOfWeek(monthStart)
  const gridEnd = endOfWeek(monthEnd)
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd })

  const choresOnDay = (day: Date) =>
    chores.filter((c) => isSameDay(parseISO(c.dueDate), day))

  const selectedChores = selected ? choresOnDay(selected) : []

  return (
    <div className="cal-wrap">
      <div className="cal">
        {/* Month nav */}
        <div className="cal__nav">
          <button className="icon-btn" onClick={() => setCurrent(subMonths(current, 1))}>‹</button>
          <h2 className="cal__month">{format(current, 'MMMM yyyy')}</h2>
          <button className="icon-btn" onClick={() => setCurrent(addMonths(current, 1))}>›</button>
          <button
            className="btn btn--ghost btn--sm"
            onClick={() => { setCurrent(new Date()); setSelected(new Date()) }}
          >
            Today
          </button>
        </div>

        {/* Weekday headers */}
        <div className="cal__grid cal__grid--header">
          {WEEKDAYS.map((d) => (
            <div key={d} className="cal__weekday">{d}</div>
          ))}
        </div>

        {/* Day cells */}
        <div className="cal__grid">
          {days.map((day) => {
            const dayChores = choresOnDay(day)
            const isCurrentMonth = isSameMonth(day, current)
            const isSelected = selected ? isSameDay(day, selected) : false
            const isT = isToday(day)

            return (
              <button
                key={day.toISOString()}
                className={clsx('cal__day', {
                  'cal__day--outside': !isCurrentMonth,
                  'cal__day--today': isT,
                  'cal__day--selected': isSelected,
                  'cal__day--has-chores': dayChores.length > 0,
                })}
                onClick={() => setSelected(isSelected ? null : day)}
              >
                <span className="cal__day-num">{format(day, 'd')}</span>
                <div className="cal__dots">
                  {dayChores.slice(0, 3).map((c) => (
                    <span key={c.id} className={clsx('cal__dot', STATUS_DOT[c.status])} />
                  ))}
                  {dayChores.length > 3 && (
                    <span className="cal__dot-more">+{dayChores.length - 3}</span>
                  )}
                </div>
              </button>
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
              <span className="cal-panel__count">{selectedChores.length} chore{selectedChores.length !== 1 ? 's' : ''}</span>
            </div>
            {selectedChores.length === 0 ? (
              <p className="empty-hint">No chores due this day.</p>
            ) : (
              <ul className="cal-panel__list">
                {selectedChores.map((c) => {
                  const assignee = employees.find((e) => e.id === c.assigneeId)
                  return (
                    <li key={c.id} className={clsx('cal-panel__item', `cal-panel__item--${c.status}`)}>
                      <div className="cal-panel__item-top">
                        <span className={clsx('priority-badge', `priority-badge--${c.priority}`)}>
                          {c.priority}
                        </span>
                        {assignee && (
                          <span
                            className="assignee-dot assignee-dot--sm"
                            style={{ background: assignee.color }}
                            title={assignee.name}
                          >
                            {assignee.name[0]}
                          </span>
                        )}
                        <button
                          className="icon-btn"
                          title="Edit"
                          onClick={() => onEditChore(c)}
                        >
                          ✏️
                        </button>
                      </div>
                      <p className={clsx('cal-panel__title', { 'cal-panel__title--done': c.status === 'done' })}>
                        {c.title}
                      </p>
                      {c.description && (
                        <p className="cal-panel__desc">{c.description}</p>
                      )}
                      <span className={clsx('cal-status-tag', `cal-status-tag--${c.status}`)}>
                        {c.status === 'in-progress' ? 'In Progress' : c.status === 'done' ? 'Done' : 'To Do'}
                      </span>
                    </li>
                  )
                })}
              </ul>
            )}
          </>
        ) : (
          <div className="cal-panel__empty">
            <span className="cal-panel__empty-icon">📅</span>
            <p>Click a day to see chores due</p>
          </div>
        )}
      </div>
    </div>
  )
}
