import { useCallback, useEffect, useState } from 'react'

export default function useCountdown(date?: Date) {
  const calculateTimeLeft = useCallback(() => {
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

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft())

  useEffect(() => {
    // exit early when we reach 0
    if (!timeLeft) return

    // save intervalId to clear the interval when the
    // component re-renders
    const intervalId = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)

    // clear interval on re-render to avoid memory leaks
    return () => clearInterval(intervalId)
    // add timeLeft as a dependency to re-rerun the effect
    // when we update it
  }, [timeLeft, calculateTimeLeft, setTimeLeft])

  if (!timeLeft) {
    return null
  }

  return timeLeft
}
