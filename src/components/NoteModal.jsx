import { useState } from 'react'

function NoteModal({ habitName, habitEmoji, day, monthName, note, onSave, onClose }) {
  const [text, setText] = useState(note || '')

  const handleSave = () => {
    onSave(text.trim())
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal note-modal" onClick={e => e.stopPropagation()}>
        <h2 className="modal-title">
          {habitEmoji} {habitName}
        </h2>
        <p className="note-date">{monthName} {day}</p>
        <textarea
          className="note-textarea"
          placeholder="Add a note... (e.g. 'Leg day, 60 min workout')"
          value={text}
          onChange={e => setText(e.target.value)}
          autoFocus
          maxLength={200}
        />
        <div className="note-char-count">{text.length}/200</div>
        <div className="modal-actions">
          <button type="button" className="cancel-btn" onClick={onClose}>Cancel</button>
          <button type="button" className="submit-btn" onClick={handleSave}>Save Note</button>
        </div>
      </div>
    </div>
  )
}

export default NoteModal
