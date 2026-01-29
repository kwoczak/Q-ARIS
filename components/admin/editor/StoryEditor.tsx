'use client'

import { useCallback, useState } from 'react'
import ReactFlow, {
    Background,
    Controls,
    MiniMap,
    useNodesState,
    useEdgesState,
    addEdge,
    Connection,
    Edge,
    Node,
    EdgeChange,
    NodeChange,
    applyEdgeChanges
} from 'reactflow'
import 'reactflow/dist/style.css'
import type { Story, Stage, Trigger, StoryEdge } from '@/types/schema'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import { StageProperties } from './StageProperties'
import { Loader2, Pencil, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

// Helper to convert DB Stages to ReactFlow Nodes
const getInitialNodes = (stages: Stage[]): Node[] => {
    return stages.map(s => ({
        id: s.id,
        position: { x: s.position_x || 0, y: s.position_y || 0 },
        data: { label: s.title, type: s.type },
        style: {
            border: '1px solid #404040',
            padding: '10px 20px',
            borderRadius: '8px',
            background: '#171717',
            color: 'white',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)',
            minWidth: '150px',
            textAlign: 'center',
            fontWeight: 500
        }
    }))
}

// Helper to convert DB Edges to ReactFlow Edges
const getInitialGraphEdges = (edges: StoryEdge[]): Edge[] => {
    return edges.map(e => ({
        id: e.id,
        source: e.source_stage_id,
        target: e.target_stage_id,
        type: 'default',
        animated: true,
        style: { stroke: '#2563eb' }
    }))
}

// Define types outside to avoid re-creation warning
const nodeTypes = {}
const edgeTypes = {}

export function StoryEditor({ story, initialStages, initialTriggers, initialEdges }: { story: Story, initialStages: Stage[], initialTriggers: Trigger[], initialEdges: StoryEdge[] }) {
    const [nodes, setNodes, onNodesChange] = useNodesState(getInitialNodes(initialStages))
    const [edges, setEdges, onEdgesChange] = useEdgesState(getInitialGraphEdges(initialEdges))
    const [stages, setStages] = useState<Stage[]>(initialStages)
    const [selectedStage, setSelectedStage] = useState<Stage | null>(null)
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [storyTitle, setStoryTitle] = useState(story.title)

    const supabase = createClient()

    // Handle Connecting Nodes (Save to DB)
    const onConnect = useCallback(async (params: Connection | Edge) => {
        // 1. Update Local View
        setEdges((eds) => addEdge(params, eds))

        // 2. Save to DB
        if (params.source && params.target) {
            const { data, error } = await supabase.from('story_edges').insert({
                story_id: story.id,
                source_stage_id: params.source,
                target_stage_id: params.target
            }).select().single()

            if (error) {
                console.error("Failed to save edge:", error)
                // Optionally revert UI change here
            }
        }
    }, [setEdges, story.id, supabase])

    // Handle Deleting Edges (Remove from DB)
    const onEdgesChangeWrapper = useCallback(async (changes: EdgeChange[]) => {
        onEdgesChange(changes)

        // Check for removals
        const removals = changes.filter(c => c.type === 'remove')
        for (const removal of removals) {
            if (removal.id) {
                await supabase.from('story_edges').delete().eq('id', removal.id)
            }
        }
    }, [onEdgesChange, supabase])

    const handleNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
        const stage = stages.find(s => s.id === node.id)
        if (stage) {
            setSelectedStage(stage)
            setIsSidebarOpen(true)
        }
    }, [stages])

    // Handle Deleting Nodes (Remove from DB)
    const onNodesChangeWrapper = useCallback(async (changes: NodeChange[]) => {
        onNodesChange(changes)

        const removals = changes.filter(c => c.type === 'remove')
        for (const removal of removals) {
            if (removal.id) {
                // Delete from DB (Cascade will kill edges and triggers usually)
                await supabase.from('stages').delete().eq('id', removal.id)

                // Update local state
                setStages(prev => prev.filter(s => s.id !== removal.id))
            }
        }
    }, [onNodesChange, supabase])

    const handleStageUpdate = async (updatedStage: Stage) => {
        setStages(prev => prev.map(s => s.id === updatedStage.id ? updatedStage : s))
        setNodes(prev => prev.map(n => n.id === updatedStage.id ? { ...n, data: { ...n.data, label: updatedStage.title } } : n))

        const { error } = await supabase
            .from('stages')
            .update({
                title: updatedStage.title,
                content: updatedStage.content,
                type: updatedStage.type
            })
            .eq('id', updatedStage.id)

        if (error) {
            console.error("Failed to update stage", error)
            alert("Failed to save changes")
        }
    }

    const handleAddStage = async () => {
        setIsSaving(true)
        const newStage = {
            story_id: story.id,
            title: "New Stage",
            type: 'content',
            content: {},
            position_x: 100,
            position_y: 100
        }

        const { data, error } = await supabase
            .from('stages')
            .insert(newStage)
            .select()
            .single()

        setIsSaving(false)

        if (error || !data) {
            console.error("Error creating stage", error)
            return
        }

        // Auto-generate Trigger
        if (data) {
            const code = Math.random().toString(36).substring(2, 10).toUpperCase()
            await supabase.from('triggers').insert({
                code,
                story_id: story.id,
                target_stage_id: data.id,
                type: 'checkpoint'
            })
        }

        const createdStage = data as Stage
        setStages(prev => [...prev, createdStage])
        setNodes(prev => [...prev, ...getInitialNodes([createdStage])])
    }

    const handleDuplicateStage = async (originalStage: Stage) => {
        setIsSaving(true)
        const copiedStage = {
            story_id: story.id,
            title: `${originalStage.title} (Copy)`,
            type: originalStage.type,
            content: structuredClone(originalStage.content), // Deep copy
            position_x: (originalStage.position_x || 0) + 50,
            position_y: (originalStage.position_y || 0) + 50,
        }

        const { data, error } = await supabase
            .from('stages')
            .insert(copiedStage)
            .select()
            .single()

        setIsSaving(false)

        if (error || !data) {
            console.error("Error duplicating stage", error)
            alert("Failed to duplicate stage")
            return
        }

        // Auto-generate Trigger for Copy
        if (data) {
            const code = Math.random().toString(36).substring(2, 10).toUpperCase()
            await supabase.from('triggers').insert({
                code,
                story_id: story.id,
                target_stage_id: data.id,
                type: 'checkpoint'
            })
        }

        const createdStage = data as Stage
        setStages(prev => [...prev, createdStage])
        setNodes(prev => [...prev, ...getInitialNodes([createdStage])])
    }

    const handleSaveGraphPositions = async () => {
        setIsSaving(true)
        for (const node of nodes) {
            await supabase.from('stages').update({
                position_x: node.position.x,
                position_y: node.position.y
            }).eq('id', node.id)
        }
        setIsSaving(false)
        alert("Graph positions saved!")
    }

    return (
        <div className="h-[calc(100vh-140px)] w-full border border-white/10 rounded-lg overflow-hidden bg-neutral-950 flex flex-col relative">
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-neutral-900 shrink-0">
                <div className="flex items-center gap-4">
                    <Link href="/curator">
                        <Button size="icon" variant="ghost" className="text-neutral-400 hover:text-white hover:bg-white/10">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <div>
                        <div className="flex items-center gap-2 group">
                            <Input
                                value={storyTitle}
                                onChange={(e) => setStoryTitle(e.target.value)}
                                onBlur={async () => {
                                    if (storyTitle.trim() === story.title) return
                                    const { error } = await supabase.from('stories').update({ title: storyTitle }).eq('id', story.id)
                                    if (error) {
                                        console.error(error)
                                        alert("Error updating title")
                                    }
                                }}
                                className="font-bold text-lg h-auto p-0 border-transparent hover:border-neutral-700 focus-visible:ring-0 bg-transparent px-1 -ml-1 w-full max-w-md transition-all shadow-none text-white hover:bg-neutral-800"
                            />
                            <Pencil className="w-4 h-4 text-neutral-500 opacity-50 group-hover:opacity-100 transition-opacity cursor-pointer" />
                        </div>
                        <p className="text-xs text-neutral-400">
                            {stages.length} Stages • Drag nodes to plan. Draw lines to connect.
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button size="sm" variant="secondary" onClick={handleAddStage} disabled={isSaving} className="bg-neutral-800 text-white hover:bg-neutral-700 border border-white/10">
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : "+ Add Stage"}
                    </Button>
                    <Button size="sm" onClick={handleSaveGraphPositions} disabled={isSaving} className="bg-neutral-800 text-white hover:bg-neutral-700 border border-white/10">
                        Save Positions
                    </Button>
                </div>
            </div>
            <div className="flex-1 w-full bg-neutral-950">
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChangeWrapper}
                    onEdgesChange={onEdgesChangeWrapper}
                    onConnect={onConnect}
                    onNodeClick={handleNodeClick}
                    nodeTypes={nodeTypes}
                    edgeTypes={edgeTypes}
                    fitView
                >
                    <Background gap={12} size={1} color="#333" />
                    <Controls className="bg-neutral-800 border-neutral-700 [&>button]:!bg-neutral-800 [&>button]:!border-neutral-700 [&>button]:!text-white [&>button:hover]:!bg-neutral-700 [&_svg]:!fill-white [&_path]:!fill-white" />
                    <MiniMap style={{ background: '#171717' }} nodeStrokeColor="#444" nodeColor="#262626" maskColor="rgba(0, 0, 0, 0.7)" />
                </ReactFlow>
            </div>

            <StageProperties
                stage={selectedStage}
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                onSave={handleStageUpdate}
                onDelete={async (id) => {
                    if (id) {
                        // Delete from DB
                        await supabase.from('stages').delete().eq('id', id)
                        // Update local state
                        setStages(prev => prev.filter(s => s.id !== id))
                        setNodes(prev => prev.filter(n => n.id !== id))
                    }
                }}
                onDuplicate={() => selectedStage && handleDuplicateStage(selectedStage)}
            />
        </div>
    )
}
