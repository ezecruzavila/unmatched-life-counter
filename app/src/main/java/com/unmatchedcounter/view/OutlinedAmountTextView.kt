package com.unmatchedcounter.view

import android.content.Context
import android.graphics.Canvas
import android.graphics.Paint
import android.util.AttributeSet
import androidx.appcompat.widget.AppCompatTextView
import androidx.core.content.ContextCompat
import com.unmatchedcounter.R

/**
 * Life totals: filled text with a thin stroke behind it.
 * Avoids [android:shadowLayer/shadowRadius], which can crash with autosize on some devices.
 */
class OutlinedAmountTextView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : AppCompatTextView(context, attrs, defStyleAttr) {

    private val strokeWidthPx: Float
        get() = resources.getDimension(R.dimen.counter_amount_stroke_width)

    init {
        paint.isAntiAlias = true
    }

    override fun onDraw(canvas: Canvas) {
        val origColors = textColors
        val p = paint
        val savedStyle = p.style
        val savedStrokeW = p.strokeWidth

        p.strokeJoin = Paint.Join.ROUND
        p.strokeMiter = 10f
        p.style = Paint.Style.STROKE
        p.strokeWidth = strokeWidthPx
        setTextColor(ContextCompat.getColor(context, R.color.black))
        super.onDraw(canvas)

        setTextColor(origColors)
        p.style = Paint.Style.FILL
        p.strokeWidth = savedStrokeW
        super.onDraw(canvas)

        p.style = savedStyle
        p.strokeWidth = savedStrokeW
    }
}
