package com.satish.agrifarm.ui.farmer.profile

import androidx.compose.foundation.*
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
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.satish.agrifarm.data.model.*
import com.satish.agrifarm.ui.components.CommunityPostCard
import com.satish.agrifarm.ui.components.FarmerBottomBar
import com.satish.agrifarm.ui.components.NotificationRow
import com.satish.agrifarm.ui.farmer.categories.FilterChip
import com.satish.agrifarm.ui.navigation.Screen
import com.satish.agrifarm.ui.theme.*

// Database, Repository & Date Formatting Imports
import com.satish.agrifarm.data.repository.AgroRepository
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

fun formatTimestamp(timestamp: Long): String {
    return try {
        val sdf = SimpleDateFormat("MMM dd, yyyy", Locale.getDefault())
        sdf.format(Date(timestamp))
    } catch (e: Exception) {
        "Date unknown"
    }
}

// ==========================================
// 1. Order History Screen
// ==========================================
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun OrderHistoryScreen(
    onNavigate: (String) -> Unit
) {
    val ordersState by AgroRepository.orders.collectAsState()
    val orders = ordersState

    LaunchedEffect(Unit) {
        AgroRepository.fetchOrders()
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
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = GreenPrimary)
            )
        },
        bottomBar = {
            FarmerBottomBar(currentRoute = Screen.OrderHistory.route, onNavigate = onNavigate)
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
            Column {
                Text(text = "Order History", fontWeight = FontWeight.Bold, fontSize = 20.sp, color = TextDark)
                Text(text = "Track your seasonal supplies and farm equipment", fontSize = 12.sp, color = TextMuted)
            }

            // Filters row
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                FilterChip("All Orders", active = true)
                FilterChip("Delivered", active = false)
                FilterChip("Processing", active = false)
            }

            // Orders list card
            if (orders.isEmpty()) {
                Box(
                    modifier = Modifier.fillMaxWidth().padding(32.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Text("No order history available.", color = TextMuted, fontSize = 14.sp)
                }
            } else {
                orders.forEach { order ->
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(16.dp),
                        colors = CardDefaults.cardColors(containerColor = Color.White),
                        border = BorderStroke(1.dp, DividerGray)
                    ) {
                        Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Column {
                                    Text(text = "ORDER #${order.orderId}", fontWeight = FontWeight.Bold, fontSize = 13.sp, color = TextDark)
                                    Text(
                                        text = formatTimestamp(order.timestamp),
                                        fontSize = 11.sp,
                                        color = TextMuted
                                    )
                                }

                                val chipColor = when(order.status) {
                                    OrderStatus.DELIVERED -> GreenLight
                                    OrderStatus.PENDING -> TintWeedKillers
                                    OrderStatus.CANCELLED -> TintPesticides
                                    else -> GreenLight
                                }
                                val textColor = when(order.status) {
                                    OrderStatus.DELIVERED -> GreenDark
                                    OrderStatus.PENDING -> OrangeAccent
                                    OrderStatus.CANCELLED -> RedAccent
                                    else -> GreenDark
                                }
                                Box(
                                    modifier = Modifier
                                        .clip(RoundedCornerShape(6.dp))
                                        .background(chipColor)
                                        .padding(horizontal = 8.dp, vertical = 4.dp)
                                ) {
                                    Text(
                                        text = order.status.name,
                                        color = textColor,
                                        fontWeight = FontWeight.Bold,
                                        fontSize = 10.sp
                                    )
                                }
                            }

                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Box(
                                    modifier = Modifier
                                        .size(44.dp)
                                        .clip(RoundedCornerShape(8.dp))
                                        .background(GreenLight),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Icon(Icons.Default.Grass, contentDescription = null, tint = GreenPrimary)
                                }
                                Spacer(modifier = Modifier.width(12.dp))
                                Column {
                                    val firstItemName = order.items.firstOrNull()?.productName ?: "Agricultural Product"
                                    val otherItemsCount = if (order.items.size > 1) order.items.size - 1 else 0
                                    Text(
                                        text = firstItemName,
                                        fontWeight = FontWeight.Bold,
                                        fontSize = 13.sp,
                                        color = TextDark
                                    )
                                    if (!order.shopName.isNullOrEmpty()) {
                                        Text(
                                            text = "Store: ${order.shopName}",
                                            fontSize = 11.sp,
                                            fontWeight = FontWeight.SemiBold,
                                            color = GreenPrimary
                                        )
                                    }
                                    Text(
                                        text = if (otherItemsCount > 0) "+ $otherItemsCount other(s) • ₹${order.totalAmount.toInt()}" else "₹${order.totalAmount.toInt()}",
                                        fontSize = 12.sp,
                                        color = TextMuted
                                    )
                                }
                            }

                            Divider(color = DividerGray)

                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.spacedBy(12.dp)
                            ) {
                                OutlinedButton(
                                    onClick = { /* Reorder mock */ },
                                    shape = RoundedCornerShape(8.dp),
                                    modifier = Modifier.weight(1f),
                                    border = BorderStroke(1.dp, GreenPrimary),
                                    colors = ButtonDefaults.outlinedButtonColors(contentColor = GreenPrimary)
                                ) {
                                    Text("Reorder", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                                }

                                Button(
                                    onClick = { onNavigate(Screen.BillInvoice.createRoute(order.orderId)) },
                                    shape = RoundedCornerShape(8.dp),
                                    modifier = Modifier.weight(1f),
                                    colors = ButtonDefaults.buttonColors(containerColor = GreenPrimary)
                                ) {
                                    Text("View Details", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Color.White)
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

// ==========================================
// 2. Invoice Screen
// ==========================================
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun BillInvoiceScreen(
    orderId: String,
    onBackClick: () -> Unit
) {
    val ordersState by AgroRepository.orders.collectAsState()
    val order = ordersState.find { it.orderId == orderId }
    val currentUser = AgroRepository.currentUser

    // Compute dynamic billing numbers
    val subtotal = order?.items?.sumOf { it.price * it.quantity } ?: 0.0
    val tax = subtotal * 0.05 // 5% GST
    val deliveryFee = if (subtotal > 999.0 || subtotal == 0.0) 0.0 else 49.0
    val discount = 0.0
    val totalAmount = subtotal + tax + deliveryFee - discount

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("/ Bill Details", fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    IconButton(onClick = onBackClick) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                },
                actions = {
                    IconButton(onClick = {}) {
                        Icon(Icons.Default.Share, contentDescription = "Share")
                    }
                    IconButton(onClick = {}) {
                        Icon(Icons.Default.MoreVert, contentDescription = "Menu")
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
                .verticalScroll(rememberScrollState())
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Confirm block
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = GreenLight),
                border = BorderStroke(1.dp, Color(0xFFC8E6C9))
            ) {
                Column(
                    modifier = Modifier.padding(16.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Icon(Icons.Default.CheckCircle, contentDescription = null, tint = GreenPrimary, modifier = Modifier.size(36.dp))
                    Spacer(modifier = Modifier.height(8.dp))
                    Text("Payment Successful", fontWeight = FontWeight.Bold, fontSize = 16.sp, color = GreenDark)
                    Text("Order #$orderId has been processed.", fontSize = 11.sp, color = TextMuted)
                }
            }

            // Billing Details List
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                border = BorderStroke(1.dp, DividerGray)
            ) {
                Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                        Column {
                            Text("BILLED TO", fontSize = 10.sp, color = TextMuted, fontWeight = FontWeight.Bold)
                            Text(currentUser?.name ?: "Bhoomiputra Farmer", fontWeight = FontWeight.Bold, fontSize = 13.sp, color = TextDark)
                            Text("${currentUser?.address ?: "Tamil Nadu, IN"} • ${currentUser?.phone ?: "+91 98765 43210"}", fontSize = 11.sp, color = TextMuted)
                        }

                        Column(horizontalAlignment = Alignment.End) {
                            Text("DATE", fontSize = 10.sp, color = TextMuted, fontWeight = FontWeight.Bold)
                            Text(if (order != null) formatTimestamp(order.timestamp) else "Date unknown", fontWeight = FontWeight.Bold, fontSize = 13.sp, color = TextDark)
                            Text("Status: COD / Pending", fontSize = 11.sp, color = OrangeAccent, fontWeight = FontWeight.Bold)
                        }
                    }

                    if (order != null && !order.shopName.isNullOrEmpty()) {
                        Divider(color = DividerGray, modifier = Modifier.padding(vertical = 4.dp))
                        Column {
                            Text("MERCHANT SHOP", fontSize = 10.sp, color = TextMuted, fontWeight = FontWeight.Bold)
                            Text(order.shopName ?: "AgriFarm Store", fontWeight = FontWeight.Bold, fontSize = 13.sp, color = GreenPrimary)
                        }
                    }

                    Divider(color = DividerGray, modifier = Modifier.padding(vertical = 4.dp))

                    Text("ORDER SUMMARY", fontSize = 11.sp, color = TextMuted, fontWeight = FontWeight.Bold)

                    if (order == null || order.items.isEmpty()) {
                        Text("No items found in this order.", color = TextMuted, fontSize = 13.sp)
                    } else {
                        order.items.forEach { item ->
                            InvoiceItemRow(name = item.productName, qty = item.quantity, price = item.price)
                        }
                    }

                    Divider(color = DividerGray, modifier = Modifier.padding(vertical = 4.dp))

                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                        Text("Subtotal", fontSize = 12.sp, color = TextMuted)
                        Text("₹${subtotal.toInt()}.00", fontSize = 12.sp, color = TextDark)
                    }

                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                        Text("Tax (GST 5%)", fontSize = 12.sp, color = TextMuted)
                        Text("₹${String.format(java.util.Locale.US, "%.2f", tax)}", fontSize = 12.sp, color = TextDark)
                    }

                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                        Text("Delivery Fee", fontSize = 12.sp, color = TextMuted)
                        Text("₹${deliveryFee.toInt()}.00", fontSize = 12.sp, color = TextDark)
                    }

                    Divider(color = DividerGray, modifier = Modifier.padding(vertical = 4.dp))

                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                        Text("Total Amount", fontWeight = FontWeight.Bold, fontSize = 14.sp, color = TextDark)
                        Text("₹${String.format(java.util.Locale.US, "%.2f", totalAmount)}", fontWeight = FontWeight.Bold, fontSize = 18.sp, color = GreenPrimary)
                    }
                }
            }

            // Actions Buttons
            Button(
                onClick = {},
                colors = ButtonDefaults.buttonColors(containerColor = GreenPrimary),
                shape = RoundedCornerShape(10.dp),
                modifier = Modifier.fillMaxWidth().height(50.dp)
            ) {
                Icon(Icons.Default.Download, contentDescription = null, tint = Color.White)
                Spacer(modifier = Modifier.width(6.dp))
                Text("Download PDF Receipt", fontWeight = FontWeight.Bold, color = Color.White)
            }

            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                OutlinedButton(
                    onClick = {},
                    shape = RoundedCornerShape(10.dp),
                    modifier = Modifier.weight(1f),
                    border = BorderStroke(1.5.dp, GreenPrimary),
                    colors = ButtonDefaults.outlinedButtonColors(contentColor = GreenPrimary)
                ) {
                    Icon(Icons.Default.Share, contentDescription = null, modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Share", fontWeight = FontWeight.Bold)
                }

                OutlinedButton(
                    onClick = {},
                    shape = RoundedCornerShape(10.dp),
                    modifier = Modifier.weight(1f),
                    border = BorderStroke(1.5.dp, GreenPrimary),
                    colors = ButtonDefaults.outlinedButtonColors(contentColor = GreenPrimary)
                ) {
                    Icon(Icons.Default.Help, contentDescription = null, modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Support", fontWeight = FontWeight.Bold)
                }
            }
        }
    }
}

@Composable
fun InvoiceItemRow(name: String, qty: Int, price: Double) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Column {
            Text(text = name, fontWeight = FontWeight.Bold, fontSize = 13.sp, color = TextDark)
            Text(text = "Qty: $qty • 500g", fontSize = 11.sp, color = TextMuted)
        }
        Text(text = "₹${price.toInt()}", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = TextDark)
    }
}

// ==========================================
// 3. Notifications Screen
// ==========================================
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun NotificationsScreen(
    onNavigate: (String) -> Unit
) {
    val list = listOf(
        NotificationItem("n1", "Orders", "Order #AAF-8821 Out for Delivery", "Your organic fertilizer batch is on its way to the farm. Track live location.", false, "10 mins ago"),
        NotificationItem("n2", "Harvest", "Harvest Collection Scheduled", "The logistics team will arrive tomorrow at 8:00 AM for the paddy collection.", false, "2 hours ago"),
        NotificationItem("n3", "Offers", "20% Off Hybrid Seeds", "Special monsoon discount for Bhoomiputra members on all high-yield seeds.", true, "1 day ago"),
        NotificationItem("n4", "Account", "Profile Verified", "Your seller dashboard is now fully active. You can list your products now.", true, "3 days ago")
    )

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
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = GreenPrimary)
            )
        },
        bottomBar = {
            FarmerBottomBar(currentRoute = Screen.Profile.route, onNavigate = onNavigate)
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .padding(padding)
                .fillMaxSize()
                .background(BackgroundWhite)
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(text = "Notifications", fontWeight = FontWeight.Bold, fontSize = 20.sp, color = TextDark)
                    Text(text = "Stay updated with your farm activity", fontSize = 12.sp, color = TextMuted)
                }

                Text(
                    text = "Mark all as read",
                    color = GreenPrimary,
                    fontWeight = FontWeight.Bold,
                    fontSize = 12.sp,
                    modifier = Modifier.clickable {}
                )
            }

            Row(modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                FilterChip("All Updates", active = true)
                FilterChip("Orders", active = false)
                FilterChip("Offers", active = false)
            }

            Spacer(modifier = Modifier.height(16.dp))

            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .weight(1f)
                    .verticalScroll(rememberScrollState())
            ) {
                list.forEach { item ->
                    NotificationRow(
                        notification = item,
                        onClick = {
                            if (item.category == "Orders") {
                                onNavigate(Screen.LiveTracking.route)
                            } else if (item.category == "Offers") {
                                onNavigate(Screen.OffersPromos.route)
                            }
                        }
                    )
                    Divider(color = DividerGray.copy(alpha = 0.5f))
                }
            }
        }
    }
}

// ==========================================
// 4. Offers & Promos Screen
// ==========================================
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun OffersPromosScreen(
    onNavigate: (String) -> Unit
) {
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
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = GreenPrimary)
            )
        },
        bottomBar = {
            FarmerBottomBar(currentRoute = Screen.Profile.route, onNavigate = onNavigate)
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
            // Hero Banner
            Card(
                modifier = Modifier.fillMaxWidth().height(140.dp),
                shape = RoundedCornerShape(20.dp),
                colors = CardDefaults.cardColors(containerColor = GreenDark)
            ) {
                Box(modifier = Modifier.fillMaxSize()) {
                    Icon(
                        imageVector = Icons.Default.LocalOffer,
                        contentDescription = null,
                        tint = Color.White.copy(alpha = 0.08f),
                        modifier = Modifier.size(160.dp).align(Alignment.CenterEnd)
                    )

                    Column(
                        modifier = Modifier.padding(16.dp).fillMaxHeight(),
                        verticalArrangement = Arrangement.SpaceBetween
                    ) {
                        Column {
                            Text("MONSOON HARVEST DEAL", color = GoldAccent, fontWeight = FontWeight.Bold, fontSize = 10.sp)
                            Text("Up to 40% Off on Fertilizer Kits", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 16.sp)
                            Text("Boost your yield with premium nutrients.", color = Color.White.copy(alpha = 0.8f), fontSize = 11.sp)
                        }

                        Button(
                            onClick = { onNavigate(Screen.FertilizersCategory.route) },
                            colors = ButtonDefaults.buttonColors(containerColor = GoldAccent),
                            shape = RoundedCornerShape(8.dp)
                        ) {
                            Text("Claim Now", color = TextDark, fontWeight = FontWeight.Bold, fontSize = 11.sp)
                        }
                    }
                }
            }

            // Expiring soon section
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(text = "Expiring Soon", fontWeight = FontWeight.Bold, fontSize = 15.sp, color = TextDark)
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.HourglassEmpty, contentDescription = null, tint = RedAccent, modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(text = "Ends in 4h", color = RedAccent, fontWeight = FontWeight.Bold, fontSize = 11.sp)
                }
            }

            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                PromoCodeRow(title = "FREE DELIVERY", desc = "on orders above ₹999. Valid on Hybrid Seeds.")
                PromoCodeRow(title = "15% OFF SEEDS", desc = "Valid on Hybrid Paddy & Organic Tomatoes.")
            }

            // Active Offers
            Text(text = "Active Offers", fontWeight = FontWeight.Bold, fontSize = 15.sp, color = TextDark)

            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                border = BorderStroke(1.dp, DividerGray)
            ) {
                Row(
                    modifier = Modifier.padding(16.dp).fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(6.dp))
                                .background(GreenLight)
                                .padding(horizontal = 6.dp, vertical = 2.dp)
                        ) {
                            Text("ACTIVE", color = GreenDark, fontSize = 9.sp, fontWeight = FontWeight.Bold)
                        }
                        Spacer(modifier = Modifier.height(4.dp))
                        Text("FARMERPRIDE20", fontWeight = FontWeight.Bold, fontSize = 14.sp)
                        Text("Flat ₹200 off on all new tractors and equipment.", fontSize = 12.sp, color = TextMuted)
                    }

                    Button(
                        onClick = {},
                        shape = RoundedCornerShape(8.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = GreenPrimary)
                    ) {
                        Text("Apply", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 11.sp)
                    }
                }
            }
        }
    }
}

@Composable
fun PromoCodeRow(title: String, desc: String) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        border = BorderStroke(1.dp, DividerGray)
    ) {
        Row(
            modifier = Modifier.padding(16.dp).fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Text(text = title, fontWeight = FontWeight.Bold, fontSize = 14.sp, color = TextDark)
                Text(text = desc, fontSize = 12.sp, color = TextMuted)
            }

            Button(
                onClick = {},
                shape = RoundedCornerShape(8.dp),
                colors = ButtonDefaults.buttonColors(containerColor = GreenPrimary)
            ) {
                Text("Apply", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 11.sp)
            }
        }
    }
}

// ==========================================
// 5. Referral & Rewards Screen
// ==========================================
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ReferralRewardsScreen(
    onBackClick: () -> Unit
) {
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Referral & Rewards Screen", fontWeight = FontWeight.Bold, color = Color.White) },
                navigationIcon = {
                    IconButton(onClick = onBackClick) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = Color.White)
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
            // Grow Together Banner
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(20.dp)
            ) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(150.dp)
                        .background(
                            Brush.verticalGradient(
                                colors = listOf(GreenDark, GreenPrimary)
                            )
                        )
                ) {
                    Icon(
                        imageVector = Icons.Default.Handshake,
                        contentDescription = null,
                        tint = Color.White.copy(alpha = 0.1f),
                        modifier = Modifier.size(160.dp).align(Alignment.CenterEnd)
                    )

                    Column(
                        modifier = Modifier.padding(20.dp).fillMaxHeight(),
                        verticalArrangement = Arrangement.SpaceBetween
                    ) {
                        Column {
                            Text("Grow Together, Earn Together", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 18.sp)
                            Spacer(modifier = Modifier.height(4.dp))
                            Text("Refer a fellow farmer and both get ₹500 in AgriCash", color = Color.White.copy(alpha = 0.8f), fontSize = 12.sp)
                        }

                        Button(
                            onClick = {},
                            colors = ButtonDefaults.buttonColors(containerColor = GoldAccent),
                            shape = RoundedCornerShape(8.dp)
                        ) {
                            Text("Invite Now", color = TextDark, fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }

            // Earnings widget
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(20.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                border = BorderStroke(1.dp, DividerGray)
            ) {
                Column(modifier = Modifier.padding(20.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    Text("YOUR EARNINGS", fontSize = 11.sp, color = TextMuted, fontWeight = FontWeight.Bold)
                    Text("₹2,450", fontSize = 32.sp, fontWeight = FontWeight.Bold, color = GreenPrimary)

                    Divider(color = DividerGray)

                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                        Column {
                            Text("Active Invites", fontSize = 11.sp, color = TextMuted)
                            Text("12", fontWeight = FontWeight.Bold, fontSize = 15.sp, color = TextDark)
                        }

                        Column(horizontalAlignment = Alignment.End) {
                            Text("Pending Rewards", fontSize = 11.sp, color = TextMuted)
                            Text("₹750", fontWeight = FontWeight.Bold, fontSize = 15.sp, color = TextDark)
                        }
                    }
                }
            }

            // Code card
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = TintWeedKillers),
                border = BorderStroke(1.5.dp, OrangeAccent)
            ) {
                Column(
                    modifier = Modifier.padding(20.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    Text("YOUR UNIQUE REFERRAL CODE", fontSize = 11.sp, color = TextMuted, fontWeight = FontWeight.Bold)
                    Text("BHOOMI24", fontSize = 24.sp, fontWeight = FontWeight.Bold, color = OrangeAccent, letterSpacing = 2.sp)

                    Button(
                        onClick = {},
                        shape = RoundedCornerShape(10.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = GreenPrimary),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Icon(Icons.Default.Share, contentDescription = null, tint = Color.White)
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("Invite via WhatsApp", color = Color.White, fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
    }
}

// ==========================================
// 6. Community Feed Screen
// ==========================================
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CommunityFeedScreen(
    onNavigate: (String) -> Unit
) {
    val posts = listOf(
        SocialPost("p1", "Dr. Arulmani", "Agri-Expert | Soil Science", true, "Farmers in the Delta region, we are observing early signs of Leaf Blast in paddy crops due to recent humidity levels. Ensure proper water management and consider a silica-based supplement to strengthen the stalks.", "", 240, 48, "3 mins ago"),
        SocialPost("p2", "Selvam R.", "Farmer | Salem", true, "Successfully harvested my first batch of organic tomatoes today! The Bhoomiputra organic fertilizer really made a difference in the fruit size and color. Highly recommend it to fellow farmers in the cluster.", "", 112, 16, "2 hours ago")
    )

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Community Feed Screen", fontWeight = FontWeight.Bold, color = Color.White) },
                navigationIcon = {
                    IconButton(onClick = { onNavigate(Screen.Profile.route) }) {
                        Icon(Icons.Default.Menu, contentDescription = "Menu", tint = Color.White)
                    }
                },
                actions = {
                    IconButton(onClick = { onNavigate(Screen.Search.route) }) {
                        Icon(Icons.Default.Search, contentDescription = "Search", tint = Color.White)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = GreenPrimary)
            )
        },
        bottomBar = {
            FarmerBottomBar(currentRoute = Screen.Profile.route, onNavigate = onNavigate)
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .padding(padding)
                .fillMaxSize()
                .background(BackgroundWhite)
        ) {
            // Tabs Row
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Color.White)
                    .padding(vertical = 4.dp),
                horizontalArrangement = Arrangement.SpaceAround
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.weight(1f).clickable {}) {
                    Text("Trending", fontWeight = FontWeight.Bold, color = GreenPrimary, fontSize = 14.sp, modifier = Modifier.padding(vertical = 8.dp))
                    Box(modifier = Modifier.width(64.dp).height(3.dp).background(GreenPrimary))
                }
                Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.weight(1f).clickable {}) {
                    Text("Local", color = TextMuted, fontSize = 14.sp, modifier = Modifier.padding(vertical = 8.dp))
                    Box(modifier = Modifier.width(64.dp).height(3.dp).background(Color.Transparent))
                }
            }

            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .weight(1f)
                    .verticalScroll(rememberScrollState())
                    .padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                // Share input bar
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    border = BorderStroke(1.dp, DividerGray)
                ) {
                    Row(
                        modifier = Modifier.padding(12.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text("Share your farm update...", color = TextMuted, fontSize = 13.sp)
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            IconButton(onClick = {}) {
                                Icon(Icons.Default.Image, contentDescription = null, tint = GreenPrimary)
                            }
                            IconButton(onClick = {}) {
                                Icon(Icons.Default.VideoCall, contentDescription = null, tint = GreenPrimary)
                            }
                        }
                    }
                }

                // Post listings
                posts.forEach { post ->
                    CommunityPostCard(post = post)
                }

                // Tip trivia card
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(containerColor = TintWeedKillers),
                    border = BorderStroke(1.dp, OrangeAccent.copy(alpha = 0.5f))
                ) {
                    Row(modifier = Modifier.padding(16.dp), verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.Lightbulb, contentDescription = null, tint = OrangeAccent)
                        Spacer(modifier = Modifier.width(12.dp))
                        Text(
                            text = "Did you know? Intercropping marigold with your tomato crops helps naturally repel harmful root pests.",
                            fontSize = 12.sp,
                            color = TextDark,
                            lineHeight = 16.sp
                        )
                    }
                }
            }
        }
    }
}
