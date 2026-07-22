package com.satish.agrifarm.ui.navigation

import androidx.compose.animation.AnimatedContentTransitionScope
import androidx.compose.animation.core.tween
import androidx.compose.runtime.Composable
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import com.satish.agrifarm.ui.auth.*
import com.satish.agrifarm.ui.farmer.*
import com.satish.agrifarm.ui.farmer.categories.*
import com.satish.agrifarm.ui.farmer.product.*
import com.satish.agrifarm.ui.farmer.search.*
import com.satish.agrifarm.ui.farmer.cart.*
import com.satish.agrifarm.ui.farmer.tracking.*
import com.satish.agrifarm.ui.farmer.profile.*
import com.satish.agrifarm.ui.seller.*

import com.satish.agrifarm.data.repository.AgroRepository
import com.satish.agrifarm.data.model.UserRole

@Composable
fun AgroLinkNavGraph(navController: NavHostController) {
    NavHost(
        navController = navController,
        startDestination = Screen.Splash.route,
        enterTransition = {
            slideIntoContainer(
                AnimatedContentTransitionScope.SlideDirection.Left,
                animationSpec = tween(350)
            )
        },
        exitTransition = {
            slideOutOfContainer(
                AnimatedContentTransitionScope.SlideDirection.Left,
                animationSpec = tween(350)
            )
        },
        popEnterTransition = {
            slideIntoContainer(
                AnimatedContentTransitionScope.SlideDirection.Right,
                animationSpec = tween(350)
            )
        },
        popExitTransition = {
            slideOutOfContainer(
                AnimatedContentTransitionScope.SlideDirection.Right,
                animationSpec = tween(350)
            )
        }
    ) {
        // Splash Screen
        composable(Screen.Splash.route) {
            SplashScreen(
                onSplashFinished = {
                    val destination = if (AgroRepository.isLoggedIn()) {
                        if (AgroRepository.currentUser?.role == UserRole.SHOP_OWNER) {
                            Screen.ShopDashboard.route
                        } else {
                            Screen.FarmerHome.route
                        }
                    } else {
                        Screen.RoleSelection.route
                    }
                    navController.navigate(destination) {
                        popUpTo(Screen.Splash.route) { inclusive = true }
                    }
                }
            )
        }

        // Role Selection & Auth Flow
        composable(Screen.RoleSelection.route) {
            RoleSelectionScreen(
                onSelectFarmer = { navController.navigate(Screen.FarmerLogin.route) },
                onSelectOwner = { navController.navigate(Screen.OwnerLogin.route) }
            )
        }

        composable(Screen.FarmerLogin.route) {
            LoginScreen(
                role = "FARMER",
                onLoginSuccess = {
                    navController.navigate(Screen.FarmerHome.route) {
                        popUpTo(Screen.RoleSelection.route) { inclusive = true }
                    }
                },
                onNavigateToRegister = { navController.navigate(Screen.FarmerRegister.route) },
                onBackClick = { navController.popBackStack() }
            )
        }

        composable(Screen.OwnerLogin.route) {
            LoginScreen(
                role = "SHOP_OWNER",
                onLoginSuccess = {
                    navController.navigate(Screen.ShopDashboard.route) {
                        popUpTo(Screen.RoleSelection.route) { inclusive = true }
                    }
                },
                onNavigateToRegister = { navController.navigate(Screen.OwnerRegister.route) },
                onBackClick = { navController.popBackStack() }
            )
        }

        composable(Screen.FarmerRegister.route) {
            FarmerRegisterScreen(
                onRegisterSuccess = { navController.navigate(Screen.FarmerLogin.route) },
                onBackToLogin = { navController.popBackStack() }
            )
        }

        composable(Screen.OwnerRegister.route) {
            OwnerRegisterScreen(
                onRegisterSuccess = { navController.navigate(Screen.OwnerLogin.route) },
                onBackToLogin = { navController.popBackStack() }
            )
        }

        // Farmer Dashboard
        composable(Screen.FarmerHome.route) {
            FarmerHomeScreen(
                onProductClick = { productId ->
                    navController.navigate(Screen.ProductDetails.createRoute(productId))
                },
                onCartClick = { navController.navigate(Screen.Cart.route) },
                onNavigate = { route -> navController.navigate(route) }
            )
        }

        // Product Categories
        composable(Screen.ProductCategories.route) {
            ProductCategoriesScreen(
                onNavigate = { route -> navController.navigate(route) }
            )
        }

        // Subcategories Pages
        composable(Screen.FertilizersCategory.route) {
            FertilizersCategoryScreen(
                onProductClick = { pid -> navController.navigate(Screen.ProductDetails.createRoute(pid)) },
                onNavigate = { route -> navController.navigate(route) }
            )
        }

        composable(Screen.SeedsCategory.route) {
            SeedsCategoryScreen(
                onProductClick = { pid -> navController.navigate(Screen.ProductDetails.createRoute(pid)) },
                onNavigate = { route -> navController.navigate(route) }
            )
        }

        composable(Screen.CropProtectionCategory.route) {
            CropProtectionCategoryScreen(
                onProductClick = { pid -> navController.navigate(Screen.ProductDetails.createRoute(pid)) },
                onNavigate = { route -> navController.navigate(route) }
            )
        }

        composable(Screen.WeedKillersCategory.route) {
            WeedKillersCategoryScreen(
                onProductClick = { pid -> navController.navigate(Screen.ProductDetails.createRoute(pid)) },
                onNavigate = { route -> navController.navigate(route) }
            )
        }

        composable(Screen.ToolsCategory.route) {
            ToolsCategoryScreen(
                onProductClick = { pid -> navController.navigate(Screen.ProductDetails.createRoute(pid)) },
                onNavigate = { route -> navController.navigate(route) }
            )
        }
        composable(Screen.ShopCatalog.route) { backStackEntry ->
            val shopId = backStackEntry.arguments?.getString("shopId") ?: ""
            ShopCatalogScreen(
                shopId = shopId,
                onProductClick = { pid ->
                    navController.navigate(Screen.ProductDetails.createRoute(pid))
                },
                onBackClick = { navController.popBackStack() },
                onNavigate = { route -> navController.navigate(route) }
            )
        }

        // Product Details
        composable(Screen.ProductDetails.route) { backStackEntry ->
            val productId = backStackEntry.arguments?.getString("productId") ?: ""
            ProductDetailsScreen(
                productId = productId,
                onBackClick = { navController.popBackStack() },
                onNavigate = { route -> navController.navigate(route) }
            )
        }

        // Product Image Gallery
        composable(Screen.ImageGallery.route) { backStackEntry ->
            val productId = backStackEntry.arguments?.getString("productId") ?: ""
            ProductImageGalleryScreen(
                productId = productId,
                onCloseClick = { navController.popBackStack() }
            )
        }

        // Product Ratings & Reviews
        composable(Screen.RatingsReviews.route) { backStackEntry ->
            val productId = backStackEntry.arguments?.getString("productId") ?: ""
            RatingsReviewsScreen(
                productId = productId,
                onBackClick = { navController.popBackStack() }
            )
        }

        // Search flow
        composable(Screen.Search.route) {
            SearchScreen(
                onNavigate = { route -> navController.navigate(route) }
            )
        }

        composable(Screen.VoiceSearch.route) {
            VoiceSearchScreen(
                onCancelClick = { navController.popBackStack() }
            )
        }

        composable(Screen.FilterSort.route) {
            FilterSortScreen(
                onCloseClick = { navController.popBackStack() },
                onApplyClick = { navController.popBackStack() }
            )
        }

        // Cart Screen
        composable(Screen.Cart.route) {
            CartScreen(
                onBackClick = { navController.popBackStack() },
                onCheckoutClick = { navController.navigate(Screen.Checkout.route) }
            )
        }

        // Checkout Stepper Screen
        composable(Screen.Checkout.route) {
            CheckoutScreen(
                onBackClick = { navController.popBackStack() },
                onProceedToPaymentClick = { navController.navigate(Screen.PaymentMethod.route) }
            )
        }

        // Address Management
        composable(Screen.AddressManagement.route) {
            AddressManagementScreen(
                onBackClick = { navController.popBackStack() },
                onNavigate = { route -> navController.navigate(route) }
            )
        }

        // Payment Method Options
        composable(Screen.PaymentMethod.route) {
            PaymentMethodScreen(
                onBackClick = { navController.popBackStack() },
                onPaymentSuccessClick = { navController.navigate(Screen.OrderSuccess.route) }
            )
        }

        // Order Confirmation Success
        composable(Screen.OrderSuccess.route) {
            OrderSuccessScreen(
                onTrackOrder = { navController.navigate(Screen.LiveTracking.route) },
                onGoHome = {
                    navController.navigate(Screen.FarmerHome.route) {
                        popUpTo(Screen.RoleSelection.route) { inclusive = false }
                    }
                }
            )
        }

        // Map Tracking
        composable(Screen.LiveTracking.route) {
            LiveTrackingScreen(
                onBackClick = { navController.popBackStack() },
                onNavigate = { route -> navController.navigate(route) }
            )
        }

        composable(Screen.PartnerMapTracking.route) {
            PartnerMapTrackingScreen(
                onCloseClick = { navController.popBackStack() }
            )
        }

        // Social, FAQ and History
        composable(Screen.OrderHistory.route) {
            OrderHistoryScreen(
                onNavigate = { route -> navController.navigate(route) }
            )
        }

        composable(Screen.BillInvoice.route) { backStackEntry ->
            val orderId = backStackEntry.arguments?.getString("orderId") ?: ""
            BillInvoiceScreen(
                orderId = orderId,
                onBackClick = { navController.popBackStack() }
            )
        }

        composable(Screen.Notifications.route) {
            NotificationsScreen(
                onNavigate = { route -> navController.navigate(route) }
            )
        }

        composable(Screen.OffersPromos.route) {
            OffersPromosScreen(
                onNavigate = { route -> navController.navigate(route) }
            )
        }

        composable(Screen.ReferralRewards.route) {
            ReferralRewardsScreen(
                onBackClick = { navController.popBackStack() }
            )
        }

        composable(Screen.CommunityFeed.route) {
            CommunityFeedScreen(
                onNavigate = { route -> navController.navigate(route) }
            )
        }

        // Profiles & Settings
        composable(Screen.EditProfile.route) {
            EditProfileScreen(
                onBackClick = { navController.popBackStack() }
            )
        }

        composable(Screen.SettingsScreen.route) {
            SettingsScreen(
                onBackClick = { navController.popBackStack() },
                onLogoutClick = {
                    navController.navigate(Screen.RoleSelection.route) {
                        popUpTo(0) { inclusive = true }
                    }
                },
                onEditProfileClick = {
                    navController.navigate(Screen.EditProfile.route)
                }
            )
        }

        composable(Screen.CustomerSupport.route) {
            CustomerSupportScreen(
                onBackClick = { navController.popBackStack() },
                onChatClick = { navController.navigate(Screen.ChatWithSeller.route) }
            )
        }

        composable(Screen.ChatWithSeller.route) {
            ChatWithSellerScreen(
                onBackClick = { navController.popBackStack() },
                onNavigate = { route -> navController.navigate(route) }
            )
        }

        composable(Screen.Profile.route) {
            FarmerProfileScreen(
                onNavigate = { route -> navController.navigate(route) }
            )
        }

        // ==========================================
        // Seller Flow
        // ==========================================
        composable(Screen.ShopDashboard.route) {
            SellerDashboardScreen(
                onNavigate = { route -> navController.navigate(route) }
            )
        }

        composable(Screen.SellerOrders.route) {
            SellerOrdersScreen(
                onNavigate = { route -> navController.navigate(route) }
            )
        }

        composable(Screen.SellerProductManagement.route) {
            SellerProductManagementScreen(
                onNavigate = { route -> navController.navigate(route) }
            )
        }

        composable(Screen.AddProduct.route) {
            AddProductScreen(
                onBackClick = { navController.popBackStack() },
                onSaveClick = { navController.popBackStack() }
            )
        }

        composable(Screen.InventoryManagement.route) {
            InventoryManagementScreen(
                onNavigate = { route -> navController.navigate(route) }
            )
        }

        composable(Screen.EarningsAnalytics.route) {
            EarningsAnalyticsScreen(
                onBackClick = { navController.popBackStack() }
            )
        }

        composable(Screen.CropScanner.route) {
            CropScannerScreen(
                onBackClick = { navController.popBackStack() },
                onProductClick = { productId ->
                    navController.navigate(Screen.ProductDetails.createRoute(productId))
                }
            )
        }

        composable(Screen.MandiPrices.route) {
            MandiPricesScreen(
                onBackClick = { navController.popBackStack() }
            )
        }

        composable(Screen.SellerSettings.route) {
            SellerSettingsScreen(
                onNavigate = { route -> navController.navigate(route) },
                onBackClick = { navController.popBackStack() },
                onLogoutClick = {
                    navController.navigate(Screen.RoleSelection.route) {
                        popUpTo(0) { inclusive = true }
                    }
                }
            )
        }
    }
}
