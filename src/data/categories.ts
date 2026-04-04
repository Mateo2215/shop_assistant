import type { Category, CategoryId } from '../types'

// bgColor and textColor contain both light and dark: Tailwind variants
// so they work regardless of theme
export const CATEGORIES: Category[] = [
  { id: 'vegetables', name: 'Warzywa i owoce',      emoji: '🥕', bgColor: 'bg-emerald-100 dark:bg-emerald-500/10',  textColor: 'text-emerald-700 dark:text-emerald-400'  },
  { id: 'konserwy',   name: 'Konserwy',              emoji: '🥫', bgColor: 'bg-orange-100 dark:bg-orange-500/10',   textColor: 'text-orange-700 dark:text-orange-400'    },
  { id: 'spices',     name: 'Przyprawy',             emoji: '🌶️', bgColor: 'bg-red-100 dark:bg-red-500/10',         textColor: 'text-red-700 dark:text-red-400'          },
  { id: 'tea-coffee', name: 'Herbata i Kawa',        emoji: '☕',  bgColor: 'bg-amber-100 dark:bg-amber-500/10',    textColor: 'text-amber-700 dark:text-amber-400'      },
  { id: 'chips',      name: 'Przekąski',             emoji: '🍿', bgColor: 'bg-yellow-100 dark:bg-yellow-500/10',  textColor: 'text-yellow-700 dark:text-yellow-400'    },
  { id: 'sweets',     name: 'Słodycze',              emoji: '🍫', bgColor: 'bg-pink-100 dark:bg-pink-500/10',      textColor: 'text-pink-700 dark:text-pink-400'        },
  { id: 'sauces',     name: 'Sosy',                  emoji: '🫙', bgColor: 'bg-lime-100 dark:bg-lime-500/10',      textColor: 'text-lime-700 dark:text-lime-400'        },
  { id: 'pasta-rice', name: 'Makaron i Ryż',         emoji: '🍝', bgColor: 'bg-yellow-100 dark:bg-yellow-600/10', textColor: 'text-yellow-700 dark:text-yellow-500'    },
  { id: 'salt-sugar', name: 'Sól i Cukier',          emoji: '🧂', bgColor: 'bg-gray-100 dark:bg-gray-500/10',     textColor: 'text-gray-600 dark:text-gray-400'        },
  { id: 'dairy',      name: 'Nabiał',                emoji: '🥛', bgColor: 'bg-blue-100 dark:bg-blue-500/10',     textColor: 'text-blue-700 dark:text-blue-400'        },
  { id: 'deli',       name: 'Wędlina i Ser',         emoji: '🧀', bgColor: 'bg-amber-100 dark:bg-amber-600/10',   textColor: 'text-amber-700 dark:text-amber-500'      },
  { id: 'meat',       name: 'Mięso',                 emoji: '🥩', bgColor: 'bg-rose-100 dark:bg-rose-500/10',     textColor: 'text-rose-700 dark:text-rose-400'        },
  { id: 'frozen',     name: 'Mrożonki',              emoji: '🧊', bgColor: 'bg-cyan-100 dark:bg-cyan-500/10',     textColor: 'text-cyan-700 dark:text-cyan-400'        },
  { id: 'bread',      name: 'Pieczywo',              emoji: '🍞', bgColor: 'bg-orange-100 dark:bg-amber-600/10',  textColor: 'text-orange-700 dark:text-amber-500'     },
  { id: 'alcohol',    name: 'Alkohole',              emoji: '🍺', bgColor: 'bg-purple-100 dark:bg-purple-500/10', textColor: 'text-purple-700 dark:text-purple-400'    },
  { id: 'drinks',     name: 'Napoje',                emoji: '🥤', bgColor: 'bg-indigo-100 dark:bg-indigo-500/10', textColor: 'text-indigo-700 dark:text-indigo-400'    },
  { id: 'water',      name: 'Woda',                  emoji: '💧', bgColor: 'bg-sky-100 dark:bg-sky-500/10',       textColor: 'text-sky-700 dark:text-sky-400'          },
  { id: 'hygiene',    name: 'Artykuły higieniczne',  emoji: '🧴', bgColor: 'bg-pink-100 dark:bg-pink-600/10',     textColor: 'text-pink-700 dark:text-pink-500'        },
  { id: 'household',  name: 'Artykuły chemiczne',    emoji: '🧹', bgColor: 'bg-teal-100 dark:bg-teal-500/10',     textColor: 'text-teal-700 dark:text-teal-400'        },
  { id: 'snacks',     name: 'Przekąski (legacy)',    emoji: '🍿', bgColor: 'bg-yellow-100 dark:bg-yellow-500/10', textColor: 'text-yellow-700 dark:text-yellow-400'    },
  { id: 'other',      name: 'Inne',                  emoji: '🛒', bgColor: 'bg-gray-100 dark:bg-slate-500/10',    textColor: 'text-gray-600 dark:text-slate-400'       },
]

export const CATEGORY_MAP = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c])
) as Record<CategoryId, Category>

export function getCategory(id: string): Category {
  return CATEGORY_MAP[id as CategoryId] ?? CATEGORY_MAP['other']
}
