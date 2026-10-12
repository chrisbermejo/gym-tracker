import { useEffect, useState } from 'react'
import AddExercisePicker from './ExerciseForm/AddExercisePicker'

interface WorkoutTypeExercise {
    exercise_id: number
    name: string
    order_index: number
}

function ExerciseList({ workoutTypeId, canEdit }: { workoutTypeId: number; canEdit: boolean }) {
    const [attached, setAttached] = useState<WorkoutTypeExercise[]>([])

    const loadAttached = () => {
        fetch(`/api/workout-types/${workoutTypeId}/exercises`)
            .then((res) => res.json())
            .then(setAttached)
    }

    useEffect(() => {
        loadAttached()
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
                <AddExercisePicker excludeIds={attached.map((a) => a.exercise_id)} onAttach={attachExercise} />
            )}
        </div>
    )
}

export default ExerciseList