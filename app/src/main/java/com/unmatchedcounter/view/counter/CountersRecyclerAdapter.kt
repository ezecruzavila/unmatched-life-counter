package com.unmatchedcounter.view.counter

import android.annotation.SuppressLint
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.FrameLayout
import android.widget.LinearLayout
import android.widget.TextView
import android.view.ViewTreeObserver
import androidx.core.view.isVisible
import androidx.recyclerview.widget.RecyclerView
import com.unmatchedcounter.R
import com.unmatchedcounter.model.player.PlayerModel
import com.unmatchedcounter.ui.game.OnPlayerUpdatedListener

class CountersRecyclerAdapter(
    private val onPlayerUpdatedListener: OnPlayerUpdatedListener
) : RecyclerView.Adapter<LifeViewHolder>() {

    companion object {
        private const val ID_LIFE = "__LIFE__"
    }

    private var player: PlayerModel? = null

    private var recyclerView: RecyclerView? = null

    init {
        setHasStableIds(true)
    }

    fun setData(player: PlayerModel) {
        this.player = player
        notifyDataSetChanged()
    }

    override fun getItemId(position: Int): Long {
        return "$ID_LIFE##!##${player?.id}".hashCode().toLong()
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): LifeViewHolder {
        return LifeViewHolder(
            LayoutInflater.from(parent.context)
                .inflate(R.layout.item_life_counter, parent, false),
            onPlayerUpdatedListener
        )
    }

    override fun onBindViewHolder(
        holder: LifeViewHolder,
        @SuppressLint("RecyclerView") position: Int
    ) {
        holder.bind(player!!)

        if (recyclerView?.width ?: 0 > 0) {
            adjustLifeCellWidth(holder)
        } else {
            recyclerView?.viewTreeObserver?.addOnPreDrawListener(object :
                ViewTreeObserver.OnPreDrawListener {
                override fun onPreDraw(): Boolean {
                    recyclerView?.viewTreeObserver?.removeOnPreDrawListener(this)
                    adjustLifeCellWidth(holder)
                    return false
                }
            })
        }
    }

    private fun adjustLifeCellWidth(holder: LifeViewHolder) {
        val resources = holder.itemView.resources
        val lifeWidth = resources.getDimensionPixelSize(R.dimen.player_life_width)
        val recyclerViewWidth = recyclerView?.let {
            it.width - it.paddingStart - it.paddingEnd
        } ?: 0
        val scrollThreshold = resources.getDimensionPixelSize(R.dimen.counter_scroll_threshold)
        val shouldStretch =
            lifeWidth < recyclerViewWidth || lifeWidth - recyclerViewWidth < scrollThreshold
        val cellWidth = if (shouldStretch) recyclerViewWidth else lifeWidth
        val lp = holder.itemView.layoutParams
        lp.width = cellWidth
        holder.itemView.layoutParams = lp
    }

    override fun getItemCount(): Int {
        return if (player == null) 0 else 1
    }

    override fun onAttachedToRecyclerView(recyclerView: RecyclerView) {
        super.onAttachedToRecyclerView(recyclerView)
        this.recyclerView = recyclerView
    }

    override fun onDetachedFromRecyclerView(recyclerView: RecyclerView) {
        super.onDetachedFromRecyclerView(recyclerView)
        this.recyclerView = null
    }
}

class LifeViewHolder(
    itemView: View,
    private val onPlayerUpdatedListener: OnPlayerUpdatedListener
) : RecyclerView.ViewHolder(itemView) {
    private val lifeColumns: List<FrameLayout> = listOf(
        itemView.findViewById(R.id.life_column_0),
        itemView.findViewById(R.id.life_column_1),
        itemView.findViewById(R.id.life_column_2),
    )
    private val lifeLabels: List<TextView> = listOf(
        itemView.findViewById(R.id.life_label_0),
        itemView.findViewById(R.id.life_label_1),
        itemView.findViewById(R.id.life_label_2),
    )
    private val lifeViews: List<LifeCounterView> = listOf(
        itemView.findViewById(R.id.life_segment_0),
        itemView.findViewById(R.id.life_segment_1),
        itemView.findViewById(R.id.life_segment_2),
    )
    private val lifeSeparators: List<View> = listOf(
        itemView.findViewById(R.id.life_separator_0),
        itemView.findViewById(R.id.life_separator_1),
    )

    private var playerId: Int = -1

    init {
        for (segmentIndex in lifeViews.indices) {
            val lifeView = lifeViews[segmentIndex]
            lifeView.setOnAmountUpdatedListener(object : CounterView.OnAmountUpdatedListener {
                override fun onAmountSet(amount: Int) {
                    onPlayerUpdatedListener.onLifeAmountSet(
                        playerId = playerId,
                        amount = amount,
                        segmentIndex = segmentIndex
                    )
                }

                override fun onAmountIncremented(amountDifference: Int) {
                    onPlayerUpdatedListener.onLifeIncremented(
                        playerId = playerId,
                        amountDifference = amountDifference,
                        segmentIndex = segmentIndex
                    )
                }
            })
        }
    }

    fun bind(playerModel: PlayerModel) {
        this.playerId = playerModel.id
        val count = playerModel.lifeSegments.size
        val labels = playerModel.lifeSegmentLabels
        lifeSeparators[0].isVisible = count >= 2
        lifeSeparators[1].isVisible = count >= 3
        for (i in lifeViews.indices) {
            val show = i < count
            lifeColumns[i].isVisible = show
            if (show) {
                val text = labels.getOrNull(i).orEmpty().trim()
                lifeLabels[i].text = text
                lifeLabels[i].isVisible = text.isNotEmpty()
                lifeViews[i].isVisible = true
                lifeViews[i].setAmount(playerModel.lifeSegments[i])
            }
        }
        applyLifeSegmentWeights(count)
    }

    private fun applyLifeSegmentWeights(visibleCount: Int) {
        val params = lifeColumns.map { it.layoutParams as LinearLayout.LayoutParams }
        when (visibleCount) {
            1 -> {
                params[0].weight = 1f
                params[1].weight = 0f
                params[2].weight = 0f
            }
            2 -> {
                params[0].weight = 15f
                params[1].weight = 9f
                params[2].weight = 0f
            }
            3 -> {
                params[0].weight = 1f
                params[1].weight = 1f
                params[2].weight = 1f
            }
            else -> {
                params[0].weight = 0f
                params[1].weight = 0f
                params[2].weight = 0f
            }
        }
        for (i in lifeColumns.indices) {
            lifeColumns[i].layoutParams = params[i]
        }
    }
}
