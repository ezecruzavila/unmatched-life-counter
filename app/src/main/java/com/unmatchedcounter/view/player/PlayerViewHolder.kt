package com.unmatchedcounter.view.player

import android.view.View
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.bumptech.glide.Glide
import com.unmatchedcounter.UnmatchedCharacters
import com.unmatchedcounter.databinding.ItemPlayerTabletopBinding
import com.unmatchedcounter.ui.game.GamePlayerUiModel
import com.unmatchedcounter.ui.game.OnPlayerUpdatedListener
import com.unmatchedcounter.view.counter.CountersRecyclerAdapter

class PlayerViewHolder(
    val itemView: View,
    val onPlayerUpdatedListener: OnPlayerUpdatedListener,
) {
    private val binding = ItemPlayerTabletopBinding.bind(itemView)
    private val countersAdapter = CountersRecyclerAdapter(onPlayerUpdatedListener)

    init {
        binding.countersRecycler.layoutManager =
            LinearLayoutManager(itemView.context, RecyclerView.HORIZONTAL, false)
        binding.countersRecycler.adapter = countersAdapter
    }

    fun bind(data: GamePlayerUiModel) {
        val model = data.model
        countersAdapter.setData(model)
        val artRes = UnmatchedCharacters.backgroundDrawableResId(
            model.characterName,
            model.id,
        )
        Glide.with(itemView.context).load(artRes).into(binding.playerContainerBgImage)
    }
}
