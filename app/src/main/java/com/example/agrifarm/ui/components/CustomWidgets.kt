package com.satish.agrifarm.ui.components

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
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
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.satish.agrifarm.data.model.*
import com.satish.agrifarm.ui.theme.*
import com.satish.agrifarm.data.repository.AgroRepository
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState

// 1. High-Fidelity Product Card
@Composable
fun HighFidelityProductCard(
    product: Product,
    onProductClick: () -> Unit,
    onAddToCartClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier
            .fillMaxWidth()
            .clickable { onProductClick() },
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 3.dp)
    ) {
        Column {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(130.dp)
                    .background(
                        Brush.verticalGradient(
                            colors = listOf(GreenLight, Color.White)
                        )
                    )
            ) {
                // Background icon representation since we have no physical image URLs
                Icon(
                    imageVector = when (product.category) {
                        "Fertilizers" -> Icons.Default.Eco
                        "Seeds" -> Icons.Default.Grass
                        "Weed Killers" -> Icons.Default.Agriculture
                        "Tools" -> Icons.Default.Build
                        else -> Icons.Default.Yard
                    },
                    contentDescription = null,
                    modifier = Modifier
                        .size(64.dp)
                        .align(Alignment.Center),
                    tint = GreenPrimary.copy(alpha = 0.3f)
                )

                // High fidelity tags (BEST SELLER / -15% / BEST DEAL)
                val tag = when {
                    product.rating >= 4.7f -> "BEST SELLER"
                    product.price > 1000 -> "BEST DEAL"
                    product.stock < 20 -> "LOW STOCK"
                    else -> null
                }

                if (tag != null) {
                    val tagBg = when (tag) {
                        "BEST SELLER" -> GreenPrimary
                        "LOW STOCK" -> OrangeAccent
                        else -> EarthBrown
                    }
                    Box(
                        modifier = Modifier
                            .padding(8.dp)
                            .clip(RoundedCornerShape(8.dp))
                            .background(tagBg)
                            .padding(horizontal = 8.dp, vertical = 4.dp)
                            .align(Alignment.TopStart)
                    ) {
                        Text(
                            text = tag,
                            color = Color.White,
                            fontSize = 9.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }
            }

            Column(
                modifier = Modifier
                    .padding(12.dp)
                    .fillMaxWidth()
            ) {
                Text(
                    text = product.name,
                    fontWeight = FontWeight.Bold,
                    fontSize = 14.sp,
                    color = TextDark,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
                if (!product.shopName.isNullOrEmpty()) {
                    Spacer(modifier = Modifier.height(2.dp))
                    Text(
                        text = "Store: ${product.shopName}",
                        fontSize = 10.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = GreenPrimary,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis
                    )
                }
                
                Spacer(modifier = Modifier.height(2.dp))
                
                Text(
                    text = "5 kg • Granular",
                    fontSize = 11.sp,
                    color = TextMuted
                )

                Spacer(modifier = Modifier.height(8.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text(
                            text = "₹${product.price}",
                            fontWeight = FontWeight.Bold,
                            fontSize = 16.sp,
                            color = GreenDark
                        )
                        if (product.price > 300) {
                            Text(
                                text = "₹${(product.price * 1.3).toInt()}",
                                fontSize = 11.sp,
                                color = TextMuted,
                                style = LocalTextStyle.current.copy(
                                    textDecoration = androidx.compose.ui.text.style.TextDecoration.LineThrough
                                )
                            )
                        }
                    }

                    // Green circular add button
                    Box(
                        modifier = Modifier
                            .size(36.dp)
                            .clip(CircleShape)
                            .background(GreenPrimary)
                            .clickable { onAddToCartClick() },
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.Add,
                            contentDescription = "Add to Cart",
                            tint = Color.White,
                            modifier = Modifier.size(20.dp)
                        )
                    }
                }
            }
        }
    }
}

// Helper to map string icon names to Material Icons
fun mapConditionIcon(name: String): ImageVector {
    return when (name) {
        "WbSunny" -> Icons.Default.WbSunny
        "Cloud" -> Icons.Default.Cloud
        "WbCloudy" -> Icons.Default.WbCloudy
        "Grain" -> Icons.Default.Grain
        else -> Icons.Default.WbSunny
    }
}

// 2. High-Fidelity Weather Card
@Composable
fun WeatherDashboardCard(
    modifier: Modifier = Modifier,
    onTipClick: () -> Unit = {}
) {
    val weatherState by AgroRepository.weatherForecastState.collectAsState()

    LaunchedEffect(Unit) {
        AgroRepository.fetchWeatherForecast()
    }

    val firstForecast = (weatherState as? UiState.Success)?.data?.firstOrNull()

    val location = firstForecast?.location?.uppercase() ?: "KUMBAKONAM, TAMIL NADU"
    val temp = firstForecast?.tempCelsius?.let { "${it}°C" } ?: "32°C"
    val condition = firstForecast?.conditionText ?: "Sunny Interval"
    val icon = firstForecast?.conditionIcon?.let { mapConditionIcon(it) } ?: Icons.Default.WbSunny

    Card(
        modifier = modifier.fillMaxWidth(),
        shape = RoundedCornerShape(24.dp),
        colors = CardDefaults.cardColors(containerColor = Color.Transparent)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .background(
                    Brush.verticalGradient(
                        colors = listOf(GreenDark, GreenPrimary)
                    )
                )
                .padding(20.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = location,
                        color = Color.White.copy(alpha = 0.7f),
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = temp,
                        color = Color.White,
                        fontSize = 36.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = condition,
                        color = Color.White,
                        fontSize = 16.sp
                    )
                }

                Icon(
                    imageVector = icon,
                    contentDescription = "Weather icon",
                    tint = GoldAccent,
                    modifier = Modifier.size(64.dp)
                )
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Sub-card sowing tips
            Card(
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White.copy(alpha = 0.15f)),
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable { onTipClick() }
            ) {
                Row(
                    modifier = Modifier.padding(12.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Box(
                        modifier = Modifier
                            .size(32.dp)
                            .clip(CircleShape)
                            .background(Color.White.copy(alpha = 0.2f)),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.Agriculture,
                            contentDescription = "Tractor",
                            tint = Color.White,
                            modifier = Modifier.size(18.dp)
                        )
                    }
                    Spacer(modifier = Modifier.width(12.dp))
                    Text(
                        text = "Perfect time for sowing. Ideal soil moisture and 60% sunlight predicted.",
                        color = Color.White,
                        fontSize = 12.sp,
                        maxLines = 2,
                        modifier = Modifier.weight(1f)
                    )
                }
            }
        }
    }
}

// 3. Category Card button list
@Composable
fun CategoryRowItem(
    category: CategoryItem,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier
            .fillMaxWidth()
            .clickable { onClick() },
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .size(48.dp)
                    .clip(CircleShape)
                    .background(Color(category.tintHex)),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = when (category.iconName) {
                        "fertilizer" -> Icons.Default.Eco
                        "pesticide" -> Icons.Default.BugReport
                        "weed" -> Icons.Default.Agriculture
                        "seed" -> Icons.Default.Grass
                        "tool" -> Icons.Default.Build
                        else -> Icons.Default.Yard
                    },
                    contentDescription = null,
                    tint = when (category.iconName) {
                        "fertilizer" -> GreenPrimary
                        "pesticide" -> RedAccent
                        "weed" -> OrangeAccent
                        "seed" -> GreenDark
                        "tool" -> EarthBrown
                        else -> GreenSecondary
                    },
                    modifier = Modifier.size(24.dp)
                )
            }

            Spacer(modifier = Modifier.width(16.dp))

            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = category.title,
                    fontWeight = FontWeight.Bold,
                    fontSize = 16.sp,
                    color = TextDark
                )
                Text(
                    text = category.subtitle,
                    fontSize = 12.sp,
                    color = TextMuted
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

// 4. AgriExpertAdviceCard
@Composable
fun AgriExpertAdviceCard(
    onContactClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier.fillMaxWidth(),
        shape = RoundedCornerShape(20.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(140.dp)
                .background(
                    Brush.horizontalGradient(
                        colors = listOf(GreenDark, GreenPrimary)
                    )
                )
        ) {
            // Background visual details
            Icon(
                imageVector = Icons.Default.SupportAgent,
                contentDescription = null,
                tint = Color.White.copy(alpha = 0.1f),
                modifier = Modifier
                    .size(150.dp)
                    .align(Alignment.CenterEnd)
            )

            Column(
                modifier = Modifier
                    .padding(20.dp)
                    .fillMaxHeight(),
                verticalArrangement = Arrangement.SpaceBetween
            ) {
                Column {
                    Text(
                        text = "EXPERT ADVICE",
                        color = Color.White.copy(alpha = 0.7f),
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = "Not sure what to buy?",
                        color = Color.White,
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold
                    )
                }

                Button(
                    onClick = onContactClick,
                    colors = ButtonDefaults.buttonColors(containerColor = GreenLight),
                    shape = RoundedCornerShape(10.dp)
                ) {
                    Text(
                        text = "Talk to Agri-Expert",
                        color = GreenDark,
                        fontWeight = FontWeight.Bold,
                        fontSize = 12.sp
                    )
                }
            }
        }
    }
}

// 5. Social Feed Post Card
@Composable
fun CommunityPostCard(
    post: SocialPost,
    onLikeClick: () -> Unit = {},
    onCommentClick: () -> Unit = {}
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(
                    modifier = Modifier
                        .size(40.dp)
                        .clip(CircleShape)
                        .background(GreenLight),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = post.authorName.take(1),
                        fontWeight = FontWeight.Bold,
                        color = GreenPrimary
                    )
                }
                Spacer(modifier = Modifier.width(12.dp))
                Column {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(
                            text = post.authorName,
                            fontWeight = FontWeight.Bold,
                            fontSize = 14.sp
                        )
                        if (post.isVerified) {
                            Spacer(modifier = Modifier.width(4.dp))
                            Icon(
                                imageVector = Icons.Default.CheckCircle,
                                contentDescription = "Verified",
                                tint = GreenPrimary,
                                modifier = Modifier.size(14.dp)
                            )
                        }
                    }
                    Text(
                        text = post.authorRole,
                        fontSize = 11.sp,
                        color = TextMuted
                    )
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            Text(
                text = post.content,
                fontSize = 13.sp,
                color = TextDark,
                lineHeight = 18.sp
            )

            Spacer(modifier = Modifier.height(12.dp))

            // Subdued illustration representing post photo
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(160.dp)
                    .clip(RoundedCornerShape(12.dp))
                    .background(
                        Brush.linearGradient(
                            colors = listOf(GreenLight, TintWeedKillers)
                        )
                    ),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = Icons.Default.Image,
                    contentDescription = null,
                    tint = GreenPrimary.copy(alpha = 0.2f),
                    modifier = Modifier.size(48.dp)
                )
            }

            Spacer(modifier = Modifier.height(12.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = Icons.Default.Favorite,
                        contentDescription = "Likes",
                        tint = RedAccent,
                        modifier = Modifier
                            .size(20.dp)
                            .clickable { onLikeClick() }
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(text = "${post.likesCount}", fontSize = 12.sp, color = TextDark)
                    
                    Spacer(modifier = Modifier.width(16.dp))
                    
                    Icon(
                        imageVector = Icons.Default.Comment,
                        contentDescription = "Comments",
                        tint = TextMuted,
                        modifier = Modifier
                            .size(20.dp)
                            .clickable { onCommentClick() }
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(text = "${post.commentsCount}", fontSize = 12.sp, color = TextDark)
                }
                
                Text(text = post.timeAgo, fontSize = 11.sp, color = TextMuted)
            }
        }
    }
}

// 6. Notification Row Item
@Composable
fun NotificationRow(
    notification: NotificationItem,
    onClick: () -> Unit
) {
    val unreadBg = if (!notification.isRead) Color(0xFFF1F8E9) else Color.White
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .background(unreadBg)
            .clickable { onClick() }
            .padding(16.dp),
        verticalAlignment = Alignment.Top
    ) {
        Box(
            modifier = Modifier
                .size(40.dp)
                .clip(CircleShape)
                .background(
                    when (notification.category) {
                        "Orders" -> TintFertilizers
                        "Harvest" -> TintWeedKillers
                        "Offers" -> TintPesticides
                        else -> TintTools
                    }
                ),
            contentAlignment = Alignment.Center
        ) {
            Icon(
                imageVector = when (notification.category) {
                    "Orders" -> Icons.Default.LocalShipping
                    "Harvest" -> Icons.Default.Grass
                    "Offers" -> Icons.Default.LocalOffer
                    "Security" -> Icons.Default.Security
                    else -> Icons.Default.Notifications
                },
                contentDescription = null,
                tint = when (notification.category) {
                    "Orders" -> GreenPrimary
                    "Harvest" -> OrangeAccent
                    "Offers" -> RedAccent
                    "Security" -> BlueAccent
                    else -> TextDark
                },
                modifier = Modifier.size(20.dp)
            )
        }

        Spacer(modifier = Modifier.width(12.dp))

        Column(modifier = Modifier.weight(1f)) {
            Text(
                text = notification.title,
                fontWeight = if (!notification.isRead) FontWeight.Bold else FontWeight.Normal,
                fontSize = 14.sp,
                color = TextDark
            )
            Spacer(modifier = Modifier.height(2.dp))
            Text(
                text = notification.message,
                fontSize = 12.sp,
                color = TextMuted,
                lineHeight = 16.sp
            )
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = notification.timeAgo,
                fontSize = 10.sp,
                color = TextMuted
            )
        }
    }
}

// 7. FAQ Accordion Item
@Composable
fun FAQAccordion(
    title: String,
    content: String
) {
    var expanded by remember { mutableStateOf(false) }

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        border = BorderStroke(1.dp, DividerGray)
    ) {
        Column(modifier = Modifier.clickable { expanded = !expanded }) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = title,
                    fontWeight = FontWeight.Bold,
                    fontSize = 14.sp,
                    color = TextDark,
                    modifier = Modifier.weight(1f)
                )
                Icon(
                    imageVector = if (expanded) Icons.Default.ExpandLess else Icons.Default.ExpandMore,
                    contentDescription = null,
                    tint = TextMuted
                )
            }

            AnimatedVisibility(visible = expanded) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(start = 16.dp, end = 16.dp, bottom = 16.dp)
                ) {
                    Divider(color = DividerGray)
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = content,
                        fontSize = 12.sp,
                        color = TextMuted,
                        lineHeight = 16.sp
                    )
                }
            }
        }
    }
}
