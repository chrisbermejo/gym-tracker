import { useEffect, useState } from 'react'
import ExerciseList from './ExerciseList'

import Button from './ui/Button'
import Input from './ui/Input'

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
        <div className="flex flex-col gap-4 items-center justify-center">
            <h2 className="text-2xl font-bold">What are we doing today?</h2>

            <div className="flex flex-wrap gap-2">
                {types.map((t) => (
                    <Button
                        key={t.id}
                        variant={selected?.id === t.id ? 'primary' : 'secondary'}
                        onClick={() => {
                            setSelected(t)
                            setNewName(t.name)
                        }}
                    >
                        {t.name}
                    </Button>
                ))}
                {types.length === 0 && (
                    <p className="italic text-ink-muted text-sm w-full">
                        No types yet — try Push, Pull, Legs, Upper, or Lower.
                    </p>
                )}
            </div>

            <div className="flex gap-2">
                <Input
                    placeholder="Enter workout name..."
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                />

                <div className="flex gap-2">
                    <Button onClick={createType}>Add</Button>
                    {selected && (
                        <>
                            <Button onClick={() => editType(selected.id, newName)}>
                                Edit
                            </Button>
                            <Button variant="danger" onClick={() => deleteType(selected.id)}>
                                Delete
                            </Button>
                        </>
                    )}
                </div>
            </div>

            {selected && (
                <div className="flex flex-col w-full max-w-sm text-center">
                    <p>
                        You picked <strong>{selected.name}</strong>.
                    </p>
                    <ExerciseList workoutTypeId={selected.id} canEdit={!selected.is_predefined} />
                </div>
            )}
        </div>
    )
}

export default WorkoutTypes