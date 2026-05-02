package com.unmatchedcounter.view

import android.content.Context
import android.util.AttributeSet
import android.view.MotionEvent
import androidx.appcompat.widget.AppCompatTextView

/**
 * Draws text but does not claim touches, so touches reach overlapping siblings drawn below
 * (e.g. [com.unmatchedcounter.view.counter.LifeCounterView] under this overlay).
 *
 * Uses [android.R.attr.textViewStyle] like [AppCompatTextView]'s two-arg constructor.
 */
class TouchPassthroughTextView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = android.R.attr.textViewStyle,
) : AppCompatTextView(context, attrs, defStyleAttr) {

    override fun onTouchEvent(event: MotionEvent): Boolean = false
}
