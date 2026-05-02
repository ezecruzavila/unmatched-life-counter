package com.unmatchedcounter.util

import android.util.Log
import com.unmatchedcounter.BuildConfig

object LogUtils {

    const val TAG_DEFAULT = "SC_Debug"
    const val TAG_INCREMENTER = "SC_Incrementer_Debug"
    const val TAG_TABLETOP_TOUCH_EVENTS = "SC_Tabletop_TE_Debug"

    private val whiteList = setOf(
        TAG_DEFAULT,
//        TAG_INCREMENTER,
        TAG_TABLETOP_TOUCH_EVENTS,
    )

    fun d(message: String, tag: String = TAG_DEFAULT) {
        if (BuildConfig.DEBUG && whiteList.contains(tag)) {
            Log.d(tag, message)
        }
    }
}
