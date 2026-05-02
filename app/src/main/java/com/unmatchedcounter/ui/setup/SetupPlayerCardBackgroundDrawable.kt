package com.unmatchedcounter.ui.setup

import android.content.res.Resources
import android.graphics.Canvas
import android.graphics.ColorFilter
import android.graphics.Paint
import android.graphics.Path
import android.graphics.PixelFormat
import android.graphics.drawable.Drawable
import androidx.annotation.ColorInt
import com.unmatchedcounter.R

/** Rounded card with a circular bite at the hub-facing corner; hub draws underneath. */
enum class SetupHubFacingCorner {
    BOTTOM_RIGHT,
    BOTTOM_LEFT,
    TOP_RIGHT,
    TOP_LEFT,
}

class SetupPlayerCardBackgroundDrawable(
    private val res: Resources,
    private val hubFacingCorner: SetupHubFacingCorner,
) : Drawable() {

    private val fillPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        style = Paint.Style.FILL
        color = res.getColor(R.color.setup_player_card_bg, null)
    }

    /**
     * Stroke is drawn at 2× width and clipped to the shape so the visible portion
     * (the inner half) equals [R.dimen.setup_ui_stroke_width] uniformly on every side.
     * Without this trick the outer half of a centered stroke gets cropped by the view
     * bounds, producing thinner edges where antialiasing meets the clip.
     */
    private val strokePaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        style = Paint.Style.STROKE
        strokeWidth = res.getDimension(R.dimen.setup_ui_stroke_width) * 2f
        strokeJoin = Paint.Join.ROUND
        strokeCap = Paint.Cap.ROUND
        color = res.getColor(R.color.setup_ui_border_gray, null)
    }

    @ColorInt
    private var activeStrokeColor: Int = res.getColor(R.color.setup_ui_border_gray, null)
    private var disabled: Boolean = false

    fun setStrokeColor(@ColorInt color: Int) {
        activeStrokeColor = color
        if (!disabled) {
            strokePaint.color = color
            invalidateSelf()
        }
    }

    /** When disabled, both border and fill collapse to the muted gray palette. */
    fun setDisabledAppearance(disabled: Boolean) {
        if (this.disabled == disabled) return
        this.disabled = disabled
        strokePaint.color = if (disabled) {
            res.getColor(R.color.setup_ui_border_disabled, null)
        } else {
            activeStrokeColor
        }
        invalidateSelf()
    }

    private val roundedPath = Path()
    private val diskPath = Path()
    private val bitePath = Path()
    private val shapePath = Path()

    override fun draw(canvas: Canvas) {
        val b = bounds
        val w = b.width().toFloat()
        val h = b.height().toFloat()
        if (w <= 0f || h <= 0f) return

        val cornerR = res.getDimension(R.dimen.setup_card_corner_radius)
        val hubR = res.getDimension(R.dimen.setup_center_plate_size) / 2f

        val (cx, cy) = when (hubFacingCorner) {
            SetupHubFacingCorner.BOTTOM_RIGHT -> w to h
            SetupHubFacingCorner.BOTTOM_LEFT -> 0f to h
            SetupHubFacingCorner.TOP_RIGHT -> w to 0f
            SetupHubFacingCorner.TOP_LEFT -> 0f to 0f
        }

        val radii = FloatArray(8) { cornerR }
        roundedPath.rewind()
        roundedPath.addRoundRect(0f, 0f, w, h, radii, Path.Direction.CW)

        diskPath.rewind()
        diskPath.addCircle(cx, cy, hubR, Path.Direction.CW)

        bitePath.rewind()
        bitePath.op(diskPath, roundedPath, Path.Op.INTERSECT)

        shapePath.rewind()
        shapePath.op(roundedPath, bitePath, Path.Op.DIFFERENCE)

        canvas.save()
        canvas.translate(b.left.toFloat(), b.top.toFloat())
        canvas.drawPath(shapePath, fillPaint)

        // Clip to the card silhouette so the outer half of the doubled stroke is removed,
        // leaving a visually uniform border on every edge.
        canvas.save()
        canvas.clipPath(shapePath)
        canvas.drawPath(shapePath, strokePaint)
        canvas.restore()

        canvas.restore()
    }

    override fun setAlpha(alpha: Int) {
        fillPaint.alpha = alpha
        strokePaint.alpha = alpha
    }

    override fun setColorFilter(colorFilter: ColorFilter?) {
        fillPaint.colorFilter = colorFilter
        strokePaint.colorFilter = colorFilter
    }

    override fun getOpacity(): Int = PixelFormat.TRANSLUCENT
}
