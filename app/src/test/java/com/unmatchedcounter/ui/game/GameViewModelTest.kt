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
