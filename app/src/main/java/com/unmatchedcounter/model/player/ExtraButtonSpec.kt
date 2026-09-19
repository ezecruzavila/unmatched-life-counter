package com.unmatchedcounter.model.player

import androidx.annotation.ColorInt
import androidx.annotation.DrawableRes

/**
 * Optional floating button shown over a player's life counter, anchored to the
 * corner of the panel furthest from the table center. Configured per character
 * in [com.unmatchedcounter.UnmatchedCharacters].
 *
 * Two flavors are supported:
 *  - [Counter]: an image with a number overlaid; tapping decrements it, cycling
 *    back to the start once it passes 0.
 *  - [Toggle]: a text label that cycles through a fixed set of states, each with
 *    its own text color and background color.
 *
 * The button's mutable state is a single Int held on [PlayerModel.extraButtonValue]:
 *  - For [Counter] it is the current count.
 *  - For [Toggle] it is the index of the current state.
 */
sealed interface ExtraButtonSpec {

    /** The initial value stored on the player model when a game starts / resets. */
    val initialValue: Int

    /**
     * Image with a number on top. Starts at [start], each tap subtracts 1, and
     * cycling from 0 wraps back to [start].
     */
    data class Counter(
        @DrawableRes val imageResId: Int,
        val start: Int,
    ) : ExtraButtonSpec {
        override val initialValue: Int get() = start

        /** Next value after a tap: decrement by 1, wrapping 0 -> [start]. */
        fun nextValue(current: Int): Int = if (current <= 0) start else current - 1
    }

    /**
     * Text label cycling through [states]. Each state defines the label text,
     * the text color, and the button background color.
     */
    data class Toggle(
        val states: List<State>,
    ) : ExtraButtonSpec {
        init {
            require(states.size >= 2) { "Toggle button needs at least 2 states" }
        }

        override val initialValue: Int get() = 0

        /** Next state index after a tap: advance by 1, wrapping back to 0. */
        fun nextValue(current: Int): Int = (current + 1) % states.size

        fun stateAt(index: Int): State = states[index.mod(states.size)]

        data class State(
            val text: String,
            @ColorInt val textColorArgb: Int,
            @ColorInt val backgroundColorArgb: Int,
        )
    }
}
