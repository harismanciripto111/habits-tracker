/**
 * Category definitions with colors
 */

export const CATEGORIES = [
  { id: 'health', name: 'Health', color: '#6b9e7e', bgColor: '#e8f5e9' },
  { id: 'productivity', name: 'Productivity', color: '#5b8bd6', bgColor: '#e3f2fd' },
  { id: 'learning', name: 'Learning', color: '#f59e42', bgColor: '#fff3e0' },
  { id: 'mindfulness', name: 'Mindfulness', color: '#ab6bd6', bgColor: '#f3e5f5' },
  { id: 'finance', name: 'Finance', color: '#e6b422', bgColor: '#fffde7' },
  { id: 'social', name: 'Social', color: '#e06b8f', bgColor: '#fce4ec' },
  { id: 'custom', name: 'Custom', color: '#78909c', bgColor: '#eceff1' },
]

export function getCategoryById(id) {
  return CATEGORIES.find(c => c.id === id) || CATEGORIES[CATEGORIES.length - 1]
}

export function getCategoryColor(id) {
  const cat = getCategoryById(id)
  return cat.color
}

export function getCategoryBgColor(id) {
  const cat = getCategoryById(id)
  return cat.bgColor
}
