import { MenuItem } from '@/types'

// The single source of truth for what we sell and what it costs.
// Prices are in cents so we never do floating point arithmetic on money.
export const menuItems: MenuItem[] = [
  {
    id: 'classic',
    name: 'Classic Lemonade',
    description: 'Fresh squeezed lemons with the perfect balance of sweet and tart',
    priceCents: 350,
    image: '🍋',
  },
  {
    id: 'pink',
    name: 'Pink Lemonade',
    description: 'Our classic lemonade with a splash of cranberry for color and flavor',
    priceCents: 400,
    image: '🌸',
  },
  {
    id: 'mint',
    name: 'Mint Lemonade',
    description: 'Refreshing lemonade infused with fresh mint leaves',
    priceCents: 450,
    image: '🌿',
  },
  {
    id: 'strawberry',
    name: 'Strawberry Lemonade',
    description: 'Sweet strawberries blended with our classic lemonade',
    priceCents: 500,
    image: '🍓',
  },
]

export function getMenuItem(id: string): MenuItem | undefined {
  return menuItems.find((item) => item.id === id)
}

export const MAX_QUANTITY_PER_ITEM = 20

export function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`
}
