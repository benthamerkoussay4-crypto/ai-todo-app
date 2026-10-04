import { useEffect, useMemo, useState } from "react"

const STORAGE_KEY = "ai_todo_tasks"

function App() {
  const [tasks, setTasks] = useState([])
  const [text, setText] = useState("")
  const [filter, setFilter] = useState("all")

  const [editingId, setEditingId] = useState(null)
  const [editingText, setEditingText] = useState("")

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return
    try {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) setTasks(parsed)
    } catch {
      setTasks([])
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
  }, [tasks])

  const visibleTasks = useMemo(() => {
    if (filter === "active") return tasks.filter((t) => !t.done)
    if (filter === "completed") return tasks.filter((t) => t.done)
    return tasks
  }, [tasks, filter])

  const remainingCount = useMemo(() => {
    return tasks.filter((t) => !t.done).length
  }, [tasks])

  const addTask = (e) => {
    e.preventDefault()
    const value = text.trim()
    if (!value) return

    const task = {
      id: crypto.randomUUID(),
      text: value,
      done: false,
      createdAt: Date.now()
    }

    setTasks((prev) => [task, ...prev])
    setText("")
  }

  const toggleTask = (id) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)))
  }

  const deleteTask = (id) => {
    setTasks((prev) => prev.filter((t) => t.id !== id))
    if (editingId === id) cancelEdit()
  }

  const startEdit = (task) => {
    setEditingId(task.id)
    setEditingText(task.text)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditingText("")
  }

  const saveEdit = (id) => {
    const value = editingText.trim()
    if (!value) return
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, text: value } : t)))
    cancelEdit()
  }

  const onEditKeyDown = (e, id) => {
    if (e.key === "Enter") saveEdit(id)
    if (e.key === "Escape") cancelEdit()
  }

  return (
    <div className="page">
      <div className="card">
        <header className="header">
          <div>
            <h1 className="title">AI Todo</h1>
            <p className="subtitle">Simple task manager. English UI.</p>
          </div>
          <p className="subtitle">{remainingCount} tasks left</p>
        </header>

        <form className="form" onSubmit={addTask}>
          <input
            className="input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Add a task"
          />
          <button className="button" type="submit">
            Add
          </button>
        </form>

        <div className="filters">
          <button
            type="button"
            className={filter === "all" ? "chip chipActive" : "chip"}
            onClick={() => setFilter("all")}
          >
            All
          </button>

          <button
            type="button"
            className={filter === "active" ? "chip chipActive" : "chip"}
            onClick={() => setFilter("active")}
          >
            Active
          </button>

          <button
            type="button"
            className={filter === "completed" ? "chip chipActive" : "chip"}
            onClick={() => setFilter("completed")}
          >
            Completed
          </button>
        </div>

        <ul className="list">
          {visibleTasks.map((task) => {
            const isEditing = editingId === task.id

            return (
              <li key={task.id} className="item">
                <div className="itemLeft">
                  <input
                    type="checkbox"
                    checked={task.done}
                    onChange={() => toggleTask(task.id)}
                    aria-label="Toggle task"
                  />

                  {!isEditing && (
                    <span className={task.done ? "text textDone" : "text"}>{task.text}</span>
                  )}

                  {isEditing && (
                    <input
                      className="editInput"
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      onKeyDown={(e) => onEditKeyDown(e, task.id)}
                      autoFocus
                    />
                  )}
                </div>

                <div className="actions">
                  {!isEditing && (
                    <button className="secondary" type="button" onClick={() => startEdit(task)}>
                      Edit
                    </button>
                  )}

                  {isEditing && (
                    <>
                      <button className="buttonSmall" type="button" onClick={() => saveEdit(task.id)}>
                        Save
                      </button>
                      <button className="secondary" type="button" onClick={cancelEdit}>
                        Cancel
                      </button>
                    </>
                  )}

                  <button className="danger" type="button" onClick={() => deleteTask(task.id)}>
                    Delete
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}

export default App