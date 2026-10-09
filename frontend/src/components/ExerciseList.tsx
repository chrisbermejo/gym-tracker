import { useEffect, useState } from 'react'

import Button from './ui/Button'
import Input from './ui/Input'

interface Exercise {
    id: number
    name: string
    muscle_group: string | null
    is_predefined: boolean
}

interface WorkoutTypeExercise {
    exercise_id: number
    name: string
    order_index: number
}

const MUSCLE_GROUPS = ['Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Core', 'Full Body']

function ExerciseList({ workoutTypeId, canEdit }: { workoutTypeId: number; canEdit: boolean }) {
    const [allExercises, setAllExercises] = useState<Exercise[]>([])
    const [attached, setAttached] = useState<WorkoutTypeExercise[]>([])
    const [showAddPanel, setShowAddPanel] = useState(false)
    const [newExerciseName, setNewExerciseName] = useState('')
    const [newExerciseMuscleGroup, setNewExerciseMuscleGroup] = useState('')

    const loadAttached = () => {
        fetch(`/api/workout-types/${workoutTypeId}/exercises`)
            .then((res) => res.json())
            .then(setAttached)
    }

    const loadAllExercises = () => {
        fetch('/api/exercises')
            .then((res) => res.json())
            .then(setAllExercises)
    }

    useEffect(() => {
        loadAttached()
        loadAllExercises()
    }, [workoutTypeId])

    const attachExercise = async (exerciseId: number) => {
        await fetch(`/api/workout-types/${workoutTypeId}/exercises`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ exercise_id: exerciseId, order_index: attached.length }),
        })
        loadAttached()
    }

    const removeExercise = async (exerciseId: number) => {
        await fetch(`/api/workout-types/${workoutTypeId}/exercises/${exerciseId}`, { method: 'DELETE' })
        loadAttached()
    }

    const createAndAttachExercise = async () => {
        if (!newExerciseName.trim()) return
        const res = await fetch('/api/exercises', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: newExerciseName.trim(),
                muscle_group: newExerciseMuscleGroup || null,
            }),
        })
        const created = await res.json()
        setNewExerciseName('')
        setNewExerciseMuscleGroup('')
        loadAllExercises()
        await attachExercise(created.id)
        setShowAddPanel(false)
    }

    const availableToAdd = allExercises.filter((e) => !attached.some((a) => a.exercise_id === e.id))

    return (
        <div className="flex flex-col gap-2 mt-2">
            <h3 className="font-bold">Exercises</h3>

            <div className="flex flex-col gap-1">
                {attached.map((a) => (
                    <div key={a.exercise_id} className="flex items-center justify-between border border-line rounded px-3 py-2">
                        <span>{a.name}</span>
                        {canEdit && (
                            <button type="button" onClick={() => removeExercise(a.exercise_id)} className="text-red-600 hover:underline text-sm">
                                Remove
                            </button>
                        )}
                    </div>
                ))}
            </div>

            {canEdit && (
                <>
                    <Button variant="secondary" className="text-left font-medium" onClick={() => setShowAddPanel((prev) => !prev)}>
                        + Add exercise
                    </Button>

                    {showAddPanel && (
                        <div className="flex flex-col gap-2 border border-line rounded p-3">
                            <div className="flex flex-col gap-1">
                                {availableToAdd.map((e) => (
                                    <button
                                        key={e.id}
                                        type="button"
                                        onClick={() => {
                                            attachExercise(e.id)
                                            setShowAddPanel(false)
                                        }}
                                        className="text-left px-2 py-1 hover:bg-line rounded"
                                    >
                                        {e.name}
                                        {e.muscle_group && <span className="text-ink-muted text-sm"> ({e.muscle_group})</span>}
                                    </button>
                                ))}
                                {availableToAdd.length === 0 && (
                                    <p className="text-sm text-ink-muted">No more exercises to add from the library.</p>
                                )}
                            </div>

                            <hr className="border-line" />

                            <p className="text-sm font-medium">Create a new exercise</p>
                            <Input
                                placeholder="Exercise name..."
                                value={newExerciseName}
                                onChange={(e) => setNewExerciseName(e.target.value)}
                            />
                            <select
                                className="border border-line rounded px-3 py-1.5 text-sm bg-surface"
                                value={newExerciseMuscleGroup}
                                onChange={(e) => setNewExerciseMuscleGroup(e.target.value)}
                            >
                                <option value="">Select body part...</option>
                                {MUSCLE_GROUPS.map((mg) => (
                                    <option key={mg} value={mg}>
                                        {mg}
                                    </option>
                                ))}
                            </select>
                            <Button onClick={createAndAttachExercise}>Create & Add</Button>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}

export default ExerciseList