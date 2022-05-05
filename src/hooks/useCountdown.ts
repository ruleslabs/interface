import { useCallback, useEffect, useState } from 'react'

interface Countdown {
  hours: number
  minutes: number
  seconds: number
}

export default function useCountdown(date?: Date): Countdown | null {
  const calculateTimeLeft = useCallback((): Countdown | null => {
    if (!date) return null

    const difference = +date - +new Date()

    if (difference > 0) {
      return {
        hours: Math.floor(difference / (1000 * 60 * 60)),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      }
    } else {
      return null
    }
  }, [date])

  const [timeLeft, setTimeLeft] = useState<Countdown | null>(null)

  useEffect(() => {
    // init when null or exit early when we reach 0
    if (!timeLeft) {
      setTimeLeft(calculateTimeLeft())
      return
    }

    // save intervalId to clear the interval when the
    // component re-renders
    const intervalId = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)

    // clear interval on re-render to avoid memory leaks
    return () => clearInterval(intervalId)
    // add timeLeft as a dependency to re-rerun the effect
    // when we update it
  }, [date, timeLeft, calculateTimeLeft, setTimeLeft])

  if (!timeLeft) {
    return null
  }

  return timeLeft
}
