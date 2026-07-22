package com.satish.agrifarm.ui.navigation

sealed class Screen(val route: String) {
    data object Splash : Screen("splash")
    data object RoleSelection : Screen("role_selection")
    
    // Auth Flow
    data object FarmerLogin : Screen("farmer_login")
    data object OwnerLogin : Screen("owner_login")
    data object FarmerRegister : Screen("farmer_register")
    data object OwnerRegister : Screen("owner_register")
    
    // Farmer Home & Categories
    data object FarmerHome : Screen("farmer_home")
    data object ProductCategories : Screen("product_categories")
    
    // Sub-Categories
    data object FertilizersCategory : Screen("fertilizers_category")
    data object SeedsCategory : Screen("seeds_category")
    data object CropProtectionCategory : Screen("crop_protection_category")
    data object WeedKillersCategory : Screen("weed_killers_category")
    data object ToolsCategory : Screen("tools_category")
    
    // Product Details & Reviews
    data object ProductDetails : Screen("product_details/{productId}") {
        fun createRoute(productId: String) = "product_details/$productId"
    }
    data object ImageGallery : Screen("image_gallery/{productId}") {
        fun createRoute(productId: String) = "image_gallery/$productId"
    }
    data object RatingsReviews : Screen("ratings_reviews/{productId}") {
        fun createRoute(productId: String) = "ratings_reviews/$productId"
    }
    // NEW: Write a review after delivery
    data object WriteReview : Screen("write_review/{productId}/{orderId}") {
        fun createRoute(productId: String, orderId: String) = "write_review/$productId/$orderId"
    }
    
    // Search Flow
    data object Search : Screen("search")
    data object VoiceSearch : Screen("voice_search")
    data object FilterSort : Screen("filter_sort")
    
    // Cart & Checkout Flow
    data object Cart : Screen("cart")
    data object Checkout : Screen("checkout")
    data object AddressManagement : Screen("address_management")
    data object PaymentMethod : Screen("payment_method")
    data object OrderSuccess : Screen("order_success")
    
    // Tracking & Maps Flow
    data object LiveTracking : Screen("live_tracking")
    data object PartnerMapTracking : Screen("partner_map_tracking")
    
    // Social, History & Support Flow
    data object OrderHistory : Screen("order_history")
    data object BillInvoice : Screen("bill_invoice/{orderId}") {
        fun createRoute(orderId: String) = "bill_invoice/$orderId"
    }
    data object Notifications : Screen("notifications")
    data object OffersPromos : Screen("offers_promos")
    data object ReferralRewards : Screen("referral_rewards")
    data object CommunityFeed : Screen("community_feed")
    data object EditProfile : Screen("edit_profile")
    data object SettingsScreen : Screen("settings_screen")
    data object CustomerSupport : Screen("customer_support")
    data object ChatWithSeller : Screen("chat_with_seller")
    data object CropScanner : Screen("crop_scanner")
    data object MandiPrices : Screen("mandi_prices")

    // NEW: Wishlist
    data object Wishlist : Screen("wishlist")
    
    // Seller Flow
    data object ShopDashboard : Screen("shop_dashboard")
    data object SellerOrders : Screen("seller_orders")
    data object SellerProductManagement : Screen("seller_product_management")
    data object AddProduct : Screen("add_product")
    data object InventoryManagement : Screen("inventory_management")
    data object EarningsAnalytics : Screen("earnings_analytics")
    data object SellerSettings : Screen("seller_settings")  // Fix 4: Seller settings screen
    
    data object Profile : Screen("profile")
    data object ShopList : Screen("shop_list")

    data object ShopCatalog : Screen("shop_catalog/{shopId}") {
        fun createRoute(shopId: String) = "shop_catalog/$shopId"
    }
}
