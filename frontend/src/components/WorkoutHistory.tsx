import { useEffect, useState } from 'react'

interface WorkoutSummary {
    id: number
    workout_date: string
    label: string
    completed_at: string | null
}

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

function WorkoutHistory() {
    const [workouts, setWorkouts] = useState<WorkoutSummary[]>([])
    const [expandedId, setExpandedId] = useState<number | null>(null)
    const [detailsCache, setDetailsCache] = useState<Record<number, WorkoutDetail>>({})

    useEffect(() => {
        fetch('/api/workouts')
            .then((res) => res.json())
            .then(setWorkouts)
    }, [])

    const toggleWorkout = async (id: number) => {
        if (expandedId === id) {
            setExpandedId(null)
            return
        }

        if (!detailsCache[id]) {
            const res = await fetch(`/api/workouts/${id}`)
            const detail: WorkoutDetail = await res.json()
            setDetailsCache((prev) => ({ ...prev, [id]: detail }))
        }

        setExpandedId(id)
    }

    return (
        <div className="flex flex-col gap-4 max-w-md w-full">
            <h2 className="text-2xl font-bold">Workout History</h2>

            <div className="flex flex-col gap-1">
                {workouts.map((w) => {
                    const detail = detailsCache[w.id]
                    const exercisesWithSets = detail?.exercises.filter((we) => we.sets.length > 0) ?? []

                    return (
                        <div key={w.id} className="flex flex-col">
                            <button
                                type="button"
                                onClick={() => toggleWorkout(w.id)}
                                className="flex items-center justify-between border rounded px-3 py-2 text-left"
                            >
                                <span>{w.workout_date} — {w.label}</span>
                                {w.completed_at ? (
                                    <span className="text-green-600 text-sm">Completed</span>
                                ) : (
                                    <span className="text-gray-500 text-sm">In progress</span>
                                )}
                            </button>

                            {expandedId === w.id && (
                                <div className="flex flex-col gap-2 border rounded p-3 mt-1">
                                    {exercisesWithSets.length === 0 && (
                                        <p className="text-sm text-gray-500">No sets logged for this workout.</p>
                                    )}
                                    {exercisesWithSets.map((we) => (
                                        <div key={we.workout_exercise_id}>
                                            <p className="font-medium">{we.name}</p>
                                            {we.sets.map((s) => (
                                                <p key={s.id} className="text-sm">
                                                    Set {s.set_number}: {s.weight} lbs × {s.reps} reps
                                                </p>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )
                })}
                {workouts.length === 0 && <p className="text-sm text-gray-500">No workouts logged yet.</p>}
            </div>
        </div>
    )
}

export default WorkoutHistory