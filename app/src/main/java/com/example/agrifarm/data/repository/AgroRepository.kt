package com.satish.agrifarm.data.repository

import com.satish.agrifarm.BuildConfig
import com.satish.agrifarm.data.model.*
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.withContext
import okhttp3.*
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.RequestBody.Companion.toRequestBody
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import java.lang.reflect.Type
import java.util.concurrent.TimeUnit
import android.content.Context
import android.content.SharedPreferences
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey

/**
 * AgroRepository v2.0
 * - BASE_URL from BuildConfig (set in local.properties) — NO HARDCODED IPs
 * - JWT Bearer token injected on every authenticated request
 * - UiState<T> for proper Loading/Success/Error handling
 * - Wishlist, Notifications, Reviews support
 * - Refresh token on 401 responses
 */
object AgroRepository {

    // ── Read BASE_URL from BuildConfig (set in local.properties) ──────────
    // If you're on a physical device, set BASE_URL in local.properties to your PC's IP.
    // For emulator: http://10.0.2.2:3000/api
    private val BASE_URL = BuildConfig.BASE_URL.trimEnd('/')

    private val client = OkHttpClient.Builder()
        .connectTimeout(30, TimeUnit.SECONDS)
        .readTimeout(30, TimeUnit.SECONDS)
        .writeTimeout(30, TimeUnit.SECONDS)
        .build()

    private val gson = Gson()

    // ── In-memory state ───────────────────────────────────────────────────
    var currentUser: User? = null
    var currentSellerShop: Shop? = null
    private var accessToken: String? = null
    private var refreshTokenStr: String? = null

    // ── StateFlows with UiState wrapper ──────────────────────────────────
    private val _productsState = MutableStateFlow<UiState<List<Product>>>(UiState.Loading)
    val productsState: StateFlow<UiState<List<Product>>> = _productsState

    private val _shopsState = MutableStateFlow<UiState<List<Shop>>>(UiState.Loading)
    val shopsState: StateFlow<UiState<List<Shop>>> = _shopsState

    private val _ordersState = MutableStateFlow<UiState<List<Order>>>(UiState.Loading)
    val ordersState: StateFlow<UiState<List<Order>>> = _ordersState

    private val _wishlistState = MutableStateFlow<UiState<List<WishlistItem>>>(UiState.Loading)
    val wishlistState: StateFlow<UiState<List<WishlistItem>>> = _wishlistState

    private val _notificationsState = MutableStateFlow<UiState<List<NotificationItem2>>>(UiState.Loading)
    val notificationsState: StateFlow<UiState<List<NotificationItem2>>> = _notificationsState

    // Backward-compat plain list flows for screens that haven't been migrated yet
    private val _products = MutableStateFlow<List<Product>>(emptyList())
    val products: StateFlow<List<Product>> = _products

    private val _shops = MutableStateFlow<List<Shop>>(emptyList())
    val shops: StateFlow<List<Shop>> = _shops

    private val _orders = MutableStateFlow<List<Order>>(emptyList())
    val orders: StateFlow<List<Order>> = _orders

    private val _cart = MutableStateFlow<List<CartItem>>(emptyList())
    val cart: StateFlow<List<CartItem>> = _cart

    private val _mandiPricesState = MutableStateFlow<UiState<List<MandiItem>>>(UiState.Loading)
    val mandiPricesState: StateFlow<UiState<List<MandiItem>>> = _mandiPricesState

    private val _mandiPrices = MutableStateFlow<List<MandiItem>>(emptyList())
    val mandiPrices: StateFlow<List<MandiItem>> = _mandiPrices

    private val _cropDiseasesState = MutableStateFlow<UiState<List<DiseaseInfo>>>(UiState.Loading)
    val cropDiseasesState: StateFlow<UiState<List<DiseaseInfo>>> = _cropDiseasesState

    private val _cropDiseases = MutableStateFlow<List<DiseaseInfo>>(emptyList())
    val cropDiseases: StateFlow<List<DiseaseInfo>> = _cropDiseases

    private val _weatherForecastState = MutableStateFlow<UiState<List<WeatherForecastEntry>>>(UiState.Loading)
    val weatherForecastState: StateFlow<UiState<List<WeatherForecastEntry>>> = _weatherForecastState

    private val _weatherForecast = MutableStateFlow<List<WeatherForecastEntry>>(emptyList())
    val weatherForecast: StateFlow<List<WeatherForecastEntry>> = _weatherForecast

    // ── JWT Token Management & Secure Persistence ─────────────────────────
    private var appContext: Context? = null

    fun initialize(context: Context) {
        appContext = context.applicationContext
        loadSession()
    }

    private fun getEncryptedPrefs(): SharedPreferences? {
        val ctx = appContext ?: return null
        return try {
            val masterKey = MasterKey.Builder(ctx)
                .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
                .build()
            EncryptedSharedPreferences.create(
                ctx,
                "secure_agrifarm_prefs",
                masterKey,
                EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
                EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
            )
        } catch (e: Exception) {
            e.printStackTrace()
            ctx.getSharedPreferences("agrifarm_prefs_fallback", Context.MODE_PRIVATE)
        }
    }

    private fun loadSession() {
        val prefs = getEncryptedPrefs() ?: return
        accessToken = prefs.getString("access_token", null)
        refreshTokenStr = prefs.getString("refresh_token", null)
        
        val userJson = prefs.getString("current_user", null)
        if (!userJson.isNullOrEmpty()) {
            currentUser = try { gson.fromJson(userJson, User::class.java) } catch (e: Exception) { null }
        }
        
        val shopJson = prefs.getString("current_shop", null)
        if (!shopJson.isNullOrEmpty()) {
            currentSellerShop = try { gson.fromJson(shopJson, Shop::class.java) } catch (e: Exception) { null }
        }
    }

    fun saveSession() {
        val prefs = getEncryptedPrefs() ?: return
        prefs.edit().apply {
            putString("access_token", accessToken)
            putString("refresh_token", refreshTokenStr)
            putString("current_user", currentUser?.let { gson.toJson(it) })
            putString("current_shop", currentSellerShop?.let { gson.toJson(it) })
            apply()
        }
    }

    fun setTokens(access: String, refresh: String) {
        accessToken   = access
        refreshTokenStr = refresh
        saveSession()
    }

    fun clearTokens() {
        accessToken     = null
        refreshTokenStr = null
        val prefs = getEncryptedPrefs()
        prefs?.edit()?.clear()?.apply()
    }

    fun isLoggedIn(): Boolean = accessToken != null && currentUser != null

    // ── HTTP Helpers ─────────────────────────────────────────────────────

    /** Build request with Authorization: Bearer <token> if logged in */
    private fun Request.Builder.withAuth(): Request.Builder {
        accessToken?.let { addHeader("Authorization", "Bearer $it") }
        return this
    }

    private suspend fun refreshAccessToken(): Boolean = withContext(Dispatchers.IO) {
        val refresh = refreshTokenStr ?: return@withContext false
        val mediaType = "application/json; charset=utf-8".toMediaType()
        val bodyStr = gson.toJson(mapOf("refreshToken" to refresh))
        val body = bodyStr.toRequestBody(mediaType)
        val request = Request.Builder()
            .url("$BASE_URL/auth/refresh")
            .post(body)
            .build()
        try {
            val response = client.newCall(request).execute()
            val respBody = response.body?.string()
            response.close()
            if (response.isSuccessful && !respBody.isNullOrEmpty()) {
                val resMap = gson.fromJson<Map<String, String>>(respBody, object : TypeToken<Map<String, String>>() {}.type)
                val newAccess = resMap["accessToken"]
                val newRefresh = resMap["refreshToken"]
                if (!newAccess.isNullOrEmpty()) {
                    accessToken = newAccess
                    if (!newRefresh.isNullOrEmpty()) {
                        refreshTokenStr = newRefresh
                    }
                    saveSession()
                    return@withContext true
                }
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
        false
    }

    private suspend fun executeCall(requestBuilder: Request.Builder, requiresAuth: Boolean): Pair<Int, String> =
        withContext(Dispatchers.IO) {
            var request = requestBuilder.apply { if (requiresAuth) withAuth() }.build()
            var response = client.newCall(request).execute()
            var code = response.code
            var bodyStr = response.body?.string() ?: ""
            response.close()

            if (code == 401 && requiresAuth) {
                if (refreshAccessToken()) {
                    request = requestBuilder.apply {
                        removeHeader("Authorization")
                        withAuth()
                    }.build()
                    response = client.newCall(request).execute()
                    code = response.code
                    bodyStr = response.body?.string() ?: ""
                    response.close()
                } else {
                    clearTokens()
                    currentUser = null
                }
            }
            Pair(code, bodyStr)
        }

    /** Execute a GET request, parse response as T */
    private suspend fun <T> makeGetRequest(url: String, typeToken: Type, requiresAuth: Boolean = false): T =
        withContext(Dispatchers.IO) {
            val builder = Request.Builder().url(url)
            val (code, bodyStr) = executeCall(builder, requiresAuth)
            if (code == 401 && requiresAuth) {
                throw Exception("Session expired. Please log in again.")
            }
            if (code < 200 || code >= 300) {
                val errorMsg = try {
                    gson.fromJson(bodyStr, Map::class.java)["error"]?.toString()
                } catch (e: Exception) { null } ?: "Server error $code"
                throw Exception(errorMsg)
            }
            gson.fromJson(bodyStr, typeToken)
        }

    /** Execute a POST request with JSON body, parse response as T */
    private suspend fun <T> makePostRequest(url: String, jsonBody: String, typeToken: Type, requiresAuth: Boolean = false): T =
        withContext(Dispatchers.IO) {
            val mediaType = "application/json; charset=utf-8".toMediaType()
            val body = jsonBody.toRequestBody(mediaType)
            val builder = Request.Builder().url(url).post(body)
            val (code, bodyStr) = executeCall(builder, requiresAuth)
            if (code == 401 && requiresAuth) {
                throw Exception("Session expired. Please log in again.")
            }
            if (code < 200 || code >= 300) {
                val errorMsg = try {
                    gson.fromJson(bodyStr, Map::class.java)["error"]?.toString()
                } catch (e: Exception) { null } ?: "Server error $code"
                throw Exception(errorMsg)
            }
            gson.fromJson(bodyStr, typeToken)
        }

    /** Execute a DELETE request, returns true on success */
    private suspend fun makeDeleteRequest(url: String): Boolean =
        withContext(Dispatchers.IO) {
            val builder = Request.Builder().url(url).delete()
            val (code, _) = executeCall(builder, requiresAuth = true)
            code in 200..299
        }

    /** Execute a PUT request with JSON body, parse response as T */
    private suspend fun <T> makePutRequest(url: String, jsonBody: String, typeToken: Type, requiresAuth: Boolean = false): T =
        withContext(Dispatchers.IO) {
            val mediaType = "application/json; charset=utf-8".toMediaType()
            val body = jsonBody.toRequestBody(mediaType)
            val builder = Request.Builder().url(url).put(body)
            val (code, bodyStr) = executeCall(builder, requiresAuth)
            if (code == 401 && requiresAuth) {
                throw Exception("Session expired. Please log in again.")
            }
            if (code < 200 || code >= 300) {
                val errorMsg = try {
                    gson.fromJson(bodyStr, Map::class.java)["error"]?.toString()
                } catch (e: Exception) { null } ?: "Server error $code"
                throw Exception(errorMsg)
            }
            gson.fromJson(bodyStr, typeToken)
        }

    // ── AUTH ─────────────────────────────────────────────────────────────

    suspend fun validateLogin(email: String, role: String, password: String = ""): Result<User> {
        return try {
            val body = gson.toJson(mapOf("email" to email, "role" to role, "password" to password))
            val user = makePostRequest<User>("$BASE_URL/login", body, User::class.java)
            currentUser = user

            // Store JWT tokens
            if (user.accessToken.isNotEmpty()) {
                setTokens(user.accessToken, user.refreshToken)
            }

            // Fetch data after login
            fetchShops()
            fetchProducts()
            fetchOrders()
            if (user.role == UserRole.SHOP_OWNER) loadSellerShopInfo()

            Result.success(user)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun registerUser(
        name: String, email: String, phone: String,
        role: String, address: String, password: String = ""
    ): Result<User> {
        return try {
            val body = gson.toJson(mapOf(
                "name" to name, "email" to email, "phone" to phone,
                "role" to role, "address" to address, "password" to password
            ))
            val user = makePostRequest<User>("$BASE_URL/auth/register", body, User::class.java)
            if (user.accessToken.isNotEmpty()) {
                currentUser = user
                setTokens(user.accessToken, user.refreshToken)
            }
            Result.success(user)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun logout(): Result<Unit> {
        return try {
            if (accessToken != null) {
                val body = gson.toJson(emptyMap<String, String>())
                makePostRequest<Map<*, *>>("$BASE_URL/auth/logout", body, Map::class.java, requiresAuth = true)
            }
            currentUser   = null
            currentSellerShop = null
            clearTokens()
            _products.value = emptyList()
            _shops.value    = emptyList()
            _orders.value   = emptyList()
            _cart.value     = emptyList()
            Result.success(Unit)
        } catch (e: Exception) {
            // Even if server logout fails, clear local state
            currentUser   = null
            currentSellerShop = null
            clearTokens()
            Result.success(Unit)
        }
    }

    suspend fun updateUserProfile(
        name: String, email: String, phone: String,
        address: String, profileImage: String
    ): Result<User> {
        val uid = currentUser?.uid ?: return Result.failure(Exception("Not logged in"))
        return try {
            val body = gson.toJson(mapOf(
                "uid" to uid, "name" to name, "email" to email,
                "phone" to phone, "address" to address, "profileImage" to profileImage
            ))
            val updatedUser = makePostRequest<User>("$BASE_URL/users/update", body, User::class.java, requiresAuth = true)
            currentUser = updatedUser
            saveSession()
            Result.success(updatedUser)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    /**
     * Change the current user's password.
     * Calls PUT /api/users/me with the new password.
     * Fix 4: Powers the Change Password dialog in Settings screens.
     */
    suspend fun changePassword(newPassword: String): Result<Unit> {
        return try {
            val body = gson.toJson(mapOf("password" to newPassword))
            // Use the /api/users/me PUT endpoint which supports password updates
            makePutRequest<Map<*, *>>("$BASE_URL/users/me", body, Map::class.java, requiresAuth = true)
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    // ── SHOPS ─────────────────────────────────────────────────────────────

    suspend fun fetchShops() {
        _shopsState.value = UiState.Loading
        try {
            val type = object : TypeToken<List<Shop>>() {}.type
            val shopList = makeGetRequest<List<Shop>>("$BASE_URL/shops", type)
            val approved = shopList.filter { it.status == "APPROVED" }
            _shops.value      = approved
            _shopsState.value = UiState.Success(approved)
        } catch (e: Exception) {
            _shopsState.value = UiState.Error(e.message ?: "Failed to load shops")
        }
    }

    suspend fun loadSellerShopInfo() {
        val ownerId = currentUser?.uid ?: return
        try {
            val type = object : TypeToken<List<Shop>>() {}.type
            val ownerShops = makeGetRequest<List<Shop>>("$BASE_URL/shops?ownerId=$ownerId", type)
            currentSellerShop = ownerShops.firstOrNull()
            saveSession()
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    suspend fun registerShop(
        name: String, category: String, address: String,
        description: String, imageUrl: String,
        ownerId: String? = null, imageBase64: String? = null
    ): Result<Shop> {
        val finalOwnerId = ownerId ?: currentUser?.uid ?: return Result.failure(Exception("Owner ID not found"))
        return try {
            val bodyMap = mutableMapOf(
                "name" to name, "ownerId" to finalOwnerId, "category" to category,
                "address" to address, "description" to description, "imageUrl" to imageUrl
            )
            if (!imageBase64.isNullOrEmpty()) bodyMap["imageBase64"] = imageBase64
            val body = gson.toJson(bodyMap)
            val shop = makePostRequest<Shop>("$BASE_URL/shops", body, Shop::class.java, requiresAuth = true)
            if (finalOwnerId == currentUser?.uid) {
                currentSellerShop = shop
                saveSession()
            }
            fetchShops()
            Result.success(shop)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    // ── PRODUCTS ──────────────────────────────────────────────────────────

    suspend fun fetchProducts(shopId: String? = null, category: String? = null, search: String? = null) {
        _productsState.value = UiState.Loading
        try {
            var url = "$BASE_URL/products"
            val params = mutableListOf<String>()
            shopId?.let   { params.add("shopId=$it") }
            category?.let { if (it != "All") params.add("category=${it.replace(" ", "%20")}") }
            search?.let   { params.add("search=${it.replace(" ", "%20")}") }
            if (params.isNotEmpty()) url += "?" + params.joinToString("&")

            val type = object : TypeToken<List<Product>>() {}.type
            val productList = makeGetRequest<List<Product>>(url, type)
            _products.value      = productList
            _productsState.value = UiState.Success(productList)
        } catch (e: Exception) {
            _productsState.value = UiState.Error(e.message ?: "Failed to load products")
        }
    }

    suspend fun addProduct(
        name: String, category: String, price: Double, stock: Int,
        description: String, usageInstructions: String,
        imageUrl: String = "", imageBase64: String? = null,
        imagesBase64: List<String>? = null
    ): Result<Product> {
        val shopId = currentSellerShop?.id ?: return Result.failure(Exception("No shop registered yet"))
        return try {
            val bodyMap = mutableMapOf<String, Any>(
                "shopId" to shopId, "name" to name, "category" to category,
                "price" to price, "stock" to stock, "description" to description,
                "usageInstructions" to usageInstructions, "imageUrl" to imageUrl
            )
            if (!imageBase64.isNullOrEmpty()) bodyMap["imageBase64"] = imageBase64
            if (!imagesBase64.isNullOrEmpty()) bodyMap["imagesBase64"] = imagesBase64
            val body = gson.toJson(bodyMap)
            val newProduct = makePostRequest<Product>("$BASE_URL/products", body, Product::class.java, requiresAuth = true)
            fetchProducts(shopId)
            Result.success(newProduct)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    // ── WISHLIST ──────────────────────────────────────────────────────────

    suspend fun fetchWishlist() {
        _wishlistState.value = UiState.Loading
        try {
            val type = object : TypeToken<List<WishlistItem>>() {}.type
            val items = makeGetRequest<List<WishlistItem>>("$BASE_URL/wishlist", type, requiresAuth = true)
            _wishlistState.value = UiState.Success(items)
        } catch (e: Exception) {
            _wishlistState.value = UiState.Error(e.message ?: "Failed to load wishlist")
        }
    }

    suspend fun toggleWishlist(productId: String): Result<Boolean> {
        return try {
            val body = gson.toJson(emptyMap<String, String>())
            val response = makePostRequest<Map<*, *>>(
                "$BASE_URL/wishlist/$productId", body, Map::class.java, requiresAuth = true
            )
            val wishlisted = response["wishlisted"] as? Boolean ?: false
            fetchWishlist()
            Result.success(wishlisted)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    // ── NOTIFICATIONS ─────────────────────────────────────────────────────

    suspend fun fetchNotifications() {
        _notificationsState.value = UiState.Loading
        try {
            val type = object : TypeToken<List<NotificationItem2>>() {}.type
            val items = makeGetRequest<List<NotificationItem2>>("$BASE_URL/notifications", type, requiresAuth = true)
            _notificationsState.value = UiState.Success(items)
        } catch (e: Exception) {
            _notificationsState.value = UiState.Error(e.message ?: "Failed to load notifications")
        }
    }

    // ── CART (local in-memory) ────────────────────────────────────────────

    fun addToCart(product: Product) {
        val currentCart = _cart.value.toMutableList()
        val existingItem = currentCart.find { it.productId == product.id }
        if (existingItem != null) {
            val index = currentCart.indexOf(existingItem)
            currentCart[index] = existingItem.copy(quantity = existingItem.quantity + 1)
        } else {
            currentCart.add(CartItem(product.id, product.name, 1, product.price))
        }
        _cart.value = currentCart
    }

    fun removeFromCart(productId: String) {
        _cart.value = _cart.value.filter { it.productId != productId }
    }

    fun decrementCartItem(productId: String) {
        val currentCart = _cart.value.toMutableList()
        val existingItem = currentCart.find { it.productId == productId } ?: return
        val index = currentCart.indexOf(existingItem)
        if (existingItem.quantity > 1) {
            currentCart[index] = existingItem.copy(quantity = existingItem.quantity - 1)
        } else {
            currentCart.removeAt(index)
        }
        _cart.value = currentCart
    }

    fun clearCart() { _cart.value = emptyList() }

    // ── ORDERS ────────────────────────────────────────────────────────────

    suspend fun fetchOrders() {
        _ordersState.value = UiState.Loading
        val userId = currentUser?.uid ?: return
        try {
            val url = if (currentUser?.role == UserRole.SHOP_OWNER) {
                val shopId = currentSellerShop?.id ?: ""
                "$BASE_URL/orders?shopId=$shopId"
            } else {
                "$BASE_URL/orders?buyerId=$userId"
            }
            val type = object : TypeToken<List<Order>>() {}.type
            val orderList = makeGetRequest<List<Order>>(url, type, requiresAuth = true)
            _orders.value      = orderList
            _ordersState.value = UiState.Success(orderList)
        } catch (e: Exception) {
            _ordersState.value = UiState.Error(e.message ?: "Failed to load orders")
        }
    }

    suspend fun confirmOrder(address: String): Result<Order> {
        val buyerId   = currentUser?.uid ?: return Result.failure(Exception("Not logged in"))
        val cartItems = _cart.value
        if (cartItems.isEmpty()) return Result.failure(Exception("Cart is empty"))
        if (address.isBlank()) return Result.failure(Exception("Delivery address is required"))

        val firstProdId = cartItems.first().productId
        val prodDetails = _products.value.find { it.id == firstProdId }
        val shopId = prodDetails?.shopId ?: return Result.failure(Exception("Cannot determine shop for order"))

        return try {
            val body = gson.toJson(mapOf(
                "farmerUid"       to buyerId,
                "shopId"          to shopId,
                "items"           to cartItems,
                "totalAmount"     to cartItems.sumOf { it.price * it.quantity },
                "deliveryAddress" to address
            ))
            val order = makePostRequest<Order>("$BASE_URL/orders", body, Order::class.java, requiresAuth = true)
            clearCart()
            fetchOrders()
            Result.success(order)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun updateOrderStatus(orderId: String, status: String): Result<Order> {
        return try {
            val body = gson.toJson(mapOf("status" to status))
            val order = makePostRequest<Order>("$BASE_URL/orders/$orderId/status", body, Order::class.java, requiresAuth = true)
            fetchOrders()
            Result.success(order)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    // ── REVIEWS ───────────────────────────────────────────────────────────

    suspend fun fetchProductReviews(productId: String): Result<List<Review>> {
        return try {
            val type = object : TypeToken<List<Review>>() {}.type
            val reviews = makeGetRequest<List<Review>>("$BASE_URL/products/$productId/reviews", type)
            Result.success(reviews)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun submitReview(
        productId: String, orderId: String, rating: Int,
        title: String, body: String
    ): Result<Map<*, *>> {
        return try {
            val jsonBody = gson.toJson(mapOf(
                "productId" to productId, "orderId" to orderId,
                "rating" to rating, "title" to title, "body" to body
            ))
            val result = makePostRequest<Map<*, *>>("$BASE_URL/reviews", jsonBody, Map::class.java, requiresAuth = true)
            Result.success(result)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    // ── DYNAMIC SERVICES (MANDI, WEATHER, CROP SCANS) ──────────────────────

    fun getServerRoot(): String {
        return "$BASE_URL/".replace("/api/", "/")
    }

    suspend fun fetchMandiPrices(district: String? = null) {
        _mandiPricesState.value = UiState.Loading
        try {
            val url = if (district != null && district != "All") "$BASE_URL/mandi-prices?district=$district" else "$BASE_URL/mandi-prices"
            val type = object : TypeToken<List<MandiItem>>() {}.type
            val list = makeGetRequest<List<MandiItem>>(url, type)
            _mandiPrices.value = list
            _mandiPricesState.value = UiState.Success(list)
        } catch (e: Exception) {
            _mandiPricesState.value = UiState.Error(e.message ?: "Failed to load mandi prices")
        }
    }

    suspend fun fetchCropDiseases() {
        _cropDiseasesState.value = UiState.Loading
        try {
            val type = object : TypeToken<List<DiseaseInfo>>() {}.type
            val list = makeGetRequest<List<DiseaseInfo>>("$BASE_URL/crop-diseases", type)
            _cropDiseases.value = list
            _cropDiseasesState.value = UiState.Success(list)
        } catch (e: Exception) {
            _cropDiseasesState.value = UiState.Error(e.message ?: "Failed to load crop diseases")
        }
    }

    suspend fun fetchWeatherForecast() {
        _weatherForecastState.value = UiState.Loading
        try {
            val type = object : TypeToken<List<WeatherForecastEntry>>() {}.type
            val list = makeGetRequest<List<WeatherForecastEntry>>("$BASE_URL/weather", type)
            _weatherForecast.value = list
            _weatherForecastState.value = UiState.Success(list)
        } catch (e: Exception) {
            _weatherForecastState.value = UiState.Error(e.message ?: "Failed to load weather forecast")
        }
    }
}
