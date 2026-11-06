import { useEffect, useState } from 'react'

// Savaitgalio akcija baigiasi sekmadienį 23:59:59 vietos laiku.
export function getSaleEnd(from = new Date()) {
  const end = new Date(from)
  const daysUntilSunday = (7 - end.getDay()) % 7
  end.setDate(end.getDate() + daysUntilSunday)
  end.setHours(23, 59, 59, 999)
  if (end <= from) end.setDate(end.getDate() + 7)
  return end
}

function split(ms) {
  const total = Math.max(0, Math.floor(ms / 1000))
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  }
}

const pad = (value) => String(value).padStart(2, '0')

export function useCountdown() {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  const parts = split(getSaleEnd(now).getTime() - now.getTime())
  const clock = `${pad(parts.hours)}:${pad(parts.minutes)}:${pad(parts.seconds)}`
  const label = parts.days > 0 ? `${parts.days} d. ${clock}` : clock

  return { ...parts, clock, label }
}
