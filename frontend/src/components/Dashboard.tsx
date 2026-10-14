import { useEffect, useState } from 'react'

import TodaysWorkout from './TodaysWorkout'
import WorkoutHistory from './WorkoutHistory'
import RoutineWeekStrip from './Routine/RoutineWeekStrip'
import Button from './ui/Button'

interface WorkoutSummary {
    id: number
    workout_date: string
    label: string
    completed_at: string | null
}

function Dashboard() {
    const [workouts, setWorkouts] = useState<WorkoutSummary[]>([])
    const [showFullHistory, setShowFullHistory] = useState(false)
    const [refreshNonce, setRefreshNonce] = useState(0)

    const loadWorkouts = () => {
        fetch('/api/workouts')
            .then((res) => res.json())
            .then(setWorkouts)
    }

    useEffect(() => {
        loadWorkouts()
    }, [])

    const handleConfirmed = () => {
        loadWorkouts()
        setRefreshNonce((n) => n + 1)
    }

    const dateDisplay = new Date().toLocaleDateString(undefined, {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
    })

    const recentTwo = workouts.slice(0, 2)
    const todayISO = new Date().toISOString().slice(0, 10)
    const hasTodayWorkout = workouts.some((w) => w.workout_date === todayISO)

    const recentActivitySection = (
        <div className="flex flex-col gap-2 w-full">
            {!showFullHistory ? (
                <>
                    <h3 className="font-bold">Recent activity</h3>
                    {recentTwo.length === 0 && <p className="text-sm italic text-ink-muted">No workouts logged yet.</p>}
                    {recentTwo.map((w) => (
                        <div key={w.id} className="flex items-center justify-between border border-line rounded px-3 py-2 text-sm">
                            <span>{w.workout_date} — {w.label}</span>
                            {w.completed_at ? (
                                <span className="text-green-600 text-xs">Completed</span>
                            ) : (
                                <span className="text-ink-muted text-xs">In progress</span>
                            )}
                        </div>
                    ))}
                    {workouts.length > 2 && (
                        <Button variant="ghost" onClick={() => setShowFullHistory(true)}>
                            Show more
                        </Button>
                    )}
                </>
            ) : (
                <>
                    <WorkoutHistory />
                    <Button variant="ghost" onClick={() => setShowFullHistory(false)}>
                        Show less
                    </Button>
                </>
            )}
        </div>
    )

    const todaysWorkoutSection = (
        <TodaysWorkout key={refreshNonce} onWorkoutChange={loadWorkouts} />
    )

    return (
        <div className="flex flex-col gap-6 w-full">
            <p className="text-sm text-ink-muted text-center">{dateDisplay}</p>

            <RoutineWeekStrip workouts={workouts} onConfirmed={handleConfirmed} />

            <hr className="border-line w-full" />

            {hasTodayWorkout ? (
                <>
                    {todaysWorkoutSection}
                    {recentActivitySection}
                </>
            ) : (
                <>
                    {recentActivitySection}
                    {todaysWorkoutSection}
                </>
            )}
        </div>
    )
}

export default Dashboard