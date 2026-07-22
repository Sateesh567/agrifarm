package com.satish.agrifarm.ui.farmer

import androidx.compose.animation.core.*
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Eco
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.satish.agrifarm.ui.theme.AgrifarmTheme
import com.satish.agrifarm.ui.theme.GreenDark
import com.satish.agrifarm.ui.theme.GreenLight
import com.satish.agrifarm.ui.theme.GreenPrimary
import kotlinx.coroutines.delay

@Composable
fun SplashScreen(
    onSplashFinished: () -> Unit
) {
    // Launch timer to transition automatically
    LaunchedEffect(Unit) {
        delay(2500)
        onSplashFinished()
    }

    // High fidelity green gradient represents scenic mountain backgrounds
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(
                Brush.verticalGradient(
                    colors = listOf(
                        Color(0xFF388E3C), // Scenic Forest Top
                        GreenDark,        // Mid tea field green
                        Color(0xFF0C2B0E)  // Dark deep mountain bottom
                    )
                )
            )
            .clickable { onSplashFinished() } // Allow tapping to skip
    ) {
        // Decorative background hills drawn with Canvas
        Canvas(modifier = Modifier.fillMaxSize()) {
            drawCircle(
                color = Color.White.copy(alpha = 0.03f),
                radius = size.width * 0.8f,
                center = androidx.compose.ui.geometry.Offset(size.width * 0.5f, size.height * 0.5f)
            )
            drawCircle(
                color = Color.White.copy(alpha = 0.02f),
                radius = size.width * 1.2f,
                center = androidx.compose.ui.geometry.Offset(size.width * 0.5f, size.height * 0.6f)
            )
        }

        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            Spacer(modifier = Modifier.height(1.dp))

            // Logo and Brand Name
            Column(
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                // Central Logo Circle
                Box(
                    modifier = Modifier
                        .size(100.dp)
                        .clip(CircleShape)
                        .background(Color.White.copy(alpha = 0.15f))
                        .border(
                            width = 2.dp,
                            color = Color.White.copy(alpha = 0.3f),
                            shape = CircleShape
                        ),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.Eco,
                        contentDescription = "Logo",
                        tint = Color.White,
                        modifier = Modifier.size(54.dp)
                    )
                }

                Spacer(modifier = Modifier.height(16.dp))

                Text(
                    text = "AgriFarm",
                    color = Color.White,
                    fontSize = 38.sp,
                    fontWeight = FontWeight.Bold,
                    fontFamily = FontFamily.SansSerif
                )
                
                Box(
                    modifier = Modifier
                        .width(48.dp)
                        .height(3.dp)
                        .background(GreenLight)
                        .padding(top = 4.dp)
                )
            }

            // Bottom brand credits and dot indicator
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                modifier = Modifier.padding(bottom = 24.dp)
            ) {
                Text(
                    text = "POWERED BY AGRIFARM ECOSYSTEM",
                    color = Color.White.copy(alpha = 0.6f),
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    letterSpacing = 1.sp
                )

                Spacer(modifier = Modifier.height(16.dp))

                // Pulsing dot indicators
                Row(
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    DotIndicator(active = true)
                    DotIndicator(active = true)
                    DotIndicator(active = true)
                }
            }
        }
    }
}

@Composable
fun DotIndicator(active: Boolean) {
    val size = 8.dp
    Box(
        modifier = Modifier
            .size(size)
            .clip(CircleShape)
            .background(if (active) GreenLight else Color.White.copy(alpha = 0.3f))
    )
}

@Preview(showBackground = true, showSystemUi = true)
@Composable
fun SplashScreenPreview() {
    AgrifarmTheme {
        SplashScreen(onSplashFinished = {})
    }
}
