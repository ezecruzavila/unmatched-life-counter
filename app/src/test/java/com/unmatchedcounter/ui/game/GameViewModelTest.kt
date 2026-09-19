package com.unmatchedcounter.ui.game

import android.os.Build
import androidx.arch.core.executor.testing.InstantTaskExecutorRule
import androidx.lifecycle.SavedStateHandle
import androidx.test.core.app.ApplicationProvider
import com.unmatchedcounter.CoroutineTestRule
import com.unmatchedcounter.TestApplication
import com.unmatchedcounter.UnmatchedCharacters
import com.unmatchedcounter.model.player.PlayerColor
import com.unmatchedcounter.model.player.PlayerSetupModel
import com.unmatchedcounter.persistence.Datastore
import com.unmatchedcounter.persistence.DatastoreImpl
import com.unmatchedcounter.persistence.GameRepository
import com.unmatchedcounter.persistence.GameRepositoryImpl
import io.mockk.MockKAnnotations
import junit.framework.Assert.assertEquals
import org.junit.Before
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config

@RunWith(RobolectricTestRunner::class)
@Config(sdk = [Build.VERSION_CODES.O], application = TestApplication::class)
class GameViewModelTest {
    @get:Rule
    val instantTaskExecutorRule = InstantTaskExecutorRule()

    @get:Rule
    var coroutinesTestRule = CoroutineTestRule()

    private lateinit var gameRepository: GameRepository
    private lateinit var savedStateHandle: SavedStateHandle
    private lateinit var viewModel: GameViewModel
    private lateinit var datastore: Datastore

    @Before
    fun setup() {
        MockKAnnotations.init(this, relaxUnitFun = true)
        datastore =
            DatastoreImpl(ApplicationProvider.getApplicationContext())
        gameRepository = GameRepositoryImpl(datastore)

        savedStateHandle = SavedStateHandle(
            mapOf(
                GameActivity.ARGS_SETUP_PLAYERS to listOf(
                    PlayerSetupModel(
                        id = 0,
                        characterName = UnmatchedCharacters.NAMES[0],
                        color = PlayerColor.BLUE,
                        startingLifeSegments = UnmatchedCharacters.startingLifeSegmentsFor(
                            UnmatchedCharacters.NAMES[0]
                        ),
                    ),
                    PlayerSetupModel(
                        id = 1,
                        characterName = UnmatchedCharacters.NAMES[1],
                        color = PlayerColor.RED,
                        startingLifeSegments = UnmatchedCharacters.startingLifeSegmentsFor(
                            UnmatchedCharacters.NAMES[1]
                        ),
                    ),
                    PlayerSetupModel(
                        id = 2,
                        characterName = UnmatchedCharacters.NAMES[2],
                        color = PlayerColor.GREEN,
                        startingLifeSegments = UnmatchedCharacters.startingLifeSegmentsFor(
                            UnmatchedCharacters.NAMES[2]
                        ),
                    ),
                    PlayerSetupModel(
                        id = 3,
                        characterName = UnmatchedCharacters.NAMES[3],
                        color = PlayerColor.ORANGE,
                        startingLifeSegments = UnmatchedCharacters.startingLifeSegmentsFor(
                            UnmatchedCharacters.NAMES[3]
                        ),
                    ),
                )
            )
        )
        viewModel = GameViewModel(gameRepository, savedStateHandle)
    }

    @Test
    fun players_created_with_life_only() {
        assertEquals(4, viewModel.players.value?.size)
        val expected0 =
            UnmatchedCharacters.startingLifeSegmentsFor(UnmatchedCharacters.NAMES[0]).sum()
        assertEquals(expected0, viewModel.players.value!![0].model.lifeSegments.sum())
    }

    @Test
    fun player_count_matches_setup_players_size() {
        assertEquals(4, viewModel.playerCount)
    }

    @Test
    fun two_player_game_creates_only_two_players_and_reports_count_two() {
        val twoPlayers = SavedStateHandle(
            mapOf(
                GameActivity.ARGS_SETUP_PLAYERS to listOf(
                    PlayerSetupModel(
                        id = 0,
                        characterName = UnmatchedCharacters.NAMES[0],
                        color = PlayerColor.BLUE,
                        startingLifeSegments = UnmatchedCharacters.startingLifeSegmentsFor(
                            UnmatchedCharacters.NAMES[0]
                        ),
                    ),
                    PlayerSetupModel(
                        id = 1,
                        characterName = UnmatchedCharacters.NAMES[1],
                        color = PlayerColor.RED,
                        startingLifeSegments = UnmatchedCharacters.startingLifeSegmentsFor(
                            UnmatchedCharacters.NAMES[1]
                        ),
                    ),
                )
            )
        )
        val vm = GameViewModel(gameRepository, twoPlayers)
        assertEquals(2, vm.playerCount)
        assertEquals(2, vm.players.value!!.size)
    }

    @Test
    fun increment_life_updates_players_after_damage() {
        // All pools start at max; +1 on first segment must not go over max.
        val base0 = viewModel.players.value!![0].model.lifeSegments.sum()
        viewModel.incrementPlayerLife(0, 1)
        assertEquals(base0, viewModel.players.value!![0].model.lifeSegments.sum())

        // After damage, healing increases up to the original max.
        viewModel.incrementPlayerLife(0, -5, 0)
        val afterDamage0 = viewModel.players.value!![0].model.lifeSegments.sum()
        viewModel.incrementPlayerLife(0, 3, 0)
        assertEquals(afterDamage0 + 3, viewModel.players.value!![0].model.lifeSegments.sum())
    }

    @Test
    fun increment_life_allows_negative() {
        val base0 = viewModel.players.value!![0].model.lifeSegments.sum()
        viewModel.incrementPlayerLife(0, -1)

        assertEquals(4, viewModel.players.value?.size)
        assertEquals(base0 - 1, viewModel.players.value!![0].model.lifeSegments.sum())
    }

    @Test
    fun increment_life_does_nothing_when_player_id_not_found() {
        val before = viewModel.players.value!!.map { it.model.lifeSegments.sum() }
        viewModel.incrementPlayerLife(-1, 1)
        viewModel.incrementPlayerLife(4, 1)

        assertEquals(4, viewModel.players.value?.size)
        assertEquals(before[0], viewModel.players.value!![0].model.lifeSegments.sum())
        assertEquals(before[1], viewModel.players.value!![1].model.lifeSegments.sum())
        assertEquals(before[2], viewModel.players.value!![2].model.lifeSegments.sum())
        assertEquals(before[3], viewModel.players.value!![3].model.lifeSegments.sum())
    }

    @Test
    fun increment_life_segment_independent() {
        val onlyTwoSegments = SavedStateHandle(
            mapOf(
                GameActivity.ARGS_SETUP_PLAYERS to listOf(
                    PlayerSetupModel(
                        id = 0,
                        characterName = UnmatchedCharacters.NAMES[0],
                        color = PlayerColor.BLUE,
                        startingLifeSegments = listOf(8, 7),
                    )
                )
            )
        )
        val vm = GameViewModel(gameRepository, onlyTwoSegments)
        assertEquals(listOf(8, 7), vm.players.value!![0].model.lifeSegments)
        vm.incrementPlayerLife(0, 1, 0)
        assertEquals(15, vm.players.value!![0].model.lifeSegments.sum())
        assertEquals(8, vm.players.value!![0].model.lifeSegments[0])
        assertEquals(7, vm.players.value!![0].model.lifeSegments[1])
    }

    @Test
    fun player_models_created_from_setup() {
        val players = viewModel.players.value!!
        assertEquals(4, players.size)
        assertEquals(0, players[0].model.id)
        assertEquals(UnmatchedCharacters.NAMES[0], players[0].model.characterName)
        assertEquals(PlayerColor.BLUE.resId, players[0].model.colorResId)
        val start0 = UnmatchedCharacters.startingLifeSegmentsFor(UnmatchedCharacters.NAMES[0])
        assertEquals(start0, players[0].model.lifeSegments)
        assertEquals(start0, players[0].model.lifeSegmentMaximums)
    }

    private fun handleFor(vararg characterNames: String): SavedStateHandle =
        SavedStateHandle(
            mapOf(
                GameActivity.ARGS_SETUP_PLAYERS to characterNames.mapIndexed { i, name ->
                    PlayerSetupModel(
                        id = i,
                        characterName = name,
                        color = PlayerColor.allColors()[i % PlayerColor.allColors().size],
                        startingLifeSegments = UnmatchedCharacters.startingLifeSegmentsFor(name),
                    )
                }
            )
        )

    private fun vmFor(vararg characterNames: String): GameViewModel =
        GameViewModel(gameRepository, handleFor(*characterNames))

    @Test
    fun life_change_emits_only_the_changed_player_id() {
        val vm = vmFor(UnmatchedCharacters.NAMES[0], UnmatchedCharacters.NAMES[1])
        vm.incrementPlayerLife(1, -1, 0)
        // Hot-path update targets a single seat for incremental re-bind.
        assertEquals(1, vm.playerChanged.value)
    }

    @Test
    fun player_at_returns_current_model() {
        val vm = vmFor("Muldoon & Workers")
        vm.onExtraButtonClicked(0) // 8 -> 7
        assertEquals(7, vm.playerAt(0)!!.model.extraButtonValue)
        assertEquals(null, vm.playerAt(99))
    }

    @Test
    fun life_changes_survive_recreation_from_same_handle() {
        val handle = handleFor(UnmatchedCharacters.NAMES[0])
        val vm = GameViewModel(gameRepository, handle)
        val start = vm.players.value!![0].model.lifeSegments.sum()
        vm.incrementPlayerLife(0, -4, 0)
        val afterDamage = vm.players.value!![0].model.lifeSegments.sum()
        assertEquals(start - 4, afterDamage)

        // State is persisted when the screen leaves the foreground (Activity.onPause).
        vm.persistState()
        // Recreate the VM from the same handle (simulates a config change).
        val recreated = GameViewModel(gameRepository, handle)
        assertEquals(afterDamage, recreated.players.value!![0].model.lifeSegments.sum())
    }

    @Test
    fun extra_button_value_survives_recreation_from_same_handle() {
        val handle = handleFor("Muldoon & Workers", "Schrödinger's Cat")
        val vm = GameViewModel(gameRepository, handle)
        vm.onExtraButtonClicked(0) // Muldoon 8 -> 7
        vm.onExtraButtonClicked(1) // Schrödinger UNCERTAIN -> OBSERVED
        vm.persistState()

        val recreated = GameViewModel(gameRepository, handle)
        assertEquals(7, recreated.players.value!![0].model.extraButtonValue)
        assertEquals(1, recreated.players.value!![1].model.extraButtonValue)
    }

    @Test
    fun extra_button_null_for_character_without_one() {
        // NAMES[0] (Geralt) has no extra button configured.
        val vm = vmFor(UnmatchedCharacters.NAMES[0])
        assertEquals(null, vm.players.value!![0].model.extraButtonValue)
        // Clicking is a no-op and leaves it null.
        vm.onExtraButtonClicked(0)
        assertEquals(null, vm.players.value!![0].model.extraButtonValue)
    }

    @Test
    fun muldoon_counter_starts_at_8_and_decrements() {
        val vm = vmFor("Muldoon & Workers")
        assertEquals(8, vm.players.value!![0].model.extraButtonValue)
        vm.onExtraButtonClicked(0)
        assertEquals(7, vm.players.value!![0].model.extraButtonValue)
        vm.onExtraButtonClicked(0)
        assertEquals(6, vm.players.value!![0].model.extraButtonValue)
    }

    @Test
    fun muldoon_counter_wraps_from_zero_back_to_8() {
        val vm = vmFor("Muldoon & Workers")
        repeat(8) { vm.onExtraButtonClicked(0) } // 8 -> 0
        assertEquals(0, vm.players.value!![0].model.extraButtonValue)
        vm.onExtraButtonClicked(0) // 0 -> 8
        assertEquals(8, vm.players.value!![0].model.extraButtonValue)
    }

    @Test
    fun schrodinger_toggle_starts_uncertain_and_alternates() {
        val vm = vmFor("Schrödinger's Cat")
        // Initial state index 0 == UNCERTAIN.
        assertEquals(0, vm.players.value!![0].model.extraButtonValue)
        vm.onExtraButtonClicked(0)
        assertEquals(1, vm.players.value!![0].model.extraButtonValue) // OBSERVED
        vm.onExtraButtonClicked(0)
        assertEquals(0, vm.players.value!![0].model.extraButtonValue) // back to UNCERTAIN
    }

    @Test
    fun reset_restores_extra_button_initial_values() {
        val vm = vmFor("Muldoon & Workers", "Schrödinger's Cat")
        vm.onExtraButtonClicked(0) // Muldoon 8 -> 7
        vm.onExtraButtonClicked(1) // Schrödinger UNCERTAIN -> OBSERVED
        assertEquals(7, vm.players.value!![0].model.extraButtonValue)
        assertEquals(1, vm.players.value!![1].model.extraButtonValue)

        vm.resetGame()
        assertEquals(8, vm.players.value!![0].model.extraButtonValue)
        assertEquals(0, vm.players.value!![1].model.extraButtonValue)
    }

    @Test
    fun life_segment_labels_follow_chosen_character() {
        val players = viewModel.players.value!!
        val c0 = players[0].model
        assertEquals(
            UnmatchedCharacters.segmentLabelsFor(UnmatchedCharacters.NAMES[0]),
            c0.lifeSegmentLabels
        )
        assertEquals(c0.lifeSegments.size, c0.lifeSegmentLabels.size)
        val c1 = players[1].model
        assertEquals(
            UnmatchedCharacters.segmentLabelsFor(UnmatchedCharacters.NAMES[1]),
            c1.lifeSegmentLabels
        )
    }
}
