package com.unmatchedcounter.ui

import android.os.Bundle
import android.view.WindowManager
import androidx.appcompat.app.AppCompatActivity
import com.unmatchedcounter.R
import com.unmatchedcounter.persistence.Datastore
import dagger.hilt.EntryPoint
import dagger.hilt.EntryPoints
import dagger.hilt.InstallIn
import dagger.hilt.android.AndroidEntryPoint
import dagger.hilt.components.SingletonComponent

@AndroidEntryPoint
open class BaseActivity : AppCompatActivity() {

    @EntryPoint
    @InstallIn(SingletonComponent::class)
    interface DatastoreEntryPoint {
        fun provideDatastore(): Datastore
    }

    lateinit var datastore: Datastore

    override fun onCreate(savedInstanceState: Bundle?) {
        val entry = EntryPoints.get(applicationContext, DatastoreEntryPoint::class.java)
        datastore = entry.provideDatastore()
        setTheme(R.style.DarkTheme)
        super.onCreate(savedInstanceState)
        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
    }
}
