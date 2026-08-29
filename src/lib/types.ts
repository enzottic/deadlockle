
export interface DeadlockItem {
  name: string;
  type: DeadlockItemType;
  tier: string;
  upgrades_from: number;
  upgrades_to: number;
  stats?: string[];
  item_trigger?: string[];
  item_effect?: string[];
  cooldown?: number;
  duration?: number;
  image_url?: string;
}

export type DeadlockItemType = "Spirit" | "Weapon" | "Vitality"

export interface DailyGameState {
  date: string;
  guesses: DeadlockItem[];
  completed: boolean;
}

export type ResultColor = "green" | "yellow" | "red"
export type Direction = "higher" | "lower" | "correct"
export interface HigherLowerResult {
    colorResult: ResultColor
    direction: Direction
}

export interface DeadlockleGuessState {
    item: DeadlockItem;
    typeResult: ResultColor
    tierResult: ResultColor
    statsResult: ResultColor
    upgradesFromResult: HigherLowerResult
    upgradesToResult: HigherLowerResult
    triggerResult: ResultColor
    effectResult: ResultColor
}
