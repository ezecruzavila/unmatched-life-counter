import { useState } from 'react'
import {
  useAppState,
  setPlayerCount,
  goToSetup,
  clearCacheAndReload,
} from '../state/gameStore'
import { SUPPORTED_PLAYER_COUNTS } from '../domain/gameRules'
import { backgroundArt, iconArt, logoArt } from '../art'

/** Player-count icon assets (white glyphs with black stroke). */
const COUNT_ICON: Record<number, string> = {
  2: '2_players_icon.png',
  4: '4_players_icon.png',
}

/**
 * Landing screen shown before character selection. ALWAYS portrait, regardless
 * of device orientation. Holds the logo, version, the player-count toggle, an
 * info panel (rules), and a maintenance action to clear the cache. Keeping this
 * chrome here declutters the (landscape) character-selection screen, which is
 * left with just the four cards and a START button.
 */
export function HomeScreen() {
  const { playerCount } = useAppState()
  const [showInfo, setShowInfo] = useState(false)
  const [confirmClear, setConfirmClear] = useState(false)

  return (
    <div className="home">
      {/* Decorative full-bleed background (character art around a dark centre). */}
      <img
        className="home__bg"
        src={backgroundArt('main_ui_bg.png')}
        alt=""
        aria-hidden
      />

      <button
        type="button"
        className="home__info-btn"
        onClick={() => setShowInfo(true)}
        title="Info & rules"
        aria-label="Info and rules"
      >
        <InfoIcon />
      </button>

      <div className="home__body">
        <img className="home__logo" src={logoArt('unmatched_logo.png')} alt="Unmatched Life Counter" />

        <span className="home__label">PLAYERS</span>
        <div className="home__count" role="group" aria-label="Player count">
          {SUPPORTED_PLAYER_COUNTS.map((count) => (
            <button
              key={count}
              type="button"
              className={`count-btn ${playerCount === count ? 'count-btn--active' : ''}`}
              onClick={() => setPlayerCount(count)}
              aria-pressed={playerCount === count}
            >
              <img className="count-btn__icon" src={iconArt(COUNT_ICON[count])} alt="" aria-hidden />
              <span>{count}</span>
            </button>
          ))}
        </div>

        <button type="button" className="home__continue" onClick={goToSetup}>
          CONTINUE
        </button>
      </div>

      {/* Footer: version + credits (source repo, hosting) on the left, cache
          maintenance on the right. Links use labels + icons rather than raw
          URLs, the usual convention for app footers. */}
      <footer className="home__footer">
        <span className="home__credit">
          <span className="home__ver">v{__APP_VERSION__}</span>
          <a
            className="home__link"
            href="https://github.com/ezecruzavila/unmatched-life-counter"
            target="_blank"
            rel="noopener noreferrer"
          >
            <GithubIcon />
            Source
          </a>
          <a
            className="home__link"
            href="https://render.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            Hosted on Render
          </a>
        </span>
        <button
          type="button"
          className="home__clear-btn"
          onClick={() => setConfirmClear(true)}
        >
          Clear cache
        </button>
      </footer>

      {showInfo && (
        <div className="dialog__overlay" onClick={() => setShowInfo(false)}>
          <div
            className="dialog dialog--wide"
            role="dialog"
            aria-modal="true"
            aria-label="Info and rules"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="dialog__title">Info &amp; Rules</h2>
            <div className="dialog__message">
              {/* Placeholder — rules content goes here. */}
              <p>Tap the top half of a life pool to add, the bottom half to subtract.</p>
              <p>Set the player count and characters, then start the game.</p>
            </div>
            <div className="dialog__actions">
              <button
                type="button"
                className="dialog__btn dialog__btn--primary"
                onClick={() => setShowInfo(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmClear && (
        <div className="dialog__overlay" onClick={() => setConfirmClear(false)}>
          <div
            className="dialog"
            role="alertdialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="dialog__title">Clear Cache</h2>
            <p className="dialog__message">
              This clears saved data and cached files, then reloads the latest
              version. Your current selection will be lost. Continue?
            </p>
            <div className="dialog__actions">
              <button
                type="button"
                className="dialog__btn"
                onClick={() => setConfirmClear(false)}
              >
                No
              </button>
              <button
                type="button"
                className="dialog__btn dialog__btn--primary"
                onClick={() => {
                  void clearCacheAndReload()
                }}
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/** GitHub mark (Octocat silhouette). */
function GithubIcon() {
  return (
    <svg viewBox="0 0 16 16" width="13" height="13" aria-hidden="true" fill="currentColor">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
    </svg>
  )
}

function InfoIcon() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="8" r="1.4" fill="currentColor" />
      <path d="M12 11v6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}
