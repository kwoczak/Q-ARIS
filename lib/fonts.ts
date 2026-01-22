export const fontOptions = [
    { label: 'Inter (Default)', value: 'sans', fontFamily: 'var(--font-inter), sans-serif' },
    { label: 'Roboto', value: 'roboto', fontFamily: 'var(--font-roboto), sans-serif' },
    { label: 'Playfair Display', value: 'playfair', fontFamily: 'var(--font-playfair), serif' },
    { label: 'Merriweather', value: 'merriweather', fontFamily: 'var(--font-merriweather), serif' },
    { label: 'Oswald', value: 'oswald', fontFamily: 'var(--font-oswald), sans-serif' },
    { label: 'Monospace', value: 'mono', fontFamily: 'ui-monospace, monospace' },
]

export const getFontFamily = (value: string) => {
    const font = fontOptions.find(f => f.value === value)
    return font ? font.fontFamily : 'inherit'
}
