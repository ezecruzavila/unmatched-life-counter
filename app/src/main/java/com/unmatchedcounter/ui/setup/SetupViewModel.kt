package com.unmatchedcounter.ui.setup

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.unmatchedcounter.GameRules
import com.unmatchedcounter.UnmatchedCharacters
import com.unmatchedcounter.model.player.PlayerColor
import com.unmatchedcounter.model.player.PlayerSetupModel
import com.unmatchedcounter.persistence.GameRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class SetupViewModel @Inject constructor(
    private val gameRepository: GameRepository,
) : ViewModel() {

    companion object {
        // Always keep 4 player slots in memory so toggling 4 → 2 → 4 preserves selections.
        const val PLAYER_COUNT = GameRules.MAX_PLAYER_COUNT
    }

    private val _hideNavigation = MutableLiveData<Boolean>()
    val hideNavigation: LiveData<Boolean> get() = _hideNavigation

    private val _setupPlayers = MutableLiveData<List<PlayerSetupModel>>()
    val setupPlayers: LiveData<List<PlayerSetupModel>> get() = _setupPlayers

    private val _playerCount = MutableLiveData<Int>(GameRules.MAX_PLAYER_COUNT)
    val playerCount: LiveData<Int> get() = _playerCount

    private val playerColors = PlayerColor.allColors()

    init {
        refresh()
    }

    fun refresh() {
        viewModelScope.launch {
            rebuildSetupPlayerList()
            _hideNavigation.value = gameRepository.hideNavigation
        }
    }

    private fun defaultCharacterName(index: Int): String =
        UnmatchedCharacters.NAMES.getOrElse(index) { UnmatchedCharacters.NAMES.first() }

    private fun rebuildSetupPlayerList() {
        val number = PLAYER_COUNT
        val newList = (_setupPlayers.value?.take(number))?.map { player ->
            player.copy(
                startingLifeSegments = UnmatchedCharacters.startingLifeSegmentsFor(player.characterName),
            )
        }?.toMutableList() ?: mutableListOf()
        while (newList.size < number) {
            val i = newList.size
            val name = defaultCharacterName(i)
            newList.add(
                PlayerSetupModel(
                    id = i,
                    characterName = name,
                    color = playerColors.find { c -> newList.none { it.color == c } }
                        ?: PlayerColor.NONE,
                    startingLifeSegments = UnmatchedCharacters.startingLifeSegmentsFor(name),
                )
            )
        }
        _setupPlayers.value = newList
    }

    fun setPlayerCharacter(playerId: Int, characterName: String) {
        if (playerId !in 0 until PLAYER_COUNT) return
        if (characterName !in UnmatchedCharacters.NAMES) return
        _setupPlayers.value?.let { list ->
            _setupPlayers.value = list.map {
                if (it.id == playerId) {
                    it.copy(
                        characterName = characterName,
                        startingLifeSegments = UnmatchedCharacters.startingLifeSegmentsFor(characterName),
                    )
                } else {
                    it
                }
            }
        }
    }

    fun setPlayerCount(count: Int) {
        require(count in GameRules.SUPPORTED_PLAYER_COUNTS) {
            "Unsupported player count: $count"
        }
        if (_playerCount.value == count) return
        _playerCount.value = count
    }

    fun setHideNavigation(hideNavigation: Boolean) {
        gameRepository.hideNavigation = hideNavigation
        _hideNavigation.value = hideNavigation
    }

    fun findSetupPlayerById(id: Int): PlayerSetupModel? {
        return _setupPlayers.value?.find { it.id == id }
    }

    fun updatePlayer(playerSetupModel: PlayerSetupModel) {
        _setupPlayers.value?.let { playerList ->
            playerList.find { it.id == playerSetupModel.id }?.let { existingPlayer ->
                val existingColor = existingPlayer.color
                _setupPlayers.value = playerList.map {
                    if (it.id == playerSetupModel.id) {
                        val name = playerSetupModel.characterName
                        playerSetupModel.copy(
                            startingLifeSegments = UnmatchedCharacters.startingLifeSegmentsFor(name),
                        )
                    } else if (it.color == playerSetupModel.color) {
                        it.copy(color = existingColor)
                    } else {
                        it
                    }
                }
            }
        }
    }

    /** Only the active players (according to [playerCount]) are sent to the game. */
    fun getPlayersForGame(): List<PlayerSetupModel> {
        val active = _playerCount.value ?: GameRules.MAX_PLAYER_COUNT
        return _setupPlayers.value
            ?.take(active)
            ?.map { player ->
                player.copy(
                    startingLifeSegments = UnmatchedCharacters.startingLifeSegmentsFor(player.characterName),
                )
            } ?: emptyList()
    }
}
