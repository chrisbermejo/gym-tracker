import { useState } from 'react'

import Button from '../ui/Button'
import Input from '../ui/Input'

const MUSCLE_GROUPS = ['Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Core', 'Full Body']

interface CreatedExercise {
    id: number
    name: string
    muscle_group: string | null
    is_predefined: boolean
}

function CreateExerciseForm({ onCreated }: { onCreated: (exercise: CreatedExercise) => void }) {
    const [name, setName] = useState('')
    const [muscleGroup, setMuscleGroup] = useState('')

    const create = async () => {
        if (!name.trim()) return
        const res = await fetch('/api/exercises', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: name.trim(), muscle_group: muscleGroup || null }),
        })
        const created = await res.json()
        setName('')
        setMuscleGroup('')
        onCreated(created)
    }

    return (
        <div className="flex flex-col gap-2">
            <p className="text-sm font-medium">Create a new exercise</p>
            <Input placeholder="Exercise name..." value={name} onChange={(e) => setName(e.target.value)} />
            <select
                className="border border-line rounded px-3 py-1.5 text-sm bg-surface"
                value={muscleGroup}
                onChange={(e) => setMuscleGroup(e.target.value)}
            >
                <option value="">Select body part...</option>
                {MUSCLE_GROUPS.map((mg) => (
                    <option key={mg} value={mg}>
                        {mg}
                    </option>
                ))}
            </select>
            <Button onClick={create}>Create</Button>
        </div>
    )
}

export default CreateExerciseForm