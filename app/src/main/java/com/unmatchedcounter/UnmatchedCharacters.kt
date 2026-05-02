package com.unmatchedcounter

import android.graphics.Color
import androidx.annotation.ColorInt
import androidx.annotation.DrawableRes

/**
 * Playable Unmatched character names for the four life-counter seats.
 * Setup spinners show [NAMES] sorted alphabetically (case-insensitive).
 */
object UnmatchedCharacters {

    /**
     * Single source of truth for display name, life pools, labels, panel art,
     * and setup UI accent (card / spinner / avatar borders).
     */
    private enum class Fighter(
        val displayName: String,
        val segmentLabels: List<String>,
        @DrawableRes val backgroundResId: Int,
        @DrawableRes val avatarResId: Int,
        val startingLifeSegments: List<Int>,
        @ColorInt val setupAccentColorArgb: Int,
    ) {
        GERALT(
            displayName = "Geralt & Dendelion",
            segmentLabels = listOf("GERALT", "DENDELION"),
            backgroundResId = R.drawable.bg_geralt,
            avatarResId = R.drawable.avatar_geralt,
            startingLifeSegments = listOf(16, 5),
            setupAccentColorArgb = Color.parseColor("#309894"),
        ),
        BIGFOOT_JACKALOPE(
            displayName = "Bigfoot & Jackalope",
            segmentLabels = listOf("BIGFOOT", "JACKALOPE"),
            backgroundResId = R.drawable.bg_bigfoot,
            avatarResId = R.drawable.avatar_bigfoot,
            startingLifeSegments = listOf(16, 6),
            setupAccentColorArgb = Color.parseColor("#F0B586"),
        ),
        BRUCE_LEE(
            displayName = "Bruce Lee",
            segmentLabels = listOf("BRUCE LEE"),
            backgroundResId = R.drawable.bg_brucelee,
            avatarResId = R.drawable.avatar_brucelee,
            startingLifeSegments = listOf(14),
            setupAccentColorArgb = Color.parseColor("#ECBD49"),
        ),
        SYNDRA(
            displayName = "Syndra",
            segmentLabels = listOf("SYNDRA"),
            backgroundResId = R.drawable.bg_syndra,
            avatarResId = R.drawable.avatar_syndra,
            startingLifeSegments = listOf(14),
            setupAccentColorArgb = Color.parseColor("#3D25A8"),
        ),
        TASKMASTER(
            displayName = "Taskmaster",
            segmentLabels = listOf("TASKMASTER"),
            backgroundResId = R.drawable.bg_taskmaster,
            avatarResId = R.drawable.avatar_taskmaster,
            startingLifeSegments = listOf(16),
            setupAccentColorArgb = Color.parseColor("#FF8B33"),
        ),
        MULDOON_WORKERS(
            displayName = "Muldoon & Workers",
            segmentLabels = listOf("MULDOON"),
            backgroundResId = R.drawable.bg_muldoon,
            avatarResId = R.drawable.avatar_muldoon,
            startingLifeSegments = listOf(14),
            setupAccentColorArgb = Color.parseColor("#E39139"),
        ),
        CHUPACABRAS(
            displayName = "Chupacabras",
            segmentLabels = listOf("CHUPACABRAS"),
            backgroundResId = R.drawable.bg_chupacabras,
            avatarResId = R.drawable.avatar_chupacabras,
            startingLifeSegments = listOf(14),
            setupAccentColorArgb = Color.parseColor("#C0C565"),
        ),
        RAPTORS(
            displayName = "Raptors",
            segmentLabels = listOf("BLUE", "ECHO", "CHARLIE"),
            backgroundResId = R.drawable.bg_raptors,
            avatarResId = R.drawable.avatar_raptors,
            startingLifeSegments = listOf(7, 7, 7),
            setupAccentColorArgb = Color.parseColor("#AF9E49"),
        ),
        EREDIN(
            displayName = "Eredin",
            segmentLabels = listOf("EREDIN"),
            backgroundResId = R.drawable.bg_eredin,
            avatarResId = R.drawable.avatar_eredin,
            startingLifeSegments = listOf(14),
            setupAccentColorArgb = Color.parseColor("#2E302D"),
        ),
        BULLSEYE(
            displayName = "Bullseye",
            segmentLabels = listOf("BULLSEYE"),
            backgroundResId = R.drawable.bg_bullseye,
            avatarResId = R.drawable.avatar_bullseye,
            startingLifeSegments = listOf(14),
            setupAccentColorArgb = Color.parseColor("#5876A1"),
        ),
        HOUDINI_BESS(
            displayName = "Houdini & Bess",
            segmentLabels = listOf("HOUDINI", "BESS"),
            backgroundResId = R.drawable.bg_houdini,
            avatarResId = R.drawable.avatar_houdini,
            startingLifeSegments = listOf(14, 5),
            setupAccentColorArgb = Color.parseColor("#C6AD5A"),
        ),
        DAREDEVIL(
            displayName = "Daredevil",
            segmentLabels = listOf("DAREDEVIL"),
            backgroundResId = R.drawable.bg_daredevil,
            avatarResId = R.drawable.avatar_daredevil,
            startingLifeSegments = listOf(17),
            setupAccentColorArgb = Color.parseColor("#770A08"),
        ),
        LOKI(
            displayName = "Loki",
            segmentLabels = listOf("LOKI"),
            backgroundResId = R.drawable.bg_loki,
            avatarResId = R.drawable.avatar_loki,
            startingLifeSegments = listOf(16),
            setupAccentColorArgb = Color.parseColor("#354932"),
        ),
        SHERLOCK_WATSON(
            displayName = "Sherlock & Dr.Watson",
            segmentLabels = listOf("SHERLOCK", "DR. WATSON"),
            backgroundResId = R.drawable.bg_sherlock,
            avatarResId = R.drawable.avatar_sherlock,
            startingLifeSegments = listOf(16, 8),
            setupAccentColorArgb = Color.parseColor("#FFC03F"),
        ),
        ELEKTRA(
            displayName = "Elektra",
            segmentLabels = listOf("ELEKTRA"),
            backgroundResId = R.drawable.bg_elektra,
            avatarResId = R.drawable.avatar_elektra,
            startingLifeSegments = listOf(8),
            setupAccentColorArgb = Color.parseColor("#770A08"),
        ),
        ZED(
            displayName = "Zed",
            segmentLabels = listOf("ZED"),
            backgroundResId = R.drawable.bg_zed,
            avatarResId = R.drawable.avatar_zed,
            startingLifeSegments = listOf(15),
            setupAccentColorArgb = Color.parseColor("#770A08"),
        ),
        KING_ARTHUR_MERLIN(
            displayName = "Arthur & Merlin",
            segmentLabels = listOf("KING ARTHUR", "MERLIN"),
            backgroundResId = R.drawable.bg_kingarthur,
            avatarResId = R.drawable.avatar_arthur,
            startingLifeSegments = listOf(18, 7),
            setupAccentColorArgb = Color.parseColor("#2E302D"),
        ),
        MEDUSA_HARPIES(
            displayName = "Medusa",
            segmentLabels = listOf("MEDUSA"),
            backgroundResId = R.drawable.bg_medusa,
            avatarResId = R.drawable.avatar_medusa,
            startingLifeSegments = listOf(16),
            setupAccentColorArgb = Color.parseColor("#354932"),
        ),
        ALICE_JABBERWOCK(
            displayName = "Alice & Jabberwock",
            segmentLabels = listOf("ALICE", "JABBERWOCK"),
            backgroundResId = R.drawable.bg_alicia,
            avatarResId = R.drawable.avatar_alice,
            startingLifeSegments = listOf(13, 8),
            setupAccentColorArgb = Color.parseColor("#5876A1"),
        ),
        SINBAD_PORTER(
            displayName = "Sinbad & The Porter",
            segmentLabels = listOf("SINBAD", "PORTER"),
            backgroundResId = R.drawable.bg_simbad,
            avatarResId = R.drawable.avatar_simbad,
            startingLifeSegments = listOf(15, 6),
            setupAccentColorArgb = Color.parseColor("#F0B586"),
        ),
    }

    val NAMES: List<String> = Fighter.entries.map { it.displayName }

    private val SEGMENT_LABELS_BY_NAME: Map<String, List<String>> =
        Fighter.entries.associate { it.displayName to it.segmentLabels }

    private val BACKGROUND_DRAWABLE_RES_BY_NAME: Map<String, Int> =
        Fighter.entries.associate { it.displayName to it.backgroundResId }

    private val AVATAR_DRAWABLE_RES_BY_NAME: Map<String, Int> =
        Fighter.entries.associate { it.displayName to it.avatarResId }

    private val STARTING_LIFE_SEGMENTS_BY_NAME: Map<String, List<Int>> =
        Fighter.entries.associate { it.displayName to it.startingLifeSegments }

    private val SETUP_ACCENT_ARGB_BY_NAME: Map<String, Int> =
        Fighter.entries.associate { it.displayName to it.setupAccentColorArgb }

    init {
        for (f in Fighter.entries) {
            val pools = f.startingLifeSegments.size
            val labels = f.segmentLabels.size
            require(pools == labels) {
                "Fighter ${f.name}: distinto nº de pools y etiquetas ($pools vs $labels)"
            }
            require(f.startingLifeSegments.isNotEmpty()) { "Fighter ${f.name}: sin pools de vida" }
            require(f.startingLifeSegments.size <= 3) { "Fighter ${f.name}: máximo 3 pools" }
        }
    }

    /**
     * Border accent for setup card, spinner, and avatar for this fighter.
     */
    @ColorInt
    fun setupAccentColorFor(characterName: String): Int {
        require(characterName in NAMES) { "Unknown character: $characterName" }
        return SETUP_ACCENT_ARGB_BY_NAME.getValue(characterName)
    }

    /**
     * @return a non-empty list (length 1..3) of starting life values, one per pool.
     */
    fun startingLifeSegmentsFor(characterName: String): List<Int> {
        require(characterName in NAMES) { "Unknown character: $characterName" }
        return STARTING_LIFE_SEGMENTS_BY_NAME.getValue(characterName).map { it }
    }

    /**
     * @return one display string per life pool, same order and length as [startingLifeSegmentsFor].
     */
    fun segmentLabelsFor(characterName: String): List<String> {
        require(characterName in NAMES) { "Unknown character: $characterName" }
        return SEGMENT_LABELS_BY_NAME.getValue(characterName).map { it }
    }

    /** Round avatar shown on the setup card for this fighter. */
    @DrawableRes
    fun avatarDrawableResId(characterName: String): Int {
        require(characterName in NAMES) { "Unknown character: $characterName" }
        return AVATAR_DRAWABLE_RES_BY_NAME.getValue(characterName)
    }

    /** Panel art behind life digits for this fighter (one drawable per character name). */
    @DrawableRes
    fun backgroundDrawableResId(characterName: String, playerIdForFallback: Int): Int {
        val name = characterName.takeIf { it in NAMES }
            ?: NAMES.getOrElse(playerIdForFallback.coerceIn(0, NAMES.lastIndex)) { NAMES.first() }
        return BACKGROUND_DRAWABLE_RES_BY_NAME.getValue(name)
    }
}
