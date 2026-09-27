import { useEffect, useState } from 'react'

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
                    <div key={a.exercise_id} className="flex items-center justify-between border rounded px-3 py-2">
                        <span>{a.name}</span>
                        {canEdit && (
                            <button type="button" onClick={() => removeExercise(a.exercise_id)} className="text-red-600 text-sm">
                                Remove
                            </button>
                        )}
                    </div>
                ))}
            </div>

            {canEdit && (
                <>
                    <button
                        type="button"
                        onClick={() => setShowAddPanel((prev) => !prev)}
                        className="border rounded px-3 py-2 text-left font-medium"
                    >
                        + Add exercise
                    </button>

                    {showAddPanel && (
                        <div className="flex flex-col gap-2 border rounded p-3">
                            <div className="flex flex-col gap-1">
                                {availableToAdd.map((e) => (
                                    <button
                                        key={e.id}
                                        type="button"
                                        onClick={() => {
                                            attachExercise(e.id)
                                            setShowAddPanel(false)
                                        }}
                                        className="text-left px-2 py-1 hover:bg-gray-100 rounded"
                                    >
                                        {e.name}
                                        {e.muscle_group && <span className="text-gray-500 text-sm"> ({e.muscle_group})</span>}
                                    </button>
                                ))}
                                {availableToAdd.length === 0 && (
                                    <p className="text-sm text-gray-500">No more exercises to add from the library.</p>
                                )}
                            </div>

                            <hr />

                            <p className="text-sm font-medium">Create a new exercise</p>
                            <input
                                className="border rounded px-2 py-1"
                                placeholder="Exercise name..."
                                value={newExerciseName}
                                onChange={(e) => setNewExerciseName(e.target.value)}
                            />
                            <select
                                className="border rounded px-2 py-1"
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
                            <button type="button" onClick={createAndAttachExercise} className="border rounded px-3 py-1">
                                Create & Add
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}

export default ExerciseList