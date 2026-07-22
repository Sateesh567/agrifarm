package com.satish.agrifarm.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.satish.agrifarm.R
import com.satish.agrifarm.ui.navigation.Screen
import com.satish.agrifarm.ui.theme.GreenPrimary
import com.satish.agrifarm.ui.theme.TextMuted

@Composable
fun FarmerBottomBar(
    currentRoute: String?,
    onNavigate: (String) -> Unit
) {
    NavigationBar(
        containerColor = Color.White,
        tonalElevation = 8.dp,
        modifier = Modifier.height(72.dp)
    ) {
        val items = listOf(
            NavigationItem(stringResource(R.string.nav_home), Icons.Default.Home, Screen.FarmerHome.route),
            NavigationItem(stringResource(R.string.nav_categories), Icons.Default.GridView, Screen.ProductCategories.route),
            NavigationItem(stringResource(R.string.nav_orders), Icons.Default.ReceiptLong, Screen.OrderHistory.route),
            NavigationItem(stringResource(R.string.nav_profile), Icons.Default.Person, Screen.Profile.route)
        )

        items.forEach { item ->
            val isSelected = currentRoute == item.route
            NavigationBarItem(
                icon = {
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.Center
                    ) {
                        Icon(
                            imageVector = item.icon,
                            contentDescription = item.label,
                            tint = if (isSelected) GreenPrimary else TextMuted,
                            modifier = Modifier.size(24.dp)
                        )
                        if (isSelected) {
                            Spacer(modifier = Modifier.height(4.dp))
                            Box(
                                modifier = Modifier
                                    .size(6.dp)
                                    .clip(CircleShape)
                                    .background(GreenPrimary)
                             )
                        }
                    }
                },
                label = {
                    Text(
                        text = item.label,
                        fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
                        fontSize = 11.sp,
                        color = if (isSelected) GreenPrimary else TextMuted
                    )
                },
                selected = isSelected,
                onClick = { onNavigate(item.route) },
                colors = NavigationBarItemDefaults.colors(
                    indicatorColor = Color.Transparent
                )
            )
        }
    }
}

@Composable
fun SellerBottomBar(
    currentRoute: String?,
    onNavigate: (String) -> Unit
) {
    NavigationBar(
        containerColor = Color.White,
        tonalElevation = 8.dp,
        modifier = Modifier.height(72.dp)
    ) {
        val items = listOf(
            NavigationItem(stringResource(R.string.nav_dashboard), Icons.Default.Dashboard, Screen.ShopDashboard.route),
            NavigationItem(stringResource(R.string.nav_products), Icons.Default.Inventory, Screen.SellerProductManagement.route),
            NavigationItem(stringResource(R.string.nav_orders), Icons.Default.LocalShipping, Screen.SellerOrders.route),
            NavigationItem(stringResource(R.string.nav_settings), Icons.Default.Settings, Screen.SellerSettings.route)
        )

        items.forEach { item ->
            val isSelected = currentRoute == item.route
            NavigationBarItem(
                icon = {
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.Center
                    ) {
                        Icon(
                            imageVector = item.icon,
                            contentDescription = item.label,
                            tint = if (isSelected) GreenPrimary else TextMuted,
                            modifier = Modifier.size(24.dp)
                        )
                        if (isSelected) {
                            Spacer(modifier = Modifier.height(4.dp))
                            Box(
                                modifier = Modifier
                                    .size(6.dp)
                                    .clip(CircleShape)
                                    .background(GreenPrimary)
                            )
                        }
                    }
                },
                label = {
                    Text(
                        text = item.label,
                        fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
                        fontSize = 11.sp,
                        color = if (isSelected) GreenPrimary else TextMuted
                    )
                },
                selected = isSelected,
                onClick = { onNavigate(item.route) },
                colors = NavigationBarItemDefaults.colors(
                    indicatorColor = Color.Transparent
                )
            )
        }
    }
}

private data class NavigationItem(
    val label: String,
    val icon: ImageVector,
    val route: String
)
