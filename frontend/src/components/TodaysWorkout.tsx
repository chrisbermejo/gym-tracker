import { useEffect, useState } from 'react'
import WorkoutExerciseCard from './WorkoutExerciseCard'
import AddExercisePicker from './ExerciseForm/AddExercisePicker'

import Button from './ui/Button'
import Input from './ui/Input'

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

interface WorkoutType {
    id: number
    name: string
    is_predefined: boolean
}

function TodaysWorkout({ onWorkoutChange }: { onWorkoutChange?: () => void }) {
    const [workout, setWorkout] = useState<WorkoutDetail | null | undefined>(undefined)
    const [types, setTypes] = useState<WorkoutType[]>([])
    const [customLabel, setCustomLabel] = useState('')

    useEffect(() => {
        fetch('/api/workouts/today').then((res) => res.json()).then(setWorkout)
        fetch('/api/workout-types').then((res) => res.json()).then(setTypes)
    }, [])

    const startWorkout = async (label: string, workoutTypeId?: number) => {
        if (!label.trim()) return
        const res = await fetch('/api/workouts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ label: label.trim(), workout_type_id: workoutTypeId ?? null }),
        })
        setWorkout(await res.json())
        onWorkoutChange?.()
    }

    const deleteWorkout = async () => {
        if (!workout) return
        await fetch(`/api/workouts/${workout.id}`, { method: 'DELETE' })
        setWorkout(null)
        onWorkoutChange?.()
    }

    const addExerciseById = async (exerciseId: number) => {
        if (!workout) return
        const res = await fetch(`/api/workouts/${workout.id}/exercises`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ exercise_id: exerciseId }),
        })
        setWorkout(await res.json())
    }

    const finishWorkout = async () => {
        if (!workout) return
        const res = await fetch(`/api/workouts/${workout.id}/complete`, { method: 'PATCH' })
        setWorkout(await res.json())
        onWorkoutChange?.()
    }

    const undoComplete = async () => {
        if (!workout) return
        const res = await fetch(`/api/workouts/${workout.id}/uncomplete`, { method: 'PATCH' })
        setWorkout(await res.json())
        onWorkoutChange?.()
    }

    if (workout === undefined) return <p>Loading...</p>

    if (!workout) {
        return (
            <div className="flex flex-col gap-4 w-full">
                <h2 className="text-2xl font-bold text-center">What are we doing today?</h2>
                <div className="flex flex-wrap gap-2">
                    {types.map((t) => (
                        <Button key={t.id} onClick={() => startWorkout(t.name, t.id)}>
                            {t.name}
                        </Button>
                    ))}
                    {types.length === 0 && (
                        <p className="italic text-ink-muted text-sm w-full">
                            No types yet — create one in Manage Types, or type below.
                        </p>
                    )}
                </div>
                <div className="flex gap-2 w-full">
                    <Input
                        className="flex-1"
                        placeholder="Or type something else..."
                        value={customLabel}
                        onChange={(e) => setCustomLabel(e.target.value)}
                    />
                    <Button onClick={() => startWorkout(customLabel)}>
                        Start
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-4 items-center w-full">
            <div className="flex flex-col gap-3 w-full">
                <div className="flex items-center justify-between w-full">
                    <h2 className="text-2xl font-bold">{workout.label}</h2>
                    {workout.completed_at ? (
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={undoComplete}
                                className="text-xs font-medium text-ink-muted bg-line px-2.5 py-1 rounded-full hover:opacity-80 transition-opacity"
                            >
                                Undo
                            </button>
                            <span className="text-xs font-medium text-green-600 bg-green-600/10 px-2.5 py-1 rounded-full">
                                Completed
                            </span>
                        </div>
                    ) : (
                        <span className="text-xs font-medium text-ink-muted bg-line px-2.5 py-1 rounded-full">
                            In progress
                        </span>
                    )}
                </div>

                {!workout.completed_at && (
                    <div className="flex gap-2 w-full">
                        <Button variant="primary" className="flex-1" onClick={finishWorkout}>
                            Finish workout
                        </Button>
                        <Button variant="danger" onClick={deleteWorkout}>
                            Start over
                        </Button>
                    </div>
                )}
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
                <AddExercisePicker
                    excludeIds={workout.exercises.map((we) => we.exercise_id)}
                    onAttach={addExerciseById}
                />
            )}
        </div>
    )
}

export default TodaysWorkout