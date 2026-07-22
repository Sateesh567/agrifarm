package com.satish.agrifarm.ui.farmer

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.satish.agrifarm.BuildConfig
import com.satish.agrifarm.ui.components.FarmerBottomBar
import com.satish.agrifarm.ui.components.WeatherDashboardCard
import com.satish.agrifarm.ui.navigation.Screen
import com.satish.agrifarm.ui.components.mapConditionIcon
import com.satish.agrifarm.data.model.UiState
import com.satish.agrifarm.ui.theme.*
import androidx.compose.foundation.verticalScroll
import androidx.compose.runtime.collectAsState
import com.satish.agrifarm.data.repository.AgroRepository


@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun FarmerHomeScreen(
    onProductClick: (String) -> Unit,
    onCartClick: () -> Unit,
    onNavigate: (String) -> Unit
) {
    val shopsState by AgroRepository.shops.collectAsState()
    val approvedShops = shopsState.filter { it.status == "APPROVED" }
    val weatherState by AgroRepository.weatherForecastState.collectAsState()

    LaunchedEffect(Unit) {
        AgroRepository.fetchShops()
        AgroRepository.fetchWeatherForecast()
    }
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("AgriFarm", fontWeight = FontWeight.Bold, color = Color.White) },
                navigationIcon = {
                    IconButton(onClick = { onNavigate(Screen.Profile.route) }) {
                        Icon(Icons.Default.Menu, contentDescription = "Menu", tint = Color.White)
                    }
                },
                actions = {
                    IconButton(onClick = { onNavigate(Screen.Search.route) }) {
                        Icon(Icons.Default.Search, contentDescription = "Search", tint = Color.White)
                    }
                    IconButton(onClick = onCartClick) {
                        Icon(Icons.Default.ShoppingCart, contentDescription = "Cart", tint = Color.White)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = GreenPrimary
                )
            )
        },
        bottomBar = {
            FarmerBottomBar(
                currentRoute = Screen.FarmerHome.route,
                onNavigate = onNavigate
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
            // Weather Card Widget
            WeatherDashboardCard(
                onTipClick = { onNavigate(Screen.CustomerSupport.route) }
            )

            // AI Scanner & Mandi Price utilities row
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                Card(
                    modifier = Modifier
                        .weight(1f)
                        .height(96.dp)
                        .clickable { onNavigate(Screen.CropScanner.route) },
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    border = BorderStroke(1.dp, DividerGray)
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(12.dp),
                        verticalArrangement = Arrangement.SpaceBetween
                    ) {
                        Box(
                            modifier = Modifier
                                .size(32.dp)
                                .clip(CircleShape)
                                .background(GreenLight),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Default.CameraAlt,
                                contentDescription = null,
                                tint = GreenPrimary,
                                modifier = Modifier.size(18.dp)
                            )
                        }
                        Column {
                            Text(
                                text = "AI Crop Doctor",
                                fontWeight = FontWeight.Bold,
                                fontSize = 13.sp,
                                color = TextDark
                            )
                            Text(
                                text = "Scan & Diagnose",
                                fontSize = 10.sp,
                                color = TextMuted
                            )
                        }
                    }
                }

                Card(
                    modifier = Modifier
                        .weight(1f)
                        .height(96.dp)
                        .clickable { onNavigate(Screen.MandiPrices.route) },
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    border = BorderStroke(1.dp, DividerGray)
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(12.dp),
                        verticalArrangement = Arrangement.SpaceBetween
                    ) {
                        Box(
                            modifier = Modifier
                                .size(32.dp)
                                .clip(CircleShape)
                                .background(Color(0xFFFFF3E0)),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Default.TrendingUp,
                                contentDescription = null,
                                tint = OrangeAccent,
                                modifier = Modifier.size(18.dp)
                            )
                        }
                        Column {
                            Text(
                                text = "Mandi Prices",
                                fontWeight = FontWeight.Bold,
                                fontSize = 13.sp,
                                color = TextDark
                            )
                            Text(
                                text = "Live APMC Rates",
                                fontSize = 10.sp,
                                color = TextMuted
                            )
                        }
                    }
                }
            }

            if (approvedShops.isNotEmpty()) {
                Column {
                    Text(
                        text = "Featured Farms & Shops",
                        fontWeight = FontWeight.Bold,
                        fontSize = 16.sp,
                        color = TextDark
                    )
                    Spacer(modifier = Modifier.height(10.dp))
                    LazyRow(
                        horizontalArrangement = Arrangement.spacedBy(16.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        items(approvedShops) { shop ->
                            SwiggyStyleShopCard(shop = shop, onClick = {
                                onNavigate(Screen.ShopCatalog.createRoute(shop.id))
                            })
                        }
                    }
                }
            }

            // 5-Day Forecast Row
            Column {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "5-Day Forecast",
                        fontWeight = FontWeight.Bold,
                        fontSize = 16.sp,
                        color = TextDark
                    )
                    Text(
                        text = "VIEW DETAILS",
                        fontWeight = FontWeight.Bold,
                        fontSize = 11.sp,
                        color = GreenPrimary,
                        modifier = Modifier.clickable { onNavigate(Screen.CustomerSupport.route) }
                    )
                }

                Spacer(modifier = Modifier.height(10.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    val days = when (val state = weatherState) {
                        is UiState.Success -> state.data.map {
                            ForecastDay(
                                name = it.dayName,
                                temp = it.temp,
                                icon = mapConditionIcon(it.conditionIcon),
                                isActive = it.isAlert
                            )
                        }
                        else -> listOf(
                            ForecastDay("MON", "21°", Icons.Default.Cloud, false),
                            ForecastDay("TUE", "32°", Icons.Default.WbSunny, true),
                            ForecastDay("WED", "22°", Icons.Default.WbCloudy, false),
                            ForecastDay("THU", "28°", Icons.Default.WbSunny, false),
                            ForecastDay("FRI", "27°", Icons.Default.Grain, false)
                        )
                    }

                    days.forEach { day ->
                        ForecastItem(day = day)
                    }
                }
            }

            // Market Trend Bar
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = Color(0xFFE8F5E9)),
                border = BorderStroke(1.dp, Color(0xFFC8E6C9))
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(
                            modifier = Modifier
                                .size(36.dp)
                                .clip(CircleShape)
                                .background(GreenPrimary.copy(alpha = 0.1f)),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Default.TrendingUp,
                                contentDescription = null,
                                tint = GreenPrimary,
                                modifier = Modifier.size(20.dp)
                            )
                        }
                        Spacer(modifier = Modifier.width(12.dp))
                        Column {
                            Text(
                                text = "MARKET TREND",
                                fontWeight = FontWeight.Bold,
                                fontSize = 10.sp,
                                color = GreenDark
                            )
                            Text(
                                text = "Paddy prices up 12%",
                                fontWeight = FontWeight.Bold,
                                fontSize = 14.sp,
                                color = TextDark
                            )
                        }
                    }

                    Icon(
                        imageVector = Icons.Default.ShowChart,
                        contentDescription = "Graph icon",
                        tint = GreenPrimary
                    )
                }
            }

            // Daily Crop Tips Section
            Column {
                Text(
                    text = "Daily Crop Tips",
                    fontWeight = FontWeight.Bold,
                    fontSize = 16.sp,
                    color = TextDark
                )

                Spacer(modifier = Modifier.height(10.dp))

                // Crop Tip 1 (Irrigation)
                CropTipItem(
                    title = "RICE WATER MANAGEMENT",
                    subtitle = "Maintain 5cm water level during tillering stage for maximum yield.",
                    icon = Icons.Default.WaterDrop,
                    iconBg = Color(0xFFE3F2FD),
                    iconTint = BlueAccent,
                    onNavigate = { onNavigate(Screen.CommunityFeed.route) }
                )

                Spacer(modifier = Modifier.height(10.dp))

                // Crop Tip 2 (Pest Alert)
                CropTipItem(
                    title = "PEST ALERT",
                    subtitle = "Watch out for stem borers during high-humidity weeks. Spray Neem oil early.",
                    icon = Icons.Default.BugReport,
                    iconBg = Color(0xFFFFEBEE),
                    iconTint = RedAccent,
                    onNavigate = { onNavigate(Screen.CommunityFeed.route) }
                )
                
                Spacer(modifier = Modifier.height(10.dp))

                // Crop Tip 3 (Fertilizer)
                CropTipItem(
                    title = "FERTILIZER TIP",
                    subtitle = "Apply balanced NPK organic compound today to stimulate active root nodes.",
                    icon = Icons.Default.Eco,
                    iconBg = Color(0xFFE8F5E9),
                    iconTint = GreenPrimary,
                    onNavigate = { onNavigate(Screen.ProductCategories.route) }
                )
            }
        }
    }
}

@Composable
fun CropTipItem(
    title: String,
    subtitle: String,
    icon: ImageVector,
    iconBg: Color,
    iconTint: Color,
    onNavigate: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onNavigate() },
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
            Box(
                modifier = Modifier
                    .size(44.dp)
                    .clip(CircleShape)
                    .background(iconBg),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = icon,
                    contentDescription = null,
                    tint = iconTint,
                    modifier = Modifier.size(22.dp)
                )
            }

            Spacer(modifier = Modifier.width(16.dp))

            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = title,
                    fontWeight = FontWeight.Bold,
                    fontSize = 11.sp,
                    color = iconTint
                )
                Text(
                    text = subtitle,
                    fontSize = 13.sp,
                    color = TextDark,
                    fontWeight = FontWeight.Medium,
                    lineHeight = 16.sp
                )
            }

            Icon(
                imageVector = Icons.Default.ChevronRight,
                contentDescription = null,
                tint = TextMuted
            )
        }
    }
}

@Composable
fun ForecastItem(day: ForecastDay) {
    val activeBg = if (day.isActive) GreenPrimary else Color.White
    val contentColor = if (day.isActive) Color.White else TextDark
    val mutedColor = if (day.isActive) Color.White.copy(alpha = 0.7f) else TextMuted

    Card(
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = activeBg),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
        border = if (!day.isActive) BorderStroke(1.dp, DividerGray) else null,
        modifier = Modifier.width(58.dp)
    ) {
        Column(
            modifier = Modifier
                .padding(vertical = 12.dp)
                .fillMaxWidth(),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(
                text = day.name,
                fontWeight = FontWeight.Bold,
                fontSize = 10.sp,
                color = mutedColor
            )
            Spacer(modifier = Modifier.height(8.dp))
            Icon(
                imageVector = day.icon,
                contentDescription = null,
                tint = if (day.isActive) Color.White else GoldAccent,
                modifier = Modifier.size(20.dp)
            )
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = day.temp,
                fontWeight = FontWeight.Bold,
                fontSize = 13.sp,
                color = contentColor
            )
        }
    }
}

data class ForecastDay(
    val name: String,
    val temp: String,
    val icon: ImageVector,
    val isActive: Boolean
)

@Composable
fun SwiggyStyleShopCard(
    shop: com.satish.agrifarm.data.model.Shop,
    onClick: () -> Unit
) {
    Card(
        modifier = Modifier
            .width(260.dp)
            .clickable { onClick() },
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        border = BorderStroke(1.dp, DividerGray)
    ) {
        Column {
            // Use BuildConfig.BASE_URL instead of hardcoded IP
            val serverRoot = BuildConfig.BASE_URL.removeSuffix("/api")
            val imgUrl = "$serverRoot/${shop.imageUrl}"
            coil.compose.AsyncImage(
                model = imgUrl,
                contentDescription = shop.name,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(130.dp)
                    .clip(RoundedCornerShape(topStart = 16.dp, topEnd = 16.dp)),
                contentScale = androidx.compose.ui.layout.ContentScale.Crop
            )
            
            Column(modifier = Modifier.padding(12.dp)) {
                Text(
                    text = shop.name,
                    fontWeight = FontWeight.Bold,
                    fontSize = 15.sp,
                    color = TextDark,
                    maxLines = 1
                )
                Spacer(modifier = Modifier.height(4.dp))
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = Icons.Default.Star,
                        contentDescription = null,
                        tint = GoldAccent,
                        modifier = Modifier.size(16.dp)
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(
                        text = "${shop.rating} • ${shop.category}",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = TextDark
                    )
                }
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = shop.address,
                    fontSize = 11.sp,
                    color = TextMuted,
                    maxLines = 1
                )
            }
        }
    }
}

@Preview(showBackground = true, showSystemUi = true)
@Composable
fun FarmerHomeScreenPreview() {
    AgrifarmTheme {
        FarmerHomeScreen(
            onProductClick = {},
            onCartClick = {},
            onNavigate = {}
        )
    }
}
