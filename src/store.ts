import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { persist } from 'zustand/middleware'
import type { Chore, Employee } from './types'

interface State {
  employees: Employee[]
  chores: Chore[]
}

interface Actions {
  // Employees
  addEmployee: (name: string, color: string) => void
  removeEmployee: (id: string) => void
  updateEmployee: (id: string, name: string, color: string) => void

  // Chores
  addChore: (chore: Omit<Chore, 'id' | 'createdAt' | 'completedAt'>) => void
  updateChore: (id: string, patch: Partial<Omit<Chore, 'id' | 'createdAt'>>) => void
  deleteChore: (id: string) => void
  setStatus: (id: string, status: Chore['status']) => void
  assignChore: (choreId: string, employeeId: string | null) => void
}

const EMPLOYEE_COLORS = [
  '#4f46e5', '#0891b2', '#059669', '#d97706',
  '#dc2626', '#7c3aed', '#db2777', '#65a30d',
]

const today = new Date().toISOString().split('T')[0]
const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]

const SEED_EMPLOYEES: Employee[] = [
  { id: 'e1', name: 'Alice', color: EMPLOYEE_COLORS[0] },
  { id: 'e2', name: 'Bob', color: EMPLOYEE_COLORS[1] },
  { id: 'e3', name: 'Carol', color: EMPLOYEE_COLORS[2] },
  { id: 'e4', name: 'David', color: EMPLOYEE_COLORS[3] },
]

const SEED_CHORES: Chore[] = [
  {
    id: 'c1', title: 'Clean break room', description: 'Wipe counters, clean microwave, take out trash',
    assigneeId: 'e1', status: 'pending', priority: 'high', frequency: 'daily',
    dueDate: today, completedAt: null, createdAt: today,
  },
  {
    id: 'c2', title: 'Restock supplies', description: 'Check paper towels, soap, coffee pods',
    assigneeId: 'e2', status: 'in-progress', priority: 'medium', frequency: 'weekly',
    dueDate: tomorrow, completedAt: null, createdAt: today,
  },
  {
    id: 'c3', title: 'Vacuum common area', description: 'Vacuum all carpeted areas on the main floor',
    assigneeId: 'e3', status: 'pending', priority: 'low', frequency: 'weekly',
    dueDate: tomorrow, completedAt: null, createdAt: today,
  },
  {
    id: 'c4', title: 'Sanitize meeting rooms', description: 'Wipe down tables, chairs, and remote controls',
    assigneeId: 'e1', status: 'done', priority: 'medium', frequency: 'daily',
    dueDate: today, completedAt: new Date().toISOString(), createdAt: today,
  },
  {
    id: 'c5', title: 'Empty recycling bins', description: 'Collect and empty all recycling bins across floors',
    assigneeId: 'e4', status: 'pending', priority: 'low', frequency: 'weekly',
    dueDate: nextWeek, completedAt: null, createdAt: today,
  },
  {
    id: 'c6', title: 'Clean windows', description: 'Wipe interior windows in lobby and conference rooms',
    assigneeId: null, status: 'pending', priority: 'low', frequency: 'monthly',
    dueDate: nextWeek, completedAt: null, createdAt: today,
  },
]

let _idCounter = 100

const uid = () => `id_${++_idCounter}_${Math.random().toString(36).slice(2, 7)}`

export const useStore = create<State & Actions>()(
  persist(
    immer((set) => ({
      employees: SEED_EMPLOYEES,
      chores: SEED_CHORES,

      addEmployee: (name, color) =>
        set((s) => {
          s.employees.push({ id: uid(), name, color })
        }),

      removeEmployee: (id) =>
        set((s) => {
          s.employees = s.employees.filter((e) => e.id !== id)
          s.chores.forEach((c) => {
            if (c.assigneeId === id) c.assigneeId = null
          })
        }),

      updateEmployee: (id, name, color) =>
        set((s) => {
          const e = s.employees.find((e) => e.id === id)
          if (e) { e.name = name; e.color = color }
        }),

      addChore: (chore) =>
        set((s) => {
          s.chores.push({
            ...chore,
            id: uid(),
            createdAt: new Date().toISOString().split('T')[0],
            completedAt: null,
          })
        }),

      updateChore: (id, patch) =>
        set((s) => {
          const c = s.chores.find((c) => c.id === id)
          if (c) Object.assign(c, patch)
        }),

      deleteChore: (id) =>
        set((s) => {
          s.chores = s.chores.filter((c) => c.id !== id)
        }),

      setStatus: (id, status) =>
        set((s) => {
          const c = s.chores.find((c) => c.id === id)
          if (c) {
            c.status = status
            c.completedAt = status === 'done' ? new Date().toISOString() : null
          }
        }),

      assignChore: (choreId, employeeId) =>
        set((s) => {
          const c = s.chores.find((c) => c.id === choreId)
          if (c) c.assigneeId = employeeId
        }),
    })),
    { name: 'chore-app-store' }
  )
)

export const COLORS = EMPLOYEE_COLORS
