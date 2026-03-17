import { useState } from 'react'
import { calculateStreak, getStreakEmoji } from '../utils/streaks'
import { getCategoryById } from '../utils/categories'
import NoteModal from './NoteModal'

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

function HabitsGrid({
  habits, daysInMonth, currentMonth, currentYear, isChecked, toggleCheck,
  getCompletionCount, todayDate, onEditHabit, checks, notes, onSaveNote,
  numericalValues, onSetNumericalValue, viewMode, weekOffset,
}) {
  const [noteModal, setNoteModal] = useState(null)

  let days
  if (viewMode === 'weekly') {
    const startOfWeek = weekOffset * 7 + 1
    days = []
    for (let i = 0; i < 7; i++) {
      const d = startOfWeek + i
      if (d >= 1 && d <= daysInMonth) days.push(d)
    }
  } else {
    days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  }

  const getDayName = (day) => {
    const date = new Date(currentYear, currentMonth, day)
    return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()]
  }

  const getShortDayName = (day) => {
    const date = new Date(currentYear, currentMonth, day)
    return ['S', 'M', 'T', 'W', 'T', 'F', 'S'][date.getDay()]
  }

  const monthKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`
  const getNoteKey = (habitId, day) => `${monthKey}-${habitId}-${day}-note`
  const hasNote = (habitId, day) => {
    const key = getNoteKey(habitId, day)
    return notes && notes[key] && notes[key].trim().length > 0
  }

  const openNoteModal = (habit, day, e) => {
    e.preventDefault()
    e.stopPropagation()
    const key = getNoteKey(habit.id, day)
    setNoteModal({ habit, day, note: notes?.[key] || '' })
  }

  const handleSaveNote = (text) => {
    const key = getNoteKey(noteModal.habit.id, noteModal.day)
    onSaveNote(key, text)
    setNoteModal(null)
  }

  const getNumericalKey = (habitId, day) => `${monthKey}-${habitId}-${day}-val`

  const handleNumericalChange = (habitId, day, value) => {
    const key = getNumericalKey(habitId, day)
    const numVal = Math.max(0, parseInt(value) || 0)
    onSetNumericalValue(key, numVal)
    const checkKey = `${monthKey}-${habitId}-${day}`
    if (numVal > 0 && !checks[checkKey]) toggleCheck(habitId, day)
    else if (numVal === 0 && checks[checkKey]) toggleCheck(habitId, day)
  }

  const getNumericalValue = (habitId, day) => {
    const key = getNumericalKey(habitId, day)
    return numericalValues?.[key] || 0
  }

  const isWeekly = viewMode === 'weekly'

  return (
    <>
      <div className={`grid-container ${isWeekly ? 'weekly-view' : ''}`}>
        <div className="grid-wrapper">
          <table className="habits-table">
            <thead>
              <tr>
                <th className="habit-name-header">Habit</th>
                {days.map(day => (
                  <th key={day} className={`day-header ${day === todayDate ? 'today' : ''} ${isWeekly ? 'weekly' : ''}`}>
                    <span className="day-name">{isWeekly ? getDayName(day) : getShortDayName(day)}</span>
                    <span className="day-num">{day}</span>
                  </th>
                ))}
                <th className="completion-header">Done</th>
                <th className="streak-header">Streak</th>
              </tr>
            </thead>
            <tbody>
              {habits.map(habit => {
                const count = getCompletionCount(habit.id)
                const pct = Math.round((count / daysInMonth) * 100)
                const streak = calculateStreak(habit.id, checks, null)
                const streakInfo = getStreakEmoji(streak.currentStreak)
                const category = getCategoryById(habit.category)
                const isNumerical = habit.type === 'numerical'

                return (
                  <tr key={habit.id} className="habit-row">
                    <td className="habit-name-cell" onClick={() => onEditHabit(habit)}>
                      <div className="habit-name-content">
                        <span className="category-dot" style={{ backgroundColor: category.color }} title={category.name} />
                        <span className="habit-emoji">{habit.emoji}</span>
                        <span className="habit-label">{habit.name}</span>
                        {isNumerical && (
                          <span className="habit-target-badge">{habit.target} {habit.unit}</span>
                        )}
                      </div>
                    </td>
                    {days.map(day => {
                      const checked = isChecked(habit.id, day)
                      const dayHasNote = hasNote(habit.id, day)

                      if (isNumerical) {
                        const val = getNumericalValue(habit.id, day)
                        const progress = habit.target ? Math.min(100, (val / habit.target) * 100) : 0
                        const isMet = val >= (habit.target || 1)
                        return (
                          <td key={day} className={`check-cell numerical-cell ${day === todayDate ? 'today-col' : ''} ${isMet ? 'met' : ''} ${isWeekly ? 'weekly' : ''}`}
                            onContextMenu={(e) => openNoteModal(habit, day, e)}>
                            <div className="numerical-wrapper">
                              <input type="number" className={`num-input ${isMet ? 'met' : ''}`}
                                value={val || ''} onChange={(e) => handleNumericalChange(habit.id, day, e.target.value)}
                                min="0" placeholder="0" />
                              <div className="num-progress-bar">
                                <div className="num-progress-fill" style={{ width: `${progress}%` }} />
                              </div>
                            </div>
                            {dayHasNote && <span className="note-dot" title="Has note">*</span>}
                          </td>
                        )
                      }

                      return (
                        <td key={day} className={`check-cell ${checked ? 'checked' : ''} ${day === todayDate ? 'today-col' : ''} ${isWeekly ? 'weekly' : ''}`}
                          onClick={() => toggleCheck(habit.id, day)} onContextMenu={(e) => openNoteModal(habit, day, e)}>
                          <div className={`checkbox ${checked ? 'checked' : ''} ${isWeekly ? 'big' : ''}`}>
                            {checked && (
                              <svg width={isWeekly ? '16' : '12'} height={isWeekly ? '16' : '12'} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                            )}
                          </div>
                          {dayHasNote && <span className="note-dot" title="Has note">*</span>}
                          {isWeekly && dayHasNote && (
                            <span className="note-preview">{notes[getNoteKey(habit.id, day)]?.slice(0, 20)}</span>
                          )}
                        </td>
                      )
                    })}
                    <td className="completion-cell">
                      <div className="completion-badge">
                        <span className="completion-count">{count}</span>
                        <span className="completion-pct">{pct}%</span>
                      </div>
                    </td>
                    <td className="streak-cell">
                      <div className="streak-badge">
                        {streak.currentStreak > 0 ? (
                          <>
                            <span className="streak-fire">{streakInfo.icon || '\uD83D\uDD25'}</span>
                            <span className="streak-count">{streak.currentStreak}</span>
                          </>
                        ) : (
                          <span className="streak-count dim">0</span>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {noteModal && (
        <NoteModal
          habitName={noteModal.habit.name} habitEmoji={noteModal.habit.emoji}
          day={noteModal.day} monthName={MONTH_NAMES[currentMonth]}
          note={noteModal.note} onSave={handleSaveNote} onClose={() => setNoteModal(null)}
        />
      )}
    </>
  )
}

export default HabitsGrid
