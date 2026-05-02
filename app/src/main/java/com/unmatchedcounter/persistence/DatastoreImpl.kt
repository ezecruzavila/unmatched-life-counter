package com.unmatchedcounter.persistence

import android.app.Activity
import android.content.Context
import android.content.SharedPreferences

class DatastoreImpl(context: Context) : Datastore {

    companion object {
        private const val PREFERENCES_NAME = "com.unmatchedcounter.preferences"
        private const val KEY_HIDE_NAVIGATION = "key_hide_navigation"
    }

    private val prefs: SharedPreferences = context.getSharedPreferences(
        PREFERENCES_NAME,
        Activity.MODE_PRIVATE
    )

    private fun getEditor(): SharedPreferences.Editor = prefs.edit()

    override var hideNavigation: Boolean
        get() = prefs.getBoolean(KEY_HIDE_NAVIGATION, false)
        set(value) = getEditor().putBoolean(KEY_HIDE_NAVIGATION, value).apply()
}
