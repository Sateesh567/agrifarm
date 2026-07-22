package com.satish.agrifarm.ui.farmer.categories

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Menu
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.satish.agrifarm.data.model.CategoryItem
import com.satish.agrifarm.ui.components.AgriExpertAdviceCard
import com.satish.agrifarm.ui.components.CategoryRowItem
import com.satish.agrifarm.ui.components.FarmerBottomBar
import com.satish.agrifarm.ui.navigation.Screen
import com.satish.agrifarm.ui.theme.AgrifarmTheme
import com.satish.agrifarm.ui.theme.BackgroundWhite
import com.satish.agrifarm.ui.theme.GreenPrimary

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ProductCategoriesScreen(
    onNavigate: (String) -> Unit
) {
    val categoriesList = listOf(
        CategoryItem("1", "Fertilizers", "Boost your crop yield", 0xFFE8F5E9, "fertilizer"),
        CategoryItem("2", "Pesticides", "Protect against infestations", 0xFFFFEBEE, "pesticide"),
        CategoryItem("3", "Weed Killers", "Clean fields, better growth", 0xFFFFF3E0, "weed"),
        CategoryItem("4", "Seeds", "High-quality hybrid seeds", 0xFFE8F5E9, "seed"),
        CategoryItem("5", "Farming Tools", "Modern equipment for precision", 0xFFF5F5F5, "tool"),
        CategoryItem("6", "Organic Products", "Natural & eco-friendly solutions", 0xFFE8F5E9, "organic")
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
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = GreenPrimary
                )
            )
        },
        bottomBar = {
            FarmerBottomBar(
                currentRoute = Screen.ProductCategories.route,
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
            Column {
                Text(
                    text = "Product Categories",
                    fontWeight = FontWeight.Bold,
                    fontSize = 24.sp,
                    color = MaterialTheme.colorScheme.onBackground
                )
                Text(
                    text = "Find everything you need for your farm",
                    fontSize = 14.sp,
                    color = Color.Gray
                )
            }

            // Categories list cards
            categoriesList.forEach { category ->
                val destinationRoute = when (category.title) {
                    "Fertilizers" -> Screen.FertilizersCategory.route
                    "Seeds" -> Screen.SeedsCategory.route
                    "Pesticides" -> Screen.CropProtectionCategory.route
                    "Weed Killers" -> Screen.WeedKillersCategory.route
                    "Farming Tools" -> Screen.ToolsCategory.route
                    else -> Screen.FertilizersCategory.route
                }
                
                CategoryRowItem(
                    category = category,
                    onClick = { onNavigate(destinationRoute) }
                )
            }

            Spacer(modifier = Modifier.height(4.dp))

            // Expert Advice banner card
            AgriExpertAdviceCard(
                onContactClick = { onNavigate(Screen.CustomerSupport.route) }
            )
        }
    }
}

@Preview(showBackground = true, showSystemUi = true)
@Composable
fun ProductCategoriesScreenPreview() {
    AgrifarmTheme {
        ProductCategoriesScreen(onNavigate = {})
    }
}
