package com.unmatchedcounter.view.counter

import android.content.Context
import android.graphics.drawable.ColorDrawable
import android.util.AttributeSet
import android.util.TypedValue
import android.view.LayoutInflater
import android.widget.FrameLayout
import android.widget.TextView
import androidx.annotation.ColorInt
import androidx.core.widget.TextViewCompat
import com.unmatchedcounter.R
import com.unmatchedcounter.util.CounterUtils
import com.unmatchedcounter.view.HoldableButton
import kotlin.math.min

abstract class CounterView(
    layoutResId: Int,
    context: Context,
    attrs: AttributeSet?,
    defStyleAttr: Int
) : FrameLayout(
    context,
    attrs,
    defStyleAttr
) {

    private var amountText: TextView
    private var amount: Int = 0
    private val incrementer: HoldableButton
    private val decrementer: HoldableButton

    private var listener: OnAmountUpdatedListener? = null

    /// Translucent black drawable overlaid on top of the counter when the
    /// pool is at 0 (drawn as the FrameLayout `foreground`).
    private val deadOverlay = ColorDrawable(0x99000000.toInt())

    companion object {
        private const val LABEL_HEIGHT_TO_WIDTH_RATIO = 1.3f
    }

    constructor(layoutResId: Int, context: Context) : this(layoutResId, context, null)
    constructor(layoutResId: Int, context: Context, attrs: AttributeSet?) : this(
        layoutResId,
        context,
        attrs,
        0
    )

    init {
        //Leaking instance information is safe in this init because we are not referencing any subclass info
        @Suppress("LeakingThis")
        LayoutInflater.from(context).inflate(layoutResId, this, true)
        amountText = findViewById(R.id.amount)
        incrementer = findViewById(R.id.increment_button)
        decrementer = findViewById(R.id.decrement_button)
        setAmount(0)

        incrementer.setListener(object :
            HoldableButton.HoldableButtonListener {
            override fun onSingleClick() {
                listener?.onAmountIncremented(1)
            }

            override fun onHoldContinued(increments: Int) {
                listener?.onAmountIncremented(
                    CounterUtils.getAmountChangeForHoldIteration(
                        increments
                    )
                )
            }
        })

        decrementer.setListener(object :
            HoldableButton.HoldableButtonListener {
            override fun onSingleClick() {
                listener?.onAmountIncremented(-1)
            }

            override fun onHoldContinued(increments: Int) {
                listener?.onAmountIncremented(
                    CounterUtils.getAmountChangeForHoldIteration(
                        increments
                    ) * -1
                )
            }
        })
    }

    override fun onSizeChanged(w: Int, h: Int, oldw: Int, oldh: Int) {
        super.onSizeChanged(w, h, oldw, oldh)
        val maxTextSize = resources.getDimensionPixelSize(
            R.dimen.counter_max_text_size
        )

        /**
         * Auto Size text view can clip at large text sizes when the ratio of width
         * to height is low. Dynamically set a ratio to prevent this from occurring.
         *
         * Only an issue if h > w
         *
         * NOTE: This is not being done in the ConstraintLayout because other constraints
         * are necessary for the general layout that would not be compatible with an additional
         * ratio constraint
         */
        TextViewCompat.setAutoSizeTextTypeUniformWithConfiguration(
            amountText,
            resources.getDimensionPixelSize(R.dimen.counter_label_min_text_size),
            if (h > w)
                (w * LABEL_HEIGHT_TO_WIDTH_RATIO).toInt()
            else
                min(maxTextSize, h),
            1,
            TypedValue.COMPLEX_UNIT_PX,
        )
    }

    fun setOnAmountUpdatedListener(onAmountUpdatedListener: OnAmountUpdatedListener?) {
        listener = onAmountUpdatedListener
    }

    fun setAmount(amount: Int) {
        amountText.text = "$amount"
        this.amount = amount
        applyAliveState(amount > 0)
    }

    /**
     * Shadow the whole counter area (including the player background that
     * shows through behind it) with a translucent black overlay drawn as
     * the FrameLayout foreground, hide the number entirely, and block taps
     * on the decrement half when the pool hits 0. `foreground` is purely
     * visual so the increment half underneath stays tappable, bringing the
     * counter back to life on press.
     */
    private fun applyAliveState(alive: Boolean) {
        amountText.alpha = if (alive) 1.0f else 0.0f
        decrementer.isEnabled = alive
        foreground = if (alive) null else deadOverlay
    }

    open fun setTextColor(@ColorInt color: Int) {
        amountText.setTextColor(color)
    }

    interface OnAmountUpdatedListener {
        fun onAmountSet(amount: Int)
        fun onAmountIncremented(amountDifference: Int)
    }
}