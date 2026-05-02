package com.unmatchedcounter.view.counter

import android.content.Context
import android.util.AttributeSet
import android.view.View
import com.unmatchedcounter.R

class LifeCounterView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : CounterView(R.layout.view_counter, context, attrs, defStyleAttr) {

    private val counterIconView = findViewById<View>(R.id.counter_icon_view)

    init {
        counterIconView.visibility = View.GONE
    }
}
