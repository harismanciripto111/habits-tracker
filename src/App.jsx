import { useState, useEffect } from 'react'
import HabitsGrid from './components/HabitsGrid'
import AddHabitModal from './components/AddHabitModal'
import './App.css'

const DEFAULT_HABITS = [
  { id: '1', name: 'Wake up at 06:30', emoji: '\u23F0' },
  { id: '2', name: 'Gym', emoji: '\uD83D\uDCAA' },
  { id: '3', name: 'Stop Bad Habits', emoji: '\uD83D\uDEAB' },
  { id: '4', name: 'Reading / Learn', emoji: '\uD83D\uDCD6' },
  { id: '5', name: 'Budget Tracking', emoji: '\uD83D\uDCB0' },
  { id: '6', name: 'Project Routine', emoji: '\uD83D\uDCBB' },
  { id: '7', name: 'No Alcohol', emoji: '\uD83C\uDF77' },
  { id: '8', name: 'Social Media Detox', emoji: '\uD83D\uDCF5' },
  { id: '9', name: 'Journaling', emoji: '\uD83D\uDCDD' },
  { id: '10', name: 'Side Hustle', emoji: '\uD83D\uDE80' },
]

function getMonthKey(year, month) {
  return `${year}-${String(month + 1).padStart(2, '0')}`
}

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate()
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

function App() {
  const now = new Date()
  const [currentMonth, setCurrentMonth] = useState(now.getMonth())
  const [currentYear, setCurrentYear] = useState(now.getFullYear())
  const [habits, setHabits] = useState(() => {
    const saved = localStorage.getItem('habits-list')
    return saved ? JSON.parse(saved) : DEFAULT_HABITS
  })
  const [checks, setChecks] = useState(() => {
    const saved = localStorage.getItem('habits-checks')
    return saved ? JSON.parse(saved) : {}
  })
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingHabit, setEditingHabit] = useState(null)

  useEffect(() => {
    localStorage.setItem('habits-list', JSON.stringify(habits))
  }, [habits])

  useEffect(() => {
    localStorage.setItem('habits-checks', JSON.stringify(checks))
  }, [checks])

  const monthKey = getMonthKey(currentYear, currentMonth)
  const daysInMonth = getDaysInMonth(currentYear, currentMonth)

  const toggleCheck = (habitId, day) => {
    const key = `${monthKey}-${habitId}-${day}`
    setChecks(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const isChecked = (habitId, day) => {
    const key = `${monthKey}-${habitId}-${day}`
    return !!checks[key]
  }

  const getCompletionCount = (habitId) => {
    let count = 0
    for (let d = 1; d <= daysInMonth; d++) {
      if (isChecked(habitId, d)) count++
    }
    return count
  }

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear(y => y - 1)
    } else {
      setCurrentMonth(m => m - 1)
    }
  }

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear(y => y + 1)
    } else {
      setCurrentMonth(m => m + 1)
    }
  }

  const addHabit = (name, emoji) => {
    const id = Date.now().toString()
    setHabits(prev => [...prev, { id, name, emoji }])
    setShowAddModal(false)
  }

  const updateHabit = (id, name, emoji) => {
    setHabits(prev => prev.map(h => h.id === id ? { ...h, name, emoji } : h))
    setEditingHabit(null)
    setShowAddModal(false)
  }

  const deleteHabit = (id) => {
    setHabits(prev => prev.filter(h => h.id !== id))
    setEditingHabit(null)
    setShowAddModal(false)
  }

  const openEdit = (habit) => {
    setEditingHabit(habit)
    setShowAddModal(true)
  }

  const closeModal = () => {
    setShowAddModal(false)
    setEditingHabit(null)
  }

  const today = new Date()
  const isCurrentMonth = today.getMonth() === currentMonth && today.getFullYear() === currentYear
  const todayDate = isCurrentMonth ? today.getDate() : null

  return (
    <div className="app">
      <header className="header">
        <h1 className="title">Habits Tracker</h1>
        <p className="subtitle">{MONTH_NAMES[currentMonth]} {currentYear}</p>
        <div className="nav-buttons">
          <button className="nav-btn" onClick={prevMonth}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
          </button>
          <button className="nav-btn today-btn" onClick={() => { setCurrentMonth(now.getMonth()); setCurrentYear(now.getFullYear()) }}>
            Today
          </button>
          <button className="nav-btn" onClick={nextMonth}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>
        </div>
      </header>

      <HabitsGrid
        habits={habits}
        daysInMonth={daysInMonth}
        currentMonth={currentMonth}
        currentYear={currentYear}
        isChecked={isChecked}
        toggleCheck={toggleCheck}
        getCompletionCount={getCompletionCount}
        todayDate={todayDate}
        onEditHabit={openEdit}
      />

      <button className="add-habit-btn" onClick={() => setShowAddModal(true)}>
        + Add Habit
      </button>

      {showAddModal && (
        <AddHabitModal
          onAdd={addHabit}
          onUpdate={updateHabit}
          onDelete={deleteHabit}
          onClose={closeModal}
          editingHabit={editingHabit}
        />
      )}
    </div>
  )
}

export default App