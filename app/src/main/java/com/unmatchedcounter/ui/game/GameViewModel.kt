package com.unmatchedcounter.ui.game

import androidx.lifecycle.*
import com.unmatchedcounter.R
import com.unmatchedcounter.UnmatchedCharacters
import com.unmatchedcounter.model.player.PlayerModel
import com.unmatchedcounter.model.player.PlayerSetupModel
import com.unmatchedcounter.persistence.GameRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import java.lang.IllegalArgumentException
import javax.inject.Inject

@HiltViewModel
class GameViewModel @Inject constructor(
    private val gameRepository: GameRepository,
    savedStateHandle: SavedStateHandle
) : ViewModel() {

    private val setupPlayers =
        savedStateHandle.get<List<PlayerSetupModel>>(GameActivity.ARGS_SETUP_PLAYERS)
            ?: throw IllegalArgumentException("PlayerSetupModels must be passed in intent")

    /** Number of seats in this game (matches the tabletop layout in use). */
    val playerCount: Int = setupPlayers.size

    private val playerMap: MutableMap<Int, GamePlayerUiModel> = mutableMapOf()

    private val _players = MutableLiveData<List<GamePlayerUiModel>>()
    val players: LiveData<List<GamePlayerUiModel>> = _players

    private val _hideNavigation = MutableLiveData<Boolean>()
    val hideNavigation: LiveData<Boolean> = _hideNavigation

    init {
        _hideNavigation.value = gameRepository.hideNavigation
        initializePlayers()
    }

    private fun initializePlayers() {
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
                )
            )
            playerMap[i] = player
        }
        _players.value = playerMap.values.toList()
    }

    fun incrementPlayerLife(playerId: Int, lifeDifference: Int = 1, segmentIndex: Int = 0) {
        playerMap[playerId]?.let { player ->
            val segs = player.model.lifeSegments.toMutableList()
            if (segmentIndex !in segs.indices) return@let
            val max = player.model.lifeSegmentMaximums[segmentIndex]
            segs[segmentIndex] = (segs[segmentIndex] + lifeDifference).coerceIn(0, max)
            player.model = player.model.copy(lifeSegments = segs)
            _players.value = playerMap.values.toList()
        }
    }

    fun setHideNavigation(hideNavigation: Boolean) {
        gameRepository.hideNavigation = hideNavigation
        _hideNavigation.value = hideNavigation
    }

    fun resetGame() {
        initializePlayers()
    }
}
