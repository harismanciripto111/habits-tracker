import { useMemo } from 'react'
import { calculateStreak } from '../../utils/streaks'
import { getCategoryById } from '../../utils/categories'

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function AnalyticsDashboard({ habits, checks, currentMonth, currentYear }) {
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  const monthKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`

  const stats = useMemo(() => {
    const habitStats = habits.map(habit => {
      let completedDays = 0
      for (let d = 1; d <= daysInMonth; d++) {
        const key = `${monthKey}-${habit.id}-${d}`
        if (checks[key]) completedDays++
      }
      const streak = calculateStreak(habit.id, checks, null)
      const rate = daysInMonth > 0 ? Math.round((completedDays / daysInMonth) * 100) : 0
      return { ...habit, completedDays, rate, currentStreak: streak.currentStreak, longestStreak: streak.longestStreak, category: getCategoryById(habit.category) }
    })
    const totalChecks = habitStats.reduce((s, h) => s + h.completedDays, 0)
    const totalPossible = habits.length * daysInMonth
    const overallRate = totalPossible > 0 ? Math.round((totalChecks / totalPossible) * 100) : 0
    const dayOfWeekCounts = [0, 0, 0, 0, 0, 0, 0]
    const dayOfWeekTotal = [0, 0, 0, 0, 0, 0, 0]
    for (let d = 1; d <= daysInMonth; d++) {
      const dow = new Date(currentYear, currentMonth, d).getDay()
      dayOfWeekTotal[dow]++
      for (const habit of habits) {
        const key = `${monthKey}-${habit.id}-${d}`
        if (checks[key]) dayOfWeekCounts[dow]++
      }
    }
    const dayOfWeekRates = dayOfWeekCounts.map((count, i) => ({
      day: DAY_NAMES[i],
      rate: dayOfWeekTotal[i] > 0 && habits.length > 0 ? Math.round((count / (dayOfWeekTotal[i] * habits.length)) * 100) : 0,
      count,
    }))
    const bestDay = dayOfWeekRates.reduce((best, d) => d.rate > best.rate ? d : best, dayOfWeekRates[0])
    const sortedByRate = [...habitStats].sort((a, b) => b.rate - a.rate)
    const mostConsistent = sortedByRate[0] || null
    const sortedByStreak = [...habitStats].sort((a, b) => b.currentStreak - a.currentStreak)
    const bestStreak = sortedByStreak[0] || null
    return { habitStats, overallRate, totalChecks, totalPossible, dayOfWeekRates, bestDay, mostConsistent, bestStreak, sortedByRate, sortedByStreak }
  }, [habits, checks, currentMonth, currentYear, daysInMonth, monthKey])

  const heatmapData = useMemo(() => {
    const weeks = []
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    for (let w = 11; w >= 0; w--) {
      const week = []
      for (let d = 0; d < 7; d++) {
        const date = new Date(today)
        date.setDate(date.getDate() - (w * 7 + (6 - d)))
        const year = date.getFullYear()
        const month = date.getMonth()
        const day = date.getDate()
        const mk = `${year}-${String(month + 1).padStart(2, '0')}`
        let completed = 0
        for (const habit of habits) {
          const key = `${mk}-${habit.id}-${day}`
          if (checks[key]) completed++
        }
        const intensity = habits.length > 0 ? Math.min(4, Math.ceil((completed / habits.length) * 4)) : 0
        week.push({ date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), completed, total: habits.length, intensity, isFuture: date > today })
      }
      weeks.push(week)
    }
    return weeks
  }, [habits, checks])

  return (
    <div className="analytics-dashboard">
      <div className="analytics-cards">
        <div className="analytics-card">
          <div className="card-value">{stats.overallRate}%</div>
          <div className="card-label">Overall Rate</div>
          <div className="card-detail">{stats.totalChecks}/{stats.totalPossible} checks</div>
        </div>
        <div className="analytics-card">
          <div className="card-value">{stats.bestStreak ? stats.bestStreak.currentStreak : 0}</div>
          <div className="card-label">Best Streak</div>
          <div className="card-detail">{stats.bestStreak ? `${stats.bestStreak.emoji} ${stats.bestStreak.name}` : 'N/A'}</div>
        </div>
        <div className="analytics-card">
          <div className="card-value">{stats.bestDay.day}</div>
          <div className="card-label">Best Day</div>
          <div className="card-detail">{stats.bestDay.rate}% completion</div>
        </div>
        <div className="analytics-card">
          <div className="card-value">{stats.mostConsistent ? stats.mostConsistent.rate : 0}%</div>
          <div className="card-label">Top Habit</div>
          <div className="card-detail">{stats.mostConsistent ? `${stats.mostConsistent.emoji} ${stats.mostConsistent.name}` : 'N/A'}</div>
        </div>
      </div>

      <div className="analytics-section">
        <h3 className="section-title">Activity Heatmap (12 weeks)</h3>
        <div className="heatmap-container">
          <div className="heatmap-grid">
            {heatmapData.map((week, wi) => (
              <div key={wi} className="heatmap-week">
                {week.map((day, di) => (
                  <div key={di} className={`heatmap-cell intensity-${day.isFuture ? 'future' : day.intensity}`}
                    title={`${day.date}: ${day.completed}/${day.total} habits`} />
                ))}
              </div>
            ))}
          </div>
          <div className="heatmap-legend">
            <span>Less</span>
            <div className="heatmap-cell intensity-0" />
            <div className="heatmap-cell intensity-1" />
            <div className="heatmap-cell intensity-2" />
            <div className="heatmap-cell intensity-3" />
            <div className="heatmap-cell intensity-4" />
            <span>More</span>
          </div>
        </div>
      </div>

      <div className="analytics-section">
        <h3 className="section-title">Completion by Day of Week</h3>
        <div className="dow-chart">
          {stats.dayOfWeekRates.map((d, i) => (
            <div key={i} className="dow-bar-group">
              <div className="dow-bar-wrapper">
                <div className="dow-bar" style={{ height: `${Math.max(4, d.rate)}%` }} />
              </div>
              <div className="dow-label">{d.day}</div>
              <div className="dow-value">{d.rate}%</div>
            </div>
          ))}
        </div>
      </div>

      <div className="analytics-section">
        <h3 className="section-title">Habit Leaderboard</h3>
        <div className="leaderboard">
          {stats.sortedByRate.map((h, i) => (
            <div key={h.id} className="leaderboard-row">
              <div className="lb-rank">#{i + 1}</div>
              <span className="category-dot" style={{ backgroundColor: h.category.color }} />
              <div className="lb-emoji">{h.emoji}</div>
              <div className="lb-name">{h.name}</div>
              <div className="lb-bar-wrapper">
                <div className="lb-bar" style={{ width: `${h.rate}%` }} />
              </div>
              <div className="lb-rate">{h.rate}%</div>
              <div className="lb-streak" title={`Longest: ${h.longestStreak}`}>
                {h.currentStreak > 0 ? `\uD83D\uDD25${h.currentStreak}` : '-'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default AnalyticsDashboard
