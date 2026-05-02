package com.unmatchedcounter.ui.game.tabletop

import android.view.LayoutInflater
import android.view.View
import com.github.rongi.rotate_layout.layout.RotateLayout
import com.unmatchedcounter.R
import com.unmatchedcounter.ui.game.OnPlayerUpdatedListener
import com.unmatchedcounter.ui.game.GamePlayerUiModel
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
    )

    override fun bind(data: GamePlayerUiModel) {
        nestedPlayerVH.bind(data)
    }

    override val view: View
        get() = nestedPlayerVH.itemView
}
