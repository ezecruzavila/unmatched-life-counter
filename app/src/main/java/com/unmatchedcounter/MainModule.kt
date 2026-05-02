package com.unmatchedcounter

import android.content.Context
import com.unmatchedcounter.persistence.Datastore
import com.unmatchedcounter.persistence.DatastoreImpl
import com.unmatchedcounter.persistence.GameRepository
import com.unmatchedcounter.persistence.GameRepositoryImpl
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object MainModule {

    @Provides
    @Singleton
    fun providesDatastore(@ApplicationContext appContext: Context): Datastore {
        return DatastoreImpl(appContext)
    }

    @Provides
    @Singleton
    fun providesGameRepository(datastore: Datastore): GameRepository {
        return GameRepositoryImpl(datastore)
    }
}
