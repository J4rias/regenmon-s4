export type ArchetypeId = 'Scrap-Eye' | 'Spore-Maw' | 'Prism-Core'

export interface Archetype {
  id: ArchetypeId
  name: string
  label: string
  icon: string
  color: string
  colorDark: string
  description: string
}

export interface RegenmonStats {
  happiness: number
  energy: number
  hunger: number
}

export interface RegenmonData {
  name: string
  type: ArchetypeId
  stats: RegenmonStats
  createdAt: string
}

export const ARCHETYPES: Archetype[] = [
  {
    id: 'Scrap-Eye',
    name: 'Industrial',
    label: 'Ojo de Chatarra',
    icon: '\u2699\uFE0F',
    color: '#cd5c5c',
    colorDark: 'rgba(205, 92, 92, 0.15)',
    description: 'Forjado con restos de la vieja civilizacion.',
  },
  {
    id: 'Spore-Maw',
    name: 'Fungi',
    label: 'Fauces de Espora',
    icon: '\uD83C\uDF44',
    color: '#76c442',
    colorDark: 'rgba(118, 196, 66, 0.15)',
    description: 'Nacido de la mutacion organica del yermo.',
  },
  {
    id: 'Prism-Core',
    name: 'Mineral',
    label: 'Nucleo de Prisma',
    icon: '\uD83D\uDC8E',
    color: '#67e6dc',
    colorDark: 'rgba(103, 230, 220, 0.15)',
    description: 'Cristalizado por la radiacion residual.',
  },
]
