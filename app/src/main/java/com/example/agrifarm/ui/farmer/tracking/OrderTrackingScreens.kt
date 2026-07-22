package com.satish.agrifarm.ui.farmer.tracking

import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.satish.agrifarm.ui.navigation.Screen
import com.satish.agrifarm.ui.theme.*

// ==========================================
// 1. Live Order Tracking Screen
// ==========================================
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LiveTrackingScreen(
    onBackClick: () -> Unit,
    onNavigate: (String) -> Unit
) {
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Live Order Tracking", fontWeight = FontWeight.Bold, color = Color.White) },
                navigationIcon = {
                    IconButton(onClick = onBackClick) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = Color.White)
                    }
                },
                actions = {
                    IconButton(onClick = {}) {
                        Icon(Icons.Default.Search, contentDescription = "Search", tint = Color.White)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = GreenPrimary)
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .padding(padding)
                .fillMaxSize()
                .background(BackgroundWhite)
                .verticalScroll(rememberScrollState())
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Map box visual (aerial representation)
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(180.dp)
                    .clickable { onNavigate(Screen.PartnerMapTracking.route) },
                shape = RoundedCornerShape(20.dp),
                border = BorderStroke(1.dp, DividerGray)
            ) {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .background(
                            Brush.linearGradient(
                                colors = listOf(GreenLight, TintWeedKillers)
                            )
                        ),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.Map,
                        contentDescription = null,
                        tint = GreenPrimary.copy(alpha = 0.2f),
                        modifier = Modifier.size(80.dp)
                    )
                    
                    Box(
                        modifier = Modifier
                            .align(Alignment.Center)
                            .clip(RoundedCornerShape(8.dp))
                            .background(Color.White.copy(alpha = 0.9f))
                            .padding(8.dp)
                    ) {
                        Text("Tap to view full tracking map", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = TextDark)
                    }
                }
            }

            // Estimate box
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                border = BorderStroke(1.dp, DividerGray)
            ) {
                Row(
                    modifier = Modifier.padding(16.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text("Estimated Delivery", fontSize = 11.sp, color = TextMuted)
                        Text("12:45 PM (15 mins)", fontWeight = FontWeight.Bold, fontSize = 15.sp, color = TextDark)
                    }

                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(6.dp))
                            .background(GreenLight)
                            .padding(horizontal = 8.dp, vertical = 4.dp)
                    ) {
                        Text("ON THE WAY", color = GreenDark, fontWeight = FontWeight.Bold, fontSize = 10.sp)
                    }
                }
            }

            // Partner details
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                border = BorderStroke(1.dp, DividerGray)
            ) {
                Row(
                    modifier = Modifier.padding(12.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(
                            modifier = Modifier
                                .size(44.dp)
                                .clip(CircleShape)
                                .background(GreenLight),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(Icons.Default.Person, contentDescription = null, tint = GreenPrimary)
                        }
                        Spacer(modifier = Modifier.width(12.dp))
                        Column {
                            Text("Arjun Kumar", fontWeight = FontWeight.Bold, fontSize = 14.sp)
                            Text("AgriFarm Verified Partner", fontSize = 11.sp, color = TextMuted)
                        }
                    }

                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        IconButton(
                            onClick = { onNavigate(Screen.ChatWithSeller.route) },
                            modifier = Modifier
                                .size(36.dp)
                                .clip(CircleShape)
                                .background(GreenLight)
                        ) {
                            Icon(Icons.Default.Chat, contentDescription = "Chat", tint = GreenPrimary, modifier = Modifier.size(18.dp))
                        }

                        IconButton(
                            onClick = {},
                            modifier = Modifier
                                .size(36.dp)
                                .clip(CircleShape)
                                .background(GreenLight)
                        ) {
                            Icon(Icons.Default.Call, contentDescription = "Call", tint = GreenPrimary, modifier = Modifier.size(18.dp))
                        }
                    }
                }
            }

            // Stepper milestone tracking
            Text("Order Progress", fontWeight = FontWeight.Bold, fontSize = 14.sp, color = TextDark)

            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                border = BorderStroke(1.dp, DividerGray)
            ) {
                Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    TrackingStepMilestone(title = "Order Placed", desc = "Today, 11:30 AM", completed = true, current = false)
                    TrackingStepMilestone(title = "Packed & Ready", desc = "Today, 12:05 PM", completed = true, current = false)
                    TrackingStepMilestone(title = "Out for Delivery", desc = "Arjun is on his way to your farm", completed = false, current = true)
                    TrackingStepMilestone(title = "Delivered", desc = "Estimated by 12:45 PM", completed = false, current = false)
                }
            }

            Spacer(modifier = Modifier.height(20.dp))
        }
    }
}

@Composable
fun TrackingStepMilestone(
    title: String,
    desc: String,
    completed: Boolean,
    current: Boolean
) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        verticalAlignment = Alignment.Top
    ) {
        Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.width(24.dp)) {
            Box(
                modifier = Modifier
                    .size(16.dp)
                    .clip(CircleShape)
                    .background(
                        when {
                            completed -> GreenPrimary
                            current -> OrangeAccent
                            else -> DividerGray
                        }
                    ),
                contentAlignment = Alignment.Center
            ) {
                if (completed) {
                    Icon(Icons.Default.Check, contentDescription = null, tint = Color.White, modifier = Modifier.size(10.dp))
                }
            }
            
            Spacer(modifier = Modifier.height(4.dp))
            Box(
                modifier = Modifier
                    .width(2.dp)
                    .height(30.dp)
                    .background(if (completed) GreenPrimary else DividerGray)
            )
        }

        Spacer(modifier = Modifier.width(16.dp))

        Column {
            Text(
                text = title,
                fontWeight = if (current || completed) FontWeight.Bold else FontWeight.Normal,
                fontSize = 13.sp,
                color = if (current) OrangeAccent else TextDark
            )
            Text(text = desc, fontSize = 11.sp, color = TextMuted)
        }
    }
}

// ==========================================
// 2. Partner Map Tracking Screen (Fullscreen)
// ==========================================
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PartnerMapTrackingScreen(
    onCloseClick: () -> Unit
) {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color.White)
    ) {
        // Mock Map representation
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(
                    Brush.radialGradient(
                        colors = listOf(GreenLight, TintWeedKillers)
                    )
                )
        ) {
            Canvas(modifier = Modifier.fillMaxSize()) {
                // Draw map route lines
                drawLine(
                    color = GreenPrimary,
                    start = androidx.compose.ui.geometry.Offset(100f, 200f),
                    end = androidx.compose.ui.geometry.Offset(400f, 600f),
                    strokeWidth = 10f
                )
                drawLine(
                    color = GreenPrimary,
                    start = androidx.compose.ui.geometry.Offset(400f, 600f),
                    end = androidx.compose.ui.geometry.Offset(800f, 800f),
                    strokeWidth = 10f
                )
            }

            // Top Bar
            TopAppBar(
                title = { Text("Partner Tracking / Map", fontWeight = FontWeight.Bold, color = Color.White) },
                navigationIcon = {
                    IconButton(onClick = onCloseClick) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Close", tint = Color.White)
                    }
                },
                actions = {
                    IconButton(onClick = {}) {
                        Icon(Icons.Default.Search, contentDescription = "Search", tint = Color.White)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = GreenPrimary.copy(alpha = 0.9f))
            )

            // Pin elements represent locations
            Box(
                modifier = Modifier
                    .align(Alignment.Center)
                    .offset(x = (-60).dp, y = (-40).dp)
                    .size(48.dp)
                    .clip(CircleShape)
                    .background(Color.White)
                    .border(2.dp, GreenPrimary, CircleShape),
                contentAlignment = Alignment.Center
            ) {
                Icon(Icons.Default.Agriculture, contentDescription = null, tint = GreenPrimary)
            }

            Box(
                modifier = Modifier
                    .align(Alignment.Center)
                    .offset(x = 100.dp, y = 120.dp)
                    .size(48.dp)
                    .clip(CircleShape)
                    .background(Color.White)
                    .border(2.dp, RedAccent, CircleShape),
                contentAlignment = Alignment.Center
            ) {
                Icon(Icons.Default.MyLocation, contentDescription = null, tint = RedAccent)
            }

            // Bottom overlay card
            Card(
                modifier = Modifier
                    .align(Alignment.BottomCenter)
                    .fillMaxWidth()
                    .padding(16.dp),
                shape = RoundedCornerShape(20.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                elevation = CardDefaults.cardElevation(defaultElevation = 8.dp)
            ) {
                Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text("ESTIMATED ARRIVAL", fontSize = 10.sp, color = TextMuted, fontWeight = FontWeight.Bold)
                            Text("12 - 15 Mins", fontSize = 20.sp, fontWeight = FontWeight.Bold, color = TextDark)
                        }

                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(6.dp))
                                .background(GreenLight)
                                .padding(horizontal = 8.dp, vertical = 4.dp)
                        ) {
                            Text("ON TIME", color = GreenDark, fontWeight = FontWeight.Bold, fontSize = 10.sp)
                        }
                    }

                    Divider(color = DividerGray)

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Box(
                                modifier = Modifier
                                    .size(40.dp)
                                    .clip(CircleShape)
                                    .background(GreenLight),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(Icons.Default.Person, contentDescription = null, tint = GreenPrimary)
                            }
                            Spacer(modifier = Modifier.width(12.dp))
                            Column {
                                Text("Selvam R.", fontWeight = FontWeight.Bold, fontSize = 14.sp)
                                Text("AgriFarm Expert Partner", fontSize = 11.sp, color = TextMuted)
                            }
                        }

                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            IconButton(
                                onClick = {},
                                modifier = Modifier
                                    .size(36.dp)
                                    .clip(CircleShape)
                                    .background(GreenLight)
                            ) {
                                Icon(Icons.Default.Chat, contentDescription = "Chat", tint = GreenPrimary, modifier = Modifier.size(18.dp))
                            }
                            IconButton(
                                onClick = {},
                                modifier = Modifier
                                    .size(36.dp)
                                    .clip(CircleShape)
                                    .background(GreenLight)
                            ) {
                                Icon(Icons.Default.Call, contentDescription = "Call", tint = GreenPrimary, modifier = Modifier.size(18.dp))
                            }
                        }
                    }
                }
            }
        }
    }
}
