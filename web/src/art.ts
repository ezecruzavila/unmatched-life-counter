/** Resolve an art filename (e.g. "bg_geralt.png") to a URL under the app base. */
export function art(filename: string): string {
  return `${import.meta.env.BASE_URL}art/${filename}`
}
