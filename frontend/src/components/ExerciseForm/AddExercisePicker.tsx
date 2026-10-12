import { useEffect, useState } from 'react'
import Button from '../ui/Button'
import CreateExerciseForm from './CreateExerciseForm'

interface Exercise {
    id: number
    name: string
    muscle_group: string | null
    is_predefined: boolean
}

function AddExercisePicker({ excludeIds, onAttach,}: { excludeIds: number[], onAttach: (exerciseId: number) => void }) {
    const [allExercises, setAllExercises] = useState<Exercise[]>([])
    const [showPanel, setShowPanel] = useState(false)

    const loadAllExercises = () => {
        fetch('/api/exercises')
            .then((res) => res.json())
            .then(setAllExercises)
    }

    useEffect(() => {
        loadAllExercises()
    }, [])

    const availableToAdd = allExercises.filter((e) => !excludeIds.includes(e.id))

    return (
        <div className="flex flex-col gap-2 w-full text-center">
            <Button variant="secondary" className="text-left font-medium" onClick={() => setShowPanel((prev) => !prev)}>
                + Add exercise
            </Button>

            {showPanel && (
                <div className="flex flex-col gap-2 border border-line rounded p-3">
                    <div className="flex flex-col gap-1">
                        {availableToAdd.map((e) => (
                            <button
                                key={e.id}
                                type="button"
                                onClick={() => {
                                    onAttach(e.id)
                                    setShowPanel(false)
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

                    <CreateExerciseForm
                        onCreated={(created) => {
                            loadAllExercises()
                            onAttach(created.id)
                            setShowPanel(false)
                        }}
                    />
                </div>
            )}
        </div>
    )
}

export default AddExercisePicker