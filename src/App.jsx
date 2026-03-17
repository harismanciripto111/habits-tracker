import { useState, useEffect, useMemo } from 'react'
import HabitsGrid from './components/HabitsGrid'
import AddHabitModal from './components/AddHabitModal'
import AnalyticsDashboard from './components/analytics/AnalyticsDashboard'
import { useDarkMode } from './hooks/useDarkMode'
import { CATEGORIES } from './utils/categories'
import './App.css'

const DEFAULT_HABITS = [
  { id: '1', name: 'Wake up at 06:30', emoji: '\u23F0', category: 'health', type: 'boolean', target: null, unit: null },
  { id: '2', name: 'Gym', emoji: '\uD83D\uDCAA', category: 'health', type: 'boolean', target: null, unit: null },
  { id: '3', name: 'Stop Bad Habits', emoji: '\uD83D\uDEAB', category: 'health', type: 'boolean', target: null, unit: null },
  { id: '4', name: 'Reading / Learn', emoji: '\uD83D\uDCD6', category: 'learning', type: 'numerical', target: 30, unit: 'pages' },
  { id: '5', name: 'Budget Tracking', emoji: '\uD83D\uDCB0', category: 'finance', type: 'boolean', target: null, unit: null },
  { id: '6', name: 'Project Routine', emoji: '\uD83D\uDCBB', category: 'productivity', type: 'boolean', target: null, unit: null },
  { id: '7', name: 'No Alcohol', emoji: '\uD83C\uDF77', category: 'health', type: 'boolean', target: null, unit: null },
  { id: '8', name: 'Social Media Detox', emoji: '\uD83D\uDCF5', category: 'mindfulness', type: 'boolean', target: null, unit: null },
  { id: '9', name: 'Journaling', emoji: '\uD83D\uDCDD', category: 'mindfulness', type: 'boolean', target: null, unit: null },
  { id: '10', name: 'Drink Water', emoji: '\uD83D\uDCA7', category: 'health', type: 'numerical', target: 8, unit: 'glasses' },
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
    const saved = localStorage.getItem('habits-list-v2')
    return saved ? JSON.parse(saved) : DEFAULT_HABITS
  })
  const [checks, setChecks] = useState(() => {
    const saved = localStorage.getItem('habits-checks')
    return saved ? JSON.parse(saved) : {}
  })
  const [notes, setNotes] = useState(() => {
    const saved = localStorage.getItem('habits-notes')
    return saved ? JSON.parse(saved) : {}
  })
  const [numericalValues, setNumericalValues] = useState(() => {
    const saved = localStorage.getItem('habits-numerical')
    return saved ? JSON.parse(saved) : {}
  })
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingHabit, setEditingHabit] = useState(null)
  const [activeTab, setActiveTab] = useState('tracker')
  const [viewMode, setViewMode] = useState('monthly')
  const [weekOffset, setWeekOffset] = useState(0)
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [darkMode, setDarkMode] = useDarkMode()

  useEffect(() => { localStorage.setItem('habits-list-v2', JSON.stringify(habits)) }, [habits])
  useEffect(() => { localStorage.setItem('habits-checks', JSON.stringify(checks)) }, [checks])
  useEffect(() => { localStorage.setItem('habits-notes', JSON.stringify(notes)) }, [notes])
  useEffect(() => { localStorage.setItem('habits-numerical', JSON.stringify(numericalValues)) }, [numericalValues])

  const monthKey = getMonthKey(currentYear, currentMonth)
  const daysInMonth = getDaysInMonth(currentYear, currentMonth)
  const totalWeeks = Math.ceil(daysInMonth / 7)
  useEffect(() => { setWeekOffset(0) }, [currentMonth, currentYear])

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

  const addHabit = (habitData) => {
    const id = Date.now().toString()
    setHabits(prev => [...prev, { id, ...habitData }])
    setShowAddModal(false)
  }

  const updateHabit = (id, habitData) => {
    setHabits(prev => prev.map(h => h.id === id ? { ...h, ...habitData } : h))
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

  const saveNote = (key, text) => {
    setNotes(prev => {
      const next = { ...prev }
      if (text) next[key] = text
      else delete next[key]
      return next
    })
  }

  const setNumericalValue = (key, value) => {
    setNumericalValues(prev => ({ ...prev, [key]: value }))
  }

  const today = new Date()
  const isCurrentMonth = today.getMonth() === currentMonth && today.getFullYear() === currentYear
  const todayDate = isCurrentMonth ? today.getDate() : null

  const filteredHabits = useMemo(() => {
    if (categoryFilter === 'all') return habits
    return habits.filter(h => h.category === categoryFilter)
  }, [habits, categoryFilter])

  return (
    <div className="app">
      <header className="header">
        <div className="header-top">
          <h1 className="title">Habits Tracker</h1>
          <button
            className="dark-mode-toggle"
            onClick={() => setDarkMode(d => !d)}
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {darkMode ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            )}
          </button>
        </div>

        <div className="tab-bar">
          <button className={`tab-btn ${activeTab === 'tracker' ? 'active' : ''}`} onClick={() => setActiveTab('tracker')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
            Tracker
          </button>
          <button className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => setActiveTab('analytics')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
            Analytics
          </button>
        </div>

        {activeTab === 'tracker' && (
          <>
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

            <div className="toolbar">
              <div className="view-toggle">
                <button className={`view-btn ${viewMode === 'monthly' ? 'active' : ''}`} onClick={() => setViewMode('monthly')}>
                  Monthly
                </button>
                <button className={`view-btn ${viewMode === 'weekly' ? 'active' : ''}`} onClick={() => setViewMode('weekly')}>
                  Weekly
                </button>
              </div>

              {viewMode === 'weekly' && (
                <div className="week-nav">
                  <button className="nav-btn small" onClick={() => setWeekOffset(w => Math.max(0, w - 1))} disabled={weekOffset === 0}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
                  </button>
                  <span className="week-label">Week {weekOffset + 1}</span>
                  <button className="nav-btn small" onClick={() => setWeekOffset(w => Math.min(totalWeeks - 1, w + 1))} disabled={weekOffset >= totalWeeks - 1}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
                  </button>
                </div>
              )}

              <div className="category-filter">
                <button className={`filter-chip ${categoryFilter === 'all' ? 'active' : ''}`} onClick={() => setCategoryFilter('all')}>
                  All
                </button>
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    className={`filter-chip ${categoryFilter === cat.id ? 'active' : ''}`}
                    style={{ '--chip-color': cat.color, '--chip-bg': cat.bgColor }}
                    onClick={() => setCategoryFilter(cat.id)}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </header>

      {activeTab === 'tracker' ? (
        <>
          <HabitsGrid
            habits={filteredHabits}
            daysInMonth={daysInMonth}
            currentMonth={currentMonth}
            currentYear={currentYear}
            isChecked={isChecked}
            toggleCheck={toggleCheck}
            getCompletionCount={getCompletionCount}
            todayDate={todayDate}
            onEditHabit={openEdit}
            checks={checks}
            notes={notes}
            onSaveNote={saveNote}
            numericalValues={numericalValues}
            onSetNumericalValue={setNumericalValue}
            viewMode={viewMode}
            weekOffset={weekOffset}
          />

          <button className="add-habit-btn" onClick={() => setShowAddModal(true)}>
            + Add Habit
          </button>

          <p className="note-hint">Right-click any cell to add a note</p>
        </>
      ) : (
        <AnalyticsDashboard
          habits={habits}
          checks={checks}
          currentMonth={currentMonth}
          currentYear={currentYear}
        />
      )}

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
