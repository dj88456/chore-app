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

const STATUS_NEXT: Record<Chore['status'], Chore['status']> = {
  pending: 'in-progress',
  'in-progress': 'done',
  done: 'pending',
}

const STATUS_LABEL: Record<Chore['status'], string> = {
  pending: 'Mark In Progress →',
  'in-progress': 'Mark Done →',
  done: 'Reopen',
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
      {/* Row 1: badges + hover actions */}
      <div className="chore-card__header">
        <div className="chore-card__badges">
          <span className={clsx('priority-badge', `priority-badge--${chore.priority}`)}>
            {chore.priority}
          </span>
          <span className="freq-badge">{chore.frequency}</span>
        </div>
        <div className="chore-card__actions">
          <button className="icon-btn" title="Edit" onClick={() => onEdit(chore)}>
            ✏️
          </button>
          <button className="icon-btn" title="Delete" onClick={() => setConfirmDelete(true)}>
            🗑️
          </button>
        </div>
      </div>

      {/* Row 2: title + description */}
      <h3 className="chore-card__title">{chore.title}</h3>
      {chore.description && (
        <p className="chore-card__desc">{chore.description}</p>
      )}

      {/* Row 3: due date + assignee */}
      <div className="chore-card__meta">
        <span className={clsx('due-label', {
          'due-label--overdue': overdue,
          'due-label--today': dueToday,
        })}>
          {overdue ? '⚠️' : '📅'} {format(due, 'MMM d')}
        </span>

        <div className="chore-card__assignee">
          {assignee && (
            <span className="assignee-dot assignee-dot--sm"
              style={{ background: assignee.color }}>
              {assignee.name[0]}
            </span>
          )}
          <select
            className="assignee-select"
            value={chore.assigneeId ?? ''}
            onChange={(e) => assignChore(chore.id, e.target.value || null)}
          >
            <option value="">Unassigned</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>{emp.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Row 4: status button OR delete confirmation */}
      {confirmDelete ? (
        <div className="chore-card__confirm">
          <span>Delete this chore?</span>
          <div className="chore-card__confirm-actions">
            <button className="btn btn--ghost btn--sm" onClick={() => setConfirmDelete(false)}>
              Cancel
            </button>
            <button className="btn btn--danger btn--sm" onClick={() => deleteChore(chore.id)}>
              Delete
            </button>
          </div>
        </div>
      ) : (
        <button
          className={clsx('status-btn', `status-btn--${chore.status}`)}
          onClick={() => setStatus(chore.id, STATUS_NEXT[chore.status])}
        >
          {STATUS_LABEL[chore.status]}
        </button>
      )}
    </div>
  )
}
