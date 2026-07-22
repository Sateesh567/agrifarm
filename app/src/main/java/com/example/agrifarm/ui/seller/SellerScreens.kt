package com.satish.agrifarm.ui.seller

import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.*
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
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.satish.agrifarm.ui.components.SellerBottomBar
import com.satish.agrifarm.ui.farmer.categories.FilterChip
import com.satish.agrifarm.ui.navigation.Screen
import com.satish.agrifarm.ui.theme.*

import kotlinx.coroutines.launch
import com.satish.agrifarm.data.repository.AgroRepository
import com.satish.agrifarm.data.model.OrderStatus
import com.satish.agrifarm.util.StringConstants
import androidx.compose.ui.text.input.PasswordVisualTransformation

// Camera and Image Handling Imports
import androidx.compose.ui.graphics.asImageBitmap
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import android.graphics.Bitmap
import androidx.compose.foundation.Image
import android.widget.Toast
import androidx.compose.ui.platform.LocalContext

// ==========================================
// 1. Seller Dashboard Screen
// ==========================================
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PendingShopScreen(
    shop: com.satish.agrifarm.data.model.Shop,
    onNavigate: (String) -> Unit
) {
    val coroutineScope = rememberCoroutineScope()
    var isRefreshing by remember { mutableStateOf(false) }
    
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Shop Verification") },
                actions = {
                    IconButton(onClick = {
                        onNavigate(Screen.RoleSelection.route)
                    }) {
                        Icon(Icons.Default.ExitToApp, contentDescription = "Logout")
                    }
                }
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .padding(padding)
                .fillMaxSize()
                .background(BackgroundWhite)
                .padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Box(
                modifier = Modifier
                    .size(100.dp)
                    .clip(CircleShape)
                    .background(if (shop.status == "REJECTED") Color(0xFFFFEBEE) else Color(0xFFFFF3E0)),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = if (shop.status == "REJECTED") Icons.Default.Cancel else Icons.Default.HourglassEmpty,
                    contentDescription = null,
                    tint = if (shop.status == "REJECTED") RedAccent else OrangeAccent,
                    modifier = Modifier.size(48.dp)
                )
            }
            
            Spacer(modifier = Modifier.height(24.dp))
            
            Text(
                text = shop.name,
                fontWeight = FontWeight.Bold,
                fontSize = 22.sp,
                color = TextDark
            )
            
            Spacer(modifier = Modifier.height(8.dp))
            
            Text(
                text = if (shop.status == "REJECTED") "Verification Rejected" else "Verification Pending",
                fontWeight = FontWeight.Bold,
                color = if (shop.status == "REJECTED") RedAccent else OrangeAccent,
                fontSize = 16.sp
            )
            
            Spacer(modifier = Modifier.height(16.dp))
            
            Text(
                text = if (shop.status == "REJECTED") {
                    "Unfortunately, your shop registration request was rejected by our admin team. Please contact customer support for more details."
                } else {
                    "Your shop request has been submitted. Our administrators are currently reviewing your documents and store location."
                },
                fontSize = 14.sp,
                color = TextMuted,
                textAlign = TextAlign.Center,
                lineHeight = 20.sp
            )
            
            Spacer(modifier = Modifier.height(32.dp))
            
            Button(
                onClick = {
                    coroutineScope.launch {
                        isRefreshing = true
                        AgroRepository.loadSellerShopInfo()
                        isRefreshing = false
                    }
                },
                colors = ButtonDefaults.buttonColors(containerColor = GreenPrimary),
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier.fillMaxWidth().height(50.dp),
                enabled = !isRefreshing
            ) {
                if (isRefreshing) {
                    CircularProgressIndicator(color = Color.White, modifier = Modifier.size(24.dp))
                } else {
                    Text("Refresh Status", fontWeight = FontWeight.Bold)
                }
            }
            
            Spacer(modifier = Modifier.height(12.dp))
            
            OutlinedButton(
                onClick = {
                    onNavigate(Screen.RoleSelection.route)
                },
                border = BorderStroke(1.5.dp, GreenPrimary),
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier.fillMaxWidth().height(50.dp)
            ) {
                Text("Log Out", color = GreenPrimary, fontWeight = FontWeight.Bold)
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun NoShopRegisteredScreen(
    onNavigate: (String) -> Unit
) {
    var shopName by remember { mutableStateOf("") }
    var shopCategory by remember { mutableStateOf("") }
    var address by remember { mutableStateOf("") }
    var description by remember { mutableStateOf("") }
    var isLoading by remember { mutableStateOf(false) }
    var errorMessage by remember { mutableStateOf<String?>(null) }
    val coroutineScope = rememberCoroutineScope()
    val textFieldColors = OutlinedTextFieldDefaults.colors(
        focusedTextColor = TextDark,
        unfocusedTextColor = TextDark,
        focusedBorderColor = GreenPrimary,
        unfocusedBorderColor = DividerGray,
        focusedLabelColor = GreenPrimary,
        unfocusedLabelColor = TextMuted,
        focusedLeadingIconColor = GreenPrimary,
        unfocusedLeadingIconColor = TextMuted,
        focusedTrailingIconColor = GreenPrimary,
        unfocusedTrailingIconColor = TextMuted
    )

    // Camera & Gallery integration state
    val context = LocalContext.current
    var capturedImageBitmap by remember { mutableStateOf<android.graphics.Bitmap?>(null) }
    val cameraLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.TakePicturePreview()
    ) { bitmap ->
        if (bitmap != null) {
            capturedImageBitmap = bitmap
        }
    }
    val galleryLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.GetContent()
    ) { uri ->
        if (uri != null) {
            try {
                val bitmap = if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.P) {
                    android.graphics.ImageDecoder.decodeBitmap(
                        android.graphics.ImageDecoder.createSource(context.contentResolver, uri)
                    )
                } else {
                    @Suppress("DEPRECATION")
                    android.provider.MediaStore.Images.Media.getBitmap(context.contentResolver, uri)
                }
                capturedImageBitmap = bitmap
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Register Your Shop") },
                actions = {
                    IconButton(onClick = { onNavigate(Screen.RoleSelection.route) }) {
                        Icon(Icons.Default.ExitToApp, contentDescription = "Logout")
                    }
                }
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .padding(padding)
                .fillMaxSize()
                .background(BackgroundWhite)
                .verticalScroll(rememberScrollState())
                .padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Top
        ) {
            Text(
                text = "Let's set up your shop on AgriFarm!",
                fontWeight = FontWeight.Bold,
                fontSize = 18.sp,
                color = TextDark,
                textAlign = TextAlign.Center
            )
            Spacer(modifier = Modifier.height(24.dp))

            // Shop Banner Image Selection / Capture Box
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(16.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Box(
                    modifier = Modifier
                        .size(120.dp)
                        .clip(RoundedCornerShape(12.dp))
                        .border(BorderStroke(1.dp, DividerGray), RoundedCornerShape(12.dp))
                        .background(Color.White),
                    contentAlignment = Alignment.Center
                ) {
                    if (capturedImageBitmap != null) {
                        Image(
                            bitmap = capturedImageBitmap!!.asImageBitmap(),
                            contentDescription = "Shop Banner",
                            modifier = Modifier.fillMaxSize(),
                            contentScale = androidx.compose.ui.layout.ContentScale.Crop
                        )
                    } else {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Icon(Icons.Default.Image, contentDescription = null, tint = GreenPrimary, modifier = Modifier.size(36.dp))
                            Text("No Photo", fontSize = 11.sp, color = TextMuted)
                        }
                    }
                }

                Column(
                    verticalArrangement = Arrangement.spacedBy(8.dp),
                    modifier = Modifier.weight(1f)
                ) {
                    Button(
                        onClick = { cameraLauncher.launch(null) },
                        colors = ButtonDefaults.buttonColors(containerColor = GreenPrimary),
                        shape = RoundedCornerShape(8.dp),
                        modifier = Modifier.fillMaxWidth().height(44.dp)
                    ) {
                        Icon(Icons.Default.AddAPhoto, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("Take Photo", fontSize = 12.sp)
                    }
                    
                    OutlinedButton(
                        onClick = { galleryLauncher.launch("image/*") },
                        border = BorderStroke(1.5.dp, GreenPrimary),
                        colors = ButtonDefaults.outlinedButtonColors(contentColor = GreenPrimary),
                        shape = RoundedCornerShape(8.dp),
                        modifier = Modifier.fillMaxWidth().height(44.dp)
                    ) {
                        Icon(Icons.Default.Image, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("Choose from Gallery", fontSize = 12.sp)
                    }
                }
            }
            Spacer(modifier = Modifier.height(16.dp))

            OutlinedTextField(
                value = shopName, onValueChange = { shopName = it },
                label = { Text("Shop Name") },
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp),
                colors = textFieldColors
            )
            Spacer(modifier = Modifier.height(16.dp))

            OutlinedTextField(
                value = shopCategory, onValueChange = { shopCategory = it },
                label = { Text("Category (e.g. Seeds, Fertilizers, Tools)") },
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp),
                colors = textFieldColors
            )
            Spacer(modifier = Modifier.height(16.dp))

            OutlinedTextField(
                value = description, onValueChange = { description = it },
                label = { Text("Store Description") },
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp),
                colors = textFieldColors
            )
            Spacer(modifier = Modifier.height(16.dp))

            OutlinedTextField(
                value = address, onValueChange = { address = it },
                label = { Text("Store Address") },
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp),
                minLines = 3,
                colors = textFieldColors
            )

            errorMessage?.let {
                Text(text = it, color = Color.Red, modifier = Modifier.padding(top = 12.dp))
            }

            Spacer(modifier = Modifier.height(24.dp))

            Button(
                onClick = {
                    if (shopName.isEmpty() || address.isEmpty()) {
                        errorMessage = "Shop Name and Address are required"
                        return@Button
                    }
                    coroutineScope.launch {
                        isLoading = true
                        errorMessage = null
                        val imgUrl = when (shopCategory.lowercase(java.util.Locale.ROOT)) {
                            "seeds" -> "images/seeds_shop.png"
                            "fertilizers", "manure", "manures" -> "images/organic_farm.png"
                            else -> "images/seeds_shop.png"
                        }
                        val imageBase64 = capturedImageBitmap?.let { bitmap ->
                            try {
                                val maxDim = 1024
                                val scaledBitmap = if (bitmap.width > maxDim || bitmap.height > maxDim) {
                                    val aspectRatio = bitmap.width.toFloat() / bitmap.height.toFloat()
                                    val newWidth = if (aspectRatio > 1) maxDim else (maxDim * aspectRatio).toInt()
                                    val newHeight = if (aspectRatio > 1) (maxDim / aspectRatio).toInt() else maxDim
                                    android.graphics.Bitmap.createScaledBitmap(bitmap, newWidth, newHeight, true)
                                } else {
                                    bitmap
                                }
                                val outputStream = java.io.ByteArrayOutputStream()
                                scaledBitmap.compress(android.graphics.Bitmap.CompressFormat.JPEG, 80, outputStream)
                                val byteArray = outputStream.toByteArray()
                                android.util.Base64.encodeToString(byteArray, android.util.Base64.NO_WRAP)
                            } catch (e: Exception) {
                                e.printStackTrace()
                                null
                            }
                        }
                        val result = AgroRepository.registerShop(
                            name = shopName,
                            category = shopCategory,
                            address = address,
                            description = description,
                            imageUrl = imgUrl,
                            imageBase64 = imageBase64
                        )
                        isLoading = false
                        if (result.isFailure) {
                            errorMessage = result.exceptionOrNull()?.message ?: "Failed to submit request"
                        }
                    }
                },
                modifier = Modifier.fillMaxWidth().height(50.dp),
                shape = RoundedCornerShape(12.dp),
                colors = ButtonDefaults.buttonColors(containerColor = GreenPrimary),
                enabled = !isLoading
            ) {
                if (isLoading) {
                    CircularProgressIndicator(color = Color.White, modifier = Modifier.size(24.dp))
                } else {
                    Text("Submit Verification Request", fontWeight = FontWeight.Bold)
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SellerDashboardScreen(
    onNavigate: (String) -> Unit
) {
    val currentShop = AgroRepository.currentSellerShop
    
    if (currentShop == null) {
        NoShopRegisteredScreen(onNavigate = onNavigate)
    } else if (currentShop.status == "PENDING" || currentShop.status == "REJECTED") {
        PendingShopScreen(shop = currentShop, onNavigate = onNavigate)
    } else {
        val ordersState by AgroRepository.orders.collectAsState()
        val productsState by AgroRepository.products.collectAsState()
        
        val shopOrders = ordersState.filter { it.shopId == currentShop.id }
        val shopProducts = productsState.filter { it.shopId == currentShop.id }
        
        val pendingOrdersCount = shopOrders.count { it.status == OrderStatus.PENDING }
        val todayOrdersCount = shopOrders.size
        val totalSalesSum = shopOrders.sumOf { it.totalAmount }
        
        val lowStockProducts = shopProducts.filter { it.stock in 1..19 }
        val outOfStockProducts = shopProducts.filter { it.stock == 0 }

        LaunchedEffect(currentShop.id) {
            AgroRepository.fetchOrders()
            AgroRepository.fetchProducts(currentShop.id)
        }

        Scaffold(
            topBar = {
                TopAppBar(
                    title = { Text("AgriFarm", fontWeight = FontWeight.Bold, color = Color.White) },
                    navigationIcon = {
                        if (AgroRepository.currentUser?.isUser == true) {
                            IconButton(onClick = { onNavigate(Screen.FarmerHome.route) }) {
                                Icon(Icons.Default.Menu, contentDescription = "Menu", tint = Color.White)
                            }
                        }
                    },
                    actions = {
                        IconButton(onClick = {}) {
                            Icon(Icons.Default.Notifications, contentDescription = "Alerts", tint = Color.White)
                        }
                    },
                    colors = TopAppBarDefaults.topAppBarColors(containerColor = GreenPrimary)
                )
            },
            bottomBar = {
                SellerBottomBar(currentRoute = Screen.ShopDashboard.route, onNavigate = onNavigate)
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
                // Dashboard header
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text(text = "Seller Dashboard", fontWeight = FontWeight.Bold, fontSize = 20.sp, color = TextDark)
                        Text(text = "Welcome back, ${AgroRepository.currentUser?.name ?: "Seller"}", fontSize = 12.sp, color = TextMuted)
                    }

                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(6.dp))
                            .background(GreenLight)
                            .padding(horizontal = 8.dp, vertical = 4.dp)
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Box(modifier = Modifier.size(6.dp).clip(CircleShape).background(GreenPrimary))
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("ONLINE", color = GreenDark, fontWeight = FontWeight.Bold, fontSize = 10.sp)
                        }
                    }
                }

                // Core Action buttons
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    Button(
                        onClick = { onNavigate(Screen.AddProduct.route) },
                        shape = RoundedCornerShape(12.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = GreenPrimary),
                        modifier = Modifier.weight(1f).height(50.dp)
                    ) {
                        Icon(Icons.Default.Add, contentDescription = null)
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("Add Product", fontWeight = FontWeight.Bold)
                    }

                    OutlinedButton(
                        onClick = { onNavigate(Screen.SellerOrders.route) },
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier.weight(1f).height(50.dp),
                        border = BorderStroke(1.5.dp, GreenPrimary),
                        colors = ButtonDefaults.outlinedButtonColors(contentColor = GreenPrimary)
                    ) {
                        Icon(Icons.Default.ReceiptLong, contentDescription = null)
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("View Orders", fontWeight = FontWeight.Bold)
                    }
                }

                // Stats grid
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    StatPanelItem(title = "TODAY'S ORDERS", value = "$todayOrdersCount", desc = "All-time total", modifier = Modifier.weight(1f))
                    StatPanelItem(title = "PENDING ORDERS", value = "$pendingOrdersCount", desc = "Needs attention", modifier = Modifier.weight(1f))
                }

                // Sales Performance widget
                Card(
                    modifier = Modifier.fillMaxWidth().clickable { onNavigate(Screen.EarningsAnalytics.route) },
                    shape = RoundedCornerShape(20.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    border = BorderStroke(1.dp, DividerGray)
                ) {
                    Column(modifier = Modifier.padding(20.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                        Text("TOTAL SALES (30 DAYS)", fontSize = 11.sp, color = TextMuted, fontWeight = FontWeight.Bold)
                        Text("₹${totalSalesSum.toInt()}", fontSize = 32.sp, fontWeight = FontWeight.Bold, color = GreenPrimary)

                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(60.dp)
                                .background(
                                    Brush.verticalGradient(
                                        colors = listOf(GreenLight, Color.White)
                                    )
                                ),
                            contentAlignment = Alignment.Center
                        ) {
                            Text("Weekly Performance Chart Representation", color = GreenDark, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                        }
                    }
                }

                // Inventory alert list
                Text(text = "Inventory Alerts", fontWeight = FontWeight.Bold, fontSize = 14.sp, color = TextDark)

                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    border = BorderStroke(1.dp, DividerGray)
                ) {
                    Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                        if (lowStockProducts.isEmpty() && outOfStockProducts.isEmpty()) {
                            Text("All products have sufficient stock levels.", color = GreenDark, fontSize = 12.sp, fontWeight = FontWeight.Bold, modifier = Modifier.padding(8.dp))
                        } else {
                            lowStockProducts.take(2).forEach { prod ->
                                InventoryAlertRow(name = prod.name, alert = "Low Stock: ${prod.stock} left", onRefill = { onNavigate(Screen.InventoryManagement.route) })
                            }
                            outOfStockProducts.take(2).forEach { prod ->
                                InventoryAlertRow(name = prod.name, alert = "Out of Stock: 0 left", onRefill = { onNavigate(Screen.InventoryManagement.route) })
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun StatPanelItem(title: String, value: String, desc: String, modifier: Modifier = Modifier) {
    Card(
        modifier = modifier,
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        border = BorderStroke(1.dp, DividerGray)
    ) {
        Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
            Text(text = title, fontSize = 10.sp, color = TextMuted, fontWeight = FontWeight.Bold)
            Text(text = value, fontSize = 24.sp, fontWeight = FontWeight.Bold, color = TextDark)
            Text(text = desc, fontSize = 11.sp, color = GreenDark, fontWeight = FontWeight.Medium)
        }
    }
}

@Composable
fun InventoryAlertRow(name: String, alert: String, onRefill: () -> Unit) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Column(modifier = Modifier.weight(1f)) {
            Text(text = name, fontWeight = FontWeight.Bold, fontSize = 13.sp, color = TextDark)
            Text(text = alert, fontSize = 11.sp, color = RedAccent, fontWeight = FontWeight.Medium)
        }

        Button(
            onClick = onRefill,
            colors = ButtonDefaults.buttonColors(containerColor = GreenLight),
            shape = RoundedCornerShape(8.dp),
            contentPadding = PaddingValues(horizontal = 12.dp, vertical = 4.dp)
        ) {
            Text("Refill", color = GreenDark, fontWeight = FontWeight.Bold, fontSize = 11.sp)
        }
    }
}

// ==========================================
// 2. Seller Orders Screen
// ==========================================
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SellerOrdersScreen(
    onNavigate: (String) -> Unit
) {
    val currentShop = AgroRepository.currentSellerShop
    val ordersState by AgroRepository.orders.collectAsState()
    val shopOrders = ordersState.filter { it.shopId == currentShop?.id }
    val context = LocalContext.current
    val coroutineScope = rememberCoroutineScope()

    LaunchedEffect(Unit) {
        AgroRepository.fetchOrders()
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Seller Orders Screen", fontWeight = FontWeight.Bold, color = Color.White) },
                navigationIcon = {
                    IconButton(onClick = { onNavigate(Screen.ShopDashboard.route) }) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = Color.White)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = GreenPrimary)
            )
        },
        bottomBar = {
            SellerBottomBar(currentRoute = Screen.ShopDashboard.route, onNavigate = onNavigate)
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
            Text(text = "Manage your harvest orders", fontSize = 12.sp, color = TextMuted)

            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                FilterChip("All Orders", active = true)
                FilterChip("Organic Only", active = false)
                FilterChip("High Priority", active = false)
            }

            // Incoming Order Cards
            if (shopOrders.isEmpty()) {
                Box(
                    modifier = Modifier.fillMaxWidth().padding(32.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Text("No orders received yet.", color = TextMuted, fontSize = 14.sp)
                }
            } else {
                shopOrders.forEach { order ->
                    val detailsStr = order.items.joinToString { "${it.productName} (x${it.quantity})" } + " - ₹${order.totalAmount.toInt()}"
                    IncomingOrderCard(
                        name = "Farmer: ${order.farmerUid}",
                        orderId = order.orderId,
                        location = "Local Delivery",
                        details = detailsStr,
                        status = order.status.name,
                        onAccept = {
                            coroutineScope.launch {
                                val result = AgroRepository.updateOrderStatus(order.orderId, "CONFIRMED")
                                if (result.isSuccess) {
                                    Toast.makeText(context, "Order ${order.orderId} Confirmed!", Toast.LENGTH_SHORT).show()
                                } else {
                                    Toast.makeText(context, "Failed to accept order: ${result.exceptionOrNull()?.message}", Toast.LENGTH_SHORT).show()
                                }
                            }
                        },
                        onReject = {
                            coroutineScope.launch {
                                val result = AgroRepository.updateOrderStatus(order.orderId, "CANCELLED")
                                if (result.isSuccess) {
                                    Toast.makeText(context, "Order ${order.orderId} Cancelled!", Toast.LENGTH_SHORT).show()
                                } else {
                                    Toast.makeText(context, "Failed to reject order: ${result.exceptionOrNull()?.message}", Toast.LENGTH_SHORT).show()
                                }
                            }
                        }
                    )
                }
            }
        }
    }
}

@Composable
fun IncomingOrderCard(
    name: String,
    orderId: String,
    location: String,
    details: String,
    status: String,
    onAccept: () -> Unit,
    onReject: () -> Unit
) {
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
                    Text(text = name, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                    Text(text = "Order $orderId • $location", fontSize = 11.sp, color = TextMuted)
                }

                val tagBg = when(status) {
                    "PENDING" -> OrangeAccent.copy(alpha = 0.2f)
                    "CONFIRMED" -> GreenLight
                    "CANCELLED" -> RedAccent.copy(alpha = 0.2f)
                    else -> GreenLight
                }
                val tagText = when(status) {
                    "PENDING" -> OrangeAccent
                    "CONFIRMED" -> GreenDark
                    "CANCELLED" -> RedAccent
                    else -> GreenDark
                }
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(6.dp))
                        .background(tagBg)
                        .padding(horizontal = 8.dp, vertical = 4.dp)
                ) {
                    Text(status, color = tagText, fontWeight = FontWeight.Bold, fontSize = 9.sp)
                }
            }

            Text(text = details, fontSize = 13.sp, color = TextDark)

            if (status == "PENDING") {
                Divider(color = DividerGray)

                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    OutlinedButton(
                        onClick = onReject,
                        shape = RoundedCornerShape(8.dp),
                        modifier = Modifier.weight(1f),
                        border = BorderStroke(1.dp, RedAccent),
                        colors = ButtonDefaults.outlinedButtonColors(contentColor = RedAccent)
                    ) {
                        Text("Reject", fontWeight = FontWeight.Bold, fontSize = 12.sp)
                    }

                    Button(
                        onClick = onAccept,
                        shape = RoundedCornerShape(8.dp),
                        modifier = Modifier.weight(1.5f),
                        colors = ButtonDefaults.buttonColors(containerColor = GreenPrimary)
                    ) {
                        Text("Accept Order", fontWeight = FontWeight.Bold, color = Color.White, fontSize = 12.sp)
                    }
                }
            }
        }
    }
}

// ==========================================
// 3. Seller Product Management Screen
// ==========================================
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SellerProductManagementScreen(
    onNavigate: (String) -> Unit
) {
    val currentShop = AgroRepository.currentSellerShop
    val productsState by AgroRepository.products.collectAsState()
    val shopProducts = productsState.filter { it.shopId == currentShop?.id }
    
    val ordersState by AgroRepository.orders.collectAsState()
    val shopOrders = ordersState.filter { it.shopId == currentShop?.id }
    val totalRevenue = shopOrders.sumOf { it.totalAmount }
    
    val outOfStockCount = shopProducts.count { it.stock == 0 }

    LaunchedEffect(currentShop?.id) {
        currentShop?.id?.let { AgroRepository.fetchProducts(it) }
        AgroRepository.fetchOrders()
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Seller Product Management", fontWeight = FontWeight.Bold, color = Color.White) },
                navigationIcon = {
                    IconButton(onClick = { onNavigate(Screen.ShopDashboard.route) }) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = Color.White)
                    }
                },
                actions = {
                    IconButton(onClick = { onNavigate(Screen.AddProduct.route) }) {
                        Icon(Icons.Default.Add, contentDescription = "Add New", tint = Color.White)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = GreenPrimary)
            )
        },
        bottomBar = {
            SellerBottomBar(currentRoute = Screen.SellerProductManagement.route, onNavigate = onNavigate)
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
            // Metrics header card
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                border = BorderStroke(1.dp, DividerGray)
            ) {
                Row(modifier = Modifier.padding(16.dp), horizontalArrangement = Arrangement.SpaceBetween) {
                    Column {
                        Text("TOTAL REVENUE", fontSize = 10.sp, color = TextMuted, fontWeight = FontWeight.Bold)
                        Text("₹${totalRevenue.toInt()}", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = TextDark)
                        Text("All-time total", fontSize = 11.sp, color = GreenDark)
                    }

                    Column(horizontalAlignment = Alignment.End) {
                        Text("ACTIVE ITEMS", fontSize = 10.sp, color = TextMuted, fontWeight = FontWeight.Bold)
                        Text("${shopProducts.size}", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = TextDark)
                        Text("$outOfStockCount Out of Stock", fontSize = 11.sp, color = RedAccent)
                    }
                }
            }

            // Products Management List
            Text(text = "Manage Products", fontWeight = FontWeight.Bold, fontSize = 14.sp, color = TextDark)

            Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                if (shopProducts.isEmpty()) {
                    Box(
                        modifier = Modifier.fillMaxWidth().padding(24.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text("No products registered. Click '+' to add your first product!", color = TextMuted, fontSize = 13.sp)
                    }
                } else {
                    shopProducts.forEach { product ->
                        ManageProductRow(
                            name = product.name,
                            qty = "Stock: ${product.stock}",
                            price = "₹${product.price.toInt()}",
                            inStock = product.stock > 0
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun ManageProductRow(name: String, qty: String, price: String, inStock: Boolean) {
    var isEnabled by remember { mutableStateOf(inStock) }
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        border = BorderStroke(1.dp, DividerGray)
    ) {
        Row(
            modifier = Modifier.padding(12.dp).fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .size(54.dp)
                    .clip(RoundedCornerShape(8.dp))
                    .background(GreenLight),
                contentAlignment = Alignment.Center
            ) {
                Icon(Icons.Default.Image, contentDescription = null, tint = GreenPrimary.copy(alpha = 0.3f))
            }

            Spacer(modifier = Modifier.width(12.dp))

            Column(modifier = Modifier.weight(1f)) {
                Text(text = name, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(4.dp))
                            .background(if (inStock) GreenLight else TintPesticides)
                            .padding(horizontal = 6.dp, vertical = 2.dp)
                    ) {
                        Text(
                            text = if (inStock) "IN STOCK" else "OUT OF STOCK",
                            color = if (inStock) GreenDark else RedAccent,
                            fontSize = 8.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(text = qty, fontSize = 11.sp, color = TextMuted)
                }
                Text(text = price, fontWeight = FontWeight.Bold, fontSize = 13.sp, color = GreenPrimary)
            }

            Column(horizontalAlignment = Alignment.End) {
                Switch(
                    checked = isEnabled,
                    onCheckedChange = { isEnabled = it },
                    colors = SwitchDefaults.colors(checkedThumbColor = Color.White, checkedTrackColor = GreenPrimary)
                )
                IconButton(onClick = {}, modifier = Modifier.size(28.dp)) {
                    Icon(Icons.Default.Edit, contentDescription = "Edit", modifier = Modifier.size(16.dp), tint = TextMuted)
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AddProductScreen(
    onBackClick: () -> Unit,
    onSaveClick: () -> Unit
) {
    var productName by remember { mutableStateOf("") }
    var productPrice by remember { mutableStateOf("") }
    var productStock by remember { mutableStateOf("") }
    var description by remember { mutableStateOf("") }
    var category by remember { mutableStateOf("") }
    var usageInstructions by remember { mutableStateOf("") }
    var errorMessage by remember { mutableStateOf<String?>(null) }
    var isLoading by remember { mutableStateOf(false) }
    val coroutineScope = rememberCoroutineScope()
    val textFieldColors = OutlinedTextFieldDefaults.colors(
        focusedTextColor = TextDark,
        unfocusedTextColor = TextDark,
        focusedBorderColor = GreenPrimary,
        unfocusedBorderColor = DividerGray,
        focusedLabelColor = GreenPrimary,
        unfocusedLabelColor = TextMuted,
        focusedLeadingIconColor = GreenPrimary,
        unfocusedLeadingIconColor = TextMuted,
        focusedTrailingIconColor = GreenPrimary,
        unfocusedTrailingIconColor = TextMuted
    )

    // Camera & Gallery integration state
    val context = LocalContext.current
    val selectedBitmaps = remember { mutableStateListOf<android.graphics.Bitmap>() }
    val cameraLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.TakePicturePreview()
    ) { bitmap ->
        if (bitmap != null) {
            selectedBitmaps.add(bitmap)
        }
    }
    val galleryLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.GetContent()
    ) { uri ->
        if (uri != null) {
            try {
                val bitmap = if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.P) {
                    android.graphics.ImageDecoder.decodeBitmap(
                        android.graphics.ImageDecoder.createSource(context.contentResolver, uri)
                    )
                } else {
                    @Suppress("DEPRECATION")
                    android.provider.MediaStore.Images.Media.getBitmap(context.contentResolver, uri)
                }
                val mutableBitmap = bitmap.copy(android.graphics.Bitmap.Config.ARGB_8888, true)
                selectedBitmaps.add(mutableBitmap)
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Add Product", fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    IconButton(onClick = onBackClick) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = Color.White)
            )
        },
        bottomBar = {
            Surface(
                tonalElevation = 8.dp,
                color = Color.White
            ) {
                Row(
                    modifier = Modifier.padding(16.dp),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    OutlinedButton(
                        onClick = onBackClick,
                        shape = RoundedCornerShape(10.dp),
                        modifier = Modifier.weight(1f),
                        border = BorderStroke(1.5.dp, GreenPrimary),
                        colors = ButtonDefaults.outlinedButtonColors(contentColor = GreenPrimary),
                        enabled = !isLoading
                    ) {
                        Text("Cancel", fontWeight = FontWeight.Bold)
                    }

                    Button(
                        onClick = {
                            if (productName.isEmpty() || productPrice.isEmpty() || productStock.isEmpty() || category.isEmpty() || usageInstructions.isEmpty()) {
                                errorMessage = "Product Name, Category, Price, Stock, and Usage Instructions are required"
                                return@Button
                            }
                            val priceVal = productPrice.toDoubleOrNull()
                            if (priceVal == null || priceVal <= 0.0) {
                                errorMessage = "Enter a valid positive price"
                                return@Button
                            }
                            val stockVal = productStock.toIntOrNull()
                            if (stockVal == null || stockVal < 0) {
                                errorMessage = "Enter a valid stock quantity"
                                return@Button
                            }

                            coroutineScope.launch {
                                isLoading = true
                                errorMessage = null
                                val imgUrl = when (category.lowercase(java.util.Locale.ROOT)) {
                                    "seeds" -> "images/seeds_shop.png"
                                    "fertilizers" -> "images/organic_farm.png"
                                    else -> "images/seeds_shop.png"
                                }
                                val base64List = selectedBitmaps.mapNotNull { bitmap ->
                                    try {
                                        val maxDim = 800
                                        val scaledBitmap = if (bitmap.width > maxDim || bitmap.height > maxDim) {
                                            val aspectRatio = bitmap.width.toFloat() / bitmap.height.toFloat()
                                            val newWidth = if (aspectRatio > 1) maxDim else (maxDim * aspectRatio).toInt()
                                            val newHeight = if (aspectRatio > 1) (maxDim / aspectRatio).toInt() else maxDim
                                            android.graphics.Bitmap.createScaledBitmap(bitmap, newWidth, newHeight, true)
                                        } else {
                                            bitmap
                                        }
                                        val outputStream = java.io.ByteArrayOutputStream()
                                        scaledBitmap.compress(android.graphics.Bitmap.CompressFormat.JPEG, 80, outputStream)
                                        val byteArray = outputStream.toByteArray()
                                        "data:image/jpeg;base64," + android.util.Base64.encodeToString(byteArray, android.util.Base64.NO_WRAP)
                                    } catch (e: Exception) {
                                        e.printStackTrace()
                                        null
                                    }
                                }
                                val result = AgroRepository.addProduct(
                                    name = productName,
                                    category = category,
                                    price = priceVal,
                                    stock = stockVal,
                                    description = description,
                                    usageInstructions = usageInstructions,
                                    imageUrl = if (base64List.isNotEmpty()) "" else imgUrl,
                                    imagesBase64 = base64List
                                )
                                isLoading = false
                                if (result.isSuccess) {
                                    onSaveClick() // Navigates back & refreshes list
                                } else {
                                    errorMessage = result.exceptionOrNull()?.message ?: "Failed to publish product"
                                }
                            }
                        },
                        shape = RoundedCornerShape(10.dp),
                        modifier = Modifier.weight(1.2f),
                        colors = ButtonDefaults.buttonColors(containerColor = GreenPrimary),
                        enabled = !isLoading
                    ) {
                        if (isLoading) {
                            CircularProgressIndicator(color = Color.White, modifier = Modifier.size(24.dp))
                        } else {
                            Text("Publish Product", fontWeight = FontWeight.Bold, color = Color.White)
                        }
                    }
                }
            }
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
            // Steps indicator
            Row(
                modifier = Modifier.fillMaxWidth().padding(vertical = 8.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                StepIcon(num = 1, name = "Details", active = true, done = false)
                Spacer(modifier = Modifier.weight(1f).height(2.dp).background(DividerGray))
                StepIcon(num = 2, name = "Pricing", active = true, done = false)
                Spacer(modifier = Modifier.weight(1f).height(2.dp).background(DividerGray))
                StepIcon(num = 3, name = "Publish", active = true, done = false)
            }

            Text("Product Images", fontWeight = FontWeight.Bold, fontSize = 14.sp, color = TextDark)

            androidx.compose.foundation.lazy.LazyRow(
                horizontalArrangement = Arrangement.spacedBy(12.dp),
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp)
            ) {
                items(selectedBitmaps.size) { index ->
                    val bitmap = selectedBitmaps[index]
                    Box(
                        modifier = Modifier
                            .size(80.dp)
                            .clip(RoundedCornerShape(10.dp))
                            .border(BorderStroke(1.dp, DividerGray), RoundedCornerShape(10.dp))
                    ) {
                        Image(
                            bitmap = bitmap.asImageBitmap(),
                            contentDescription = "Product Image Preview",
                            modifier = Modifier.fillMaxSize(),
                            contentScale = androidx.compose.ui.layout.ContentScale.Crop
                        )
                        Box(
                            modifier = Modifier
                                .align(Alignment.TopEnd)
                                .padding(4.dp)
                                .size(20.dp)
                                .clip(CircleShape)
                                .background(Color.Red)
                                .clickable { selectedBitmaps.removeAt(index) },
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Default.Close,
                                contentDescription = "Remove Image",
                                tint = Color.White,
                                modifier = Modifier.size(12.dp)
                            )
                        }
                    }
                }

                item {
                    Box(
                        modifier = Modifier
                            .size(80.dp)
                            .clip(RoundedCornerShape(10.dp))
                            .border(BorderStroke(1.dp, DividerGray), RoundedCornerShape(10.dp))
                            .background(Color.White)
                            .clickable { cameraLauncher.launch(null) },
                        contentAlignment = Alignment.Center
                    ) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Icon(Icons.Default.AddAPhoto, contentDescription = null, tint = GreenPrimary)
                            Text("Take Photo", fontSize = 9.sp, color = TextMuted)
                        }
                    }
                }

                item {
                    Box(
                        modifier = Modifier
                            .size(80.dp)
                            .clip(RoundedCornerShape(10.dp))
                            .border(BorderStroke(1.dp, DividerGray), RoundedCornerShape(10.dp))
                            .background(GreenLight)
                            .clickable { galleryLauncher.launch("image/*") },
                        contentAlignment = Alignment.Center
                    ) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Icon(Icons.Default.Image, contentDescription = null, tint = GreenPrimary)
                            Text("Gallery", fontSize = 9.sp, color = TextMuted)
                        }
                    }
                }
            }

            if (errorMessage != null) {
                Text(text = errorMessage!!, color = Color.Red, fontSize = 13.sp, fontWeight = FontWeight.Bold)
            }

            OutlinedTextField(
                value = productName,
                onValueChange = { productName = it },
                label = { Text("Product Name") },
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(10.dp),
                colors = textFieldColors
            )

            OutlinedTextField(
                value = category,
                onValueChange = { category = it },
                label = { Text("Category (e.g. Seeds, Fertilizers, Tools)") },
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(10.dp),
                colors = textFieldColors
            )

            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                OutlinedTextField(
                    value = productPrice,
                    onValueChange = { productPrice = it },
                    label = { Text("Price (₹)") },
                    modifier = Modifier.weight(1f),
                    shape = RoundedCornerShape(10.dp),
                    colors = textFieldColors
                )

                OutlinedTextField(
                    value = productStock,
                    onValueChange = { productStock = it },
                    label = { Text("Stock Qty") },
                    modifier = Modifier.weight(1f),
                    shape = RoundedCornerShape(10.dp),
                    trailingIcon = { Text("Units", modifier = Modifier.padding(end = 12.dp)) },
                    colors = textFieldColors
                )
            }

            OutlinedTextField(
                value = usageInstructions,
                onValueChange = { usageInstructions = it },
                label = { Text("Usage Instructions") },
                modifier = Modifier.fillMaxWidth().height(100.dp),
                shape = RoundedCornerShape(10.dp),
                colors = textFieldColors
            )

            OutlinedTextField(
                value = description,
                onValueChange = { description = it },
                label = { Text("Description") },
                modifier = Modifier.fillMaxWidth().height(100.dp),
                shape = RoundedCornerShape(10.dp),
                colors = textFieldColors
            )
        }
    }
}

// ==========================================
// 5. Inventory Management Screen
// ==========================================
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun InventoryManagementScreen(
    onNavigate: (String) -> Unit
) {
    val currentShop = AgroRepository.currentSellerShop
    val productsState by AgroRepository.products.collectAsState()
    val shopProducts = productsState.filter { it.shopId == currentShop?.id }
    
    val lowStockCount = shopProducts.count { it.stock in 1..19 }
    val outOfStockCount = shopProducts.count { it.stock == 0 }

    LaunchedEffect(currentShop?.id) {
        currentShop?.id?.let { AgroRepository.fetchProducts(it) }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Inventory Management", fontWeight = FontWeight.Bold, color = Color.White) },
                navigationIcon = {
                    IconButton(onClick = { onNavigate(Screen.ShopDashboard.route) }) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = Color.White)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = GreenPrimary)
            )
        },
        bottomBar = {
            SellerBottomBar(currentRoute = Screen.SellerProductManagement.route, onNavigate = onNavigate)
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
            // Metrics summary
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp), modifier = Modifier.fillMaxWidth()) {
                MiniInventoryStatItem(title = "Total SKUs", value = "${shopProducts.size}", modifier = Modifier.weight(1f))
                MiniInventoryStatItem(title = "Low Stock", value = "$lowStockCount", color = OrangeAccent, modifier = Modifier.weight(1f))
                MiniInventoryStatItem(title = "Out of Stock", value = "$outOfStockCount", color = RedAccent, modifier = Modifier.weight(1f))
            }

            Text("Critical Stock Alerts", fontWeight = FontWeight.Bold, fontSize = 14.sp, color = TextDark)

            if (lowStockCount == 0 && outOfStockCount == 0) {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = GreenLight),
                    border = BorderStroke(1.dp, GreenPrimary.copy(alpha = 0.3f))
                ) {
                    Text(
                        text = "All product stock levels are stable.",
                        modifier = Modifier.padding(16.dp),
                        color = GreenDark,
                        fontWeight = FontWeight.Bold,
                        fontSize = 13.sp
                    )
                }
            } else {
                shopProducts.filter { it.stock < 20 }.forEach { prod ->
                    Card(
                        modifier = Modifier.fillMaxWidth().padding(bottom = 8.dp),
                        shape = RoundedCornerShape(16.dp),
                        colors = CardDefaults.cardColors(containerColor = TintPesticides),
                        border = BorderStroke(1.dp, RedAccent.copy(alpha = 0.5f))
                    ) {
                        Row(
                            modifier = Modifier.padding(16.dp).fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column {
                                Text(prod.name, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                                Text("Only ${prod.stock} left! Threshold: 20", fontSize = 11.sp, color = TextMuted)
                            }

                            Button(
                                onClick = {},
                                colors = ButtonDefaults.buttonColors(containerColor = RedAccent),
                                shape = RoundedCornerShape(8.dp)
                            ) {
                                Text("Restock", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 11.sp)
                            }
                        }
                    }
                }
            }

            // Inventory List
            Text("Product Inventory List", fontWeight = FontWeight.Bold, fontSize = 14.sp, color = TextDark)

            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                border = BorderStroke(1.dp, DividerGray)
            ) {
                Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    if (shopProducts.isEmpty()) {
                        Text("No products listed.", color = TextMuted, fontSize = 13.sp)
                    } else {
                        shopProducts.forEachIndexed { idx, prod ->
                            InventoryRowItem(name = prod.name, category = prod.category, stock = "Stock: ${prod.stock}")
                            if (idx < shopProducts.size - 1) {
                                Divider(color = DividerGray)
                            }
                        }
                    }
                }
            }

            // Pagination representation
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.Center,
                verticalAlignment = Alignment.CenterVertically
            ) {
                IconButton(onClick = {}) { Icon(Icons.Default.ChevronLeft, null) }
                Text("1", fontWeight = FontWeight.Bold, modifier = Modifier.padding(horizontal = 8.dp))
                IconButton(onClick = {}) { Icon(Icons.Default.ChevronRight, null) }
            }
        }
    }
}

@Composable
fun MiniInventoryStatItem(title: String, value: String, color: Color = GreenPrimary, modifier: Modifier = Modifier) {
    Card(
        modifier = modifier,
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        border = BorderStroke(1.dp, DividerGray)
    ) {
        Column(
            modifier = Modifier.padding(12.dp).fillMaxWidth(),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(text = title, fontSize = 9.sp, color = TextMuted, fontWeight = FontWeight.Bold)
            Spacer(modifier = Modifier.height(4.dp))
            Text(text = value, fontSize = 18.sp, fontWeight = FontWeight.Bold, color = color)
        }
    }
}

@Composable
fun InventoryRowItem(name: String, category: String, stock: String) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Column {
            Text(text = name, fontWeight = FontWeight.Bold, fontSize = 13.sp)
            Text(text = category, fontSize = 11.sp, color = TextMuted)
        }

        Box(
            modifier = Modifier
                .clip(RoundedCornerShape(6.dp))
                .background(GreenLight)
                .padding(horizontal = 8.dp, vertical = 4.dp)
        ) {
            Text(text = stock, color = GreenDark, fontWeight = FontWeight.Bold, fontSize = 11.sp)
        }
    }
}

// ==========================================
// 6. Earnings & Analytics Screen
// ==========================================
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun EarningsAnalyticsScreen(
    onBackClick: () -> Unit
) {
    val currentShop = AgroRepository.currentSellerShop
    val ordersState by AgroRepository.orders.collectAsState()
    val shopOrders = ordersState.filter { it.shopId == currentShop?.id }
    val totalRevenue = shopOrders.sumOf { it.totalAmount }
    
    // Sort and calculate top ranking items
    val productSales = shopOrders.flatMap { it.items }
        .groupBy { it.productName }
        .mapValues { entry -> entry.value.sumOf { it.quantity } }
        .toList()
        .sortedByDescending { it.second }

    LaunchedEffect(Unit) {
        AgroRepository.fetchOrders()
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Earnings & Analytics", fontWeight = FontWeight.Bold, color = Color.White) },
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
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text("FINANCIAL OVERVIEW", fontSize = 10.sp, color = TextMuted, fontWeight = FontWeight.Bold)
                    Text("Earnings & Analytics", fontWeight = FontWeight.Bold, fontSize = 18.sp)
                }

                Button(
                    onClick = {},
                    colors = ButtonDefaults.buttonColors(containerColor = GreenPrimary),
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Text("Download Statement", fontSize = 10.sp, fontWeight = FontWeight.Bold)
                }
            }

            // Monthly Revenue Card
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(20.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                border = BorderStroke(1.dp, DividerGray)
            ) {
                Column(modifier = Modifier.padding(20.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(
                            modifier = Modifier
                                .size(36.dp)
                                .clip(CircleShape)
                                .background(GreenLight),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(Icons.Default.AccountBalanceWallet, null, tint = GreenPrimary)
                        }
                        Spacer(modifier = Modifier.width(12.dp))
                        Column {
                            Text("Total Revenue (All-time)", fontSize = 11.sp, color = TextMuted)
                            Text("₹${totalRevenue.toInt()}.00", fontWeight = FontWeight.Bold, fontSize = 22.sp, color = TextDark)
                        }
                    }
                    Text("Dynamic updates from database", fontSize = 11.sp, color = GreenDark, fontWeight = FontWeight.Bold)
                }
            }

            // Stats panel row
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                StatPanelItem(title = "TOTAL ORDERS", value = "${shopOrders.size}", desc = "Orders fulfilled", modifier = Modifier.weight(1f))
                
                Card(
                    modifier = Modifier.weight(1f),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    border = BorderStroke(1.dp, DividerGray)
                ) {
                    Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                        Text(text = "NEXT ESTIMATED PAYOUT", fontSize = 10.sp, color = TextMuted, fontWeight = FontWeight.Bold)
                        Text(text = "Processing", fontSize = 16.sp, fontWeight = FontWeight.Bold, color = OrangeAccent)
                        Text(text = "₹${(totalRevenue * 0.95).toInt()} (Net)", fontSize = 11.sp, color = TextMuted)
                    }
                }
            }

            // Top Ranking items list
            Text(text = "Top Ranking Items", fontWeight = FontWeight.Bold, fontSize = 14.sp, color = TextDark)

            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                border = BorderStroke(1.dp, DividerGray)
            ) {
                Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    if (productSales.isEmpty()) {
                        Text("No sales data available.", color = TextMuted, fontSize = 13.sp)
                    } else {
                        productSales.take(4).forEachIndexed { idx, pair ->
                            TopRankingItemRow(name = pair.first, qty = "${pair.second} units sold", amount = "")
                            if (idx < Math.min(productSales.size, 4) - 1) {
                                Divider(color = DividerGray)
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun TopRankingItemRow(name: String, qty: String, amount: String) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Column {
            Text(text = name, fontWeight = FontWeight.Bold, fontSize = 13.sp)
            Text(text = qty, fontSize = 11.sp, color = TextMuted)
        }

        if (amount.isNotEmpty()) {
            Text(text = amount, fontWeight = FontWeight.Bold, fontSize = 14.sp, color = GreenPrimary)
        }
    }
}

@Composable
fun StepIcon(num: Int, name: String, active: Boolean, done: Boolean) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Box(
            modifier = Modifier
                .size(32.dp)
                .clip(CircleShape)
                .background(
                    when {
                        done -> GreenPrimary
                        active -> GreenPrimary
                        else -> DividerGray
                    }
                ),
            contentAlignment = Alignment.Center
        ) {
            if (done) {
                Icon(Icons.Default.Check, contentDescription = null, tint = Color.White, modifier = Modifier.size(16.dp))
            } else {
                Text(
                    text = "$num",
                    color = if (active) Color.White else TextMuted,
                    fontWeight = FontWeight.Bold,
                    fontSize = 12.sp
                )
            }
        }
        Spacer(modifier = Modifier.height(4.dp))
        Text(
            text = name,
            fontSize = 10.sp,
            fontWeight = if (active) FontWeight.Bold else FontWeight.Normal,
            color = if (active) GreenPrimary else TextMuted
        )
    }
}

@Preview(showBackground = true, showSystemUi = true)
@Composable
fun SellerDashboardScreenPreview() {
    AgrifarmTheme {
        SellerDashboardScreen(onNavigate = {})
    }
}

// ==========================================
// 7. Seller Settings Screen (Fix 4)
// ==========================================
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SellerSettingsScreen(
    onNavigate: (String) -> Unit,
    onLogoutClick: () -> Unit,
    onBackClick: () -> Unit = {}
) {
    val context = LocalContext.current
    val coroutineScope = rememberCoroutineScope()

    // Fix 4: Persist settings to SharedPreferences so they survive app restarts.
    val prefs = remember {
        context.getSharedPreferences(StringConstants.PREFS_FILE, android.content.Context.MODE_PRIVATE)
    }
    var notificationsEnabled by remember {
        mutableStateOf(prefs.getBoolean(StringConstants.PREF_NOTIFICATIONS_ENABLED, true))
    }
    var biometricEnabled by remember {
        mutableStateOf(prefs.getBoolean(StringConstants.PREF_BIOMETRIC_ENABLED, false))
    }

    // Fix 4: Change Password dialog state
    var showChangePasswordDialog by remember { mutableStateOf(false) }
    var newPassword by remember { mutableStateOf("") }
    var confirmNewPassword by remember { mutableStateOf("") }
    var passwordError by remember { mutableStateOf<String?>(null) }
    var isChangingPassword by remember { mutableStateOf(false) }

    val currentUser = AgroRepository.currentUser
    val initials = currentUser?.name?.split(" ")?.mapNotNull { it.firstOrNull() }?.joinToString("")?.take(2)?.uppercase() ?: "SO"

    // Fix 4: Change Password Dialog
    if (showChangePasswordDialog) {
        AlertDialog(
            onDismissRequest = { showChangePasswordDialog = false },
            title = { Text(StringConstants.DIALOG_CHANGE_PASSWORD_TITLE) },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    OutlinedTextField(
                        value = newPassword,
                        onValueChange = { newPassword = it },
                        label = { Text(StringConstants.LABEL_NEW_PASSWORD) },
                        visualTransformation = PasswordVisualTransformation(),
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(10.dp),
                        singleLine = true
                    )
                    OutlinedTextField(
                        value = confirmNewPassword,
                        onValueChange = { confirmNewPassword = it },
                        label = { Text(StringConstants.LABEL_CONFIRM_NEW_PASSWORD) },
                        visualTransformation = PasswordVisualTransformation(),
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(10.dp),
                        singleLine = true
                    )
                    passwordError?.let {
                        Text(text = it, color = MaterialTheme.colorScheme.error, fontSize = 12.sp)
                    }
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        when {
                            newPassword.isEmpty() -> passwordError = StringConstants.ERR_NEW_PASSWORD_REQUIRED
                            newPassword.length < 6 -> passwordError = StringConstants.ERR_PASSWORD_TOO_SHORT
                            newPassword != confirmNewPassword -> passwordError = StringConstants.ERR_PASSWORDS_MISMATCH
                            else -> {
                                coroutineScope.launch {
                                    isChangingPassword = true
                                    passwordError = null
                                    val result = AgroRepository.changePassword(newPassword)
                                    isChangingPassword = false
                                    if (result.isSuccess) {
                                        Toast.makeText(context, StringConstants.MSG_PASSWORD_CHANGED, Toast.LENGTH_SHORT).show()
                                        showChangePasswordDialog = false
                                        newPassword = ""; confirmNewPassword = ""
                                    } else {
                                        passwordError = result.exceptionOrNull()?.message ?: "Failed to change password"
                                    }
                                }
                            }
                        }
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = GreenPrimary),
                    enabled = !isChangingPassword
                ) {
                    if (isChangingPassword) {
                        CircularProgressIndicator(color = Color.White, modifier = Modifier.size(18.dp))
                    } else {
                        Text(StringConstants.BTN_CONFIRM)
                    }
                }
            },
            dismissButton = {
                TextButton(onClick = {
                    showChangePasswordDialog = false
                    newPassword = ""; confirmNewPassword = ""; passwordError = null
                }) {
                    Text(StringConstants.BTN_CANCEL)
                }
            }
        )
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(StringConstants.TITLE_SETTINGS, fontWeight = FontWeight.Bold, color = Color.White) },
                navigationIcon = {
                    IconButton(onClick = onBackClick) {
                        Icon(Icons.Default.ArrowBack, contentDescription = StringConstants.CD_BACK, tint = Color.White)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = GreenPrimary)
            )
        },
        bottomBar = {
            SellerBottomBar(currentRoute = Screen.SellerSettings.route, onNavigate = onNavigate)
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
            // Profile card
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                border = BorderStroke(1.dp, DividerGray)
            ) {
                Row(modifier = Modifier.padding(16.dp), verticalAlignment = Alignment.CenterVertically) {
                    Box(
                        modifier = Modifier
                            .size(50.dp)
                            .clip(CircleShape)
                            .background(GreenLight),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(initials, fontWeight = FontWeight.Bold, color = GreenPrimary, fontSize = 18.sp)
                    }
                    Spacer(modifier = Modifier.width(12.dp))
                    Column(modifier = Modifier.weight(1f)) {
                        Text(currentUser?.name ?: "Shop Owner", fontWeight = FontWeight.Bold, fontSize = 15.sp)
                        Text(
                            text = currentUser?.email ?: "",
                            fontSize = 12.sp,
                            color = TextMuted
                        )
                    }
                }
            }

            Text(StringConstants.SETTINGS_PREFERENCES_HEADER, fontWeight = FontWeight.Bold, fontSize = 11.sp, color = TextMuted)

            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                border = BorderStroke(1.dp, DividerGray)
            ) {
                Column(modifier = Modifier.padding(12.dp)) {
                    // Fix 4: Persist toggles to SharedPreferences on change
                    Row(
                        modifier = Modifier.fillMaxWidth().padding(4.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text(StringConstants.SETTINGS_PREF_NOTIFICATIONS, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                            Text(StringConstants.SETTINGS_PREF_NOTIFICATIONS_DESC, fontSize = 11.sp, color = TextMuted)
                        }
                        Switch(
                            checked = notificationsEnabled,
                            onCheckedChange = { newVal ->
                                notificationsEnabled = newVal
                                prefs.edit().putBoolean(StringConstants.PREF_NOTIFICATIONS_ENABLED, newVal).apply()
                            },
                            colors = SwitchDefaults.colors(checkedThumbColor = Color.White, checkedTrackColor = GreenPrimary)
                        )
                    }
                    Divider(color = DividerGray, modifier = Modifier.padding(vertical = 8.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth().padding(4.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text(StringConstants.SETTINGS_PREF_BIOMETRIC, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                            Text(StringConstants.SETTINGS_PREF_BIOMETRIC_DESC, fontSize = 11.sp, color = TextMuted)
                        }
                        Switch(
                            checked = biometricEnabled,
                            onCheckedChange = { newVal ->
                                biometricEnabled = newVal
                                prefs.edit().putBoolean(StringConstants.PREF_BIOMETRIC_ENABLED, newVal).apply()
                            },
                            colors = SwitchDefaults.colors(checkedThumbColor = Color.White, checkedTrackColor = GreenPrimary)
                        )
                    }
                }
            }

            Text(StringConstants.SETTINGS_SECURITY_HEADER, fontWeight = FontWeight.Bold, fontSize = 11.sp, color = TextMuted)

            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                border = BorderStroke(1.dp, DividerGray)
            ) {
                Column(modifier = Modifier.padding(8.dp)) {
                    // Fix 4: Account Security row opens Change Password dialog
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { showChangePasswordDialog = true }
                            .padding(12.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(Icons.Default.Security, contentDescription = null, tint = GreenPrimary, modifier = Modifier.size(20.dp))
                        Spacer(modifier = Modifier.width(12.dp))
                        Text(StringConstants.SETTINGS_MENU_ACCOUNT_SECURITY, fontWeight = FontWeight.Medium, modifier = Modifier.weight(1f))
                        Icon(Icons.Default.ChevronRight, contentDescription = null, tint = TextMuted)
                    }
                    Divider(color = DividerGray)
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(12.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(Icons.Default.Help, contentDescription = null, tint = GreenPrimary, modifier = Modifier.size(20.dp))
                        Spacer(modifier = Modifier.width(12.dp))
                        Text(StringConstants.SETTINGS_MENU_SUPPORT, fontWeight = FontWeight.Medium, modifier = Modifier.weight(1f))
                        Icon(Icons.Default.ChevronRight, contentDescription = null, tint = TextMuted)
                    }
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            OutlinedButton(
                onClick = onLogoutClick,
                shape = RoundedCornerShape(10.dp),
                border = BorderStroke(1.5.dp, RedAccent),
                colors = ButtonDefaults.outlinedButtonColors(contentColor = RedAccent),
                modifier = Modifier.fillMaxWidth().height(50.dp)
            ) {
                Icon(Icons.Default.Logout, contentDescription = null, modifier = Modifier.size(18.dp))
                Spacer(modifier = Modifier.width(6.dp))
                Text(StringConstants.BTN_LOGOUT, fontWeight = FontWeight.Bold)
            }

            Text(
                text = StringConstants.APP_VERSION,
                fontSize = 11.sp,
                color = TextMuted,
                textAlign = TextAlign.Center,
                modifier = Modifier.fillMaxWidth().padding(top = 16.dp)
            )
        }
    }
}
