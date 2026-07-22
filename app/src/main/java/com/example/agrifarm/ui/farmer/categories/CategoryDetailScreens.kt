package com.satish.agrifarm.ui.farmer.categories

import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.collectAsState
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.layout.ContentScale
import com.satish.agrifarm.data.model.Product
import com.satish.agrifarm.data.repository.AgroRepository
import com.satish.agrifarm.ui.components.FarmerBottomBar
import com.satish.agrifarm.ui.components.HighFidelityProductCard
import com.satish.agrifarm.ui.navigation.Screen
import com.satish.agrifarm.ui.theme.*

// ==========================================
// 1. Fertilizers Category Screen
// ==========================================
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun FertilizersCategoryScreen(
    onProductClick: (String) -> Unit,
    onNavigate: (String) -> Unit
) {
    val productsState by AgroRepository.products.collectAsState()
    val products = remember(productsState) {
        productsState.filter { it.category.equals("Fertilizers", ignoreCase = true) }
    }

    LaunchedEffect(Unit) {
        AgroRepository.fetchProducts()
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Fertilizers Category", fontWeight = FontWeight.Bold, color = Color.White) },
                navigationIcon = {
                    IconButton(onClick = { onNavigate(Screen.ProductCategories.route) }) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = Color.White)
                    }
                },
                actions = {
                    IconButton(onClick = { onNavigate(Screen.Search.route) }) {
                        Icon(Icons.Default.Search, contentDescription = "Search", tint = Color.White)
                    }
                    IconButton(onClick = { onNavigate(Screen.Cart.route) }) {
                        Icon(Icons.Default.ShoppingCart, contentDescription = "Cart", tint = Color.White)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = GreenPrimary)
            )
        },
        bottomBar = {
            FarmerBottomBar(currentRoute = Screen.ProductCategories.route, onNavigate = onNavigate)
        }
    ) { padding ->
        Box(modifier = Modifier.fillMaxSize().padding(padding)) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .background(BackgroundWhite)
                    .padding(horizontal = 16.dp)
            ) {
                Spacer(modifier = Modifier.height(12.dp))

                // Header info
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(text = "Essential nutrients for high yield", fontSize = 12.sp, color = TextMuted)
                    Text(text = "${products.size} items", fontWeight = FontWeight.Bold, fontSize = 12.sp, color = TextDark)
                }

                Spacer(modifier = Modifier.height(12.dp))

                // Filters
                Row(
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Button(
                        onClick = { onNavigate(Screen.FilterSort.route) },
                        colors = ButtonDefaults.buttonColors(containerColor = GreenLight),
                        contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp),
                        shape = RoundedCornerShape(8.dp)
                    ) {
                        Icon(Icons.Default.FilterList, contentDescription = null, tint = GreenPrimary, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Filter", color = GreenPrimary, fontSize = 11.sp)
                    }

                    FilterChip("Sort: Popular", active = true)
                    FilterChip("Organic", active = false)
                    FilterChip("Liquid", active = false)
                }

                Spacer(modifier = Modifier.height(12.dp))

                // Product Grid
                LazyVerticalGrid(
                    columns = GridCells.Fixed(2),
                    horizontalArrangement = Arrangement.spacedBy(12.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp),
                    modifier = Modifier.fillMaxWidth().weight(1f)
                ) {
                    items(products) { product ->
                        HighFidelityProductCard(
                            product = product,
                            onProductClick = { onProductClick(product.id) },
                            onAddToCartClick = {
                                AgroRepository.addToCart(product)
                                onNavigate(Screen.Cart.route)
                            }
                        )
                    }
                }
            }

            // View Cart Floating banner
            FloatingCartBanner(
                modifier = Modifier.align(Alignment.BottomCenter).padding(bottom = 16.dp),
                onViewCartClick = { onNavigate(Screen.Cart.route) }
            )
        }
    }
}

// ==========================================
// 2. Seeds Category Screen
// ==========================================
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SeedsCategoryScreen(
    onProductClick: (String) -> Unit,
    onNavigate: (String) -> Unit
) {
    val productsState by AgroRepository.products.collectAsState()
    val products = remember(productsState) {
        productsState.filter { it.category.equals("Seeds", ignoreCase = true) }
    }

    LaunchedEffect(Unit) {
        AgroRepository.fetchProducts()
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Seeds Category", fontWeight = FontWeight.Bold, color = Color.White) },
                navigationIcon = {
                    IconButton(onClick = { onNavigate(Screen.ProductCategories.route) }) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = Color.White)
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
            FarmerBottomBar(currentRoute = Screen.ProductCategories.route, onNavigate = onNavigate)
        }
    ) { padding ->
        Box(modifier = Modifier.fillMaxSize().padding(padding)) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .background(BackgroundWhite)
                    .padding(horizontal = 16.dp)
                    .verticalScroll(rememberScrollState())
            ) {
                Spacer(modifier = Modifier.height(8.dp))

                // Breadcrumbs
                Text(
                    text = "Home > Shop > Seeds",
                    fontSize = 11.sp,
                    color = TextMuted,
                    modifier = Modifier.fillMaxWidth()
                )

                Spacer(modifier = Modifier.height(4.dp))

                Text(
                    text = "Seeds Category",
                    fontWeight = FontWeight.Bold,
                    fontSize = 20.sp,
                    color = TextDark
                )
                Text(
                    text = "Premium variety for high-yield farming in Tamil Nadu.",
                    fontSize = 12.sp,
                    color = TextMuted
                )

                Spacer(modifier = Modifier.height(12.dp))

                // Filters row
                Row(
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    IconButton(
                        onClick = { onNavigate(Screen.FilterSort.route) },
                        modifier = Modifier
                            .size(36.dp)
                            .clip(RoundedCornerShape(8.dp))
                            .background(GreenLight)
                    ) {
                        Icon(Icons.Default.FilterList, contentDescription = null, tint = GreenPrimary, modifier = Modifier.size(18.dp))
                    }
                    FilterChip("All Seeds", active = true)
                    FilterChip("Vegetables", active = false)
                    FilterChip("Grains", active = false)
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Grid
                Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    for (i in products.indices step 2) {
                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                            HighFidelityProductCard(
                                product = products[i],
                                onProductClick = { onProductClick(products[i].id) },
                                onAddToCartClick = {
                                    AgroRepository.addToCart(products[i])
                                    onNavigate(Screen.Cart.route)
                                },
                                modifier = Modifier.weight(1f)
                            )
                            if (i + 1 < products.size) {
                                HighFidelityProductCard(
                                    product = products[i + 1],
                                    onProductClick = { onProductClick(products[i + 1].id) },
                                    onAddToCartClick = {
                                        AgroRepository.addToCart(products[i + 1])
                                        onNavigate(Screen.Cart.route)
                                    },
                                    modifier = Modifier.weight(1f)
                                )
                            } else {
                                Spacer(modifier = Modifier.weight(1f))
                            }
                        }
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Rainy Season specials banner
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = GreenDark)
                ) {
                    Box(modifier = Modifier.fillMaxWidth()) {
                        // Background overlay
                        Icon(
                            imageVector = Icons.Default.Grain,
                            contentDescription = null,
                            tint = Color.White.copy(alpha = 0.08f),
                            modifier = Modifier.size(180.dp).align(Alignment.CenterEnd)
                        )

                        Column(modifier = Modifier.padding(20.dp)) {
                            Text(
                                text = "Rainy Season Specials!",
                                color = Color.White,
                                fontWeight = FontWeight.Bold,
                                fontSize = 18.sp
                            )
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                text = "Get 15% off on all vegetable seeds. Limited time only.",
                                color = Color.White.copy(alpha = 0.8f),
                                fontSize = 12.sp
                            )
                            Spacer(modifier = Modifier.height(12.dp))
                            Button(
                                onClick = { /* Action */ },
                                colors = ButtonDefaults.buttonColors(containerColor = GoldAccent),
                                shape = RoundedCornerShape(8.dp)
                            ) {
                                Text("Shop Now", color = TextDark, fontWeight = FontWeight.Bold, fontSize = 11.sp)
                            }
                        }
                    }
                }

                Spacer(modifier = Modifier.height(80.dp)) // Padding for bottom banner
            }

            // View Cart Floating banner
            FloatingCartBanner(
                modifier = Modifier.align(Alignment.BottomCenter).padding(bottom = 16.dp),
                onViewCartClick = { onNavigate(Screen.Cart.route) }
            )
        }
    }
}

// ==========================================
// 3. Crop Protection Screen (Pesticides)
// ==========================================
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CropProtectionCategoryScreen(
    onProductClick: (String) -> Unit,
    onNavigate: (String) -> Unit
) {
    val productsState by AgroRepository.products.collectAsState()
    val products = remember(productsState) {
        productsState.filter {
            it.category.equals("Pesticides", ignoreCase = true) ||
            it.category.equals("Crop Protection", ignoreCase = true)
        }
    }

    LaunchedEffect(Unit) {
        AgroRepository.fetchProducts()
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Crop Protection", fontWeight = FontWeight.Bold, color = Color.White) },
                navigationIcon = {
                    IconButton(onClick = { onNavigate(Screen.ProductCategories.route) }) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = Color.White)
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
            FarmerBottomBar(currentRoute = Screen.ProductCategories.route, onNavigate = onNavigate)
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .padding(padding)
                .fillMaxSize()
                .background(BackgroundWhite)
                .padding(horizontal = 16.dp)
        ) {
            Spacer(modifier = Modifier.height(10.dp))

            Text(
                text = "Crop Protection",
                fontWeight = FontWeight.Bold,
                fontSize = 20.sp,
                color = TextDark
            )
            Text(
                text = "Certified pesticides and herbicides to safeguard your Bhoomiputra harvest against pests and weeds.",
                fontSize = 12.sp,
                color = TextMuted,
                lineHeight = 16.sp
            )

            Spacer(modifier = Modifier.height(12.dp))

            // Filters row
            Row(
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                FilterChip("All Products", active = true)
                FilterChip("Rice", active = false)
                FilterChip("Wheat", active = false)
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Grid
            LazyVerticalGrid(
                columns = GridCells.Fixed(2),
                horizontalArrangement = Arrangement.spacedBy(12.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp),
                modifier = Modifier.fillMaxWidth().weight(1f)
            ) {
                items(products) { product ->
                    HighFidelityProductCard(
                        product = product,
                        onProductClick = { onProductClick(product.id) },
                        onAddToCartClick = {
                            AgroRepository.addToCart(product)
                            onNavigate(Screen.Cart.route)
                        }
                    )
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Load more block
            Button(
                onClick = { /* More */ },
                colors = ButtonDefaults.buttonColors(containerColor = GreenPrimary),
                shape = RoundedCornerShape(10.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Text("Load More Products", color = Color.White, fontWeight = FontWeight.Bold)
            }

            Text(
                text = "Showing ${products.size} products.",
                fontSize = 11.sp,
                color = TextMuted,
                textAlign = TextAlign.Center,
                modifier = Modifier.fillMaxWidth().padding(vertical = 8.dp)
            )
        }
    }
}

// ==========================================
// 4. Weed Killers Category Screen
// ==========================================
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun WeedKillersCategoryScreen(
    onProductClick: (String) -> Unit,
    onNavigate: (String) -> Unit
) {
    val productsState by AgroRepository.products.collectAsState()
    val products = remember(productsState) {
        productsState.filter {
            it.category.equals("Weed Killers", ignoreCase = true) ||
            it.category.contains("Weed", ignoreCase = true)
        }
    }

    LaunchedEffect(Unit) {
        AgroRepository.fetchProducts()
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Weed Killers Category", fontWeight = FontWeight.Bold, color = Color.White) },
                navigationIcon = {
                    IconButton(onClick = { onNavigate(Screen.ProductCategories.route) }) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = Color.White)
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
            FarmerBottomBar(currentRoute = Screen.ProductCategories.route, onNavigate = onNavigate)
        }
    ) { padding ->
        Box(modifier = Modifier.fillMaxSize().padding(padding)) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .background(BackgroundWhite)
                    .padding(horizontal = 16.dp)
            ) {
                Spacer(modifier = Modifier.height(10.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text(text = "Weed Killers", fontWeight = FontWeight.Bold, fontSize = 20.sp, color = TextDark)
                        Text(text = "High-grade herbicides for crop protection", fontSize = 11.sp, color = TextMuted)
                    }

                    // Grid list toggle mock buttons
                    Row(
                        modifier = Modifier
                            .clip(RoundedCornerShape(8.dp))
                            .background(DividerGray)
                            .padding(2.dp)
                    ) {
                        IconButton(onClick = {}, modifier = Modifier.size(32.dp).background(Color.White).clip(CircleShape)) {
                            Icon(Icons.Default.GridView, contentDescription = "Grid", modifier = Modifier.size(16.dp))
                        }
                        IconButton(onClick = {}, modifier = Modifier.size(32.dp)) {
                            Icon(Icons.Default.List, contentDescription = "List", modifier = Modifier.size(16.dp))
                        }
                    }
                }

                Spacer(modifier = Modifier.height(12.dp))

                Row(
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    FilterChip("All Herbicides", active = true)
                    FilterChip("Selective", active = false)
                    FilterChip("Non-Selective", active = false)
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Grid list
                LazyVerticalGrid(
                    columns = GridCells.Fixed(2),
                    horizontalArrangement = Arrangement.spacedBy(12.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp),
                    modifier = Modifier.fillMaxWidth().weight(1f)
                ) {
                    items(products) { product ->
                        HighFidelityProductCard(
                            product = product,
                            onProductClick = { onProductClick(product.id) },
                            onAddToCartClick = {
                                AgroRepository.addToCart(product)
                                onNavigate(Screen.Cart.route)
                            }
                        )
                    }
                }
            }

            // Green Floating Filter Button
            FloatingActionButton(
                onClick = { onNavigate(Screen.FilterSort.route) },
                containerColor = GreenPrimary,
                contentColor = Color.White,
                modifier = Modifier
                    .align(Alignment.BottomEnd)
                    .padding(24.dp)
            ) {
                Icon(Icons.Default.FilterAlt, contentDescription = "Filter")
            }
        }
    }
}

// ==========================================
// 5. Professional Tools Category Screen
// ==========================================
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ToolsCategoryScreen(
    onProductClick: (String) -> Unit,
    onNavigate: (String) -> Unit
) {
    val productsState by AgroRepository.products.collectAsState()
    val tools = remember(productsState) {
        productsState.filter {
            it.category.equals("Tools", ignoreCase = true) ||
            it.category.contains("Tool", ignoreCase = true) ||
            it.category.contains("Equipment", ignoreCase = true)
        }
    }
    val featuredTool = remember(tools) {
        tools.maxByOrNull { it.price }
    }
    val manualTools = remember(tools, featuredTool) {
        tools.filter { it != featuredTool }
    }

    LaunchedEffect(Unit) {
        AgroRepository.fetchProducts()
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Professional Tools", fontWeight = FontWeight.Bold, color = Color.White) },
                navigationIcon = {
                    IconButton(onClick = { onNavigate(Screen.ProductCategories.route) }) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = Color.White)
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
            FarmerBottomBar(currentRoute = Screen.ProductCategories.route, onNavigate = onNavigate)
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .padding(padding)
                .fillMaxSize()
                .background(BackgroundWhite)
                .padding(horizontal = 16.dp)
                .verticalScroll(rememberScrollState())
        ) {
            Spacer(modifier = Modifier.height(10.dp))

            // Beautiful header illustration background box
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = GreenLight)
            ) {
                Row(
                    modifier = Modifier.padding(16.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(8.dp))
                                .background(GreenPrimary)
                                .padding(horizontal = 6.dp, vertical = 2.dp)
                        ) {
                            Text("CATEGORY", color = Color.White, fontSize = 9.sp, fontWeight = FontWeight.Bold)
                        }
                        Spacer(modifier = Modifier.height(4.dp))
                        Text("Professional Tools", fontWeight = FontWeight.Bold, fontSize = 20.sp, color = GreenDark)
                        Text(
                            text = "Precision engineered for the modern Indian farmer. Built for durability and ease.",
                            fontSize = 11.sp,
                            color = TextMuted,
                            lineHeight = 15.sp
                        )
                    }

                    Icon(
                        imageVector = Icons.Default.Agriculture,
                        contentDescription = null,
                        tint = GreenPrimary.copy(alpha = 0.2f),
                        modifier = Modifier.size(80.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            Row(
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                FilterChip("All Tools", active = true)
                FilterChip("Manual Tools", active = false)
                FilterChip("Power Equipment", active = false)
            }

            Spacer(modifier = Modifier.height(16.dp))

            if (featuredTool != null) {
                // Power Equipment Banner
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(text = "Power Equipment", fontWeight = FontWeight.Bold, fontSize = 16.sp, color = TextDark)
                    Text(text = "View All", color = GreenPrimary, fontWeight = FontWeight.Bold, fontSize = 12.sp, modifier = Modifier.clickable {})
                }

                Spacer(modifier = Modifier.height(10.dp))

                // Main Power product (motorized sprayer/tiller)
                Card(
                    modifier = Modifier.fillMaxWidth().clickable { onProductClick(featuredTool.id) },
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    border = BorderStroke(1.dp, DividerGray)
                ) {
                    Column {
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(180.dp)
                                .background(
                                    Brush.verticalGradient(
                                        colors = listOf(GreenLight, Color.White)
                                    )
                                ),
                            contentAlignment = Alignment.Center
                        ) {
                            if (featuredTool.imageUrl.isNotEmpty()) {
                                val fullImgUrl = "${AgroRepository.getServerRoot()}${featuredTool.imageUrl}"
                                coil.compose.AsyncImage(
                                    model = fullImgUrl,
                                    contentDescription = featuredTool.name,
                                    modifier = Modifier.fillMaxSize(),
                                    contentScale = ContentScale.Crop
                                )
                            } else {
                                Icon(
                                    imageVector = Icons.Default.SettingsPower,
                                    contentDescription = null,
                                    tint = GreenPrimary.copy(alpha = 0.15f),
                                    modifier = Modifier.size(96.dp)
                                )
                            }
                            Box(
                                modifier = Modifier
                                    .align(Alignment.TopStart)
                                    .padding(12.dp)
                                    .clip(RoundedCornerShape(8.dp))
                                    .background(GreenPrimary)
                                    .padding(horizontal = 8.dp, vertical = 4.dp)
                            ) {
                                Text("TOP RATED", color = Color.White, fontSize = 9.sp, fontWeight = FontWeight.Bold)
                            }
                        }

                        Column(modifier = Modifier.padding(16.dp)) {
                            Text(
                                text = featuredTool.name,
                                fontWeight = FontWeight.Bold,
                                fontSize = 16.sp,
                                color = TextDark
                            )
                            Text(
                                text = featuredTool.description,
                                fontSize = 12.sp,
                                color = TextMuted,
                                lineHeight = 16.sp
                            )

                            Spacer(modifier = Modifier.height(12.dp))

                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(
                                    text = "₹${featuredTool.price.toInt()}",
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 20.sp,
                                    color = GreenDark
                                )

                                Button(
                                    onClick = {
                                        AgroRepository.addToCart(featuredTool)
                                        onNavigate(Screen.Cart.route)
                                    },
                                    colors = ButtonDefaults.buttonColors(containerColor = GreenPrimary),
                                    shape = RoundedCornerShape(10.dp)
                                ) {
                                    Icon(Icons.Default.ShoppingCart, contentDescription = null, modifier = Modifier.size(16.dp))
                                    Spacer(modifier = Modifier.width(4.dp))
                                    Text("Add To Cart", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                                }
                            }
                        }
                    }
                }

                Spacer(modifier = Modifier.height(20.dp))
            }

            if (manualTools.isNotEmpty()) {
                // Manual hand tools section
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(text = "Manual Hand Tools", fontWeight = FontWeight.Bold, fontSize = 16.sp, color = TextDark)
                    Text(text = "View All", color = GreenPrimary, fontWeight = FontWeight.Bold, fontSize = 12.sp, modifier = Modifier.clickable {})
                }

                Spacer(modifier = Modifier.height(12.dp))

                // Grid (Manual tools)
                Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    for (i in manualTools.indices step 2) {
                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                            HighFidelityProductCard(
                                product = manualTools[i],
                                onProductClick = { onProductClick(manualTools[i].id) },
                                onAddToCartClick = {
                                    AgroRepository.addToCart(manualTools[i])
                                    onNavigate(Screen.Cart.route)
                                },
                                modifier = Modifier.weight(1f)
                            )
                            if (i + 1 < manualTools.size) {
                                HighFidelityProductCard(
                                    product = manualTools[i + 1],
                                    onProductClick = { onProductClick(manualTools[i + 1].id) },
                                    onAddToCartClick = {
                                        AgroRepository.addToCart(manualTools[i + 1])
                                        onNavigate(Screen.Cart.route)
                                    },
                                    modifier = Modifier.weight(1f)
                                )
                            } else {
                                Spacer(modifier = Modifier.weight(1f))
                            }
                        }
                    }
                }
            } else if (featuredTool == null) {
                Box(modifier = Modifier.fillMaxWidth().height(150.dp), contentAlignment = Alignment.Center) {
                    Text("No tools registered in database.", color = TextMuted)
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            // Maintenance Guide banner
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = EarthBrown)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text("Tool Maintenance Guide", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 16.sp)
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = "Keep your Bhoomi-power tools sharp and rust-free. Learn how to extend the life of your equipment with our expert tips.",
                        color = Color.White.copy(alpha = 0.8f),
                        fontSize = 11.sp,
                        lineHeight = 15.sp
                    )
                    Spacer(modifier = Modifier.height(12.dp))
                    Button(
                        onClick = {},
                        colors = ButtonDefaults.buttonColors(containerColor = Color.White.copy(alpha = 0.2f)),
                        shape = RoundedCornerShape(8.dp)
                    ) {
                        Text("Read Farmer's Guide", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 11.sp)
                    }
                }
            }

            Spacer(modifier = Modifier.height(24.dp))
        }
    }
}

// ==========================================
// Reusable sub-widgets
// ==========================================
@Composable
fun FilterChip(
    label: String,
    active: Boolean,
    onClick: () -> Unit = {}
) {
    Box(
        modifier = Modifier
            .clip(RoundedCornerShape(8.dp))
            .background(if (active) GreenPrimary else Color.White)
            .border(width = 1.dp, color = if (active) Color.Transparent else DividerGray, shape = RoundedCornerShape(8.dp))
            .clickable { onClick() }
            .padding(horizontal = 12.dp, vertical = 6.dp)
    ) {
        Text(
            text = label,
            color = if (active) Color.White else TextDark,
            fontWeight = if (active) FontWeight.Bold else FontWeight.Normal,
            fontSize = 11.sp
        )
    }
}

@Composable
fun FloatingCartBanner(
    onViewCartClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    val cartState by AgroRepository.cart.collectAsState()
    if (cartState.isEmpty()) return

    val totalCount = cartState.sumOf { it.quantity }
    val totalAmount = cartState.sumOf { it.price * it.quantity }

    Card(
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = GreenPrimary),
        elevation = CardDefaults.cardElevation(defaultElevation = 6.dp),
        modifier = modifier
            .fillMaxWidth()
            .padding(horizontal = 24.dp)
            .clickable { onViewCartClick() }
    ) {
        Row(
            modifier = Modifier.padding(14.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(Icons.Default.ShoppingCart, contentDescription = null, tint = Color.White)
                Spacer(modifier = Modifier.width(12.dp))
                Text("View Cart ($totalCount)", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 14.sp)
            }

            Row(verticalAlignment = Alignment.CenterVertically) {
                Text("₹${totalAmount.toInt()}", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                Spacer(modifier = Modifier.width(4.dp))
                Icon(Icons.Default.ArrowForward, contentDescription = null, tint = Color.White, modifier = Modifier.size(16.dp))
            }
        }
    }
}
