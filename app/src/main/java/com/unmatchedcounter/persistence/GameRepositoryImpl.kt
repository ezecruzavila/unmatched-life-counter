package com.unmatchedcounter.persistence

import com.unmatchedcounter.GameRules
import javax.inject.Inject

class GameRepositoryImpl @Inject constructor(
    private val datastore: Datastore,
) : GameRepository {
    override val startingLife: Int
        get() = GameRules.STARTING_LIFE

    override var hideNavigation: Boolean
        get() = datastore.hideNavigation
        set(value) {
            datastore.hideNavigation = value
        }
}
