package com.satish.agrifarm

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.ui.Modifier
import androidx.navigation.compose.rememberNavController
import com.satish.agrifarm.data.repository.AgroRepository
import com.satish.agrifarm.ui.navigation.AgroLinkNavGraph
import com.satish.agrifarm.ui.theme.AgrifarmTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        AgroRepository.initialize(applicationContext)
        enableEdgeToEdge()
        setContent {
            AgrifarmTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    val navController = rememberNavController()
                    AgroLinkNavGraph(navController = navController)
                }
            }
        }
    }
}
