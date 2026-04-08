import { useState } from 'react'
import { format, isPast, isToday, parseISO } from 'date-fns'
import { clsx } from 'clsx'
import type { Chore, Employee } from '../types'
import { useStore } from '../store'

interface Props {
  chore: Chore
  employees: Employee[]
  onEdit: (chore: Chore) => void
}

const PRIORITY_LABEL: Record<Chore['priority'], string> = {
  low: 'Low', medium: 'Med', high: 'High',
}

const STATUS_NEXT: Record<Chore['status'], Chore['status']> = {
  pending: 'in-progress',
  'in-progress': 'done',
  done: 'pending',
}

const STATUS_LABEL: Record<Chore['status'], string> = {
  pending: 'To Do',
  'in-progress': 'In Progress',
  done: 'Done',
}

export function ChoreCard({ chore, employees, onEdit }: Props) {
  const { setStatus, deleteChore, assignChore } = useStore()
  const [confirmDelete, setConfirmDelete] = useState(false)

  const assignee = employees.find((e) => e.id === chore.assigneeId)
  const due = parseISO(chore.dueDate)
  const overdue = chore.status !== 'done' && isPast(due) && !isToday(due)
  const dueToday = isToday(due)

  return (
    <div
      className={clsx('chore-card', {
        'chore-card--done': chore.status === 'done',
        'chore-card--overdue': overdue,
        'chore-card--today': dueToday && chore.status !== 'done',
      })}
    >
      <div className="chore-card__header">
        <span
          className={clsx('priority-badge', `priority-badge--${chore.priority}`)}
        >
          {PRIORITY_LABEL[chore.priority]}
        </span>
        <span className="freq-badge">{chore.frequency}</span>
        <div className="chore-card__actions">
          <button
            className="icon-btn"
            title="Edit"
            onClick={() => onEdit(chore)}
          >
            ✏️
          </button>
          {confirmDelete ? (
            <>
              <button
                className="icon-btn icon-btn--danger"
                onClick={() => deleteChore(chore.id)}
              >
                Confirm
              </button>
              <button
                className="icon-btn"
                onClick={() => setConfirmDelete(false)}
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              className="icon-btn"
              title="Delete"
              onClick={() => setConfirmDelete(true)}
            >
              🗑️
            </button>
          )}
        </div>
      </div>

      <h3 className="chore-card__title">{chore.title}</h3>
      {chore.description && (
        <p className="chore-card__desc">{chore.description}</p>
      )}

      <div className="chore-card__footer">
        <div className="chore-card__meta">
          <span
            className={clsx('due-label', {
              'due-label--overdue': overdue,
              'due-label--today': dueToday,
            })}
          >
            {overdue ? '⚠️ ' : dueToday ? '📅 ' : ''}
            {format(due, 'MMM d')}
          </span>

          <select
            className="assignee-select"
            value={chore.assigneeId ?? ''}
            onChange={(e) =>
              assignChore(chore.id, e.target.value || null)
            }
          >
            <option value="">Unassigned</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.name}
              </option>
            ))}
          </select>
        </div>

        {assignee && (
          <span
            className="assignee-dot"
            title={assignee.name}
            style={{ background: assignee.color }}
          >
            {assignee.name[0]}
          </span>
        )}
      </div>

      <button
        className={clsx('status-btn', `status-btn--${chore.status}`)}
        onClick={() => setStatus(chore.id, STATUS_NEXT[chore.status])}
      >
        {STATUS_LABEL[chore.status]}
      </button>
    </div>
  )
}
