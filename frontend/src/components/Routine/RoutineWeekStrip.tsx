import { useEffect, useState } from 'react'

import Button from '../ui/Button'

interface RoutineSlotInfo {
    workout_type_id: number
    name: string
}

interface RoutineState {
    slots: RoutineSlotInfo[]
    suggested: RoutineSlotInfo | null
}

interface WorkoutType {
    id: number
    name: string
    is_predefined: boolean
}

interface WorkoutSummary {
    id: number
    workout_date: string
    label: string
    completed_at: string | null
}

const DAY_LETTERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

function mondayOf(date: Date) {
    const dow = (date.getDay() + 6) % 7
    const monday = new Date(date)
    monday.setDate(date.getDate() - dow)
    return monday
}

function toISODate(date: Date) {
    return date.toISOString().slice(0, 10)
}

function RoutineWeekStrip({ workouts, onConfirmed }: { workouts: WorkoutSummary[]; onConfirmed: () => void }) {
    const [routine, setRoutine] = useState<RoutineState | null>(null)
    const [allTypes, setAllTypes] = useState<WorkoutType[]>([])
    const [editing, setEditing] = useState(false)
    const [draftSequence, setDraftSequence] = useState<RoutineSlotInfo[]>([])

    const loadRoutine = () => {
        fetch('/api/routine')
            .then((res) => res.json())
            .then(setRoutine)
    }

    useEffect(() => {
        loadRoutine()
        fetch('/api/workout-types').then((res) => res.json()).then(setAllTypes)
    }, [])

    const confirmToday = async () => {
        await fetch('/api/routine/confirm', { method: 'POST' })
        loadRoutine()
        onConfirmed()
    }

    const startEditing = () => {
        setDraftSequence(routine?.slots ?? [])
        setEditing(true)
    }

    const saveRoutine = async () => {
        await fetch('/api/routine', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ workout_type_ids: draftSequence.map((s) => s.workout_type_id) }),
        })
        setEditing(false)
        loadRoutine()
    }

    const todayDate = new Date()
    const monday = mondayOf(todayDate)
    const todayISO = toISODate(todayDate)

    const weekDays = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(monday)
        d.setDate(monday.getDate() + i)
        return d
    })

    const todayWorkout = workouts.find((w) => w.workout_date === todayISO)

    return (
        <div className="flex flex-col gap-3 w-full">
            <div className="flex justify-between items-center">
                <h3 className="font-bold">This week</h3>
                <button type="button" className="text-xs text-ink-muted underline" onClick={startEditing}>
                    Edit routine
                </button>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center">
                {weekDays.map((d, i) => {
                    const iso = toISODate(d)
                    const isToday = iso === todayISO
                    const isPast = iso < todayISO
                    const matchedWorkout = workouts.find((w) => w.workout_date === iso)

                    return (
                        <div
                            key={iso}
                            className={`flex flex-col items-center gap-1 rounded-lg py-2 px-1 border ${isToday ? 'border-primary' : 'border-line'
                                }`}
                        >
                            <span className="text-xs font-medium text-ink-muted">{DAY_LETTERS[i]}</span>

                            {isToday ? (
                                todayWorkout ? (
                                    <span className="text-[10px] text-primary font-medium leading-tight">
                                        {todayWorkout.completed_at ? 'Done' : 'Progress'}
                                        <br />
                                        {todayWorkout.label}
                                    </span>
                                ) : routine?.suggested ? (
                                    <button type="button" onClick={confirmToday} className="text-[10px] leading-tight underline">
                                        {routine.suggested.name}
                                        <br />
                                        Confirm
                                    </button>
                                ) : (
                                    <span className="text-[10px] text-ink-muted">—</span>
                                )
                            ) : isPast ? (
                                <span className="text-[10px] text-ink-muted leading-tight">
                                    {matchedWorkout ? matchedWorkout.label : '—'}
                                </span>
                            ) : (
                                <span className="text-[10px] text-ink-muted">·</span>
                            )}
                        </div>
                    )
                })}
            </div>

            {editing && (
                <div className="flex flex-col gap-2 border border-line rounded p-3">
                    <p className="text-sm font-medium">Build your routine (in order)</p>
                    <div className="flex flex-wrap gap-2">
                        {allTypes.map((t) => (
                            <button
                                key={t.id}
                                type="button"
                                onClick={() => setDraftSequence((prev) => [...prev, { workout_type_id: t.id, name: t.name }])}
                                className="text-xs border border-line rounded px-2 py-1 hover:bg-line"
                            >
                                + {t.name}
                            </button>
                        ))}
                    </div>

                    <div className="flex flex-wrap gap-1">
                        {draftSequence.map((slot, index) => (
                            <span key={index} className="flex items-center gap-1 text-xs bg-surface-muted border border-line rounded px-2 py-1">
                                {index + 1}. {slot.name}
                                <button type="button" onClick={() => setDraftSequence((prev) => prev.filter((_, i) => i !== index))} className="text-red-600">
                                    ✕
                                </button>
                            </span>
                        ))}
                        {draftSequence.length === 0 && <p className="text-xs text-ink-muted">No slots yet — add some above.</p>}
                    </div>

                    <div className="flex gap-2">
                        <Button onClick={saveRoutine}>Save routine</Button>
                        <Button variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default RoutineWeekStrip