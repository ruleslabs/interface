export function knuthShuffle<T>(arr: T[]): T[] {
  let currentIndex = arr.length
  let randomIndex = 0

  // While there remain elements to shuffle.
  while (currentIndex !== 0) {
    // Pick a remaining element.
    // prettier-ignore
    randomIndex = Math.floor(Math.random() * currentIndex--);

    // And swap it with the current element.
    // prettier-ignore
    [arr[currentIndex], arr[randomIndex]] = [arr[randomIndex], arr[currentIndex]]
  }

  return arr
}
