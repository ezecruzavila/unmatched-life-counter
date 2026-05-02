package com.unmatchedcounter.model.player

import android.os.Parcelable
import androidx.annotation.ColorRes
import com.unmatchedcounter.util.LifeSegmentUtils
import kotlinx.parcelize.Parcelize

@Parcelize
data class PlayerModel(
    val id: Int,
    /** Canonical fighter name from [com.unmatchedcounter.UnmatchedCharacters.NAMES]. */
    val characterName: String,
    /**
     * One display name per life pool (same order as [lifeSegments]), from
     * [com.unmatchedcounter.UnmatchedCharacters] for the chosen character.
     */
    val lifeSegmentLabels: List<String> = listOf(""),
    /** Per-pool ceiling (starting life at game begin); current value never exceeds this. */
    val lifeSegmentMaximums: List<Int> = listOf(0),
    val lifeSegments: List<Int> = listOf(0),
    @ColorRes val colorResId: Int = 0,
) : Parcelable {
    init {
        require(lifeSegments.isNotEmpty() && lifeSegments.size <= LifeSegmentUtils.MAX_LIFE_SEGMENTS) {
            "lifeSegments must have 1..${LifeSegmentUtils.MAX_LIFE_SEGMENTS} values"
        }
        require(lifeSegmentLabels.size == lifeSegments.size) {
            "lifeSegmentLabels must have the same size as lifeSegments"
        }
        require(lifeSegmentMaximums.size == lifeSegments.size) {
            "lifeSegmentMaximums must match lifeSegments size"
        }
    }
}
