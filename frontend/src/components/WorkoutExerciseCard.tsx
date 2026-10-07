import { useState, useEffect } from 'react'

interface SetEntry {
    id: number
    set_number: number
    weight: number
    reps: number
}

interface WorkoutExerciseEntry {
    workout_exercise_id: number
    exercise_id: number
    name: string
    sets: SetEntry[]
}

interface WorkoutDetail {
    id: number
    workout_date: string
    label: string
    completed_at: string | null
    exercises: WorkoutExerciseEntry[]
}

interface HistorySet {
    set_number: number
    weight: number
    reps: number
}

interface ExerciseHistory {
    workout_date: string
    sets: HistorySet[]
}

function WorkoutExerciseCard({
    workoutId,
    entry,
    onUpdate,
    disabled,
}: {
    workoutId: number
    entry: WorkoutExerciseEntry
    onUpdate: (workout: WorkoutDetail) => void
    disabled: boolean
}) {
    const [weight, setWeight] = useState('')
    const [reps, setReps] = useState('')
    const [history, setHistory] = useState<ExerciseHistory | null>(null)

    const addSet = async () => {
        if (!weight || !reps) return
        const res = await fetch(`/api/workouts/${workoutId}/exercises/${entry.workout_exercise_id}/sets`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ weight: Number(weight), reps: Number(reps) }),
        })
        onUpdate(await res.json())
        setWeight('')
        setReps('')
    }

    useEffect(() => {
        fetch(`/api/exercises/${entry.exercise_id}/history`)
            .then((res) => res.json())
            .then(setHistory)
    }, [entry.exercise_id])

    return (
        <div className="border rounded p-3 flex flex-col gap-2 w-full">
            <h3 className="font-bold">{entry.name}</h3>
            {history && (
                <p className="text-xs text-gray-500">
                    Last time ({history.workout_date}): {history.sets.map((s) => `${s.weight}x${s.reps}`).join(', ')}
                </p>
            )}
            <div className="flex flex-col gap-1">
                {entry.sets.map((s) => (
                    <div key={s.id} className="text-sm">
                        Set {s.set_number}: {s.weight} lbs × {s.reps} reps
                    </div>
                ))}
            </div>
            {!disabled && (
                <div className="flex gap-2 justify-center">
                    <input
                        className="border rounded px-2 py-1 w-20"
                        placeholder="Weight"
                        type="number"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                    />
                    <input
                        className="border rounded px-2 py-1 w-20"
                        placeholder="Reps"
                        type="number"
                        value={reps}
                        onChange={(e) => setReps(e.target.value)}
                    />
                    <button type="button" onClick={addSet} className="border rounded px-3 py-1">
                        Log set
                    </button>
                </div>
            )}
        </div>
    )
}

export default WorkoutExerciseCard