import { Droplets, Flame, FlaskConical, Lock, RefreshCw, SprayCan, Wind } from 'lucide-react'

// Duomenų failuose ikonos nurodomos raktu, kad duomenys liktų gryni (be JSX).
export const ICONS = {
  spray: SprayCan,
  wind: Wind,
  flame: Flame,
  droplets: Droplets,
  flask: FlaskConical,
  refresh: RefreshCw,
  lock: Lock,
}

export function getIcon(key) {
  return ICONS[key] ?? SprayCan
}
