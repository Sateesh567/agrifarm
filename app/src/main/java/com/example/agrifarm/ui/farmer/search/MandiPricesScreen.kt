package com.satish.agrifarm.ui.farmer.search

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.satish.agrifarm.ui.theme.*
import com.satish.agrifarm.data.model.MandiItem
import com.satish.agrifarm.data.model.UiState
import com.satish.agrifarm.data.repository.AgroRepository

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MandiPricesScreen(
    onBackClick: () -> Unit
) {
    var selectedDistrict by remember { mutableStateOf("Coimbatore") }
    var searchQuery by remember { mutableStateOf("") }
    
    val districts = listOf("Coimbatore", "Salem", "Erode", "Madurai", "Trichy")
    val mandiState by AgroRepository.mandiPricesState.collectAsState()

    LaunchedEffect(selectedDistrict) {
        AgroRepository.fetchMandiPrices(selectedDistrict)
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Live Mandi Prices", fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    IconButton(onClick = onBackClick) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = Color.White)
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .padding(padding)
                .fillMaxSize()
                .background(BackgroundWhite)
        ) {
            // District Selector
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Color.White)
                    .padding(horizontal = 16.dp, vertical = 8.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                districts.forEach { dist ->
                    val isSelected = dist == selectedDistrict
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(8.dp))
                            .background(if (isSelected) GreenPrimary else GreenLight)
                            .clickable { selectedDistrict = dist }
                            .padding(horizontal = 12.dp, vertical = 6.dp)
                    ) {
                        Text(
                            text = dist,
                            fontWeight = FontWeight.Bold,
                            color = if (isSelected) Color.White else GreenDark,
                            fontSize = 12.sp
                        )
                    }
                }
            }

            // Search Bar
            OutlinedTextField(
                value = searchQuery,
                onValueChange = { searchQuery = it },
                placeholder = { Text("Search commodity...", fontSize = 13.sp) },
                leadingIcon = { Icon(Icons.Default.Search, contentDescription = null, tint = GreenPrimary) },
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                shape = RoundedCornerShape(10.dp),
                singleLine = true,
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = GreenPrimary,
                    focusedContainerColor = Color.White,
                    unfocusedContainerColor = Color.White
                )
            )

            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .weight(1f)
                    .verticalScroll(rememberScrollState())
                    .padding(horizontal = 16.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                // Live Prices Title
                Text(
                    text = "APMC Rates in $selectedDistrict District",
                    fontWeight = FontWeight.Bold,
                    fontSize = 15.sp,
                    color = TextDark
                )

                // List of Commodities
                when (val state = mandiState) {
                    is UiState.Loading -> {
                        Box(modifier = Modifier.fillMaxWidth().padding(40.dp), contentAlignment = Alignment.Center) {
                            CircularProgressIndicator(color = GreenPrimary)
                        }
                    }
                    is UiState.Error -> {
                        Text(
                            text = "Error: ${state.message}",
                            modifier = Modifier.fillMaxWidth().padding(24.dp),
                            textAlign = TextAlign.Center,
                            color = RedAccent,
                            fontSize = 13.sp
                        )
                    }
                    is UiState.Success -> {
                        val filteredList = state.data.filter {
                            it.cropName.contains(searchQuery, ignoreCase = true) ||
                                    it.variety.contains(searchQuery, ignoreCase = true)
                        }

                        Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                            if (filteredList.isEmpty()) {
                                Text(
                                    text = "No commodities found.",
                                    modifier = Modifier.fillMaxWidth().padding(24.dp),
                                    textAlign = TextAlign.Center,
                                    color = TextMuted,
                                    fontSize = 13.sp
                                )
                            } else {
                                filteredList.forEach { item ->
                                    MandiPriceCard(item = item)
                                }
                            }
                        }
                    }
                }

                // AI Weekly Price Trend Projection Chart Card
                Text(
                    text = "AI Market Trend Forecast",
                    fontWeight = FontWeight.Bold,
                    fontSize = 15.sp,
                    color = TextDark
                )

                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(20.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    border = BorderStroke(1.dp, DividerGray)
                ) {
                    Column(modifier = Modifier.padding(20.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column {
                                Text("WEEKLY PROJECTION", fontSize = 10.sp, color = TextMuted, fontWeight = FontWeight.Bold)
                                Text("Paddy Prices ($selectedDistrict Raw)", fontWeight = FontWeight.Bold, fontSize = 14.sp)
                            }
                            Box(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(6.dp))
                                    .background(GreenLight)
                                    .padding(horizontal = 6.dp, vertical = 2.dp)
                            ) {
                                Text("UPWARD TREND", color = GreenDark, fontSize = 9.sp, fontWeight = FontWeight.Bold)
                            }
                        }

                        // Custom drawn line graph using Canvas
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(120.dp)
                                .background(GreenLight.copy(alpha = 0.2f))
                        ) {
                            Canvas(modifier = Modifier.fillMaxSize()) {
                                // Draw grid lines
                                val gridLineCount = 4
                                for (i in 0..gridLineCount) {
                                    val y = size.height * (i.toFloat() / gridLineCount)
                                    drawLine(
                                        color = DividerGray,
                                        start = androidx.compose.ui.geometry.Offset(0f, y),
                                        end = androidx.compose.ui.geometry.Offset(size.width, y),
                                        strokeWidth = 1f
                                    )
                                }
                                
                                // Draw projection path
                                val points = listOf(0.1f, 0.25f, 0.2f, 0.45f, 0.6f, 0.85f)
                                val path = Path()
                                points.forEachIndexed { idx, pct ->
                                    val x = size.width * (idx.toFloat() / (points.size - 1))
                                    val y = size.height * (1f - pct)
                                    if (idx == 0) path.moveTo(x, y) else path.lineTo(x, y)
                                }
                                drawPath(
                                    path = path,
                                    color = GreenPrimary,
                                    style = Stroke(width = 6f)
                                )
                            }
                        }

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            listOf("Mon", "Tue", "Wed", "Thu", "Fri", "Sat").forEach { day ->
                                Text(day, fontSize = 10.sp, color = TextMuted)
                            }
                        }
                    }
                }
                
                Spacer(modifier = Modifier.height(20.dp))
            }
        }
    }
}

@Composable
fun MandiPriceCard(item: MandiItem) {
    val unit = if (item.minPrice > 500) "Quintal" else "Kg"
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        border = BorderStroke(1.dp, DividerGray)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(14.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = item.cropName,
                    fontWeight = FontWeight.Bold,
                    fontSize = 15.sp,
                    color = TextDark
                )
                Text(text = item.variety, fontSize = 11.sp, color = TextMuted)
                
                Spacer(modifier = Modifier.height(4.dp))
                
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(4.dp))
                        .background(if (item.trend == "HIGH") GreenLight else TintWeedKillers)
                        .padding(horizontal = 6.dp, vertical = 2.dp)
                        .align(Alignment.Start)
                ) {
                    Text(
                        text = "${item.trend} DEMAND",
                        color = if (item.trend == "HIGH") GreenDark else OrangeAccent,
                        fontSize = 8.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            }

            Column(horizontalAlignment = Alignment.End) {
                Text(
                    text = "₹${item.minPrice.toInt()} - ₹${item.maxPrice.toInt()}",
                    fontWeight = FontWeight.Bold,
                    fontSize = 15.sp,
                    color = TextDark
                )
                Text(text = "per $unit", fontSize = 11.sp, color = TextMuted)
                
                Spacer(modifier = Modifier.height(4.dp))

                // Trend display
                Row(verticalAlignment = Alignment.CenterVertically) {
                    val hasGain = item.priceChange > 0
                    val hasLoss = item.priceChange < 0
                    Icon(
                        imageVector = if (hasGain) Icons.Default.TrendingUp else if (hasLoss) Icons.Default.TrendingDown else Icons.Default.HorizontalRule,
                        contentDescription = null,
                        tint = if (hasGain) GreenPrimary else if (hasLoss) RedAccent else TextMuted,
                        modifier = Modifier.size(16.dp)
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(
                        text = if (hasGain) "+₹${item.priceChange.toInt()}" else if (hasLoss) "-₹${Math.abs(item.priceChange).toInt()}" else "Stable",
                        color = if (hasGain) GreenPrimary else if (hasLoss) RedAccent else TextMuted,
                        fontWeight = FontWeight.Bold,
                        fontSize = 12.sp
                    )
                }
            }
        }
    }
}
