package com.satish.agrifarm.ui.farmer.search

import androidx.compose.animation.*
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
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.satish.agrifarm.data.model.Product
import com.satish.agrifarm.ui.components.FarmerBottomBar
import com.satish.agrifarm.ui.components.HighFidelityProductCard
import com.satish.agrifarm.ui.navigation.Screen
import com.satish.agrifarm.ui.theme.*

// ==========================================
// 1. Search Screen
// ==========================================
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SearchScreen(
    onNavigate: (String) -> Unit
) {
    var searchQuery by remember { mutableStateOf("") }
    val recentSearches = listOf("Organic Potash", "Power Tiller", "Rice Seeds Bag")
    
    val suggestedProducts = listOf(
        Product("s2", "s1", "Tomato Hybrid Seeds", "Seeds", 249.0, 100, "High germination rate seeds", "", "", 4.7f),
        Product("o1", "s2", "Organic Vermicompost", "Fertilizers", 450.0, 50, "Rich organic soil compost", "", "", 4.8f)
    )

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    OutlinedTextField(
                        value = searchQuery,
                        onValueChange = { searchQuery = it },
                        placeholder = { Text("Search seeds, tools, or fertilizers...", fontSize = 13.sp) },
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(end = 8.dp),
                        leadingIcon = { Icon(Icons.Default.Search, contentDescription = null, tint = GreenPrimary) },
                        trailingIcon = {
                            Row {
                                IconButton(onClick = { onNavigate(Screen.VoiceSearch.route) }) {
                                    Icon(Icons.Default.Mic, contentDescription = "Voice Search", tint = GreenPrimary)
                                }
                                IconButton(onClick = { onNavigate(Screen.FilterSort.route) }) {
                                    Icon(Icons.Default.QrCodeScanner, contentDescription = "Scan", tint = GreenPrimary)
                                }
                            }
                        },
                        shape = RoundedCornerShape(12.dp),
                        singleLine = true,
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = GreenPrimary,
                            unfocusedBorderColor = DividerGray,
                            focusedContainerColor = BackgroundWhite,
                            unfocusedContainerColor = BackgroundWhite
                        )
                    )
                },
                navigationIcon = {
                    IconButton(onClick = { onNavigate(Screen.FarmerHome.route) }) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = Color.White)
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
                .verticalScroll(rememberScrollState())
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(20.dp)
        ) {
            // Recent Searches
            Column {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(text = "Recent Searches", fontWeight = FontWeight.Bold, fontSize = 14.sp, color = TextDark)
                    Text(
                        text = "CLEAR ALL",
                        fontWeight = FontWeight.Bold,
                        fontSize = 11.sp,
                        color = RedAccent,
                        modifier = Modifier.clickable {}
                    )
                }

                Spacer(modifier = Modifier.height(8.dp))

                Row(
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    recentSearches.forEach { search ->
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(8.dp))
                                .background(DividerGray.copy(alpha = 0.5f))
                                .clickable { searchQuery = search }
                                .padding(horizontal = 12.dp, vertical = 6.dp)
                        ) {
                            Text(text = search, fontSize = 12.sp, color = TextDark)
                        }
                    }
                }
            }

            // Trending Categories
            Column {
                Text(text = "Trending Categories", fontWeight = FontWeight.Bold, fontSize = 14.sp, color = TextDark)
                
                Spacer(modifier = Modifier.height(10.dp))

                // Mega Banner Card
                Card(
                    modifier = Modifier.fillMaxWidth().height(120.dp),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = GreenPrimary)
                ) {
                    Box(modifier = Modifier.fillMaxSize()) {
                        Icon(
                            imageVector = Icons.Default.Agriculture,
                            contentDescription = null,
                            tint = Color.White.copy(alpha = 0.08f),
                            modifier = Modifier.size(160.dp).align(Alignment.CenterEnd)
                        )
                        Column(
                            modifier = Modifier.padding(16.dp).fillMaxHeight(),
                            verticalArrangement = Arrangement.SpaceBetween
                        ) {
                            Box(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(6.dp))
                                    .background(GoldAccent)
                                    .padding(horizontal = 6.dp, vertical = 2.dp)
                            ) {
                                Text("BEST SELLER", color = TextDark, fontSize = 8.sp, fontWeight = FontWeight.Bold)
                            }
                            Column {
                                Text("Monsoon Special Seeds", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 16.sp)
                                Text("Upto 30% Off", color = Color.White.copy(alpha = 0.8f), fontSize = 12.sp)
                            }
                        }
                    }
                }

                Spacer(modifier = Modifier.height(10.dp))

                // Small grid categories
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    TrendingCategoryMiniItem(title = "Tools", icon = Icons.Default.Build, modifier = Modifier.weight(1f))
                    TrendingCategoryMiniItem(title = "Manure", icon = Icons.Default.Eco, modifier = Modifier.weight(1f))
                }

                Spacer(modifier = Modifier.height(10.dp))

                // Irrigation Row Card
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    border = BorderStroke(1.dp, DividerGray)
                ) {
                    Row(
                        modifier = Modifier.padding(12.dp).fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Box(
                            modifier = Modifier
                                .size(36.dp)
                                .clip(CircleShape)
                                .background(TintWeedKillers),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(Icons.Default.WaterDrop, contentDescription = null, tint = OrangeAccent, modifier = Modifier.size(18.dp))
                        }
                        Spacer(modifier = Modifier.width(12.dp))
                        Column(modifier = Modifier.weight(1f)) {
                            Text("Irrigation", fontWeight = FontWeight.Bold, fontSize = 13.sp, color = TextDark)
                            Text("Drip & Sprinklers", fontSize = 11.sp, color = TextMuted)
                        }
                        Icon(Icons.Default.ChevronRight, contentDescription = null, tint = TextMuted)
                    }
                }
            }

            // Suggested for You
            Column {
                Text(text = "Suggested for You", fontWeight = FontWeight.Bold, fontSize = 14.sp, color = TextDark)
                Spacer(modifier = Modifier.height(10.dp))

                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    suggestedProducts.forEach { product ->
                        HighFidelityProductCard(
                            product = product,
                            onProductClick = { onNavigate(Screen.ProductDetails.createRoute(product.id)) },
                            onAddToCartClick = { onNavigate(Screen.Cart.route) },
                            modifier = Modifier.weight(1f)
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun TrendingCategoryMiniItem(title: String, icon: ImageVector, modifier: Modifier = Modifier) {
    Card(
        modifier = modifier,
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        border = BorderStroke(1.dp, DividerGray)
    ) {
        Row(
            modifier = Modifier.padding(12.dp).fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.Center
        ) {
            Icon(imageVector = icon, contentDescription = null, tint = GreenPrimary, modifier = Modifier.size(18.dp))
            Spacer(modifier = Modifier.width(8.dp))
            Text(text = title, fontWeight = FontWeight.Bold, fontSize = 13.sp, color = TextDark)
        }
    }
}

// ==========================================
// 2. Voice Search Screen
// ==========================================
@Composable
fun VoiceSearchScreen(
    onCancelClick: () -> Unit
) {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(
                Brush.verticalGradient(
                    colors = listOf(
                        GreenDark.copy(alpha = 0.95f),
                        Color(0xFF0C2B0E).copy(alpha = 0.98f)
                    )
                )
            )
            .clickable { onCancelClick() }
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            // Header
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                IconButton(onClick = onCancelClick) {
                    Icon(Icons.Default.Close, contentDescription = "Close", tint = Color.White)
                }
                Text(
                    text = "Voice Search Screen",
                    fontWeight = FontWeight.Bold,
                    color = Color.White,
                    fontSize = 16.sp
                )
                Spacer(modifier = Modifier.width(48.dp)) // Equalizer space
            }

            // Listening Circle
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.Center
            ) {
                Text(text = "LISTENING...", color = GreenLight, fontWeight = FontWeight.Bold, fontSize = 12.sp)
                Spacer(modifier = Modifier.height(24.dp))

                Box(
                    modifier = Modifier
                        .size(120.dp)
                        .clip(CircleShape)
                        .background(Color.White),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.Mic,
                        contentDescription = "Microphone",
                        tint = GreenDark,
                        modifier = Modifier.size(54.dp)
                    )
                }

                Spacer(modifier = Modifier.height(24.dp))
                Text(
                    text = "How can I help your farm\ntoday?",
                    color = Color.White,
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold,
                    textAlign = TextAlign.Center
                )
            }

            // Try Saying
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                Card(
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White.copy(alpha = 0.12f)),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        modifier = Modifier.padding(14.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.Center
                    ) {
                        Icon(Icons.Default.Agriculture, contentDescription = null, tint = GreenLight)
                        Spacer(modifier = Modifier.width(10.dp))
                        Text(text = "\"Fertilizer for Rice\"", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                    }
                }

                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    VoiceSuggestionChip("Best tractor deals")
                    VoiceSuggestionChip("Organic seeds")
                }

                Spacer(modifier = Modifier.height(16.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(text = "English", color = Color.White, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                    Text(text = "தமிழ்", color = GreenLight, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                    Text(text = "TAP ANYWHERE TO CANCEL", color = Color.White.copy(alpha = 0.4f), fontSize = 10.sp)
                }
            }
        }
    }
}

@Composable
fun VoiceSuggestionChip(label: String) {
    Box(
        modifier = Modifier
            .clip(RoundedCornerShape(8.dp))
            .background(Color.White.copy(alpha = 0.08f))
            .padding(horizontal = 12.dp, vertical = 6.dp)
    ) {
        Text(text = label, color = Color.White.copy(alpha = 0.7f), fontSize = 11.sp)
    }
}

// ==========================================
// 3. Filter & Sort Screen Sheet
// ==========================================
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun FilterSortScreen(
    onCloseClick: () -> Unit,
    onApplyClick: () -> Unit
) {
    var priceRange by remember { mutableStateOf(0.2f..0.8f) }
    var mahycoChecked by remember { mutableStateOf(true) }
    var bayerChecked by remember { mutableStateOf(false) }
    var syngentaChecked by remember { mutableStateOf(false) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Filter & Sort Screen", fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    IconButton(onClick = onCloseClick) {
                        Icon(Icons.Default.Close, contentDescription = "Close")
                    }
                },
                actions = {
                    TextButton(onClick = {}) {
                        Text("Clear All", color = RedAccent, fontWeight = FontWeight.Bold)
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
                    onClick = onApplyClick,
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    shape = RoundedCornerShape(10.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = GreenPrimary)
                ) {
                    Icon(Icons.Default.FilterList, contentDescription = null)
                    Spacer(modifier = Modifier.width(6.dp))
                    Text("Apply Filters", fontWeight = FontWeight.Bold, fontSize = 15.sp)
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
            verticalArrangement = Arrangement.spacedBy(20.dp)
        ) {
            // Sort By
            Column {
                Text(text = "Sort by", fontWeight = FontWeight.Bold, fontSize = 14.sp, color = TextDark)
                Spacer(modifier = Modifier.height(10.dp))
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    com.satish.agrifarm.ui.farmer.categories.FilterChip("Popularity", active = true)
                    com.satish.agrifarm.ui.farmer.categories.FilterChip("Price: Low to High", active = false)
                    com.satish.agrifarm.ui.farmer.categories.FilterChip("Rating", active = false)
                }
            }

            // Price Range
            Column {
                Text(text = "Price Range", fontWeight = FontWeight.Bold, fontSize = 14.sp, color = TextDark)
                Spacer(modifier = Modifier.height(10.dp))
                
                RangeSlider(
                    value = priceRange,
                    onValueChange = { priceRange = it },
                    colors = SliderDefaults.colors(
                        activeTrackColor = GreenPrimary,
                        inactiveTrackColor = DividerGray,
                        thumbColor = GreenPrimary
                    ),
                    modifier = Modifier.fillMaxWidth()
                )

                Spacer(modifier = Modifier.height(8.dp))

                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(8.dp))
                            .background(Color.White)
                            .border(1.dp, DividerGray, RoundedCornerShape(8.dp))
                            .padding(horizontal = 16.dp, vertical = 8.dp)
                    ) {
                        Text(text = "₹ ${(priceRange.start * 1000).toInt()}", fontSize = 13.sp, fontWeight = FontWeight.Bold)
                    }

                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(8.dp))
                            .background(Color.White)
                            .border(1.dp, DividerGray, RoundedCornerShape(8.dp))
                            .padding(horizontal = 16.dp, vertical = 8.dp)
                    ) {
                        Text(text = "₹ ${(priceRange.endInclusive * 10000).toInt()}+", fontSize = 13.sp, fontWeight = FontWeight.Bold)
                    }
                }
            }

            // Brand Checklist
            Column {
                Text(text = "Brand", fontWeight = FontWeight.Bold, fontSize = 14.sp, color = TextDark)
                Spacer(modifier = Modifier.height(8.dp))

                CheckboxItem(label = "Mahyco Seeds", checked = mahycoChecked, onCheckedChange = { mahycoChecked = it })
                CheckboxItem(label = "Bayer CropScience", checked = bayerChecked, onCheckedChange = { bayerChecked = it })
                CheckboxItem(label = "Syngenta", checked = syngentaChecked, onCheckedChange = { syngentaChecked = it })
            }

            // Weight Selection
            Column {
                Text(text = "Weight", fontWeight = FontWeight.Bold, fontSize = 14.sp, color = TextDark)
                Spacer(modifier = Modifier.height(10.dp))
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    com.satish.agrifarm.ui.farmer.categories.FilterChip("1 KG", active = false)
                    com.satish.agrifarm.ui.farmer.categories.FilterChip("5 KG", active = true)
                    com.satish.agrifarm.ui.farmer.categories.FilterChip("10 KG", active = false)
                }
            }
        }
    }
}

@Composable
fun CheckboxItem(
    label: String,
    checked: Boolean,
    onCheckedChange: (Boolean) -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onCheckedChange(!checked) }
            .padding(vertical = 4.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Text(text = label, fontSize = 13.sp, color = TextDark)
        Checkbox(
            checked = checked,
            onCheckedChange = onCheckedChange,
            colors = CheckboxDefaults.colors(checkedColor = GreenPrimary)
        )
    }
}
