package com.unmatchedcounter.view

import android.content.Context
import android.graphics.drawable.GradientDrawable
import android.util.AttributeSet
import android.view.LayoutInflater
import android.widget.FrameLayout
import android.widget.ImageView
import android.widget.TextView
import androidx.core.view.isVisible
import com.bumptech.glide.Glide
import com.unmatchedcounter.R
import com.unmatchedcounter.model.player.ExtraButtonSpec

/**
 * Floating button drawn over a player's life counter. Renders either:
 *  - a [ExtraButtonSpec.Counter]: a transparent image (e.g. Muldoon's
 *    triangle-shaped trap) with the current count overlaid as solid black text.
 *    No background — the image sits directly over the panel art.
 *  - a [ExtraButtonSpec.Toggle]: a colored pill with the current state's text.
 *    Its width is fixed to fit the longest state word so it does not resize as
 *    the label changes.
 *
 * Tap handling is wired by the host via [setOnClickListener]; this view adds the
 * pressed-state "click" feedback (foreground ripple + a brief scale dip).
 */
class ExtraButtonView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0,
) : FrameLayout(context, attrs, defStyleAttr) {

    private val image: ImageView
    private val amount: TextView
    private val text: TextView

    /** Last drawable loaded into [image]; skip reloading across binds. */
    private var loadedImageRes: Int = 0

    companion object {
        // The token art is square and never larger than the button; cap the
        // decode so the full-res source (e.g. 1254x1254) isn't kept in memory.
        private const val IMAGE_TARGET_PX = 256
    }

    init {
        LayoutInflater.from(context).inflate(R.layout.view_extra_button, this, true)
        image = findViewById(R.id.extra_button_image)
        amount = findViewById(R.id.extra_button_amount)
        text = findViewById(R.id.extra_button_text)
        isClickable = true
        isFocusable = true
    }

    /**
     * Tap feedback: a brief scale "dip" on press. We deliberately avoid a
     * foreground/background ripple here because the counter button is just a
     * transparent triangle PNG — a ripple would paint a visible square behind it.
     * The scale dip reads clearly over any panel art and adds no background.
     * Driven by the pressed state, which the tabletop touch pipeline toggles via
     * DOWN/UP dispatch.
     */
    override fun setPressed(pressed: Boolean) {
        super.setPressed(pressed)
        val target = if (pressed) 0.88f else 1f
        // Cancel any in-flight dip so rapid press/release toggles don't stack
        // animators.
        animate().cancel()
        animate().scaleX(target).scaleY(target).setDuration(80).start()
    }

    /**
     * Render [spec] at [value]. If either is null the button hides itself.
     * @return true if the button is now visible.
     */
    fun bind(spec: ExtraButtonSpec?, value: Int?): Boolean {
        if (spec == null || value == null) {
            isVisible = false
            return false
        }
        isVisible = true
        when (spec) {
            is ExtraButtonSpec.Counter -> bindCounter(spec, value)
            is ExtraButtonSpec.Toggle -> bindToggle(spec, value)
        }
        return true
    }

    private fun bindCounter(spec: ExtraButtonSpec.Counter, value: Int) {
        // No background/foreground: the triangle PNG is transparent and overlays
        // the panel; any fill would show as a square behind it.
        background = null
        foreground = null
        image.isVisible = true
        // Load via Glide (off the main thread, downsampled to the button) instead
        // of setImageResource, which would decode the full-res token (~6MB) on the
        // UI thread. Skip reloading the same image across binds.
        if (loadedImageRes != spec.imageResId) {
            loadedImageRes = spec.imageResId
            Glide.with(this)
                .load(spec.imageResId)
                .override(IMAGE_TARGET_PX, IMAGE_TARGET_PX)
                .fitCenter()
                .into(image)
        }
        amount.isVisible = true
        amount.text = value.toString()
        text.isVisible = false
    }

    private fun bindToggle(spec: ExtraButtonSpec.Toggle, value: Int) {
        val state = spec.stateAt(value)
        // Release any token bitmap if this view was previously a counter (recycle).
        if (loadedImageRes != 0) {
            Glide.with(this).clear(image)
            image.setImageDrawable(null)
            loadedImageRes = 0
        }
        image.isVisible = false
        amount.isVisible = false
        text.isVisible = true
        text.text = state.text
        text.setTextColor(state.textColorArgb)
        // Fix the label width to the widest state so the pill keeps a constant
        // size regardless of which word is showing.
        text.width = widestStateWidthPx(spec)
        background = pillBackground(state.backgroundColorArgb)
    }

    /** Measured pixel width of the longest state's text (plus its padding). */
    private fun widestStateWidthPx(spec: ExtraButtonSpec.Toggle): Int {
        val paint = text.paint
        val maxTextPx = spec.states.maxOf { paint.measureText(it.text) }
        return maxTextPx.toInt() + text.paddingLeft + text.paddingRight
    }

    private fun pillBackground(colorArgb: Int): GradientDrawable {
        val radius = resources.getDimension(R.dimen.extra_button_corner_radius)
        return GradientDrawable().apply {
            shape = GradientDrawable.RECTANGLE
            cornerRadius = radius
            setColor(colorArgb)
        }
    }
}
