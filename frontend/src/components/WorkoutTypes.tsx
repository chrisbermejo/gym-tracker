import { useEffect, useState } from 'react'

interface WorkoutType {
    id: number
    name: string
    is_predefined: boolean
}

function WorkoutTypes() {
    const [types, setTypes] = useState<WorkoutType[]>([])
    const [newName, setNewName] = useState('')
    const [selected, setSelected] = useState<WorkoutType | null>(null)

    const loadTypes = () => {
        fetch('/api/workout-types')
            .then((res) => res.json())
            .then(setTypes)
    }

    useEffect(() => {
        loadTypes()
    }, [])

    const createType = async () => {
        if (!newName.trim()) return
        const res = await fetch('/api/workout-types', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: newName.trim() }),
        })
        const created = await res.json()
        setTypes((prev) => [...prev, created])
        setNewName('')
        setSelected(created)
    }

    const deleteType = async (id: number) => {
        await fetch(`/api/workout-types/${id}`, { method: 'DELETE' })
        setTypes((prev) => prev.filter((type) => type.id !== id))
        if (selected?.id === id) {
            setSelected(null)
        }
    }

    const editType = async (id: number, name: string) => {
        if (!name.trim()) return
        const res = await fetch(`/api/workout-types/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: name.trim() }),
        })
        const updated = await res.json()
        setTypes((prev) => prev.map((type) => (type.id === id ? updated : type)))
        setSelected(updated)
        setNewName('')
    }

    return (
        <div className="m-6 flex flex-col gap-4 items-center justify-center">
            <h2 className="text-2xl font-bold">What are we doing today?</h2>

            <div className="flex flex-wrap gap-2">
                {types.map((t) => (
                    <div key={t.id} className="flex items-center gap-1">
                        <button
                            type="button"
                            onClick={() => {
                                setSelected(t)
                                setNewName(t.name)
                            }}
                            className={`border rounded px-3 py-1 ${selected?.id === t.id ? 'bg-blue-600 text-white' : ''}`}
                        >
                            {t.name}
                        </button>

                    </div>
                ))}
            </div>

            <div className="flex gap-2">
                <input
                    className="border rounded px-2 py-1"
                    placeholder="Enter workout name..."
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                />
                <button type="button" onClick={createType} className="border rounded px-3 py-1">
                    Add
                </button>
                {selected && (
                    <div className="flex gap-2">
                        <button type="button" onClick={() => deleteType(selected.id)} className="border rounded px-3 py-1">
                            Delete
                        </button>
                        <button type="button" onClick={() => editType(selected.id, newName)} className="border rounded px-3 py-1">
                            Edit
                        </button>
                    </div>

                )}
            </div>

            {selected && (
                <p>
                    You picked <strong>{selected.name}</strong>. (WIP adding exercises)
                </p>
            )}
        </div>
    )
}

export default WorkoutTypes