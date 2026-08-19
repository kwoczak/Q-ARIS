'use client'

import React, { useState, useMemo } from 'react'
import {
    Popover,
    PopoverContent,
    PopoverTrigger
} from '@/components/ui/popover'
import { Input } from '@/components/ui/input'
import { Search, X, Sparkles, Smile } from 'lucide-react'

interface IconPickerProps {
    value: string
    onChange: (icon: string) => void
    className?: string
    size?: 'sm' | 'md' | 'lg'
}

interface EmojiCategory {
    id: string
    name: string
    icon: string
    emojis: { char: string; keywords: string[] }[]
}

const EMOJI_CATEGORIES: EmojiCategory[] = [
    {
        id: 'museum',
        name: 'Museum & Art',
        icon: '🏛️',
        emojis: [
            { char: '🏛️', keywords: ['museum', 'temple', 'building', 'history', 'classical'] },
            { char: '🎨', keywords: ['art', 'palette', 'painting', 'draw', 'artist'] },
            { char: '🖼️', keywords: ['frame', 'picture', 'artwork', 'gallery', 'painting'] },
            { char: '📜', keywords: ['scroll', 'ancient', 'history', 'document', 'manuscript'] },
            { char: '🏺', keywords: ['amphora', 'vase', 'pottery', 'artifact', 'relic'] },
            { char: '🗿', keywords: ['statue', 'moai', 'sculpture', 'monument', 'stone'] },
            { char: '🎭', keywords: ['theatre', 'drama', 'masks', 'performing', 'stage'] },
            { char: '👑', keywords: ['crown', 'king', 'queen', 'royal', 'gold'] },
            { char: '💎', keywords: ['gem', 'diamond', 'jewel', 'crystal', 'treasure'] },
            { char: '🔮', keywords: ['crystal', 'magic', 'mystery', 'oracle', 'sphere'] },
            { char: '🪙', keywords: ['coin', 'gold', 'currency', 'money', 'treasure'] },
            { char: '⚜️', keywords: ['fleur-de-lis', 'royal', 'heraldry', 'symbol', 'heritage'] },
            { char: '🗝️', keywords: ['key', 'secret', 'clue', 'unlock', 'lock'] },
            { char: '⏳', keywords: ['hourglass', 'time', 'era', 'ancient', 'sand'] },
            { char: '🕯️', keywords: ['candle', 'light', 'flame', 'atmosphere', 'dark'] },
            { char: '📖', keywords: ['book', 'story', 'open book', 'reading', 'chronicle'] },
            { char: '🖋️', keywords: ['fountain pen', 'write', 'author', 'manuscript', 'calligraphy'] },
            { char: '⚔️', keywords: ['swords', 'battle', 'war', 'armor', 'medieval'] },
            { char: '🛡️', keywords: ['shield', 'defense', 'armor', 'protection', 'knight'] },
            { char: '🏹', keywords: ['bow and arrow', 'archery', 'hunter', 'ancient'] }
        ]
    },
    {
        id: 'interactive',
        name: 'Interactive & Gaming',
        icon: '⚡',
        emojis: [
            { char: '⚡', keywords: ['lightning', 'energy', 'power', 'bolt', 'fast'] },
            { char: '🏆', keywords: ['trophy', 'winner', 'cup', 'achievement', 'prize'] },
            { char: '🎯', keywords: ['target', 'bullseye', 'goal', 'quiz', 'accuracy'] },
            { char: '🎲', keywords: ['dice', 'game', 'random', 'gamified', 'play'] },
            { char: '🎮', keywords: ['controller', 'game', 'play', 'video game', 'arcade'] },
            { char: '🎟️', keywords: ['ticket', 'scratch', 'admission', 'pass', 'reveal'] },
            { char: '🪄', keywords: ['magic wand', 'sparkle', 'magic', 'wizard', 'enchant'] },
            { char: '✨', keywords: ['sparkles', 'star', 'shine', 'glow', 'magic'] },
            { char: '🌟', keywords: ['glowing star', 'special', 'favorite', 'bonus'] },
            { char: '💡', keywords: ['lightbulb', 'idea', 'insight', 'clue', 'solution'] },
            { char: '🔥', keywords: ['fire', 'flame', 'hot', 'streak', 'energy'] },
            { char: '🚀', keywords: ['rocket', 'launch', 'speed', 'fast', 'space'] },
            { char: '🧩', keywords: ['puzzle', 'piece', 'clue', 'solve', 'mystery'] },
            { char: '🕹️', keywords: ['joystick', 'arcade', 'retro', 'gaming'] },
            { char: '🎖️', keywords: ['medal', 'badge', 'award', 'honor', 'rank'] },
            { char: '⭐', keywords: ['star', 'rate', 'favorite', 'score'] },
            { char: '🔍', keywords: ['search', 'magnifying glass', 'clue', 'investigate', 'detective'] },
            { char: '🕵️', keywords: ['detective', 'secret', 'mystery', 'investigation', 'spy'] },
            { char: '🎁', keywords: ['gift', 'reward', 'present', 'box', 'bonus'] },
            { char: '💯', keywords: ['hundred', 'perfect', 'score', '100', 'points'] }
        ]
    },
    {
        id: 'science',
        name: 'Science & Tech',
        icon: '🔬',
        emojis: [
            { char: '🔬', keywords: ['microscope', 'science', 'lab', 'biology', 'research'] },
            { char: '🔭', keywords: ['telescope', 'astronomy', 'stars', 'cosmos', 'space'] },
            { char: '🧬', keywords: ['dna', 'genetics', 'biology', 'evolution', 'cell'] },
            { char: '🪐', keywords: ['planet', 'saturn', 'orbit', 'space', 'cosmos'] },
            { char: '🌌', keywords: ['milky way', 'galaxy', 'nebula', 'space', 'universe'] },
            { char: '🛰️', keywords: ['satellite', 'orbit', 'telecom', 'iss', 'space'] },
            { char: '🛸', keywords: ['ufo', 'flying saucer', 'alien', 'sci-fi'] },
            { char: '🧪', keywords: ['test tube', 'chemistry', 'experiment', 'lab', 'potion'] },
            { char: '🧫', keywords: ['petri dish', 'culture', 'bacteria', 'biology'] },
            { char: '⚙️', keywords: ['gear', 'engineering', 'settings', 'machine', 'mechanism'] },
            { char: '💻', keywords: ['laptop', 'computer', 'code', 'tech', 'digital'] },
            { char: '📡', keywords: ['satellite antenna', 'signal', 'radar', 'telemetry', 'radio'] },
            { char: '📊', keywords: ['bar chart', 'stats', 'data', 'metrics', 'graph'] },
            { char: '📈', keywords: ['chart increasing', 'growth', 'trend', 'analytics'] },
            { char: '📐', keywords: ['ruler', 'blueprint', 'measure', 'geometry', 'architecture'] },
            { char: '🔋', keywords: ['battery', 'energy', 'power', 'charge'] },
            { char: '🤖', keywords: ['robot', 'ai', 'android', 'automation', 'bot'] },
            { char: '🧠', keywords: ['brain', 'mind', 'neuro', 'intelligence', 'thought'] },
            { char: '⚡', keywords: ['electricity', 'voltage', 'power', 'physics'] },
            { char: '☢️', keywords: ['radioactive', 'nuclear', 'atom', 'physics'] }
        ]
    },
    {
        id: 'nature',
        name: 'Nature & Wildlife',
        icon: '🌿',
        emojis: [
            { char: '🌿', keywords: ['herb', 'plant', 'leaf', 'botanical', 'flora'] },
            { char: '🌴', keywords: ['palm tree', 'tropical', 'island', 'beach'] },
            { char: '🌲', keywords: ['evergreen tree', 'forest', 'pine', 'nature', 'woods'] },
            { char: '🦁', keywords: ['lion', 'animal', 'safari', 'wildlife', 'fauna'] },
            { char: '🦅', keywords: ['eagle', 'bird', 'raptor', 'predator', 'flight'] },
            { char: '🐺', keywords: ['wolf', 'canine', 'wild', 'pack', 'predator'] },
            { char: '🐳', keywords: ['whale', 'ocean', 'marine', 'sea', 'mammal'] },
            { char: '🦖', keywords: ['t-rex', 'dinosaur', 'prehistoric', 'jurassic', 'fossil'] },
            { char: '🦕', keywords: ['sauropod', 'dinosaur', 'herbivore', 'fossil'] },
            { char: '🐾', keywords: ['paw prints', 'track', 'animal', 'trail', 'wildlife'] },
            { char: '🍁', keywords: ['maple leaf', 'autumn', 'nature', 'foliage'] },
            { char: '🌸', keywords: ['cherry blossom', 'flower', 'spring', 'bloom'] },
            { char: '🌋', keywords: ['volcano', 'lava', 'geology', 'eruption', 'mountain'] },
            { char: '🌊', keywords: ['ocean wave', 'water', 'sea', 'surf', 'tsunami'] },
            { char: '☀️', keywords: ['sun', 'sunny', 'solar', 'light', 'day'] },
            { char: '🌙', keywords: ['crescent moon', 'night', 'lunar', 'dark'] },
            { char: '🦈', keywords: ['shark', 'marine', 'predator', 'ocean'] },
            { char: '🦋', keywords: ['butterfly', 'insect', 'metamorphosis', 'wings'] },
            { char: '🌺', keywords: ['hibiscus', 'flower', 'tropical', 'bloom'] },
            { char: '🍄', keywords: ['mushroom', 'fungus', 'forest', 'nature'] }
        ]
    },
    {
        id: 'places',
        name: 'Places & Travel',
        icon: '🗺️',
        emojis: [
            { char: '🗺️', keywords: ['world map', 'travel', 'geography', 'location', 'trail'] },
            { char: '📍', keywords: ['pin', 'location', 'point', 'stop', 'place'] },
            { char: '🧭', keywords: ['compass', 'navigation', 'direction', 'explore', 'north'] },
            { char: '🏰', keywords: ['castle', 'medieval', 'fortress', 'palace', 'royal'] },
            { char: '🗼', keywords: ['tower', 'tokyo', 'monument', 'landmark'] },
            { char: '🗽', keywords: ['statue of liberty', 'landmark', 'monument', 'new york'] },
            { char: '🚇', keywords: ['metro', 'subway', 'train', 'transit', 'transport'] },
            { char: '✈️', keywords: ['airplane', 'flight', 'travel', 'voyage', 'air'] },
            { char: '⛵', keywords: ['sailboat', 'ship', 'sea', 'ocean', 'voyage'] },
            { char: '🏕️', keywords: ['camping', 'tent', 'outdoors', 'expedition'] },
            { char: '🏔️', keywords: ['snowy mountain', 'peak', 'alps', 'summit', 'hiking'] },
            { char: '🌆', keywords: ['cityscape dusk', 'urban', 'skyline', 'sunset'] },
            { char: '🌅', keywords: ['sunrise', 'morning', 'dawn', 'sun'] },
            { char: '🏙️', keywords: ['cityscape', 'buildings', 'metropolis', 'downtown'] },
            { char: '🌉', keywords: ['bridge at night', 'landmark', 'city'] }
        ]
    }
]

export function IconPicker({
    value,
    onChange,
    className = '',
    size = 'md'
}: IconPickerProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [activeCategory, setActiveCategory] = useState<string>('museum')

    const filteredEmojis = useMemo(() => {
        if (!searchQuery.trim()) {
            const cat = EMOJI_CATEGORIES.find(c => c.id === activeCategory)
            return cat ? cat.emojis : []
        }

        const q = searchQuery.toLowerCase()
        const all: { char: string; keywords: string[] }[] = []
        EMOJI_CATEGORIES.forEach(cat => {
            cat.emojis.forEach(e => {
                if (
                    e.char.includes(q) ||
                    e.keywords.some(k => k.includes(q))
                ) {
                    if (!all.some(x => x.char === e.char)) {
                        all.push(e)
                    }
                }
            })
        })
        return all
    }, [searchQuery, activeCategory])

    const handleSelect = (char: string) => {
        onChange(char)
        setIsOpen(false)
    }

    const buttonSizeClasses = {
        sm: 'w-8 h-8 text-sm',
        md: 'w-10 h-10 text-base',
        lg: 'w-12 h-12 text-xl'
    }[size]

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <button
                    type="button"
                    className={`rounded-xl bg-neutral-900 border border-purple-500/40 hover:border-purple-400 hover:bg-purple-950/40 flex items-center justify-center transition-all shadow-inner group cursor-pointer shrink-0 ${buttonSizeClasses} ${className}`}
                    title="Click to choose an icon or emoji"
                >
                    <span className="group-hover:scale-125 transition-transform duration-200">
                        {value || '💎'}
                    </span>
                </button>
            </PopoverTrigger>

            <PopoverContent
                side="bottom"
                align="start"
                className="w-80 p-0 bg-neutral-950 border border-purple-500/30 text-white shadow-2xl rounded-2xl z-[9999] overflow-hidden backdrop-blur-xl"
            >
                {/* Search Bar */}
                <div className="p-3 border-b border-white/10 bg-neutral-900/80">
                    <div className="relative">
                        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                        <Input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search icons (e.g. art, rocket, star)..."
                            className="h-8 pl-8 pr-8 text-xs bg-neutral-950 border-white/10 text-white placeholder:text-neutral-500 rounded-lg focus-visible:ring-purple-500"
                            autoFocus
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                onClick={() => setSearchQuery('')}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        )}
                    </div>

                    {/* Category Tabs (only when not searching) */}
                    {!searchQuery.trim() && (
                        <div className="flex items-center gap-1 mt-2.5 overflow-x-auto pb-0.5 scrollbar-none">
                            {EMOJI_CATEGORIES.map(cat => (
                                <button
                                    key={cat.id}
                                    type="button"
                                    onClick={() => setActiveCategory(cat.id)}
                                    className={`px-2 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer flex items-center gap-1 ${
                                        activeCategory === cat.id
                                            ? 'bg-purple-600 text-white shadow-md'
                                            : 'bg-white/5 text-neutral-400 hover:bg-white/10 hover:text-white'
                                    }`}
                                >
                                    <span>{cat.icon}</span>
                                    <span>{cat.name.split(' ')[0]}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Emojis Grid */}
                <div className="p-3 max-h-56 overflow-y-auto">
                    {filteredEmojis.length > 0 ? (
                        <div className="grid grid-cols-6 gap-1.5">
                            {filteredEmojis.map((e, idx) => {
                                const isSelected = value === e.char
                                return (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() => handleSelect(e.char)}
                                        className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all cursor-pointer hover:scale-125 ${
                                            isSelected
                                                ? 'bg-purple-600/50 border border-purple-400 ring-2 ring-purple-500/50 shadow-md'
                                                : 'bg-neutral-900/60 hover:bg-neutral-800 border border-white/5'
                                        }`}
                                        title={e.keywords.join(', ')}
                                    >
                                        {e.char}
                                    </button>
                                )
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-6 text-xs text-neutral-500">
                            <p>No icons found for &ldquo;{searchQuery}&rdquo;</p>
                            <div className="mt-2 flex justify-center">
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (searchQuery.trim()) {
                                            handleSelect(searchQuery.trim())
                                        }
                                    }}
                                    className="px-3 py-1 rounded-lg bg-purple-600/30 border border-purple-500/40 text-purple-300 text-xs hover:bg-purple-600/50"
                                >
                                    Use &ldquo;{searchQuery.trim()}&rdquo; as custom icon
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Direct Custom Emoji/Character Input Footer */}
                <div className="p-2.5 border-t border-white/10 bg-neutral-900/80 flex items-center justify-between gap-2 text-xs">
                    <span className="text-[11px] text-neutral-400 flex items-center gap-1">
                        <Smile className="w-3.5 h-3.5 text-amber-400" /> Current:
                    </span>
                    <div className="flex items-center gap-1.5">
                        <Input
                            value={value}
                            onChange={(e) => onChange(e.target.value)}
                            placeholder="Emoji"
                            maxLength={4}
                            className="h-7 w-16 text-center text-sm bg-neutral-950 border-white/15 text-white p-0"
                        />
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    )
}
