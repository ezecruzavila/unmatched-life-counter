package com.unmatchedcounter.ui.setup

import android.graphics.Outline
import android.os.Bundle
import android.util.TypedValue
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.view.ViewOutlineProvider
import android.widget.AdapterView
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.Spinner
import androidx.core.content.ContextCompat
import androidx.fragment.app.Fragment
import androidx.fragment.app.activityViewModels
import com.unmatchedcounter.GameRules
import com.unmatchedcounter.R
import com.unmatchedcounter.UnmatchedCharacters
import com.unmatchedcounter.ui.game.GameActivity
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class SetupFragment : Fragment() {

    companion object {
        fun newInstance() = SetupFragment()
        // Cards beyond this index get visually disabled when only 2 players are selected.
        private const val FIRST_OPTIONAL_PLAYER_INDEX = GameRules.MIN_PLAYER_COUNT
        // Cap how many character rows the dropdown shows at once; the rest scroll.
        private const val SPINNER_DROPDOWN_VISIBLE_ITEMS = 6
    }

    private lateinit var startButton: View

    private lateinit var cardBackgroundDrawables: Array<SetupPlayerCardBackgroundDrawable>

    private lateinit var playerCards: Array<View>
    private lateinit var avatarImages: Array<ImageView>
    private lateinit var spinnerRows: Array<LinearLayout>
    private lateinit var spinners: List<Spinner>

    private lateinit var playerCountOption2: LinearLayout
    private lateinit var playerCountOption4: LinearLayout

    private val viewModel: SetupViewModel by activityViewModels()

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        super.onCreateView(inflater, container, savedInstanceState)
        return inflater.inflate(R.layout.fragment_setup, container, false)
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        playerCards = arrayOf(
            view.findViewById(R.id.setup_card_player_0),
            view.findViewById(R.id.setup_card_player_1),
            view.findViewById(R.id.setup_card_player_2),
            view.findViewById(R.id.setup_card_player_3),
        )
        avatarImages = arrayOf(
            view.findViewById(R.id.setup_avatar_image_0),
            view.findViewById(R.id.setup_avatar_image_1),
            view.findViewById(R.id.setup_avatar_image_2),
            view.findViewById(R.id.setup_avatar_image_3),
        )
        spinnerRows = arrayOf(
            view.findViewById(R.id.setup_spinner_row_0),
            view.findViewById(R.id.setup_spinner_row_1),
            view.findViewById(R.id.setup_spinner_row_2),
            view.findViewById(R.id.setup_spinner_row_3),
        )

        applySetupCardBackgrounds(view)
        view.findViewById<ImageView>(R.id.setup_center_logo).clipToCircle()
        avatarImages.forEach { it.clipToCircle() }

        val names = UnmatchedCharacters.NAMES.sortedWith(String.CASE_INSENSITIVE_ORDER)
        spinners = listOf(
            view.findViewById(R.id.player_0_character_spinner),
            view.findViewById(R.id.player_1_character_spinner),
            view.findViewById(R.id.player_2_character_spinner),
            view.findViewById(R.id.player_3_character_spinner),
        )
        val suppressSpinnerCallback = BooleanArray(spinners.size) { false }
        spinners.forEachIndexed { index, spinner ->
            val adapter = CharacterSpinnerAdapter(requireContext(), names)
            spinner.adapter = adapter
            spinner.bindDropdownToCharacterField(SPINNER_DROPDOWN_VISIBLE_ITEMS)
            val listener = object : AdapterView.OnItemSelectedListener {
                override fun onItemSelected(
                    parent: AdapterView<*>?,
                    v: View?,
                    position: Int,
                    id: Long
                ) {
                    if (suppressSpinnerCallback[index]) return
                    val name = names.getOrNull(position) ?: return
                    viewModel.setPlayerCharacter(index, name)
                }

                override fun onNothingSelected(parent: AdapterView<*>?) {}
            }
            spinner.onItemSelectedListener = listener
        }

        viewModel.setupPlayers.observe(viewLifecycleOwner) { players ->
            players.forEachIndexed { index, model ->
                if (index !in spinners.indices) return@forEachIndexed
                updatePlayerSlotAccent(model.characterName, index)

                val name = model.characterName
                val pos = names.indexOf(name)
                if (pos < 0) return@forEachIndexed
                val spinner = spinners[index]
                if (spinner.selectedItemPosition == pos) return@forEachIndexed
                suppressSpinnerCallback[index] = true
                try {
                    spinner.setSelection(pos, false)
                } finally {
                    spinner.post { suppressSpinnerCallback[index] = false }
                }
            }
        }

        playerCountOption2 = view.findViewById(R.id.setup_player_count_option_2)
        playerCountOption4 = view.findViewById(R.id.setup_player_count_option_4)
        playerCountOption2.setOnClickListener { viewModel.setPlayerCount(2) }
        playerCountOption4.setOnClickListener { viewModel.setPlayerCount(GameRules.MAX_PLAYER_COUNT) }

        viewModel.playerCount.observe(viewLifecycleOwner) { count ->
            applyPlayerCountSelection(count)
            applyCardEnablement(count)
        }

        startButton = view.findViewById(R.id.start_button)
        startButton.setOnClickListener {
            startActivity(
                GameActivity.startIntentFromSetup(
                    requireContext(),
                    viewModel.getPlayersForGame()
                )
            )
        }
    }

    private fun updatePlayerSlotAccent(characterName: String, index: Int) {
        val color = UnmatchedCharacters.setupAccentColorFor(characterName)
        cardBackgroundDrawables[index].setStrokeColor(color)
        avatarImages[index].setImageResource(UnmatchedCharacters.avatarDrawableResId(characterName))
        avatarImages[index].contentDescription = characterName
        spinnerRows[index].background = requireContext().createSpinnerRowBackground(color)
    }

    /** Mute / un-mute the optional player cards when the count toggle changes. */
    private fun applyCardEnablement(playerCount: Int) {
        val ctx = requireContext()
        val disabledStrokeColor = ContextCompat.getColor(ctx, R.color.setup_ui_border_disabled)
        val disabledAlpha = TypedValue().also {
            resources.getValue(R.dimen.setup_disabled_card_alpha, it, true)
        }.float

        playerCards.forEachIndexed { index, card ->
            val isOptional = index >= FIRST_OPTIONAL_PLAYER_INDEX
            val disabled = isOptional && index >= playerCount

            card.alpha = if (disabled) disabledAlpha else 1f
            card.isEnabled = !disabled
            spinners[index].isEnabled = !disabled
            spinnerRows[index].isEnabled = !disabled

            cardBackgroundDrawables[index].setDisabledAppearance(disabled)
            if (disabled) {
                spinnerRows[index].background = ctx.createSpinnerRowBackground(disabledStrokeColor)
            } else {
                val name = viewModel.findSetupPlayerById(index)?.characterName
                if (name != null) {
                    val accent = UnmatchedCharacters.setupAccentColorFor(name)
                    spinnerRows[index].background = ctx.createSpinnerRowBackground(accent)
                }
            }
        }
    }

    private fun applyPlayerCountSelection(count: Int) {
        val selectedBg = R.drawable.setup_player_count_button_selected
        val unselectedBg = R.drawable.setup_player_count_button_unselected
        val select2 = count == 2
        playerCountOption2.setBackgroundResource(if (select2) selectedBg else unselectedBg)
        playerCountOption4.setBackgroundResource(if (select2) unselectedBg else selectedBg)
        playerCountOption2.isSelected = select2
        playerCountOption4.isSelected = !select2
    }

    override fun onResume() {
        super.onResume()
        viewModel.refresh()
    }

    private fun View.clipToCircle() {
        post {
            if (width <= 0 || height <= 0) return@post
            outlineProvider = object : ViewOutlineProvider() {
                override fun getOutline(view: View, outline: Outline) {
                    outline.setOval(0, 0, view.width, view.height)
                }
            }
            clipToOutline = true
        }
    }

    private fun applySetupCardBackgrounds(view: View) {
        val corners = listOf(
            SetupHubFacingCorner.BOTTOM_RIGHT,
            SetupHubFacingCorner.BOTTOM_LEFT,
            SetupHubFacingCorner.TOP_RIGHT,
            SetupHubFacingCorner.TOP_LEFT,
        )
        val ids = listOf(
            R.id.setup_card_player_0,
            R.id.setup_card_player_1,
            R.id.setup_card_player_2,
            R.id.setup_card_player_3,
        )
        cardBackgroundDrawables = ids.mapIndexed { i, id ->
            SetupPlayerCardBackgroundDrawable(resources, corners[i]).also {
                view.findViewById<View>(id).background = it
            }
        }.toTypedArray()
    }

    /**
     * Pin the popup to the spinner row's width AND cap its height to [maxVisibleItems]
     * dropdown rows. The height is computed by measuring a real dropdown row so it stays
     * correct across densities/font sizes; the cap is then pushed into the internal
     * popup window via reflection because [android.widget.Spinner.setDropDownHeight]
     * is not public on the platform Spinner and the AppCompat replacement that the
     * AppCompat layout inflater installs ignores `android:dropDownHeight` from XML.
     */
    private fun Spinner.bindDropdownToCharacterField(maxVisibleItems: Int) {
        val row = parent as? View ?: return
        val apply = {
            val w = row.width
            if (w > 0) {
                dropDownWidth = w
                dropDownHorizontalOffset = 0
                applyDropdownHeightCap(w, maxVisibleItems)
            }
        }
        row.post(apply)
        row.addOnLayoutChangeListener { _, _, _, _, _, _, _, _, _ -> apply() }
    }

    private fun Spinner.applyDropdownHeightCap(widthPx: Int, maxVisibleItems: Int) {
        val a = adapter ?: return
        if (a.count == 0) return
        val sample = a.getDropDownView(0, null, this)
        val widthSpec = View.MeasureSpec.makeMeasureSpec(widthPx, View.MeasureSpec.AT_MOST)
        val heightSpec = View.MeasureSpec.makeMeasureSpec(0, View.MeasureSpec.UNSPECIFIED)
        sample.measure(widthSpec, heightSpec)
        val itemHeight = sample.measuredHeight
        if (itemHeight <= 0) return
        val capPx = itemHeight * maxVisibleItems
        setInternalPopupHeight(capPx)
    }

    /**
     * Best-effort: reach the Spinner's private `mPopup` (a `ListPopupWindow`) and call
     * `setHeight(int)` on it. Silently no-ops on unknown ROM internals.
     */
    private fun Spinner.setInternalPopupHeight(heightPx: Int) {
        try {
            var clazz: Class<*>? = this.javaClass
            var field: java.lang.reflect.Field? = null
            while (clazz != null && field == null) {
                field = runCatching { clazz!!.getDeclaredField("mPopup") }.getOrNull()
                clazz = clazz.superclass
            }
            field?.isAccessible = true
            val popup = field?.get(this) ?: return
            val setHeight = popup.javaClass.methods.firstOrNull {
                it.name == "setHeight" && it.parameterTypes.size == 1 &&
                        it.parameterTypes[0] == Int::class.javaPrimitiveType
            } ?: return
            setHeight.invoke(popup, heightPx)
        } catch (_: Throwable) {
            // ignore — fall back to the platform default behavior
        }
    }
}
