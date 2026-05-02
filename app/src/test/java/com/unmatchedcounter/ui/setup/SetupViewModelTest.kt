package com.unmatchedcounter.ui.setup

import android.os.Build
import androidx.arch.core.executor.testing.InstantTaskExecutorRule
import androidx.test.core.app.ApplicationProvider
import com.unmatchedcounter.CoroutineTestRule
import com.unmatchedcounter.GameRules
import com.unmatchedcounter.TestApplication
import com.unmatchedcounter.UnmatchedCharacters
import com.unmatchedcounter.model.player.PlayerColor
import com.unmatchedcounter.persistence.Datastore
import com.unmatchedcounter.persistence.DatastoreImpl
import com.unmatchedcounter.persistence.GameRepository
import com.unmatchedcounter.persistence.GameRepositoryImpl
import io.mockk.MockKAnnotations
import junit.framework.Assert.assertEquals
import junit.framework.Assert.assertFalse
import org.junit.Before
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config

@RunWith(RobolectricTestRunner::class)
@Config(sdk = [Build.VERSION_CODES.O], application = TestApplication::class)
class SetupViewModelTest {
    @get:Rule
    val instantTaskExecutorRule = InstantTaskExecutorRule()

    @get:Rule
    var coroutinesTestRule = CoroutineTestRule()

    private lateinit var gameRepository: GameRepository
    private lateinit var viewModel: SetupViewModel
    private lateinit var datastore: Datastore

    @Before
    fun setup() {
        MockKAnnotations.init(this, relaxUnitFun = true)
        datastore =
            DatastoreImpl(ApplicationProvider.getApplicationContext())
        gameRepository = GameRepositoryImpl(datastore)
        viewModel = SetupViewModel(gameRepository)
    }

    @Test
    fun initialize_creates_four_players_with_default_names() {
        assertEquals(4, viewModel.setupPlayers.value!!.size)
        assertEquals(UnmatchedCharacters.NAMES[0], viewModel.setupPlayers.value?.get(0)?.characterName)
        assertEquals(UnmatchedCharacters.NAMES[1], viewModel.setupPlayers.value?.get(1)?.characterName)
        assertEquals(UnmatchedCharacters.NAMES[2], viewModel.setupPlayers.value?.get(2)?.characterName)
        assertEquals(UnmatchedCharacters.NAMES[3], viewModel.setupPlayers.value?.get(3)?.characterName)
    }

    @Test
    fun default_player_count_is_max() {
        assertEquals(GameRules.MAX_PLAYER_COUNT, viewModel.playerCount.value!!)
        assertEquals(GameRules.MAX_PLAYER_COUNT, viewModel.getPlayersForGame().size)
    }

    @Test
    fun set_player_count_to_two_yields_two_players_for_game_but_keeps_four_in_setup() {
        viewModel.setPlayerCount(2)
        assertEquals(2, viewModel.playerCount.value!!)
        assertEquals(2, viewModel.getPlayersForGame().size)
        // Setup state still keeps 4 slots so toggling back preserves selections.
        assertEquals(4, viewModel.setupPlayers.value!!.size)
    }

    @Test
    fun toggle_player_count_back_to_four_restores_full_game_roster() {
        viewModel.setPlayerCount(2)
        viewModel.setPlayerCount(GameRules.MAX_PLAYER_COUNT)
        assertEquals(GameRules.MAX_PLAYER_COUNT, viewModel.getPlayersForGame().size)
    }

    @Test
    fun update_player_changes_to_unused_color() {
        val oldPlayers = viewModel.setupPlayers.value!!
        val allOldColors = oldPlayers.map { it.color }.toSet()
        assertEquals(4, allOldColors.size)
        val unusedColor = PlayerColor.allColors().find { !allOldColors.contains(it) }!!

        viewModel.updatePlayer(oldPlayers[1].copy(color = unusedColor))

        val newPlayers = viewModel.setupPlayers.value!!
        val allNewColors = newPlayers.map { it.color }.toSet()
        assertEquals(4, allNewColors.size)
        assertEquals(4, newPlayers.size)

        assertEquals(oldPlayers[0], newPlayers[0])
        assertEquals(oldPlayers[1].characterName, newPlayers[1].characterName)
        assertFalse(oldPlayers[1].color.equals(newPlayers[1]))
        assertEquals(oldPlayers[2], newPlayers[2])
        assertEquals(oldPlayers[3], newPlayers[3])
    }

    @Test
    fun update_player_changes_to_existing_color_swaps_color() {
        val oldPlayers = viewModel.setupPlayers.value!!
        val allOldColors = oldPlayers.map { it.color }.toSet()
        assertEquals(4, allOldColors.size)
        val oldPlayer0Color = oldPlayers[0].color
        val oldPlayer2Color = oldPlayers[2].color

        viewModel.updatePlayer(oldPlayers[2].copy(color = oldPlayer0Color))

        val newPlayers = viewModel.setupPlayers.value!!
        val allNewColors = newPlayers.map { it.color }.toSet()
        assertEquals(4, allNewColors.size)
        assertEquals(4, newPlayers.size)

        assertEquals(oldPlayer2Color, newPlayers[0].color)
        assertEquals(oldPlayers[0].id, newPlayers[0].id)
        assertEquals(oldPlayers[0].characterName, newPlayers[0].characterName)
        assertEquals(oldPlayers[1], newPlayers[1])
        assertEquals(oldPlayer0Color, newPlayers[2].color)
        assertEquals(oldPlayers[2].id, newPlayers[2].id)
        assertEquals(oldPlayers[2].characterName, newPlayers[2].characterName)
        assertEquals(oldPlayers[3], newPlayers[3])
    }
}

