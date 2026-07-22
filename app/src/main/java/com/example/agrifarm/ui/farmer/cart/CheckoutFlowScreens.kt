package com.satish.agrifarm.ui.farmer.cart

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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.satish.agrifarm.ui.navigation.Screen
import com.satish.agrifarm.ui.theme.*
import androidx.compose.runtime.collectAsState
import com.satish.agrifarm.data.repository.AgroRepository
import com.satish.agrifarm.data.model.Shop
import com.satish.agrifarm.data.model.Product
import kotlinx.coroutines.launch

// ==========================================
// 1. Checkout Screen
// ==========================================
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CheckoutScreen(
    onBackClick: () -> Unit,
    onProceedToPaymentClick: () -> Unit
) {
    val cartItems by AgroRepository.cart.collectAsState()
    val currentUser = AgroRepository.currentUser

    val itemsCount = cartItems.sumOf { it.quantity }
    val itemTotal = cartItems.sumOf { it.price * it.quantity }
    val deliveryFee = if (itemTotal > 0) 40.0 else 0.0
    val taxes = if (itemTotal > 0) (itemTotal * 0.035).toInt().toDouble() else 0.0
    val grandTotal = itemTotal + deliveryFee + taxes

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Checkout", fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    IconButton(onClick = onBackClick) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                },
                actions = {
                    IconButton(onClick = {}) {
                        Icon(Icons.Default.HelpOutline, contentDescription = "Help")
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
                Button(
                    onClick = onProceedToPaymentClick,
                    shape = RoundedCornerShape(12.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = GreenPrimary),
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp)
                        .height(54.dp),
                    enabled = grandTotal > 0
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text("₹${grandTotal.toInt()}.00", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 16.sp)
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text("PROCEED TO PAYMENT", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                            Spacer(modifier = Modifier.width(4.dp))
                            Icon(Icons.Default.ArrowForward, contentDescription = null, tint = Color.White, modifier = Modifier.size(16.dp))
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
            // Stepper Indicator Widget
            CheckoutProgressStepper(activeStep = 1)

            // Shipping Address Card
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(text = "Shipping Address", fontWeight = FontWeight.Bold, fontSize = 14.sp, color = TextDark)
                Text(
                    text = "CHANGE",
                    color = GreenPrimary,
                    fontWeight = FontWeight.Bold,
                    fontSize = 11.sp,
                    modifier = Modifier.clickable { }
                )
            }

            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                border = BorderStroke(1.dp, DividerGray)
            ) {
                Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(6.dp))
                                .background(GreenLight)
                                .padding(horizontal = 8.dp, vertical = 4.dp)
                        ) {
                            Text("FARM", color = GreenDark, fontSize = 9.sp, fontWeight = FontWeight.Bold)
                        }
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(text = currentUser?.name ?: "Rajesh Kumar", fontWeight = FontWeight.Bold, fontSize = 14.sp, color = TextDark)
                    }

                    Text(
                        text = currentUser?.address ?: "42, Green Valley Farmhouse, Near Pollachi Highway, Coimbatore South, Tamil Nadu - 641021",
                        fontSize = 12.sp,
                        color = TextMuted,
                        lineHeight = 16.sp
                    )

                    Text(text = if (currentUser?.phone?.isNotEmpty() == true) "+91 ${currentUser.phone}" else "+91 98765-43210", fontSize = 12.sp, color = TextDark, fontWeight = FontWeight.Bold)
                }
            }

            // Order Summary
            Text(text = "Order Summary ($itemsCount Items)", fontWeight = FontWeight.Bold, fontSize = 14.sp, color = TextDark)

            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                cartItems.forEach { item ->
                    OrderSummaryRow(name = item.productName, qty = item.quantity, price = item.price * item.quantity)
                }
            }

            // Bill Details
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                border = BorderStroke(1.dp, DividerGray)
            ) {
                Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Text(text = "Bill Details", fontWeight = FontWeight.Bold, fontSize = 14.sp, color = TextDark)

                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                        Text(text = "Items Total", fontSize = 13.sp, color = TextMuted)
                        Text(text = "₹${itemTotal.toInt()}.00", fontSize = 13.sp, color = TextDark)
                    }

                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                        Text(text = "Delivery Fee", fontSize = 13.sp, color = TextMuted)
                        Text(text = if (deliveryFee > 0) "₹${deliveryFee.toInt()}.00" else "FREE", fontSize = 13.sp, color = if (deliveryFee > 0) TextDark else GreenPrimary, fontWeight = if (deliveryFee > 0) FontWeight.Normal else FontWeight.Bold)
                    }

                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                        Text(text = "Taxes & Charges", fontSize = 13.sp, color = TextMuted)
                        Text(text = "₹${taxes.toInt()}.00", fontSize = 13.sp, color = TextDark)
                    }

                    Divider(color = DividerGray)

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(text = "Total Amount", fontWeight = FontWeight.Bold, fontSize = 15.sp, color = TextDark)
                        Text(text = "₹${grandTotal.toInt()}.00", fontWeight = FontWeight.Bold, fontSize = 18.sp, color = GreenPrimary)
                    }
                }
            }
        }
    }
}

@Composable
fun CheckoutProgressStepper(activeStep: Int) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 8.dp),
        horizontalArrangement = Arrangement.Center,
        verticalAlignment = Alignment.CenterVertically
    ) {
        // Step 1: Address
        StepIcon(num = 1, name = "Address", active = activeStep >= 1, done = activeStep > 1)
        
        Spacer(
            modifier = Modifier
                .width(48.dp)
                .height(2.dp)
                .background(if (activeStep > 1) GreenPrimary else DividerGray)
        )

        // Step 2: Payment
        StepIcon(num = 2, name = "Payment", active = activeStep >= 2, done = activeStep > 2)

        Spacer(
            modifier = Modifier
                .width(48.dp)
                .height(2.dp)
                .background(if (activeStep > 2) GreenPrimary else DividerGray)
        )

        // Step 3: Done
        StepIcon(num = 3, name = "Summary", active = activeStep >= 3, done = activeStep > 3)
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

@Composable
fun OrderSummaryRow(name: String, qty: Int, price: Double) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        border = BorderStroke(1.dp, DividerGray)
    ) {
        Row(
            modifier = Modifier.padding(12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .size(44.dp)
                    .clip(RoundedCornerShape(8.dp))
                    .background(GreenLight),
                contentAlignment = Alignment.Center
            ) {
                Icon(Icons.Default.Image, contentDescription = null, tint = GreenPrimary.copy(alpha = 0.3f))
            }
            Spacer(modifier = Modifier.width(12.dp))
            Column(modifier = Modifier.weight(1f)) {
                Text(text = name, fontWeight = FontWeight.Bold, fontSize = 13.sp, color = TextDark)
                Text(text = "Qty: $qty • 500g", fontSize = 11.sp, color = TextMuted)
            }
            Text(text = "₹${price.toInt()}", fontWeight = FontWeight.Bold, fontSize = 14.sp, color = TextDark)
        }
    }
}

// ==========================================
// 2. Address Management Screen
// ==========================================
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AddressManagementScreen(
    onBackClick: () -> Unit,
    onNavigate: (String) -> Unit
) {
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Address Management", fontWeight = FontWeight.Bold, color = Color.White) },
                navigationIcon = {
                    IconButton(onClick = onBackClick) {
                        Icon(Icons.Default.Menu, contentDescription = "Menu", tint = Color.White)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = GreenPrimary)
            )
        },
        bottomBar = {
            Surface(
                tonalElevation = 8.dp,
                color = Color.White
            ) {
                Button(
                    onClick = { /* Action */ },
                    shape = RoundedCornerShape(12.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = GreenPrimary),
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp)
                        .height(54.dp)
                ) {
                    Icon(Icons.Default.Add, contentDescription = null)
                    Spacer(modifier = Modifier.width(6.dp))
                    Text("Add New Address", fontWeight = FontWeight.Bold, fontSize = 15.sp)
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
            Text(
                text = "Manage your farm, home, and office delivery locations for faster checkout.",
                fontSize = 12.sp,
                color = TextMuted,
                lineHeight = 16.sp
            )

            // Use Current Location
            Button(
                onClick = {},
                colors = ButtonDefaults.buttonColors(containerColor = Color.White),
                border = BorderStroke(1.5.dp, GreenPrimary),
                shape = RoundedCornerShape(10.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Icon(Icons.Default.MyLocation, contentDescription = null, tint = GreenPrimary, modifier = Modifier.size(18.dp))
                Spacer(modifier = Modifier.width(6.dp))
                Text("Use Current Location", color = GreenPrimary, fontWeight = FontWeight.Bold)
            }

            // Addresses
            AddressDetailCard(
                tag = "FARM",
                name = "Agri Farm",
                desc = "Survey No. 442, Green Fields, Coimbatore - Pollachi Road, Tamil Nadu - 641001",
                iconTint = GreenPrimary,
                bg = TintFertilizers
            )

            AddressDetailCard(
                tag = "HOME",
                name = "Home",
                desc = "D-12, Heritage Apartments, Race Course Area, Coimbatore, Tamil Nadu - 641018",
                iconTint = OrangeAccent,
                bg = TintWeedKillers
            )

            AddressDetailCard(
                tag = "OFFICE",
                name = "Office",
                desc = "Agri-Tech Park, Level 4, Main Street, Tiruppur, Tamil Nadu - 641601",
                iconTint = BlueAccent,
                bg = TintTools
            )

            // Banner
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = GreenPrimary)
            ) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(110.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.Agriculture,
                        contentDescription = null,
                        tint = Color.White.copy(alpha = 0.08f),
                        modifier = Modifier.size(160.dp).align(Alignment.CenterEnd)
                    )

                    Column(modifier = Modifier.padding(16.dp).fillMaxHeight(), verticalArrangement = Arrangement.Center) {
                        Text("Delivery available to 500+ locations across Tamil Nadu.", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                    }
                }
            }

            Spacer(modifier = Modifier.height(60.dp))
        }
    }
}

@Composable
fun AddressDetailCard(
    tag: String,
    name: String,
    desc: String,
    iconTint: Color,
    bg: Color
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        border = BorderStroke(1.dp, DividerGray)
    ) {
        Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(6.dp))
                            .background(bg)
                            .padding(horizontal = 8.dp, vertical = 4.dp)
                    ) {
                        Text(text = tag, color = iconTint, fontSize = 9.sp, fontWeight = FontWeight.Bold)
                    }
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(text = name, fontWeight = FontWeight.Bold, fontSize = 14.sp, color = TextDark)
                }

                Row {
                    Text(text = "EDIT", color = GreenPrimary, fontSize = 11.sp, fontWeight = FontWeight.Bold, modifier = Modifier.clickable {})
                    Spacer(modifier = Modifier.width(16.dp))
                    Text(text = "DELETE", color = RedAccent, fontSize = 11.sp, fontWeight = FontWeight.Bold, modifier = Modifier.clickable {})
                }
            }

            Text(text = desc, fontSize = 12.sp, color = TextMuted, lineHeight = 16.sp)
        }
    }
}

// ==========================================
// 3. Payment Method Screen
// ==========================================
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PaymentMethodScreen(
    onBackClick: () -> Unit,
    onPaymentSuccessClick: () -> Unit
) {
    var selectedCod by remember { mutableStateOf(true) }

    val cartItems by AgroRepository.cart.collectAsState()
    val productsState by AgroRepository.products.collectAsState()
    val shopsState by AgroRepository.shops.collectAsState()

    val merchantShop = remember(cartItems, productsState, shopsState) {
        val firstProdId = cartItems.firstOrNull()?.productId
        val prodDetails = productsState.find { it.id == firstProdId }
        shopsState.find { it.id == prodDetails?.shopId }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Payment Method", fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    IconButton(onClick = onBackClick) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                },
                actions = {
                    IconButton(onClick = {}) {
                        Icon(Icons.Default.HelpOutline, contentDescription = "Help")
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = Color.White)
            )
        },
        bottomBar = {
            val coroutineScope = rememberCoroutineScope()
            var isLoading by remember { mutableStateOf(false) }
            val totalAmt = cartItems.sumOf { it.price * it.quantity }
            val deliveryFee = if (totalAmt > 0) 40.0 else 0.0
            val taxes = if (totalAmt > 0) (totalAmt * 0.035).toInt().toDouble() else 0.0
            val grandTotal = totalAmt + deliveryFee + taxes

            Surface(
                tonalElevation = 8.dp,
                color = Color.White
            ) {
                Button(
                    onClick = {
                        coroutineScope.launch {
                            isLoading = true
                            val address = AgroRepository.currentUser?.address ?: "Salem, TN"
                            val result = AgroRepository.confirmOrder(address)
                            isLoading = false
                            if (result.isSuccess) {
                                onPaymentSuccessClick()
                            }
                        }
                    },
                    shape = RoundedCornerShape(12.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = GreenPrimary),
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp)
                        .height(54.dp),
                    enabled = !isLoading && grandTotal > 0
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text("₹${grandTotal.toInt()}.00", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 16.sp)
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            if (isLoading) {
                                CircularProgressIndicator(color = Color.White, modifier = Modifier.size(24.dp))
                            } else {
                                Text("Pay Now (COD)", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                                Spacer(modifier = Modifier.width(4.dp))
                                Icon(Icons.Default.ArrowForward, contentDescription = null, tint = Color.White, modifier = Modifier.size(16.dp))
                            }
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
            val totalAmt = cartItems.sumOf { it.price * it.quantity }
            val deliveryFee = if (totalAmt > 0) 40.0 else 0.0
            val taxes = if (totalAmt > 0) (totalAmt * 0.035).toInt().toDouble() else 0.0
            val grandTotal = totalAmt + deliveryFee + taxes

            // Summary Card
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = GreenLight),
                border = BorderStroke(1.dp, Color(0xFFC8E6C9))
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text("ORDER SUMMARY", color = GreenDark, fontWeight = FontWeight.Bold, fontSize = 11.sp)
                        Text("₹${grandTotal.toInt()}.00", color = GreenDark, fontWeight = FontWeight.Bold, fontSize = 16.sp)
                    }
                    Spacer(modifier = Modifier.height(4.dp))
                    val itemNames = cartItems.joinToString(", ") { it.productName }
                    Text(
                        text = itemNames,
                        fontSize = 12.sp,
                        color = TextDark,
                        maxLines = 2,
                        overflow = androidx.compose.ui.text.style.TextOverflow.Ellipsis
                    )
                    if (merchantShop != null) {
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = "Merchant Store: ${merchantShop.name}",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            color = GreenDark
                        )
                    }
                }
            }

            // PAYMENT METHODS
            Text(text = "PAYMENT METHOD", fontWeight = FontWeight.Bold, fontSize = 12.sp, color = TextMuted)

            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                border = BorderStroke(1.dp, DividerGray)
            ) {
                Column(modifier = Modifier.padding(12.dp)) {
                    PaymentOptionRow(
                        label = "Cash on Delivery (COD)",
                        desc = "Pay in physical cash when order arrives (default and only option)",
                        selected = selectedCod,
                        onClick = { selectedCod = true },
                        icon = Icons.Default.CurrencyRupee
                    )
                }
            }

            // QR Code Payment (If merchant has one uploaded)
            if (merchantShop != null && !merchantShop.qrCodeUrl.isNullOrEmpty()) {
                Spacer(modifier = Modifier.height(8.dp))
                Text(text = "MERCHANT UPI QR CODE", fontWeight = FontWeight.Bold, fontSize = 12.sp, color = TextMuted)
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    border = BorderStroke(1.dp, DividerGray)
                ) {
                    Column(
                        modifier = Modifier.padding(16.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text(
                            text = "🏪 Transfer Directly to: ${merchantShop.name}",
                            fontWeight = FontWeight.Bold,
                            fontSize = 13.sp,
                            color = GreenDark
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = "Scan the QR code below to transfer payment directly to the merchant (optional).",
                            fontSize = 11.sp,
                            color = TextMuted,
                            textAlign = TextAlign.Center
                        )
                        Spacer(modifier = Modifier.height(12.dp))
                        
                        val qrUrl = "${AgroRepository.getServerRoot()}${merchantShop.qrCodeUrl}"
                        coil.compose.AsyncImage(
                            model = qrUrl,
                            contentDescription = "Shop QR Code",
                            modifier = Modifier
                                .size(180.dp)
                                .clip(RoundedCornerShape(8.dp))
                                .border(1.dp, DividerGray)
                        )
                        
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = "Please verify the shop name matches: ${merchantShop.name}",
                            fontSize = 10.sp,
                            color = TextMuted
                        )
                    }
                }
            }

            // SSL Secure badge
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 12.dp),
                horizontalArrangement = Arrangement.Center,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(Icons.Default.Lock, contentDescription = null, tint = TextMuted, modifier = Modifier.size(16.dp))
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = "Cash on Delivery is secured. Online payment options are disabled at this phase.",
                    fontSize = 10.sp,
                    color = TextMuted,
                    textAlign = TextAlign.Center,
                    modifier = Modifier.padding(horizontal = 24.dp)
                )
            }

            Spacer(modifier = Modifier.height(60.dp))
        }
    }
}

@Composable
fun PaymentOptionRow(
    label: String,
    desc: String,
    selected: Boolean,
    onClick: () -> Unit,
    icon: ImageVector
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onClick() }
            .padding(8.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.weight(1f)) {
            Icon(imageVector = icon, contentDescription = null, tint = GreenPrimary)
            Spacer(modifier = Modifier.width(12.dp))
            Column {
                Text(text = label, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                Text(text = desc, fontSize = 11.sp, color = TextMuted)
            }
        }
        RadioButton(
            selected = selected,
            onClick = onClick,
            colors = RadioButtonDefaults.colors(selectedColor = GreenPrimary)
        )
    }
}
