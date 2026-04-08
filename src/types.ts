export type ChoreStatus = 'pending' | 'in-progress' | 'done'
export type ChorePriority = 'low' | 'medium' | 'high'
export type ChoreFrequency = 'daily' | 'weekly' | 'monthly' | 'once'

export interface Employee {
  id: string
  name: string
  color: string // tailwind bg color token e.g. '#4f46e5'
}

export interface Chore {
  id: string
  title: string
  description: string
  assigneeId: string | null
  status: ChoreStatus
  priority: ChorePriority
  frequency: ChoreFrequency
  dueDate: string // ISO date string
  completedAt: string | null
  createdAt: string
}
