package com.unmatchedcounter.ui

import android.content.Intent
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import com.unmatchedcounter.R
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class SplashActivity : BaseActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_splash)
        Handler(Looper.getMainLooper()).postDelayed(
            {
                startActivity(Intent(this, MainActivity::class.java))
                finish()
            },
            SPLASH_MS,
        )
    }

    companion object {
        private const val SPLASH_MS = 700L
    }
}
