package com.unmatchedcounter.ui.game.tabletop

import com.github.rongi.rotate_layout.layout.RotateLayout
import com.unmatchedcounter.ui.game.OnPlayerUpdatedListener
import com.unmatchedcounter.ui.game.GamePlayerUiModel
import com.unmatchedcounter.view.TabletopLayout
import com.unmatchedcounter.view.TabletopLayoutAdapter

class GameTabletopLayoutAdapter(
    parent: TabletopLayout,
    private val onPlayerUpdatedListener: OnPlayerUpdatedListener,
) :
    TabletopLayoutAdapter<GameTabletopPlayerViewHolder, GamePlayerUiModel>(parent) {

    override fun createViewHolder(container: RotateLayout): GameTabletopPlayerViewHolder {
        return GameTabletopPlayerViewHolder(
            container,
            onPlayerUpdatedListener,
        )
    }
}
