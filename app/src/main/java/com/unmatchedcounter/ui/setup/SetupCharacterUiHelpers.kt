package com.unmatchedcounter.ui.setup

import android.content.Context
import android.graphics.drawable.GradientDrawable
import androidx.annotation.ColorInt
import androidx.core.content.ContextCompat
import com.unmatchedcounter.R

internal fun Context.createSpinnerRowBackground(
    @ColorInt strokeColor: Int,
): GradientDrawable {
    val strokePx = resources.getDimensionPixelSize(R.dimen.setup_ui_stroke_width)
    val fill = ContextCompat.getColor(this, R.color.setup_spinner_field_fill)
    val r = resources.getDimension(R.dimen.setup_spinner_corner_radius)
    return GradientDrawable().apply {
        shape = GradientDrawable.RECTANGLE
        cornerRadius = r
        setColor(fill)
        setStroke(strokePx, strokeColor)
    }
}
