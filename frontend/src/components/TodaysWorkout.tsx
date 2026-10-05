import { useEffect, useState } from 'react'
import WorkoutExerciseCard from './WorkoutExerciseCard'

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

interface Exercise {
    id: number
    name: string
    muscle_group: string | null
    is_predefined: boolean
}

interface WorkoutType {
    id: number
    name: string
    is_predefined: boolean
}

function TodaysWorkout() {
    const [workout, setWorkout] = useState<WorkoutDetail | null | undefined>(undefined)
    const [types, setTypes] = useState<WorkoutType[]>([])
    const [customLabel, setCustomLabel] = useState('')
    const [exercises, setExercises] = useState<Exercise[]>([])
    const [selectedExerciseId, setSelectedExerciseId] = useState('')

    useEffect(() => {
        fetch('/api/workouts/today').then((res) => res.json()).then(setWorkout)
        fetch('/api/workout-types').then((res) => res.json()).then(setTypes)
        fetch('/api/exercises').then((res) => res.json()).then(setExercises)
    }, [])

    const startWorkout = async (label: string, workoutTypeId?: number) => {
        if (!label.trim()) return
        const res = await fetch('/api/workouts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ label: label.trim(), workout_type_id: workoutTypeId ?? null }),
        })
        setWorkout(await res.json())
    }

    const deleteWorkout = async () => {
        if (!workout) return
        await fetch(`/api/workouts/${workout.id}`, { method: 'DELETE' })
        setWorkout(null)
    }

    const addExercise = async () => {
        if (!workout || !selectedExerciseId) return
        const res = await fetch(`/api/workouts/${workout.id}/exercises`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ exercise_id: Number(selectedExerciseId) }),
        })
        setWorkout(await res.json())
        setSelectedExerciseId('')
    }

    const finishWorkout = async () => {
        if (!workout) return
        const res = await fetch(`/api/workouts/${workout.id}/complete`, { method: 'PATCH' })
        setWorkout(await res.json())
    }

    const undoComplete = async () => {
        if (!workout) return
        const res = await fetch(`/api/workouts/${workout.id}/uncomplete`, { method: 'PATCH' })
        setWorkout(await res.json())
    }

    if (workout === undefined) return <p>Loading...</p>

    if (!workout) {
        return (
            <div className="flex flex-col gap-4">
                <h2 className="text-2xl font-bold">What are we doing today?</h2>
                <div className="flex flex-wrap gap-2">
                    {types.map((t) => (
                        <button key={t.id} type="button" onClick={() => startWorkout(t.name, t.id)} className="border rounded px-3 py-1">
                            {t.name}
                        </button>
                    ))}
                </div>
                <div className="flex gap-2">
                    <input
                        className="border rounded px-2 py-1 w-full"
                        placeholder="Or type something else..."
                        value={customLabel}
                        onChange={(e) => setCustomLabel(e.target.value)}
                    />
                    <button type="button" onClick={() => startWorkout(customLabel)} className="border rounded px-3 py-1">
                        Start
                    </button>
                </div>
            </div>
        )
    }

    const availableExercises = exercises.filter((e) => !workout.exercises.some((we) => we.exercise_id === e.id))

    return (
        <div className="flex flex-col gap-4 items-center max-w-md w-full">
            <div className="flex items-center gap-4">
                <h2 className="text-2xl font-bold">{workout.label}</h2>
                <div className='flex gap-2'>
                    {!workout.completed_at && (
                        <button type="button" onClick={deleteWorkout} className="border rounded px-3 py-1">
                            Undo
                        </button>
                    )}
                    {workout.completed_at ? (
                        <div className="flex items-center gap-2">
                            <span className="text-green-600 border rounded px-3 py-1">Completed</span>
                            <button type="button" onClick={undoComplete} className="border rounded px-3 py-1">
                                Undo
                            </button>
                        </div>
                    ) : (
                        <button type="button" onClick={finishWorkout} className="border rounded px-3 py-1">
                            Finish workout
                        </button>
                    )}
                </div>
            </div>

            {workout.exercises.map((we) => (
                <WorkoutExerciseCard
                    key={we.workout_exercise_id}
                    workoutId={workout.id}
                    entry={we}
                    onUpdate={setWorkout}
                    disabled={!!workout.completed_at}
                />
            ))}

            {!workout.completed_at && (
                <div className="flex gap-2">
                    <select
                        className="border rounded px-2 py-1"
                        value={selectedExerciseId}
                        onChange={(e) => setSelectedExerciseId(e.target.value)}
                    >
                        <option value="">Add an exercise...</option>
                        {availableExercises.map((e) => (
                            <option key={e.id} value={e.id}>
                                {e.name}
                            </option>
                        ))}
                    </select>
                    <button type="button" onClick={addExercise} className="border rounded px-3 py-1">
                        Add
                    </button>
                </div>
            )}
        </div>
    )
}

export default TodaysWorkout