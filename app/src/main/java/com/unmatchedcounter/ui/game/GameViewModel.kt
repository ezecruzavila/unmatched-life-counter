package com.unmatchedcounter.ui.game

import androidx.lifecycle.*
import com.unmatchedcounter.R
import com.unmatchedcounter.UnmatchedCharacters
import com.unmatchedcounter.model.player.ExtraButtonSpec
import com.unmatchedcounter.model.player.PlayerModel
import com.unmatchedcounter.model.player.PlayerSetupModel
import com.unmatchedcounter.persistence.GameRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import java.lang.IllegalArgumentException
import javax.inject.Inject

@HiltViewModel
class GameViewModel @Inject constructor(
    private val gameRepository: GameRepository,
    private val savedStateHandle: SavedStateHandle
) : ViewModel() {

    companion object {
        /** Live per-player state, persisted so a config change keeps the game. */
        private const val KEY_PLAYERS = "game_players"
    }

    private val setupPlayers =
        savedStateHandle.get<List<PlayerSetupModel>>(GameActivity.ARGS_SETUP_PLAYERS)
            ?: throw IllegalArgumentException("PlayerSetupModels must be passed in intent")

    /** Number of seats in this game (matches the tabletop layout in use). */
    val playerCount: Int = setupPlayers.size

    private val playerMap: MutableMap<Int, GamePlayerUiModel> = mutableMapOf()

    private val _players = MutableLiveData<List<GamePlayerUiModel>>()
    /** Full snapshot; observe for the initial bind and full refreshes (e.g. reset). */
    val players: LiveData<List<GamePlayerUiModel>> = _players

    /**
     * Id of the single player that just changed, for incremental UI updates on
     * the hot path (life ticks, extra button). Lets the view re-bind one seat
     * instead of all of them. Null/cleared after a full [players] refresh.
     */
    private val _playerChanged = MutableLiveData<Int>()
    val playerChanged: LiveData<Int> = _playerChanged

    private val _hideNavigation = MutableLiveData<Boolean>()
    val hideNavigation: LiveData<Boolean> = _hideNavigation

    init {
        _hideNavigation.value = gameRepository.hideNavigation
        // Restore live state across config changes / process death; only fall
        // back to fresh starting values on the very first launch of the game.
        val saved = savedStateHandle.get<ArrayList<PlayerModel>>(KEY_PLAYERS)
        if (saved != null) {
            restorePlayers(saved)
        } else {
            initializePlayers()
        }
    }

    /** Rebuild [playerMap] from a previously persisted list of models. */
    private fun restorePlayers(models: List<PlayerModel>) {
        playerMap.clear()
        models.forEachIndexed { i, model -> playerMap[i] = GamePlayerUiModel(model) }
        publishAll()
    }

    private fun initializePlayers() {
        playerMap.clear()
        for (i in setupPlayers.indices) {
            val setup = setupPlayers[i]
            val lifeSegments = setup.startingLifeSegments
            val lifeSegmentLabels = UnmatchedCharacters.segmentLabelsFor(setup.characterName)
            val player = GamePlayerUiModel(
                PlayerModel(
                    id = setup.id,
                    characterName = setup.characterName,
                    lifeSegmentLabels = lifeSegmentLabels,
                    lifeSegmentMaximums = lifeSegments,
                    lifeSegments = lifeSegments,
                    colorResId = setup.color.resId ?: R.color.white,
                    extraButtonValue = UnmatchedCharacters.extraButtonFor(setup.characterName)
                        ?.initialValue,
                )
            )
            playerMap[i] = player
        }
        publishAll()
    }

    /** Full refresh: emit the whole list (initial bind / reset). */
    private fun publishAll() {
        _players.value = playerMap.values.toList()
    }

    /**
     * Hot-path update: notify observers that only [playerId] changed. Avoids
     * re-binding every seat (and reloading every background) for a single tick.
     * Persistence is deferred to [persistState] (called on pause), not here.
     */
    private fun publishChanged(playerId: Int) {
        _playerChanged.value = playerId
    }

    /** Persist current state so the game survives recreation. Call on pause. */
    fun persistState() {
        savedStateHandle[KEY_PLAYERS] = ArrayList(playerMap.values.map { it.model })
    }

    fun incrementPlayerLife(playerId: Int, lifeDifference: Int = 1, segmentIndex: Int = 0) {
        playerMap[playerId]?.let { player ->
            val segs = player.model.lifeSegments.toMutableList()
            if (segmentIndex !in segs.indices) return@let
            val max = player.model.lifeSegmentMaximums[segmentIndex]
            segs[segmentIndex] = (segs[segmentIndex] + lifeDifference).coerceIn(0, max)
            player.model = player.model.copy(lifeSegments = segs)
            publishChanged(playerId)
        }
    }

    /**
     * Advance the floating extra button for [playerId]: decrement (wrapping) for a
     * counter, or cycle to the next state for a toggle. No-op if the player has no
     * extra button.
     */
    fun onExtraButtonClicked(playerId: Int) {
        val player = playerMap[playerId] ?: return
        val current = player.model.extraButtonValue ?: return
        val spec = UnmatchedCharacters.extraButtonFor(player.model.characterName) ?: return
        val next = when (spec) {
            is ExtraButtonSpec.Counter -> spec.nextValue(current)
            is ExtraButtonSpec.Toggle -> spec.nextValue(current)
        }
        player.model = player.model.copy(extraButtonValue = next)
        publishChanged(playerId)
    }

    /** Current model for [playerId], or null. Used for incremental re-binds. */
    fun playerAt(playerId: Int): GamePlayerUiModel? = playerMap[playerId]

    fun setHideNavigation(hideNavigation: Boolean) {
        gameRepository.hideNavigation = hideNavigation
        _hideNavigation.value = hideNavigation
    }

    fun resetGame() {
        initializePlayers()
    }
}
