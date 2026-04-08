import { useState } from 'react'
import { clsx } from 'clsx'
import { useStore } from './store'
import { ChoreCard } from './components/ChoreCard'
import { ChoreForm } from './components/ChoreForm'
import { EmployeeManager } from './components/EmployeeManager'
import { CalendarView } from './components/CalendarView'
import type { Chore, ChoreStatus } from './types'
import './App.css'

type Tab = 'board' | 'calendar' | 'employees'
type Filter = 'all' | ChoreStatus

const COLUMNS: { status: ChoreStatus; label: string }[] = [
  { status: 'pending', label: 'To Do' },
  { status: 'in-progress', label: 'In Progress' },
  { status: 'done', label: 'Done' },
]

export default function App() {
  const { chores, employees } = useStore()
  const [tab, setTab] = useState<Tab>('calendar')
  const [filter, setFilter] = useState<Filter>('all')
  const [search, setSearch] = useState('')
  const [editingChore, setEditingChore] = useState<Chore | null | undefined>(undefined)
  const [newChoreDueDate, setNewChoreDueDate] = useState<string | undefined>(undefined)
  // undefined = closed, null = new, Chore = editing

  const openNewChore = (dueDate?: string) => {
    setNewChoreDueDate(dueDate)
    setEditingChore(null)
  }

  const filtered = chores.filter((c) => {
    if (filter !== 'all' && c.status !== filter) return false
    if (search && !c.title.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const byStatus = (status: ChoreStatus) => filtered.filter((c) => c.status === status)

  const totalDone = chores.filter((c) => c.status === 'done').length
  const progress = chores.length ? Math.round((totalDone / chores.length) * 100) : 0

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <div className="app-header__left">
          <span className="app-logo">🧹</span>
          <div>
            <h1 className="app-title">ChoreBoard</h1>
            <p className="app-subtitle">Office chore management</p>
          </div>
        </div>
        <div className="app-header__right">
          <div className="progress-ring" title={`${progress}% complete`}>
            <svg viewBox="0 0 36 36" className="progress-ring__svg">
              <circle className="progress-ring__bg" cx="18" cy="18" r="15" />
              <circle
                className="progress-ring__fill"
                cx="18" cy="18" r="15"
                strokeDasharray={`${progress * 0.942} 100`}
              />
            </svg>
            <span className="progress-ring__label">{progress}%</span>
          </div>
          <div className="header-stats">
            <span>{totalDone}/{chores.length}</span>
            <span className="stat-label">chores done</span>
          </div>
        </div>
      </header>

      {/* Nav */}
      <nav className="app-nav">
        <div className="app-nav__tabs">
          <button
            className={clsx('nav-tab', { 'nav-tab--active': tab === 'board' })}
            onClick={() => setTab('board')}
          >
            Board
          </button>
          <button
            className={clsx('nav-tab', { 'nav-tab--active': tab === 'calendar' })}
            onClick={() => setTab('calendar')}
          >
            Calendar
          </button>
          <button
            className={clsx('nav-tab', { 'nav-tab--active': tab === 'employees' })}
            onClick={() => setTab('employees')}
          >
            Employees
            <span className="nav-badge">{employees.length}</span>
          </button>
        </div>

        {tab === 'board' && (
          <div className="app-nav__controls">
            <input
              className="search-input"
              type="search"
              placeholder="Search chores…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              className="filter-select"
              value={filter}
              onChange={(e) => setFilter(e.target.value as Filter)}
            >
              <option value="all">All statuses</option>
              <option value="pending">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="done">Done</option>
            </select>
            <button
              className="btn btn--primary"
              onClick={() => setEditingChore(null)}
            >
              + New Chore
            </button>
          </div>
        )}
      </nav>

      {/* Main content */}
      <main className="app-main">
        {tab === 'board' ? (
          <div className="board">
            {COLUMNS.map(({ status, label }) => {
              const cards = byStatus(status)
              return (
                <div key={status} className={clsx('column', `column--${status}`)}>
                  <div className="column__header">
                    <span className="column__title">{label}</span>
                    <span className="column__count">{cards.length}</span>
                  </div>
                  <div className="column__cards">
                    {cards.length === 0 && (
                      <div className="empty-column">No chores here</div>
                    )}
                    {cards.map((chore) => (
                      <ChoreCard
                        key={chore.id}
                        chore={chore}
                        employees={employees}
                        onEdit={setEditingChore}
                      />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        ) : tab === 'calendar' ? (
          <CalendarView onEditChore={setEditingChore} onNewChore={openNewChore} />
        ) : (
          <EmployeeManager />
        )}
      </main>

      {/* Modal */}
      {editingChore !== undefined && (
        <ChoreForm
          chore={editingChore}
          defaultDueDate={newChoreDueDate}
          onClose={() => { setEditingChore(undefined); setNewChoreDueDate(undefined) }}
        />
      )}
    </div>
  )
}
