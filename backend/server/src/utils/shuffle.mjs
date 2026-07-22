// Fisher-Yates (Knuth) shuffle — uniform random permutation.
// Extracted from routes.mjs to be reusable across services.

/**
 * Uniformly shuffle an array using Fisher-Yates.
 * Returns a new array; does not mutate the input.
 * @template T
 * @param {T[]} arr
 * @returns {T[]}
 */
export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
