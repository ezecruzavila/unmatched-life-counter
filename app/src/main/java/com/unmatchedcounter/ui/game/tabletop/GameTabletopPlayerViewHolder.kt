package com.unmatchedcounter.ui.game.tabletop

import android.view.LayoutInflater
import android.view.View
import com.github.rongi.rotate_layout.layout.RotateLayout
import com.unmatchedcounter.R
import com.unmatchedcounter.ui.game.OnPlayerUpdatedListener
import com.unmatchedcounter.ui.game.GamePlayerUiModel
import com.unmatchedcounter.view.TableLayoutPosition
import com.unmatchedcounter.view.TabletopLayoutViewHolder
import com.unmatchedcounter.view.player.PlayerViewHolder

class GameTabletopPlayerViewHolder(
    container: RotateLayout,
    onPlayerUpdatedListener: OnPlayerUpdatedListener,
) : TabletopLayoutViewHolder<GamePlayerUiModel>(container) {

    private val nestedPlayerVH = PlayerViewHolder(
        LayoutInflater.from(container.context)
            .inflate(R.layout.item_player_tabletop, container, false),
        onPlayerUpdatedListener,
        // Each panel is tagged with its seat position in TabletopLayout.init.
        // The player view uses it to place the floating button on the corner
        // furthest from the table center for this seat.
        container.tag as? TableLayoutPosition,
    )

    override fun bind(data: GamePlayerUiModel) {
        nestedPlayerVH.bind(data)
    }

    override val view: View
        get() = nestedPlayerVH.itemView
}
