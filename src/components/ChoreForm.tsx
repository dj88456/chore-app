import { useEffect, useRef, useState } from 'react'
import type { Chore, ChorePriority, ChoreFrequency, ChoreStatus } from '../types'
import { useStore } from '../store'

interface Props {
  chore?: Chore | null
  defaultDueDate?: string
  onClose: () => void
}

const today = () => new Date().toISOString().split('T')[0]

export function ChoreForm({ chore, defaultDueDate, onClose }: Props) {
  const { employees, addChore, updateChore } = useStore()
  const overlayRef = useRef<HTMLDivElement>(null)

  const [title, setTitle] = useState(chore?.title ?? '')
  const [description, setDescription] = useState(chore?.description ?? '')
  const [assigneeId, setAssigneeId] = useState(chore?.assigneeId ?? '')
  const [priority, setPriority] = useState<ChorePriority>(chore?.priority ?? 'medium')
  const [frequency, setFrequency] = useState<ChoreFrequency>(chore?.frequency ?? 'weekly')
  const [dueDate, setDueDate] = useState(chore?.dueDate ?? defaultDueDate ?? today())
  const [status, setStatus] = useState<ChoreStatus>(chore?.status ?? 'pending')

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    const payload = {
      title: title.trim(),
      description: description.trim(),
      assigneeId: assigneeId || null,
      priority,
      frequency,
      dueDate,
      status,
    }

    if (chore) {
      updateChore(chore.id, payload)
    } else {
      addChore(payload)
    }
    onClose()
  }

  return (
    <div
      className="modal-overlay"
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) onClose() }}
    >
      <div className="modal" role="dialog" aria-modal="true" aria-label="Chore form">
        <div className="modal__header">
          <h2>{chore ? 'Edit Chore' : 'New Chore'}</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <form className="modal__body" onSubmit={handleSubmit}>
          <label className="field">
            <span>Title *</span>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Clean break room"
              required
              autoFocus
            />
          </label>

          <label className="field">
            <span>Description</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Optional details…"
            />
          </label>

          <div className="field-row">
            <label className="field">
              <span>Priority</span>
              <select value={priority} onChange={(e) => setPriority(e.target.value as ChorePriority)}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </label>

            <label className="field">
              <span>Frequency</span>
              <select value={frequency} onChange={(e) => setFrequency(e.target.value as ChoreFrequency)}>
                <option value="once">Once</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </label>
          </div>

          <div className="field-row">
            <label className="field">
              <span>Due Date</span>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </label>

            <label className="field">
              <span>Status</span>
              <select value={status} onChange={(e) => setStatus(e.target.value as ChoreStatus)}>
                <option value="pending">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </label>
          </div>

          <label className="field">
            <span>Assignee</span>
            <select value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)}>
              <option value="">Unassigned</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>{emp.name}</option>
              ))}
            </select>
          </label>

          <div className="modal__footer">
            <button type="button" className="btn btn--ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn--primary">
              {chore ? 'Save Changes' : 'Add Chore'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
