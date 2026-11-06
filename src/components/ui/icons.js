import {
  Droplets,
  Flame,
  FlaskConical,
  Gift,
  Leaf,
  Lock,
  RefreshCw,
  ShieldCheck,
  SprayCan,
  Star,
  Timer,
  Truck,
  Wind,
} from 'lucide-react'

// Duomenų failuose ikonos nurodomos raktu, kad duomenys liktų gryni (be JSX).
export const ICONS = {
  spray: SprayCan,
  wind: Wind,
  flame: Flame,
  droplets: Droplets,
  flask: FlaskConical,
  refresh: RefreshCw,
  lock: Lock,
  gift: Gift,
  leaf: Leaf,
  timer: Timer,
  shield: ShieldCheck,
  truck: Truck,
  star: Star,
}

export function getIcon(key) {
  return ICONS[key] ?? SprayCan
}
