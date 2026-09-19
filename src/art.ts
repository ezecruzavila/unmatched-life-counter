/**
 * Art is organised on disk under /art in category folders:
 *   avatars/  backgrounds/  extras/  logos/  icons/
 * These helpers resolve a filename to its full URL under the app base. The
 * domain data (characters.ts) still stores bare filenames like "bg_geralt.png";
 * the category is chosen by which helper is used at the call site.
 */
const base = (folder: string, filename: string) =>
  `${import.meta.env.BASE_URL}art/${folder}/${filename}`

export const avatarArt = (filename: string) => base('avatars', filename)
export const backgroundArt = (filename: string) => base('backgrounds', filename)
export const extraArt = (filename: string) => base('extras', filename)
export const logoArt = (filename: string) => base('logos', filename)
export const iconArt = (filename: string) => base('icons', filename)
export const buttonArt = (filename: string) => base('buttons', filename)
