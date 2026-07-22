package com.satish.agrifarm.ui.farmer

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
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.satish.agrifarm.data.model.CartItem
import com.satish.agrifarm.ui.navigation.Screen
import com.satish.agrifarm.ui.theme.*

import androidx.compose.runtime.collectAsState
import com.satish.agrifarm.data.repository.AgroRepository
import com.satish.agrifarm.data.model.Product

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CartScreen(
    onBackClick: () -> Unit,
    onCheckoutClick: () -> Unit
) {
    val cartItems by AgroRepository.cart.collectAsState()

    val itemsCount = cartItems.sumOf { it.quantity }
    val itemTotal = cartItems.sumOf { it.price * it.quantity }
    val deliveryFee = if (itemTotal > 0) 40.0 else 0.0
    val taxes = if (itemTotal > 0) (itemTotal * 0.035).toInt().toDouble() else 0.0
    val grandTotal = itemTotal + deliveryFee + taxes

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Cart Screen", fontWeight = FontWeight.Bold, color = Color.White) },
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
        },
        bottomBar = {
            if (grandTotal > 0) {
                Surface(
                    tonalElevation = 8.dp,
                    color = Color.White
                ) {
                    Button(
                        onClick = onCheckoutClick,
                        shape = RoundedCornerShape(12.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = GreenPrimary),
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp)
                            .height(54.dp)
                    ) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                  Text("₹${grandTotal.toInt()}", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 16.sp)
                                Spacer(modifier = Modifier.width(6.dp))
                                Text("• ${itemsCount} Items", color = GreenLight, fontSize = 11.sp)
                            }

                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Text("Proceed to Checkout", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                                Spacer(modifier = Modifier.width(4.dp))
                                Icon(Icons.Default.ArrowForward, contentDescription = null, tint = Color.White, modifier = Modifier.size(16.dp))
                            }
                        }
                    }
                }
            }
        }
    ) { padding ->
        if (grandTotal == 0.0) {
            Box(
                modifier = Modifier.fillMaxSize().padding(padding),
                contentAlignment = Alignment.Center
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Icon(Icons.Default.ShoppingCart, contentDescription = null, modifier = Modifier.size(64.dp), tint = TextMuted)
                    Spacer(modifier = Modifier.height(12.dp))
                    Text("Your cart is empty", fontWeight = FontWeight.Bold, color = TextMuted)
                }
            }
        } else {
            Column(
                modifier = Modifier
                    .padding(padding)
                    .fillMaxSize()
                    .background(BackgroundWhite)
                    .verticalScroll(rememberScrollState())
                    .padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                // Deliver to box
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    border = BorderStroke(1.dp, DividerGray)
                ) {
                    Row(
                        modifier = Modifier.padding(16.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.Default.LocationOn, contentDescription = null, tint = GreenPrimary)
                            Spacer(modifier = Modifier.width(10.dp))
                            Column {
                                Text("Deliver to", fontSize = 11.sp, color = TextMuted)
                                Text(AgroRepository.currentUser?.address ?: "Salem, Tamil Nadu", fontWeight = FontWeight.Bold, fontSize = 13.sp, color = TextDark)
                            }
                        }

                        Text(
                            text = "CHANGE",
                            color = GreenPrimary,
                            fontWeight = FontWeight.Bold,
                            fontSize = 12.sp,
                            modifier = Modifier.clickable {}
                        )
                    }
                }

                // Items in Cart Header
                Text(
                    text = "Items in Cart ($itemsCount)",
                    fontWeight = FontWeight.Bold,
                    fontSize = 16.sp,
                    color = TextDark
                )

                // Render dynamic cart items
                cartItems.forEach { item ->
                    HighFidelityCartRow(
                        name = item.productName,
                        desc = "Unit Price: ₹${item.price.toInt()}",
                        price = item.price * item.quantity,
                        qty = item.quantity,
                        shopName = item.shopName,
                        onAdd = {
                            AgroRepository.addToCart(Product(id = item.productId, name = item.productName, price = item.price, shopName = item.shopName))
                        },
                        onRemove = {
                            AgroRepository.decrementCartItem(item.productId)
                        }
                    )
                }

                // Apply Coupon
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    border = BorderStroke(1.dp, DividerGray)
                ) {
                    Row(
                        modifier = Modifier.padding(16.dp).fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.Default.ConfirmationNumber, contentDescription = null, tint = OrangeAccent)
                            Spacer(modifier = Modifier.width(12.dp))
                            Column {
                                Text("Apply Coupon", fontWeight = FontWeight.Bold, fontSize = 13.sp, color = TextDark)
                                Text("Save up to ₹150 on this order", fontSize = 11.sp, color = TextMuted)
                            }
                        }

                        Icon(Icons.Default.ChevronRight, contentDescription = null, tint = TextMuted)
                    }
                }

                // Bill Details Breakdown
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    border = BorderStroke(1.dp, DividerGray)
                ) {
                    Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                        Text(text = "Bill Details", fontWeight = FontWeight.Bold, fontSize = 14.sp, color = TextDark)

                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                            Text(text = "Item Total", fontSize = 13.sp, color = TextMuted)
                            Text(text = "₹${itemTotal.toInt()}", fontSize = 13.sp, color = TextDark)
                        }

                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                            Text(text = "Delivery Fee", fontSize = 13.sp, color = TextMuted)
                            Text(text = "₹${deliveryFee.toInt()}", fontSize = 13.sp, color = TextDark)
                        }

                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                            Text(text = "Taxes & Charges", fontSize = 13.sp, color = TextMuted)
                            Text(text = "₹${taxes.toInt()}", fontSize = 13.sp, color = TextDark)
                        }

                        Divider(color = DividerGray)

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(text = "Total Amount", fontWeight = FontWeight.Bold, fontSize = 15.sp, color = TextDark)
                            Text(text = "₹${grandTotal.toInt()}", fontWeight = FontWeight.Bold, fontSize = 18.sp, color = GreenPrimary)
                        }
                    }
                }

                Spacer(modifier = Modifier.height(60.dp))
            }
        }
    }
}

@Composable
fun HighFidelityCartRow(
    name: String,
    desc: String,
    price: Double,
    qty: Int,
    shopName: String? = null,
    onAdd: () -> Unit,
    onRemove: () -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        border = BorderStroke(1.dp, DividerGray)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Representative product photo placeholder
            Box(
                modifier = Modifier
                    .size(64.dp)
                    .clip(RoundedCornerShape(10.dp))
                    .background(GreenLight),
                contentAlignment = Alignment.Center
            ) {
                Icon(Icons.Default.Image, contentDescription = null, tint = GreenPrimary.copy(alpha = 0.3f))
            }

            Spacer(modifier = Modifier.width(16.dp))

            Column(modifier = Modifier.weight(1f)) {
                Text(text = name, fontWeight = FontWeight.Bold, fontSize = 14.sp, color = TextDark)
                if (!shopName.isNullOrEmpty()) {
                    Text(text = "Store: $shopName", fontSize = 11.sp, color = GreenPrimary, fontWeight = FontWeight.SemiBold)
                }
                Text(text = desc, fontSize = 11.sp, color = TextMuted)
                Spacer(modifier = Modifier.height(6.dp))
                Text(text = "₹${price.toInt()}", fontWeight = FontWeight.Bold, fontSize = 15.sp, color = GreenPrimary)
            }

            // High-fidelity stepper quantity selector
            Row(
                modifier = Modifier
                    .clip(RoundedCornerShape(8.dp))
                    .background(DividerGray.copy(alpha = 0.4f))
                    .padding(2.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                IconButton(onClick = onRemove, modifier = Modifier.size(28.dp).background(Color.White, CircleShape)) {
                    Icon(Icons.Default.Remove, contentDescription = "Remove", modifier = Modifier.size(14.dp), tint = TextDark)
                }
                
                Text(text = "$qty", fontWeight = FontWeight.Bold, fontSize = 13.sp, color = TextDark)

                IconButton(onClick = onAdd, modifier = Modifier.size(28.dp).background(Color.White, CircleShape)) {
                    Icon(Icons.Default.Add, contentDescription = "Add", modifier = Modifier.size(14.dp), tint = TextDark)
                }
            }
        }
    }
}

@Preview(showBackground = true)
@Composable
fun CartScreenPreview() {
    AgrifarmTheme {
        CartScreen(onBackClick = {}, onCheckoutClick = {})
    }
}
