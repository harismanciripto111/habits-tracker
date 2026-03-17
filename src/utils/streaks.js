/**
 * Streak calculation utilities
 * Supports streak freeze: 1 free miss per week without breaking streak
 */

export function calculateStreak(habitId, checks, streakFreezes) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  let currentStreak = 0
  let longestStreak = 0
  let tempStreak = 0
  let freezeUsedThisWeek = false
  let date = new Date(today)

  for (let i = 0; i < 365; i++) {
    const year = date.getFullYear()
    const month = date.getMonth()
    const day = date.getDate()
    const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`
    const key = `${monthKey}-${habitId}-${day}`
    const weekKey = getWeekKey(date)

    if (checks[key]) {
      currentStreak++
    } else if (!freezeUsedThisWeek && hasStreakFreeze(weekKey, habitId, streakFreezes)) {
      currentStreak++
      freezeUsedThisWeek = true
    } else {
      break
    }

    const prevDate = new Date(date)
    prevDate.setDate(prevDate.getDate() - 1)
    if (getWeekKey(prevDate) !== weekKey) {
      freezeUsedThisWeek = false
    }

    date.setDate(date.getDate() - 1)
  }

  const allDates = getAllDatesFromChecks(habitId, checks)
  allDates.sort((a, b) => a - b)

  tempStreak = 0
  let lastDate = null
  for (const d of allDates) {
    if (lastDate) {
      const diff = Math.round((d - lastDate) / (1000 * 60 * 60 * 24))
      if (diff === 1) {
        tempStreak++
      } else if (diff === 2) {
        tempStreak++
      } else {
        longestStreak = Math.max(longestStreak, tempStreak)
        tempStreak = 1
      }
    } else {
      tempStreak = 1
    }
    lastDate = d
  }
  longestStreak = Math.max(longestStreak, tempStreak, currentStreak)

  return { currentStreak, longestStreak }
}

function getWeekKey(date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  const dayOfWeek = d.getDay()
  d.setDate(d.getDate() - dayOfWeek)
  return `${d.getFullYear()}-W${String(Math.ceil((d.getDate()) / 7)).padStart(2, '0')}-${d.getMonth()}`
}

function hasStreakFreeze(weekKey, habitId, streakFreezes) {
  if (!streakFreezes) return true
  const key = `${weekKey}-${habitId}`
  return !streakFreezes[key]
}

function getAllDatesFromChecks(habitId, checks) {
  const dates = []
  for (const key of Object.keys(checks)) {
    if (!checks[key]) continue
    const parts = key.split('-')
    if (parts.length >= 4) {
      const hId = parts[2]
      if (hId === String(habitId)) {
        const year = parseInt(parts[0])
        const month = parseInt(parts[1]) - 1
        const day = parseInt(parts[3])
        if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
          dates.push(new Date(year, month, day))
        }
      }
    }
  }
  return dates
}

export function getStreakEmoji(streak) {
  if (streak >= 30) return { icon: '\uD83D\uDD25', label: 'On Fire!' }
  if (streak >= 14) return { icon: '\u26A1', label: 'Unstoppable' }
  if (streak >= 7) return { icon: '\u2728', label: 'Rolling' }
  if (streak >= 3) return { icon: '\uD83C\uDF31', label: 'Growing' }
  return { icon: '', label: '' }
}
