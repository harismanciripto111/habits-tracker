import { useState } from 'react'

const EMOJI_OPTIONS = ['\u23F0', '\uD83D\uDCAA', '\uD83D\uDEAB', '\uD83D\uDCD6', '\uD83D\uDCB0', '\uD83D\uDCBB', '\uD83C\uDF77', '\uD83D\uDCF5', '\uD83D\uDCDD', '\uD83D\uDE80', '\uD83E\uDDD8', '\uD83C\uDFC3', '\uD83D\uDCA7', '\uD83E\uDD57', '\uD83D\uDE34', '\uD83C\uDFAF', '\uD83C\uDFA8', '\uD83C\uDFB5', '\uD83E\uDDE0', '\u2764\uFE0F', '\uD83C\uDF31', '\u2728', '\uD83D\uDD25', '\u2B50']

function AddHabitModal({ onAdd, onUpdate, onDelete, onClose, editingHabit }) {
  const [name, setName] = useState(editingHabit?.name || '')
  const [emoji, setEmoji] = useState(editingHabit?.emoji || '\uD83C\uDFAF')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim()) return
    if (editingHabit) {
      onUpdate(editingHabit.id, name.trim(), emoji)
    } else {
      onAdd(name.trim(), emoji)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2 className="modal-title">{editingHabit ? 'Edit Habit' : 'Add New Habit'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="emoji-picker">
            {EMOJI_OPTIONS.map(e => (
              <button
                key={e}
                type="button"
                className={`emoji-option ${emoji === e ? 'selected' : ''}`}
                onClick={() => setEmoji(e)}
              >
                {e}
              </button>
            ))}
          </div>
          <input
            type="text"
            className="habit-input"
            placeholder="Habit name..."
            value={name}
            onChange={e => setName(e.target.value)}
            autoFocus
            maxLength={30}
          />
          <div className="modal-actions">
            {editingHabit && (
              <button type="button" className="delete-btn" onClick={() => onDelete(editingHabit.id)}>
                Delete
              </button>
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