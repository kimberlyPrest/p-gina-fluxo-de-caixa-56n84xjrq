import { useEffect, useState } from 'react'

export function useAnimatedNumber(value: number, duration: number = 800) {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    let startTime: number
    let animationFrame: number

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)

      // Ease out cubic
      const easeOut = progress === 1 ? 1 : 1 - Math.pow(1 - progress, 3)
      setDisplayValue(value * easeOut)

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      }
    }

    animationFrame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationFrame)
  }, [value, duration])

  return displayValue
}
