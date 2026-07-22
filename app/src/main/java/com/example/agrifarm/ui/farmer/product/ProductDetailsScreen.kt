package com.satish.agrifarm.ui.farmer.product

import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.FavoriteBorder
import androidx.compose.material.icons.outlined.Share
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.collectAsState
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.satish.agrifarm.data.model.ReviewItem
import com.satish.agrifarm.data.repository.AgroRepository
import com.satish.agrifarm.ui.components.FarmerBottomBar
import com.satish.agrifarm.ui.navigation.Screen
import com.satish.agrifarm.ui.theme.*

// ==========================================
// 1. Main Product Details Screen
// ==========================================
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ProductDetailsScreen(
    productId: String,
    onBackClick: () -> Unit,
    onNavigate: (String) -> Unit
) {
    var pincode by remember { mutableStateOf("") }
    var deliveryMessage by remember { mutableStateOf("") }
    var isFavorite by remember { mutableStateOf(false) }

    val productsState by AgroRepository.products.collectAsState()
    val shopsState by AgroRepository.shops.collectAsState()

    val product = productsState.find { it.id == productId }
    val shop = shopsState.find { it.id == product?.shopId }

    var isDataLoaded by remember { mutableStateOf(false) }
    var activeImageIndex by remember { mutableStateOf(0) }

    LaunchedEffect(productId) {
        activeImageIndex = 0
        AgroRepository.fetchProducts()
        AgroRepository.fetchShops()
        isDataLoaded = true
    }

    if (!isDataLoaded) {
        Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            CircularProgressIndicator(color = GreenPrimary)
        }
        return
    }

    if (product == null || (shop != null && shop.status != "APPROVED")) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(BackgroundWhite)
                .padding(24.dp),
            contentAlignment = Alignment.Center
        ) {
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.Center
            ) {
                Icon(
                    imageVector = Icons.Default.Cancel,
                    contentDescription = null,
                    tint = RedAccent,
                    modifier = Modifier.size(64.dp)
                )
                Spacer(modifier = Modifier.height(16.dp))
                Text(
                    text = "Product Not Available",
                    fontWeight = FontWeight.Bold,
                    fontSize = 20.sp,
                    color = TextDark
                )
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = "This product or its seller has not been approved yet.",
                    fontSize = 14.sp,
                    color = TextMuted,
                    textAlign = TextAlign.Center
                )
                Spacer(modifier = Modifier.height(24.dp))
                Button(
                    onClick = onBackClick,
                    colors = ButtonDefaults.buttonColors(containerColor = GreenPrimary),
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Text("Go Back", color = Color.White, fontWeight = FontWeight.Bold)
                }
            }
        }
        return
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Product Details", fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    IconButton(onClick = onBackClick) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                },
                actions = {
                    IconButton(onClick = { /* Share */ }) {
                        Icon(Icons.Default.Share, contentDescription = "Share")
                    }
                    IconButton(onClick = { isFavorite = !isFavorite }) {
                        Icon(
                            imageVector = if (isFavorite) Icons.Default.Favorite else Icons.Default.FavoriteBorder,
                            tint = if (isFavorite) RedAccent else TextDark,
                            contentDescription = "Favorite"
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = Color.White)
            )
        },
        bottomBar = {
            // Sticky Add to Cart & Buy Now buttons
            Surface(
                tonalElevation = 8.dp,
                color = Color.White,
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    modifier = Modifier.padding(16.dp),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    OutlinedButton(
                        onClick = {
                            AgroRepository.addToCart(product)
                            onNavigate(Screen.Cart.route)
                        },
                        shape = RoundedCornerShape(10.dp),
                        modifier = Modifier.weight(1f),
                        border = BorderStroke(1.5.dp, GreenPrimary),
                        colors = ButtonDefaults.outlinedButtonColors(contentColor = GreenPrimary)
                    ) {
                        Icon(Icons.Default.ShoppingCart, contentDescription = null, modifier = Modifier.size(18.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("Add to Cart", fontWeight = FontWeight.Bold)
                    }

                    Button(
                        onClick = {
                            AgroRepository.addToCart(product)
                            onNavigate(Screen.Cart.route)
                        },
                        shape = RoundedCornerShape(10.dp),
                        modifier = Modifier.weight(1.2f),
                        colors = ButtonDefaults.buttonColors(containerColor = GreenDark)
                    ) {
                        Text("Buy Now", fontWeight = FontWeight.Bold, color = Color.White)
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
        ) {
            // Main Product Image
            val imageUrls = product.getProductImageUrls()
            val currentImageUrl = imageUrls.getOrNull(activeImageIndex) ?: product.imageUrl

            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(280.dp)
                    .background(
                        Brush.verticalGradient(
                            colors = listOf(GreenLight, Color.White)
                        )
                    )
                    .clickable { onNavigate(Screen.ImageGallery.createRoute(productId)) },
                contentAlignment = Alignment.Center
            ) {
                if (currentImageUrl.isNotEmpty()) {
                    val fullImgUrl = "${AgroRepository.getServerRoot()}$currentImageUrl"
                    coil.compose.AsyncImage(
                        model = fullImgUrl,
                        contentDescription = product.name,
                        modifier = Modifier.fillMaxSize(),
                        contentScale = androidx.compose.ui.layout.ContentScale.Crop
                    )
                } else {
                    Icon(
                        imageVector = Icons.Default.Grass,
                        contentDescription = null,
                        tint = GreenPrimary.copy(alpha = 0.2f),
                        modifier = Modifier.size(120.dp)
                    )
                }
                Text(
                    text = "Tap to view gallery",
                    color = TextMuted,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier
                        .align(Alignment.BottomCenter)
                        .padding(bottom = 12.dp)
                        .background(Color.White.copy(alpha = 0.7f), RoundedCornerShape(4.dp))
                        .padding(horizontal = 6.dp, vertical = 2.dp)
                )
            }

            if (imageUrls.size > 1) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp, vertical = 8.dp),
                    horizontalArrangement = Arrangement.spacedBy(8.dp, Alignment.CenterHorizontally),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    imageUrls.forEachIndexed { index, url ->
                        val isSelected = index == activeImageIndex
                        val borderStroke = if (isSelected) BorderStroke(2.dp, GreenPrimary) else BorderStroke(1.dp, DividerGray)
                        Card(
                            modifier = Modifier
                                .size(50.dp)
                                .clickable { activeImageIndex = index },
                            shape = RoundedCornerShape(6.dp),
                            border = borderStroke,
                            colors = CardDefaults.cardColors(containerColor = Color.White)
                        ) {
                            val fullThumbUrl = "${AgroRepository.getServerRoot()}$url"
                            coil.compose.AsyncImage(
                                model = fullThumbUrl,
                                contentDescription = null,
                                modifier = Modifier.fillMaxSize(),
                                contentScale = androidx.compose.ui.layout.ContentScale.Crop
                            )
                        }
                    }
                }
            }

            Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(16.dp)) {
                // Info header tags
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(6.dp))
                            .background(GreenPrimary)
                            .padding(horizontal = 8.dp, vertical = 4.dp)
                    ) {
                        Text("TOP RATED", color = Color.White, fontSize = 9.sp, fontWeight = FontWeight.Bold)
                    }
                    Spacer(modifier = Modifier.width(8.dp))
                    Icon(Icons.Default.Star, contentDescription = null, tint = RatingStar, modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(
                        text = "${product.rating} (120 Reviews)",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                        color = TextDark,
                        modifier = Modifier.clickable { onNavigate(Screen.RatingsReviews.createRoute(productId)) }
                    )
                }

                // Title details
                Column {
                    Text(
                        text = product.name,
                        fontSize = 22.sp,
                        fontWeight = FontWeight.Bold,
                        color = TextDark
                    )
                    Text(
                        text = "By ${shop?.name ?: product.shopName ?: "AgriFarm Shop"}",
                        fontSize = 14.sp,
                        color = TextMuted
                    )
                }

                // Pricing
                val mrpPrice = (product.price * 1.3).toInt()
                val discountPct = 23
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Text(text = "₹${product.price.toInt()}", fontSize = 24.sp, fontWeight = FontWeight.Bold, color = GreenDark)
                    Text(
                        text = "₹$mrpPrice",
                        fontSize = 16.sp,
                        color = TextMuted,
                        style = LocalTextStyle.current.copy(textDecoration = androidx.compose.ui.text.style.TextDecoration.LineThrough)
                    )
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(6.dp))
                            .background(TintPesticides)
                            .padding(horizontal = 6.dp, vertical = 2.dp)
                    ) {
                        Text(text = "$discountPct% OFF", color = RedAccent, fontSize = 10.sp, fontWeight = FontWeight.Bold)
                    }
                }

                Divider(color = DividerGray)

                // Check Delivery Widget
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    border = BorderStroke(1.dp, DividerGray)
                ) {
                    Column(modifier = Modifier.padding(14.dp)) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.Default.LocalShipping, contentDescription = null, tint = GreenPrimary, modifier = Modifier.size(18.dp))
                            Spacer(modifier = Modifier.width(8.dp))
                            Text("Check Delivery", fontWeight = FontWeight.Bold, fontSize = 13.sp, color = TextDark)
                        }

                        Spacer(modifier = Modifier.height(10.dp))

                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            OutlinedTextField(
                                value = pincode,
                                onValueChange = { pincode = it },
                                placeholder = { Text("Enter Pincode", fontSize = 12.sp) },
                                modifier = Modifier.weight(1f),
                                shape = RoundedCornerShape(8.dp),
                                singleLine = true,
                                colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = GreenPrimary)
                            )

                            Button(
                                onClick = {
                                    deliveryMessage = if (pincode.length == 6) {
                                        "Estimated delivery within 2-4 business days."
                                    } else {
                                        "Please enter a valid 6-digit pincode."
                                    }
                                },
                                shape = RoundedCornerShape(8.dp),
                                colors = ButtonDefaults.buttonColors(containerColor = GreenPrimary)
                            ) {
                                Text("Check", fontWeight = FontWeight.Bold)
                            }
                        }

                        if (deliveryMessage.isNotEmpty()) {
                            Spacer(modifier = Modifier.height(8.dp))
                            Text(
                                text = deliveryMessage,
                                fontSize = 11.sp,
                                color = if (deliveryMessage.contains("Estimated")) GreenDark else RedAccent,
                                fontWeight = FontWeight.Medium
                            )
                        }
                    }
                }

                // Why Choose This Section
                Column {
                    Text(text = "Why Choose This?", fontWeight = FontWeight.Bold, fontSize = 16.sp, color = TextDark)
                    Spacer(modifier = Modifier.height(10.dp))
                    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        val isTool = product.category.contains("Tool", ignoreCase = true) || product.category.contains("Equipment", ignoreCase = true)
                        val isFertilizer = product.category.contains("Fertilizer", ignoreCase = true)
                        
                        if (isTool) {
                            ChooseBenefitItem(
                                title = "Heavy Duty",
                                desc = "Engineered with premium forged steel for high durability and rust-resistance.",
                                icon = Icons.Default.Construction,
                                tint = GreenPrimary,
                                bg = TintTools
                            )
                            ChooseBenefitItem(
                                title = "Ergonomic Grip",
                                desc = "Designed to minimize fatigue during long hours of field work.",
                                icon = Icons.Default.PanTool,
                                tint = OrangeAccent,
                                bg = TintWeedKillers
                            )
                            ChooseBenefitItem(
                                title = "1-Year Warranty",
                                desc = "Backed by standard replacement support for manufacturing defects.",
                                icon = Icons.Default.Verified,
                                tint = GreenDark,
                                bg = TintFertilizers
                            )
                        } else if (isFertilizer) {
                            ChooseBenefitItem(
                                title = "100% Organic",
                                desc = "Pure natural formulation that is safe for soil microbes and earthworms.",
                                icon = Icons.Default.Eco,
                                tint = GreenPrimary,
                                bg = TintFertilizers
                            )
                            ChooseBenefitItem(
                                title = "Fast Acting",
                                desc = "Nutrients dissolve quickly to support immediate root absorption.",
                                icon = Icons.Default.FlashOn,
                                tint = OrangeAccent,
                                bg = TintWeedKillers
                            )
                            ChooseBenefitItem(
                                title = "Soil Revitalizer",
                                desc = "Restores soil pH levels and humic organic matter content.",
                                icon = Icons.Default.Spa,
                                tint = GreenDark,
                                bg = TintFertilizers
                            )
                        } else { // Seeds or others
                            ChooseBenefitItem(
                                title = "Pest Resistant",
                                desc = "Genetically optimized to resist common soil-borne pests and blight.",
                                icon = Icons.Default.Shield,
                                tint = GreenPrimary,
                                bg = TintFertilizers
                            )
                            ChooseBenefitItem(
                                title = "Drought Tolerant",
                                desc = "Special root structure that survives low-water conditions.",
                                icon = Icons.Default.WaterDrop,
                                tint = OrangeAccent,
                                bg = TintWeedKillers
                            )
                            ChooseBenefitItem(
                                title = "High Yield",
                                desc = "Expect 20-30% more crop production compared to general seeds.",
                                icon = Icons.Default.TrendingUp,
                                tint = GreenDark,
                                bg = TintFertilizers
                            )
                        }
                    }
                }

                // Detailed Description
                Column(verticalArrangement = Arrangement.spacedBy(16.dp)) {
                    Column {
                        Text(text = "Detailed Description", fontWeight = FontWeight.Bold, fontSize = 16.sp, color = TextDark)
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = product.description.ifEmpty { "No description available for this product." },
                            fontSize = 13.sp,
                            color = TextMuted,
                            lineHeight = 18.sp
                        )
                    }

                    if (product.usageInstructions.isNotEmpty()) {
                        Column {
                            Text(text = "Usage Instructions", fontWeight = FontWeight.Bold, fontSize = 16.sp, color = TextDark)
                            Spacer(modifier = Modifier.height(8.dp))
                            Text(
                                text = product.usageInstructions,
                                fontSize = 13.sp,
                                color = TextMuted,
                                lineHeight = 18.sp
                            )
                        }
                    }

                    // Spec chips
                    Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                        SpecChip("Certified Quality")
                        if (product.stock > 0) SpecChip("In Stock (${product.stock})") else SpecChip("Out of Stock")
                        SpecChip(product.category)
                    }
                }

                Spacer(modifier = Modifier.height(20.dp))
            }
        }
    }
}

@Composable
fun ChooseBenefitItem(
    title: String,
    desc: String,
    icon: ImageVector,
    tint: Color,
    bg: Color
) {
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
                    .size(40.dp)
                    .clip(CircleShape)
                    .background(bg),
                contentAlignment = Alignment.Center
            ) {
                Icon(imageVector = icon, contentDescription = null, tint = tint, modifier = Modifier.size(20.dp))
            }

            Spacer(modifier = Modifier.width(12.dp))

            Column {
                Text(text = title, fontWeight = FontWeight.Bold, fontSize = 13.sp, color = TextDark)
                Text(text = desc, fontSize = 11.sp, color = TextMuted, lineHeight = 15.sp)
            }
        }
    }
}

@Composable
fun SpecChip(label: String) {
    Box(
        modifier = Modifier
            .clip(RoundedCornerShape(8.dp))
            .background(TintTools)
            .padding(horizontal = 8.dp, vertical = 4.dp)
    ) {
        Text(text = label, fontSize = 10.sp, fontWeight = FontWeight.Bold, color = TextDark)
    }
}

// ==========================================
// 2. Fullscreen Image Gallery Screen
// ==========================================
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ProductImageGalleryScreen(
    productId: String,
    onCloseClick: () -> Unit
) {
    val productsState by AgroRepository.products.collectAsState()
    val product = productsState.find { it.id == productId }
    val imageUrls = product?.getProductImageUrls() ?: emptyList()
    var activeIndex by remember { mutableStateOf(0) }
    val currentImageUrl = imageUrls.getOrNull(activeIndex) ?: ""

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF121212))
    ) {
        Column(
            modifier = Modifier.fillMaxSize()
        ) {
            // Header
            TopAppBar(
                title = { Text("Product Image Gallery", fontWeight = FontWeight.Bold, color = Color.White) },
                navigationIcon = {
                    IconButton(onClick = onCloseClick) {
                        Icon(Icons.Default.Close, contentDescription = "Close", tint = Color.White)
                    }
                },
                actions = {
                    IconButton(onClick = {}) {
                        Icon(Icons.Default.Share, contentDescription = "Share", tint = Color.White)
                    }
                    IconButton(onClick = {}) {
                        Icon(Icons.Default.ZoomIn, contentDescription = "Zoom", tint = Color.White)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = Color.Black)
            )

            // Main zoom view representation
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .weight(1f)
                    .background(Color.Black),
                contentAlignment = Alignment.Center
            ) {
                if (currentImageUrl.isNotEmpty()) {
                    val fullImgUrl = "${AgroRepository.getServerRoot()}$currentImageUrl"
                    coil.compose.AsyncImage(
                        model = fullImgUrl,
                        contentDescription = null,
                        modifier = Modifier.fillMaxSize(),
                        contentScale = androidx.compose.ui.layout.ContentScale.Fit
                    )
                } else {
                    Icon(
                        imageVector = Icons.Default.Grass,
                        contentDescription = null,
                        tint = Color.White.copy(alpha = 0.15f),
                        modifier = Modifier.size(240.dp)
                    )
                }

                Column(
                    modifier = Modifier.align(Alignment.BottomCenter).padding(24.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text("${if (imageUrls.isEmpty()) 0 else activeIndex + 1} / ${imageUrls.size}", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 16.sp)
                    Spacer(modifier = Modifier.height(4.dp))
                    Text("Selected photo preview", color = Color.White.copy(alpha = 0.6f), fontSize = 12.sp)
                }
            }

            // Thumbnail list at the bottom
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Color.Black)
                    .padding(16.dp),
                horizontalArrangement = Arrangement.spacedBy(12.dp, Alignment.CenterHorizontally),
                verticalAlignment = Alignment.CenterVertically
            ) {
                imageUrls.forEachIndexed { index, url ->
                    ThumbnailItem(
                        url = url,
                        selected = index == activeIndex,
                        onClick = { activeIndex = index }
                    )
                }
            }
        }
    }
}

@Composable
fun ThumbnailItem(
    url: String,
    selected: Boolean,
    onClick: () -> Unit
) {
    val borderStroke = if (selected) BorderStroke(2.dp, GreenSecondary) else BorderStroke(1.dp, Color.DarkGray)
    Box(
        modifier = Modifier
            .size(54.dp)
            .clip(RoundedCornerShape(8.dp))
            .background(Color.DarkGray)
            .border(borderStroke, RoundedCornerShape(8.dp))
            .clickable { onClick() },
        contentAlignment = Alignment.Center
    ) {
        val fullThumbUrl = "${AgroRepository.getServerRoot()}$url"
        coil.compose.AsyncImage(
            model = fullThumbUrl,
            contentDescription = null,
            modifier = Modifier.fillMaxSize(),
            contentScale = androidx.compose.ui.layout.ContentScale.Crop
        )
    }
}

// ==========================================
// 3. Ratings & Reviews Screen
// ==========================================
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun RatingsReviewsScreen(
    productId: String,
    onBackClick: () -> Unit
) {
    val productsState by AgroRepository.products.collectAsState()
    val product = productsState.find { it.id == productId }
    val productName = product?.name ?: "Product"

    val reviews = remember(productName) {
        listOf(
            ReviewItem("r1", "Ramesh Kumar", 5, "3 days ago", "Excellent quality $productName! I planted/used this in my farm and the results were amazing.", 24, true, 2),
            ReviewItem("r2", "Anjali S.", 4, "1 week ago", "The delivery was very prompt and packaging was secure. The $productName works great.", 8, true, 0),
            ReviewItem("r3", "Muthu Krishnan", 5, "2 weeks ago", "Super quality. The $productName is very durable and holds up well.", 56, true, 1)
        )
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Ratings & Reviews", fontWeight = FontWeight.Bold, color = Color.White) },
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
            // Stars Summary Box
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(20.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                border = BorderStroke(1.dp, DividerGray)
            ) {
                Row(
                    modifier = Modifier.padding(20.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally,
                        modifier = Modifier.weight(1f)
                    ) {
                        Text(text = "4.8", fontSize = 48.sp, fontWeight = FontWeight.Bold, color = TextDark)
                        Row {
                            repeat(5) {
                                Icon(Icons.Default.Star, contentDescription = null, tint = RatingStar, modifier = Modifier.size(16.dp))
                            }
                        }
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(text = "Based on 1,250 reviews", fontSize = 11.sp, color = TextMuted)
                    }

                    Spacer(modifier = Modifier.width(16.dp))

                    // Breakdown lines
                    Column(
                        modifier = Modifier.weight(1.3f),
                        verticalArrangement = Arrangement.spacedBy(4.dp)
                    ) {
                        RatingBarLine(stars = 5, percent = 0.82f)
                        RatingBarLine(stars = 4, percent = 0.12f)
                        RatingBarLine(stars = 3, percent = 0.03f)
                        RatingBarLine(stars = 2, percent = 0.01f)
                        RatingBarLine(stars = 1, percent = 0.01f)
                    }
                }
            }

            // Filters row
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                com.satish.agrifarm.ui.farmer.categories.FilterChip("All Reviews", active = true)
                com.satish.agrifarm.ui.farmer.categories.FilterChip("With Photos", active = false)
                com.satish.agrifarm.ui.farmer.categories.FilterChip("Most Recent", active = false)
            }

            // Reviews List
            reviews.forEach { review ->
                ReviewRowItem(review = review)
            }

            Spacer(modifier = Modifier.height(8.dp))

            Button(
                onClick = {},
                colors = ButtonDefaults.buttonColors(containerColor = Color.White),
                border = BorderStroke(1.5.dp, GreenPrimary),
                shape = RoundedCornerShape(10.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Text("Load More Reviews", color = GreenPrimary, fontWeight = FontWeight.Bold)
            }

            Spacer(modifier = Modifier.height(24.dp))
        }
    }
}

@Composable
fun RatingBarLine(stars: Int, percent: Float) {
    Row(
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(6.dp)
    ) {
        Text(text = "$stars", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = TextDark, modifier = Modifier.width(8.dp))
        LinearProgressIndicator(
            progress = percent,
            color = GreenPrimary,
            trackColor = DividerGray,
            modifier = Modifier
                .weight(1f)
                .height(6.dp)
                .clip(CircleShape)
        )
        Text(
            text = "${(percent * 100).toInt()}%",
            fontSize = 11.sp,
            color = TextMuted,
            modifier = Modifier.width(28.dp),
            textAlign = TextAlign.End
        )
    }
}

@Composable
fun ReviewRowItem(review: ReviewItem) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        border = BorderStroke(1.dp, DividerGray)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.Top
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(
                        modifier = Modifier
                            .size(36.dp)
                            .clip(CircleShape)
                            .background(GreenLight),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(text = review.authorName.take(1), fontWeight = FontWeight.Bold, color = GreenPrimary)
                    }
                    Spacer(modifier = Modifier.width(10.dp))
                    Column {
                        Text(text = review.authorName, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            repeat(review.rating) {
                                Icon(Icons.Default.Star, contentDescription = null, tint = RatingStar, modifier = Modifier.size(12.dp))
                            }
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(text = review.timeAgo, fontSize = 10.sp, color = TextMuted)
                        }
                    }
                }

                IconButton(onClick = {}) {
                    Icon(Icons.Default.MoreVert, contentDescription = null, tint = TextMuted)
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            Text(
                text = review.content,
                fontSize = 13.sp,
                color = TextDark,
                lineHeight = 18.sp
            )

            // Mock photo review attachment
            if (review.photosCount > 0) {
                Spacer(modifier = Modifier.height(10.dp))
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    repeat(review.photosCount) {
                        Box(
                            modifier = Modifier
                                .size(60.dp)
                                .clip(RoundedCornerShape(8.dp))
                                .background(TintFertilizers),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(Icons.Default.Image, contentDescription = null, tint = GreenPrimary.copy(alpha = 0.3f))
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier.clickable {}
                ) {
                    Icon(Icons.Default.ThumbUp, contentDescription = "Helpful", tint = GreenPrimary, modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(text = "Helpful (${review.helpfulCount})", fontSize = 11.sp, color = GreenPrimary, fontWeight = FontWeight.Bold)
                }

                if (review.isVerifiedPurchase) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.CheckCircle, contentDescription = null, tint = GreenPrimary, modifier = Modifier.size(14.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(text = "Verified Purchase", fontSize = 10.sp, color = TextMuted, fontWeight = FontWeight.Medium)
                    }
                }
            }
        }
    }
}

@Preview(showBackground = true, showSystemUi = true)
@Composable
fun ProductDetailsScreenPreview() {
    AgrifarmTheme {
        ProductDetailsScreen(
            productId = "P1",
            onBackClick = {},
            onNavigate = {}
        )
    }
}
