import { useState } from 'react'
import { useStore, COLORS } from '../store'
import type { Employee } from '../types'

export function EmployeeManager() {
  const { employees, chores, addEmployee, removeEmployee, updateEmployee } = useStore()

  const [name, setName] = useState('')
  const [color, setColor] = useState(COLORS[0])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editColor, setEditColor] = useState('')

  const choreCount = (id: string) => chores.filter((c) => c.assigneeId === id).length
  const doneCount = (id: string) =>
    chores.filter((c) => c.assigneeId === id && c.status === 'done').length

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    addEmployee(name.trim(), color)
    setName('')
    setColor(COLORS[0])
  }

  const startEdit = (emp: Employee) => {
    setEditingId(emp.id)
    setEditName(emp.name)
    setEditColor(emp.color)
  }

  const saveEdit = (id: string) => {
    if (editName.trim()) updateEmployee(id, editName.trim(), editColor)
    setEditingId(null)
  }

  return (
    <div className="emp-manager">
      <div className="emp-manager__list">
        {employees.length === 0 && (
          <p className="empty-hint">No employees yet. Add one below.</p>
        )}
        {employees.map((emp) => (
          <div key={emp.id} className="emp-row">
            {editingId === emp.id ? (
              <div className="emp-row__edit">
                <div
                  className="color-swatch"
                  style={{ background: editColor }}
                />
                <input
                  className="emp-input"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') saveEdit(emp.id)
                    if (e.key === 'Escape') setEditingId(null)
                  }}
                  autoFocus
                />
                <div className="color-picker">
                  {COLORS.map((c) => (
                    <button
                      key={c}
                      className="color-option"
                      style={{ background: c, outline: editColor === c ? '2px solid white' : 'none' }}
                      onClick={() => setEditColor(c)}
                      aria-label={c}
                    />
                  ))}
                </div>
                <button className="btn btn--primary btn--sm" onClick={() => saveEdit(emp.id)}>Save</button>
                <button className="btn btn--ghost btn--sm" onClick={() => setEditingId(null)}>Cancel</button>
              </div>
            ) : (
              <>
                <span className="assignee-dot" style={{ background: emp.color }}>
                  {emp.name[0]}
                </span>
                <span className="emp-name">{emp.name}</span>
                <span className="emp-stats">
                  {doneCount(emp.id)}/{choreCount(emp.id)} done
                </span>
                <button className="icon-btn" title="Edit" onClick={() => startEdit(emp)}>✏️</button>
                <button
                  className="icon-btn"
                  title="Remove"
                  onClick={() => {
                    if (window.confirm(`Remove ${emp.name}? Their chores will become unassigned.`)) {
                      removeEmployee(emp.id)
                    }
                  }}
                >
                  🗑️
                </button>
              </>
            )}
          </div>
        ))}
      </div>

      <form className="emp-add-form" onSubmit={handleAdd}>
        <h3>Add Employee</h3>
        <div className="emp-add-form__row">
          <div
            className="color-swatch"
            style={{ background: color }}
          />
          <input
            className="emp-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Employee name"
          />
          <button type="submit" className="btn btn--primary">Add</button>
        </div>
        <div className="color-picker">
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              className="color-option"
              style={{ background: c, outline: color === c ? '2px solid white' : 'none' }}
              onClick={() => setColor(c)}
              aria-label={c}
            />
          ))}
        </div>
      </form>
    </div>
  )
}
