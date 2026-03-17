import { useState } from 'react'
import { CATEGORIES } from '../utils/categories'

const EMOJI_OPTIONS = ['\u23F0', '\uD83D\uDCAA', '\uD83D\uDEAB', '\uD83D\uDCD6', '\uD83D\uDCB0', '\uD83D\uDCBB', '\uD83C\uDF77', '\uD83D\uDCF5', '\uD83D\uDCDD', '\uD83D\uDE80', '\uD83E\uDDD8', '\uD83C\uDFC3', '\uD83D\uDCA7', '\uD83E\uDD57', '\uD83D\uDE34', '\uD83C\uDFAF', '\uD83C\uDFA8', '\uD83C\uDFB5', '\uD83E\uDDE0', '\u2764\uFE0F', '\uD83C\uDF31', '\u2728', '\uD83D\uDD25', '\u2B50']

function AddHabitModal({ onAdd, onUpdate, onDelete, onClose, editingHabit }) {
  const [name, setName] = useState(editingHabit?.name || '')
  const [emoji, setEmoji] = useState(editingHabit?.emoji || '\uD83C\uDFAF')
  const [category, setCategory] = useState(editingHabit?.category || 'custom')
  const [habitType, setHabitType] = useState(editingHabit?.type || 'boolean')
  const [target, setTarget] = useState(editingHabit?.target || '')
  const [unit, setUnit] = useState(editingHabit?.unit || '')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim()) return
    const habitData = {
      name: name.trim(), emoji, category, type: habitType,
      target: habitType === 'numerical' ? (parseInt(target) || 1) : null,
      unit: habitType === 'numerical' ? (unit.trim() || 'times') : null,
    }
    if (editingHabit) onUpdate(editingHabit.id, habitData)
    else onAdd(habitData)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2 className="modal-title">{editingHabit ? 'Edit Habit' : 'Add New Habit'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="emoji-picker">
            {EMOJI_OPTIONS.map(e => (
              <button key={e} type="button" className={`emoji-option ${emoji === e ? 'selected' : ''}`} onClick={() => setEmoji(e)}>
                {e}
              </button>
            ))}
          </div>

          <input type="text" className="habit-input" placeholder="Habit name..." value={name}
            onChange={e => setName(e.target.value)} autoFocus maxLength={30} />

          <div className="form-group">
            <label className="form-label">Category</label>
            <div className="category-picker">
              {CATEGORIES.map(cat => (
                <button key={cat.id} type="button"
                  className={`category-chip ${category === cat.id ? 'selected' : ''}`}
                  style={{ '--cat-color': cat.color, '--cat-bg': cat.bgColor }}
                  onClick={() => setCategory(cat.id)}>
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Tracking Type</label>
            <div className="type-toggle">
              <button type="button" className={`type-btn ${habitType === 'boolean' ? 'active' : ''}`} onClick={() => setHabitType('boolean')}>
                Yes / No
              </button>
              <button type="button" className={`type-btn ${habitType === 'numerical' ? 'active' : ''}`} onClick={() => setHabitType('numerical')}>
                Numerical
              </button>
            </div>
          </div>

          {habitType === 'numerical' && (
            <div className="numerical-fields">
              <div className="num-field">
                <label className="form-label">Daily Target</label>
                <input type="number" className="habit-input small" placeholder="e.g. 8"
                  value={target} onChange={e => setTarget(e.target.value)} min="1" />
              </div>
              <div className="num-field">
                <label className="form-label">Unit</label>
                <input type="text" className="habit-input small" placeholder="e.g. glasses, pages"
                  value={unit} onChange={e => setUnit(e.target.value)} maxLength={15} />
              </div>
            </div>
          )}

          <div className="modal-actions">
            {editingHabit && (
              <button type="button" className="delete-btn" onClick={() => onDelete(editingHabit.id)}>Delete</button>
            )}
            <button type="button" className="cancel-btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="submit-btn" disabled={!name.trim()}>
              {editingHabit ? 'Save' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddHabitModal
