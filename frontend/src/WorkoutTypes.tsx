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
        setNewName('')
        loadTypes()
        setSelected(created)
    }

    return (
        <div className="m-6 flex flex-col gap-4 items-center justify-center">
            <h2 className="text-2xl font-bold">What are we doing today?</h2>

            <div className="flex flex-wrap gap-2">
                {types.map((t) => (
                    <button
                        key={t.id}
                        type="button"
                        onClick={() => setSelected(t)}
                        className={`border rounded px-3 py-1 ${selected?.id === t.id ? 'bg-blue-600 text-white' : ''}`}
                    >
                        {t.name}
                    </button>
                ))}
            </div>

            <div className="flex gap-2">
                <input
                    className="border rounded px-2 py-1"
                    placeholder="New workout name..."
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                />
                <button type="button" onClick={createType} className="border rounded px-3 py-1">
                    Add
                </button>
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