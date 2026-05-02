package com.unmatchedcounter.ui.game

import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.util.TypedValue
import android.view.Gravity
import android.view.View
import android.view.ViewGroup
import android.view.ViewTreeObserver
import android.widget.FrameLayout
import android.widget.ImageView
import android.widget.LinearLayout
import androidx.activity.viewModels
import androidx.appcompat.app.AlertDialog
import androidx.core.content.ContextCompat
import androidx.fragment.app.DialogFragment
import com.github.rongi.rotate_layout.layout.RotateLayout
import com.unmatchedcounter.GameRules
import com.unmatchedcounter.R
import com.unmatchedcounter.model.player.PlayerSetupModel
import com.unmatchedcounter.ui.BaseActivity
import com.unmatchedcounter.ui.game.options.GameOptionsDialogFragment
import com.unmatchedcounter.ui.game.tabletop.GameTabletopLayoutAdapter
import com.unmatchedcounter.view.TableLayoutPosition
import com.unmatchedcounter.view.TabletopLayout
import dagger.hilt.android.AndroidEntryPoint


@AndroidEntryPoint
class GameActivity : BaseActivity(), OnPlayerUpdatedListener {

    companion object {
        const val TAG_GAME_OPTIONS = "tag_game_options"
        const val ARGS_SETUP_PLAYERS = "args_setup_players"
        fun startIntentFromSetup(context: Context, players: List<PlayerSetupModel>): Intent {
            return Intent(context, GameActivity::class.java).putParcelableArrayListExtra(
                ARGS_SETUP_PLAYERS, ArrayList(players)
            )
        }
    }

    private lateinit var gameContainer: FrameLayout

    private lateinit var tabletopContainer: RotateLayout
    private lateinit var tabletopLayout: TabletopLayout
    private lateinit var tabletopLayoutAdapter: GameTabletopLayoutAdapter
    private lateinit var tabletopPositions: List<TableLayoutPosition>

    private val viewModel: GameViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_game)

        hideSystemUI()

        gameContainer = findViewById(R.id.game_container)

        tabletopContainer = findViewById(R.id.tabletop_container)
        tabletopLayout = findViewById(R.id.tabletop_layout)
        tabletopLayoutAdapter = GameTabletopLayoutAdapter(tabletopLayout, this)
        tabletopPositions = GameRules.tabletopPositionsFor(viewModel.playerCount)
        tabletopLayoutAdapter.setPositions(tabletopPositions)
        applyTabletopPanelMargins(viewModel.playerCount)
        addHubButtons()

        viewModel.players.observe(this) {
            tabletopLayoutAdapter.updateAll(tabletopPositions, it)
        }
    }

    private fun addHubButtons() {
        tabletopLayout.viewTreeObserver.addOnPreDrawListener(object :
            ViewTreeObserver.OnPreDrawListener {
            override fun onPreDraw(): Boolean {
                tabletopLayout.viewTreeObserver.removeOnPreDrawListener(this)

                val hubRow = LinearLayout(this@GameActivity).apply {
                    orientation = LinearLayout.HORIZONTAL
                    gravity = Gravity.CENTER_VERTICAL
                    contentDescription = getString(R.string.game_hub_row_a11y)
                }

                val buttonPx =
                    resources.getDimensionPixelSize(R.dimen.game_hub_button_size)
                val gap = resources.getDimensionPixelSize(R.dimen.game_hub_buttons_gap)
                val iconPad =
                    resources.getDimensionPixelSize(R.dimen.game_hub_icon_padding)

                fun addHubButton(iconRes: Int, descRes: Int, onClick: () -> Unit) {
                    val container = FrameLayout(this@GameActivity).apply {
                        background = ContextCompat.getDrawable(
                            this@GameActivity,
                            R.drawable.bg_game_hub_round
                        )
                    }
                    val icon = ImageView(this@GameActivity).apply {
                        scaleType = ImageView.ScaleType.FIT_CENTER
                        setImageResource(iconRes)
                        contentDescription = getString(descRes)
                        setPadding(iconPad, iconPad, iconPad, iconPad)
                    }
                    container.addView(
                        icon,
                        FrameLayout.LayoutParams(
                            FrameLayout.LayoutParams.MATCH_PARENT,
                            FrameLayout.LayoutParams.MATCH_PARENT
                        )
                    )
                    val rippleValue = TypedValue()
                    theme.resolveAttribute(
                        android.R.attr.selectableItemBackgroundBorderless,
                        rippleValue,
                        true
                    )
                    container.foreground =
                        ContextCompat.getDrawable(this@GameActivity, rippleValue.resourceId)
                    container.isClickable = true
                    container.setOnClickListener { onClick() }
                    val lp = LinearLayout.LayoutParams(buttonPx, buttonPx)
                    if (hubRow.childCount > 0) {
                        lp.marginStart = gap
                    }
                    hubRow.addView(container, lp)
                }

                addHubButton(R.drawable.ic_hub_restart_glyph, R.string.game_hub_restart_cd) {
                    openResetPrompt()
                }
                addHubButton(R.drawable.ic_hub_exit_glyph, R.string.game_hub_exit_cd) {
                    openExitPrompt()
                }

                hubRow.setOnLongClickListener {
                    openDisplaySettingsDialog()
                    true
                }

                gameContainer.addView(
                    hubRow,
                    FrameLayout.LayoutParams(
                        FrameLayout.LayoutParams.WRAP_CONTENT,
                        FrameLayout.LayoutParams.WRAP_CONTENT,
                        Gravity.CENTER,
                    )
                )
                return false
            }
        })
    }

    /**
     * In the 2-player layout each panel is a wide-and-short rectangle, so the
     * portrait character art ends up cropped aggressively. We frame each panel
     * with extra black margin (especially between players) to reduce that
     * crowding without changing the 4-player layout.
     */
    private fun applyTabletopPanelMargins(playerCount: Int) {
        if (playerCount != 2) return
        val sideMargin = resources.getDimensionPixelSize(R.dimen.tabletop_2p_panel_horizontal_margin)
        val outerMargin = resources.getDimensionPixelSize(R.dimen.tabletop_2p_panel_outer_margin)
        val innerMargin = resources.getDimensionPixelSize(R.dimen.tabletop_2p_panel_inner_margin)

        val topPanel = tabletopLayout.panels[TableLayoutPosition.TOP_PANEL] ?: return
        val bottomPanel = tabletopLayout.panels[TableLayoutPosition.BOTTOM_PANEL] ?: return

        (topPanel.layoutParams as? ViewGroup.MarginLayoutParams)?.apply {
            leftMargin = sideMargin
            rightMargin = sideMargin
            topMargin = outerMargin
            bottomMargin = innerMargin
        }
        (bottomPanel.layoutParams as? ViewGroup.MarginLayoutParams)?.apply {
            leftMargin = sideMargin
            rightMargin = sideMargin
            topMargin = innerMargin
            bottomMargin = outerMargin
        }
        topPanel.requestLayout()
        bottomPanel.requestLayout()
    }

    private fun openDisplaySettingsDialog() {
        GameOptionsDialogFragment.newInstance()
            .show(supportFragmentManager, TAG_GAME_OPTIONS)
    }

    override fun onWindowFocusChanged(hasFocus: Boolean) {
        super.onWindowFocusChanged(hasFocus)
        if (hasFocus) {
            hideSystemUI()
            viewModel.players.value?.let {
                tabletopLayoutAdapter.updateAll(tabletopPositions, it)
            }
        }
    }

    private fun hideSystemUI() {
        window.decorView.systemUiVisibility = (View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                or View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                or View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                or View.SYSTEM_UI_FLAG_FULLSCREEN)

        if (viewModel.hideNavigation.value == true) {
            window.decorView.systemUiVisibility = (window.decorView.systemUiVisibility
                    or View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                    or View.SYSTEM_UI_FLAG_HIDE_NAVIGATION)
        }
    }

    override fun onBackPressed() {
        openExitPrompt()
    }

    private fun openExitPrompt() {
        val dialog = AlertDialog.Builder(this)
            .setTitle(R.string.exit_game)
            .setMessage(R.string.are_you_sure_exit)
            .setPositiveButton(R.string.yes) { _, _ ->
                closeGameOptionsDialog()
                finish()
            }
            .setNegativeButton(R.string.no) { dialog, _ -> dialog.dismiss() }

        dialog.show()
    }

    private fun openResetPrompt() {
        val dialog = AlertDialog.Builder(this)
            .setTitle(R.string.reset_game)
            .setMessage(R.string.are_you_sure_reset)
            .setPositiveButton(R.string.yes) { _, _ ->
                closeGameOptionsDialog()
                viewModel.resetGame()
            }
            .setNegativeButton(R.string.no) { dialog, _ -> dialog.dismiss() }

        dialog.show()
    }

    private fun closeGameOptionsDialog() {
        supportFragmentManager.findFragmentByTag(TAG_GAME_OPTIONS)?.let {
            if (it is DialogFragment) {
                it.dismiss()
            }
        }
    }

    override fun onLifeIncremented(playerId: Int, amountDifference: Int, segmentIndex: Int) {
        viewModel.incrementPlayerLife(playerId, amountDifference, segmentIndex)
    }

    override fun onLifeAmountSet(playerId: Int, amount: Int, segmentIndex: Int) {
    }
}
