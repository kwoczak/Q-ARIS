'use client'

import { useState, useEffect } from 'react'
import { PuzzleContent, BlockStyle } from "@/types/schema"
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { useScore } from "../ScoreContext"
import confetti from 'canvas-confetti'

interface PuzzleBlockProps {
    blockId: string
    content: PuzzleContent
    style?: BlockStyle | React.CSSProperties
}

interface PuzzlePiece {
    id: number
    currentPos: number
    correctPos: number
}

// Helper to shuffle array
const shuffle = (array: number[]) => {
    let currentIndex = array.length, randomIndex
    while (currentIndex != 0) {
        randomIndex = Math.floor(Math.random() * currentIndex)
        currentIndex--
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]]
    }
    return array
}

// Check solvability (inversion count) - simplified for swap puzzle, 
// usually swap puzzles are always solvable if we just start from solved and random swap X times,
// but for pure random shuffle, we might get unsolvable states if it was a slide puzzle.
// Since this is a SWAP puzzle (pick any two to swap), ANY configuration is solvable.

export function PuzzleBlock({ blockId, content, style }: PuzzleBlockProps) {
    const { addPoints } = useScore()
    const [pieces, setPieces] = useState<PuzzlePiece[]>([])
    const [selectedPieceId, setSelectedPieceId] = useState<number | null>(null)
    const [isComplete, setIsComplete] = useState(false)
    const [gameStarted, setGameStarted] = useState(false)
    const [alreadyCompleted, setAlreadyCompleted] = useState(false)

    const gridSize = content.gridSize || 3
    const totalPieces = gridSize * gridSize

    const containerStyle = {
        backgroundColor: (style as any)?.backgroundColor || 'rgba(255, 255, 255, 0.5)',
        color: (style as any)?.color || 'inherit',
        fontFamily: (style as any)?.fontFamily,
        fontSize: (style as any)?.fontSize,
        borderRadius: (style as any)?.borderRadius || '0.75rem',
        padding: (style as any)?.padding || '1.5rem',
        marginBottom: (style as any)?.marginBottom
    }

    useEffect(() => {
        // Check local storage
        const key = `puzzle-${blockId}-completed`
        if (localStorage.getItem(key)) {
            setAlreadyCompleted(true)
            setIsComplete(true)
            // Initialize sorted
            const initialPieces: PuzzlePiece[] = []
            for (let i = 0; i < totalPieces; i++) {
                initialPieces.push({ id: i, currentPos: i, correctPos: i })
            }
            setPieces(initialPieces)
        } else {
            initializeGame()
        }
    }, [blockId, totalPieces, content.image])

    const initializeGame = () => {
        const positions = Array.from({ length: totalPieces }, (_, i) => i)
        // Shuffle positions
        const shuffled = shuffle([...positions])

        // Ensure it's not solved by accident (unlikely but possible)
        let isSolved = true
        for (let i = 0; i < totalPieces; i++) {
            if (shuffled[i] !== i) isSolved = false
        }
        if (isSolved) {
            // Swap first two if accidentally solved
            [shuffled[0], shuffled[1]] = [shuffled[1], shuffled[0]]
        }

        const newPieces = shuffled.map((pos, index) => ({
            id: index, // The piece ID (which chunk of image it is, 0 to N-1)
            currentPos: index, // Where it is currently in the grid (0 to N-1)
            correctPos: pos // Wait. Logic check.
        }))

        // Simpler model:
        // Identify pieces by their Correct Position (0...N).
        // Store them in an array representing the Grid [0...N].
        // So pieces[0] is the piece at top-left. It might be piece #5.

        const pieceIds = Array.from({ length: totalPieces }, (_, i) => i) // Piece 0 is top-left of image
        const shuffledIds = shuffle([...pieceIds])

        // piece[gridIndex] = pieceId
        const initPieces = shuffledIds.map((pId, gridIndex) => ({
            id: pId, // Which part of image
            currentPos: gridIndex, // Current slot
            correctPos: pId // It belongs at slot pId
        }))

        setPieces(initPieces)
        setIsComplete(false)
        setGameStarted(true)
    }

    const handlePieceClick = (index: number) => {
        if (isComplete) return

        if (selectedPieceId === null) {
            // Select first piece
            setSelectedPieceId(index)
        } else {
            // Swap with second piece
            if (selectedPieceId === index) {
                // Deselect if same
                setSelectedPieceId(null)
                return
            }

            // Perform swap
            const newPieces = [...pieces]
            const pieceA = newPieces[selectedPieceId]
            const pieceB = newPieces[index]

            // Swap their IDs (content)
            // Actually our state `pieces` is an array where index = grid position.
            // So we just swap elements.
            newPieces[selectedPieceId] = pieceB
            newPieces[index] = pieceA

            setPieces(newPieces)
            setSelectedPieceId(null)

            checkWin(newPieces)
        }
    }

    const checkWin = (currentPieces: PuzzlePiece[]) => {
        const isWin = currentPieces.every((p, index) => p.id === index)
        if (isWin) {
            setIsComplete(true)
            if (!alreadyCompleted) {
                const points = content.points || 20
                addPoints(points)
                confetti({
                    particleCount: 150,
                    spread: 70,
                    origin: { y: 0.6 }
                })
                localStorage.setItem(`puzzle-${blockId}-completed`, 'true')
                setAlreadyCompleted(true)
            }
        }
    }

    return (
        <div style={{ marginBottom: (style as any)?.marginBottom }} className="w-full">
            <div style={containerStyle} className="backdrop-blur-sm shadow-sm relative overflow-hidden">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-lg leading-tight">Puzzle Challenge</h3>
                    {alreadyCompleted && (
                        <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-bold">
                            Solved +{content.points || 20} pts
                        </div>
                    )}
                </div>

                <div
                    className="relative w-full aspect-square border-2 border-neutral-200 rounded-lg overflow-hidden bg-neutral-100"
                    style={{
                        display: 'grid',
                        gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
                        gap: '2px',
                        padding: '2px'
                    }}
                >
                    {pieces.map((piece, index) => {
                        // Calculate background position for this piece ID
                        // piece.id is 0.. N-1
                        // row = Math.floor(id / size)
                        // col = id % size
                        const row = Math.floor(piece.id / gridSize)
                        const col = piece.id % gridSize
                        const sizePct = 100 * gridSize // e.g. 300% size

                        // bg pos: x% y%
                        // validation:
                        // for 3x3:
                        // piece 0 (0,0) -> 0% 0%
                        // piece 1 (0,1) -> 50% 0% ? No.
                        // Background size should be 100% * gridSize ? 
                        // Actually easier: backgroundSize: `${gridSize * 100}%`
                        // position x: (col / (size-1)) * 100 %

                        const x = col / (gridSize - 1) * 100
                        const y = row / (gridSize - 1) * 100

                        const isSelected = selectedPieceId === index

                        return (
                            <motion.div
                                key={`${index}-${piece.id}`}
                                layoutId={gameStarted ? `piece-${piece.id}` : undefined}
                                onClick={() => handlePieceClick(index)}
                                className={`relative cursor-pointer overflow-hidden rounded-sm transition-all duration-200 ${isSelected ? 'ring-2 ring-blue-500 z-10 scale-105 shadow-lg' : ''}`}
                                style={{
                                    backgroundImage: `url(${content.image})`,
                                    backgroundSize: `${gridSize * 100}%`,
                                    backgroundPosition: `${x}% ${y}%`,
                                    opacity: isComplete ? 1 : (isSelected ? 1 : 0.9)
                                }}
                                whileHover={{ scale: isComplete ? 1 : 1.02 }}
                                whileTap={{ scale: 0.95 }}
                            />
                        )
                    })}

                    {/* Victory Overlay if just completed */}
                    {isComplete && !alreadyCompleted && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="absolute inset-0 bg-black/40 flex items-center justify-center z-20 pointer-events-none"
                        >
                            <h2 className="text-white font-bold text-3xl drop-shadow-md transform -rotate-12 border-4 border-white p-4 rounded-xl">PERFECT!</h2>
                        </motion.div>
                    )}
                </div>

                <p className="text-xs text-neutral-500 mt-2 text-center">
                    {isComplete ? "Puzzle Solved!" : "Tap two blocks to swap them."}
                </p>

                {alreadyCompleted && (
                    <Button
                        size="sm"
                        variant="outline"
                        className="w-full mt-4"
                        onClick={() => initializeGame()}
                    >
                        Play Again
                    </Button>
                )}
            </div>
        </div>
    )
}
