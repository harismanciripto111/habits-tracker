function HabitsGrid({ habits, daysInMonth, currentMonth, currentYear, isChecked, toggleCheck, getCompletionCount, todayDate, onEditHabit }) {
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  const getDayName = (day) => {
    const date = new Date(currentYear, currentMonth, day)
    return ['S', 'M', 'T', 'W', 'T', 'F', 'S'][date.getDay()]
  }

  return (
    <div className="grid-container">
      <div className="grid-wrapper">
        <table className="habits-table">
          <thead>
            <tr>
              <th className="habit-name-header">Habit</th>
              {days.map(day => (
                <th key={day} className={`day-header ${day === todayDate ? 'today' : ''}`}>
                  <span className="day-name">{getDayName(day)}</span>
                  <span className="day-num">{day}</span>
                </th>
              ))}
              <th className="completion-header">Done</th>
            </tr>
          </thead>
          <tbody>
            {habits.map(habit => {
              const count = getCompletionCount(habit.id)
              const pct = Math.round((count / daysInMonth) * 100)
              return (
                <tr key={habit.id} className="habit-row">
                  <td className="habit-name-cell" onClick={() => onEditHabit(habit)}>
                    <span className="habit-emoji">{habit.emoji}</span>
                    <span className="habit-label">{habit.name}</span>
                  </td>
                  {days.map(day => {
                    const checked = isChecked(habit.id, day)
                    return (
                      <td
                        key={day}
                        className={`check-cell ${checked ? 'checked' : ''} ${day === todayDate ? 'today-col' : ''}`}
                        onClick={() => toggleCheck(habit.id, day)}
                      >
                        <div className={`checkbox ${checked ? 'checked' : ''}`}>
                          {checked && (
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                          )}
                        </div>
                      </td>
                    )
                  })}
                  <td className="completion-cell">
                    <div className="completion-badge">
                      <span className="completion-count">{count}</span>
                      <span className="completion-pct">{pct}%</span>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default HabitsGrid