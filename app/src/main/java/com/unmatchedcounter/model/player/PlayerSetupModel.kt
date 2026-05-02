package com.unmatchedcounter.model.player

import android.os.Parcelable
import com.unmatchedcounter.GameRules
import com.unmatchedcounter.UnmatchedCharacters
import com.unmatchedcounter.util.LifeSegmentUtils
import kotlinx.parcelize.Parcelize

@Parcelize
data class PlayerSetupModel(
    val id: Int = 0,
    val characterName: String = UnmatchedCharacters.NAMES.first(),
    val color: PlayerColor = PlayerColor.NONE,
    val startingLifeSegments: List<Int> = listOf(GameRules.STARTING_LIFE),
) : Parcelable {

    init {
        require(startingLifeSegments.isNotEmpty() && startingLifeSegments.size <= LifeSegmentUtils.MAX_LIFE_SEGMENTS) {
            "startingLifeSegments must have 1..${LifeSegmentUtils.MAX_LIFE_SEGMENTS} values"
        }
    }
}
