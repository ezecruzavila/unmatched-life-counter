package com.unmatchedcounter.view.player

import android.view.View
import android.view.ViewGroup
import androidx.constraintlayout.widget.ConstraintLayout
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.bumptech.glide.Glide
import com.unmatchedcounter.UnmatchedCharacters
import com.unmatchedcounter.databinding.ItemPlayerTabletopBinding
import com.unmatchedcounter.model.player.ExtraButtonSpec
import com.unmatchedcounter.ui.game.GamePlayerUiModel
import com.unmatchedcounter.ui.game.OnPlayerUpdatedListener
import com.unmatchedcounter.view.TableLayoutPosition
import com.unmatchedcounter.view.counter.CountersRecyclerAdapter

class PlayerViewHolder(
    val itemView: View,
    val onPlayerUpdatedListener: OnPlayerUpdatedListener,
    /** Seat this panel occupies; decides which bottom corner the button sits in. */
    private val tablePosition: TableLayoutPosition? = null,
) {
    private val binding = ItemPlayerTabletopBinding.bind(itemView)
    private val countersAdapter = CountersRecyclerAdapter(onPlayerUpdatedListener)

    private var boundPlayerId: Int = -1
    /** Last background loaded into this panel; skip reloading if unchanged. */
    private var loadedArtRes: Int = 0

    companion object {
        // Upper bound for the decoded panel background. A panel is at most half
        // the screen, so this comfortably covers any phone/tablet while keeping
        // the bitmap far below the source PNGs' full resolution (e.g. 1672x941).
        private const val TARGET_BG_WIDTH_PX = 900
        private const val TARGET_BG_HEIGHT_PX = 700
    }

    init {
        binding.countersRecycler.layoutManager =
            LinearLayoutManager(itemView.context, RecyclerView.HORIZONTAL, false)
        binding.countersRecycler.adapter = countersAdapter
        binding.extraButton.setOnClickListener {
            if (boundPlayerId >= 0) {
                onPlayerUpdatedListener.onExtraButtonClicked(boundPlayerId)
            }
        }
        anchorExtraButtonToOuterCorner()
    }

    fun bind(data: GamePlayerUiModel) {
        val model = data.model
        boundPlayerId = model.id
        countersAdapter.setData(model)
        val artRes = UnmatchedCharacters.backgroundDrawableResId(
            model.characterName,
            model.id,
        )
        // The background only depends on the character, so it stays constant for
        // the life of the game. Skip the Glide request on every life tick; only
        // (re)load when the art actually changes. Downsample to the panel size to
        // avoid decoding ~6MB full-res bitmaps for a ~400px-wide panel.
        if (artRes != loadedArtRes) {
            loadedArtRes = artRes
            Glide.with(itemView.context)
                .load(artRes)
                .override(TARGET_BG_WIDTH_PX, TARGET_BG_HEIGHT_PX)
                .centerCrop()
                .into(binding.playerContainerBgImage)
        }
        bindExtraButton(model.characterName, model.extraButtonValue)
    }

    /**
     * Place the floating button in the desired bottom corner for this seat.
     *
     * Each panel's content is laid out un-rotated and then spun by RotateLayout,
     * so a content-space corner (start/end × top/bottom) maps to different
     * on-screen corners per seat. We hardcode, per [TableLayoutPosition], the
     * content-space corner that lands the button where the design wants it:
     *
     *  - 2 players: both buttons to the RIGHT.
     *  - 4 players: P1 (top-left) & P4 (bottom-right) to the LEFT;
     *               P2 (top-right) & P3 (bottom-left) to the RIGHT.
     *
     * Values below are calibrated against the on-device result; if a seat looks
     * wrong, flip its [Corner] entry in [cornerFor].
     */
    private fun anchorExtraButtonToOuterCorner() {
        val lp = binding.extraButton.layoutParams as? ConstraintLayout.LayoutParams ?: return
        val parentId = ConstraintLayout.LayoutParams.PARENT_ID
        val unset = ConstraintLayout.LayoutParams.UNSET
        val corner = cornerFor(tablePosition)

        if (corner.contentBottom) {
            lp.bottomToBottom = parentId
            lp.topToTop = unset
        } else {
            lp.topToTop = parentId
            lp.bottomToBottom = unset
        }
        if (corner.contentEnd) {
            lp.endToEnd = parentId
            lp.startToStart = unset
        } else {
            lp.startToStart = parentId
            lp.endToEnd = unset
        }
        binding.extraButton.layoutParams = lp
    }

    /** A corner in the panel's un-rotated content space. */
    private data class Corner(val contentEnd: Boolean, val contentBottom: Boolean)

    /**
     * The content-space corner that, after this seat's RotateLayout angle, puts
     * the button in the on-screen position the design calls for (see
     * [anchorExtraButtonToOuterCorner]).
     */
    private fun cornerFor(position: TableLayoutPosition?): Corner = when (position) {
        // --- 4 players ---
        // Calibration anchor: in the captured build, LEFT_PANEL_1 (270°) used
        // content bottom-end and rendered at screen TOP-LEFT. From that, the
        // content<->screen corner map per angle is derived below.
        //
        // Calibrated from two on-device captures of P3 = LEFT_PANEL_2 (270°):
        //   (end=false, bottom=false) -> screen TOP-RIGHT
        //   (end=true,  bottom=false) -> screen TOP-LEFT
        // => contentEnd controls the HORIZONTAL side (false=right, true=left),
        //    contentBottom controls the VERTICAL side (false=top, true=bottom).
        // The 90° panels (P2/P4) mirror horizontally, so their end flips sign.
        //
        // P1 top-left (270°) -> screen LEFT+bottom  (confirmed correct)
        TableLayoutPosition.LEFT_PANEL_1 -> Corner(contentEnd = false, contentBottom = true)
        // P2 top-right (90°) -> screen RIGHT+bottom (confirmed correct)
        TableLayoutPosition.RIGHT_PANEL_1 -> Corner(contentEnd = true, contentBottom = true)
        // P3 bottom-left (270°) -> screen RIGHT+bottom
        //   data: (end=false,bottom=false)=top-right; expect bottom=true => bottom-right
        TableLayoutPosition.LEFT_PANEL_2 -> Corner(contentEnd = false, contentBottom = true)
        // P4 bottom-right (90°) -> screen LEFT+bottom
        //   mirror of P3 on the 90° side: (end=true,bottom=false)=top-left; bottom=true => bottom-left
        TableLayoutPosition.RIGHT_PANEL_2 -> Corner(contentEnd = true, contentBottom = true)

        // --- 2 players (both to the RIGHT) ---
        // P1 top (180°) -> want screen RIGHT = content bottom-start
        TableLayoutPosition.TOP_PANEL -> Corner(contentEnd = false, contentBottom = true)
        // P2 bottom (0°) -> want screen RIGHT = content bottom-end
        TableLayoutPosition.BOTTOM_PANEL -> Corner(contentEnd = true, contentBottom = true)

        else -> Corner(contentEnd = true, contentBottom = true)
    }

    private fun bindExtraButton(characterName: String, value: Int?) {
        val spec = UnmatchedCharacters.extraButtonFor(characterName)
        val lp = binding.extraButton.layoutParams
        if (spec is ExtraButtonSpec.Toggle) {
            // Toggle pill: short, and sized to its content. The view itself pins
            // its width to the longest state word (see ExtraButtonView), so the
            // pill keeps a constant size as the label changes.
            lp.width = ViewGroup.LayoutParams.WRAP_CONTENT
            lp.height = ViewGroup.LayoutParams.WRAP_CONTENT
        } else {
            // Counter (triangle art): fixed square footprint.
            val size = itemView.resources.getDimensionPixelSize(
                com.unmatchedcounter.R.dimen.extra_button_size
            )
            lp.width = size
            lp.height = size
        }
        binding.extraButton.layoutParams = lp
        binding.extraButton.bind(spec, value)
    }
}
