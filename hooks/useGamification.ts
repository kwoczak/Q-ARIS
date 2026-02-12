import { useVisitor } from "@/components/player/VisitorContext"

export function useGamification() {
    const context = useVisitor()

    // VisitorContext guarantees these are available, but let's be safe if it returns undefined
    // (though useVisitor throws if context is undefined)
    const { score, addPoints, hasCompletedBlock } = context

    return {
        points: score,
        addPoints: (amount: number, blockId: string) => addPoints(amount, blockId),
        hasCompletedBlock
    }
}
