package com.satish.agrifarm.ui.farmer.profile

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
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.satish.agrifarm.ui.components.FAQAccordion
import com.satish.agrifarm.ui.components.FarmerBottomBar
import com.satish.agrifarm.ui.navigation.Screen
import com.satish.agrifarm.ui.theme.*
import com.satish.agrifarm.util.StringConstants

// Camera and Repository Imports
import androidx.compose.ui.graphics.asImageBitmap
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import android.graphics.Bitmap
import androidx.compose.foundation.Image
import android.widget.Toast
import androidx.compose.ui.platform.LocalContext
import kotlinx.coroutines.launch
import com.satish.agrifarm.data.repository.AgroRepository

// ==========================================
// 1. Farmer Profile Screen
// ==========================================
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun FarmerProfileScreen(
    onNavigate: (String) -> Unit
) {
    val currentUser = AgroRepository.currentUser
    val initials = currentUser?.name?.split(" ")?.mapNotNull { it.firstOrNull() }?.joinToString("")?.take(2)?.uppercase() ?: "BF"
    
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Farmer Profile Screen", fontWeight = FontWeight.Bold, color = Color.White) },
                navigationIcon = {
                    IconButton(onClick = { onNavigate(Screen.FarmerHome.route) }) {
                        Icon(Icons.Default.Menu, contentDescription = "Menu", tint = Color.White)
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
            FarmerBottomBar(currentRoute = Screen.Profile.route, onNavigate = onNavigate)
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
            // Profile Card
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(20.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                border = BorderStroke(1.dp, DividerGray)
            ) {
                Row(modifier = Modifier.padding(16.dp), verticalAlignment = Alignment.CenterVertically) {
                    Box(
                        modifier = Modifier
                            .size(54.dp)
                            .clip(CircleShape)
                            .background(GreenLight),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(initials, fontWeight = FontWeight.Bold, fontSize = 20.sp, color = GreenPrimary)
                    }
                    Spacer(modifier = Modifier.width(16.dp))
                    Column {
                        Text(currentUser?.name ?: "Bhoomiputra Farmer", fontWeight = FontWeight.Bold, fontSize = 16.sp, color = TextDark)
                        Text(
                            text = "${currentUser?.address ?: "Salem, Tamil Nadu, IN"} • Member",
                            fontSize = 11.sp,
                            color = TextMuted
                        )
                    }
                }
            }

            // Switch to Seller Toggle Card
            if (currentUser?.isUser == true && currentUser?.isSeller == true) {
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable { onNavigate(Screen.ShopDashboard.route) },
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = GreenDark)
                ) {
                    Row(
                        modifier = Modifier.padding(16.dp).fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.Default.SwapHoriz, contentDescription = null, tint = Color.White)
                            Spacer(modifier = Modifier.width(12.dp))
                            Column {
                                Text("Switch to Seller", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                                Text("Start selling your crops directly.", color = Color.White.copy(alpha = 0.8f), fontSize = 11.sp)
                            }
                        }
                        Icon(Icons.Default.ChevronRight, contentDescription = null, tint = Color.White)
                    }
                }
            }

            // ACCOUNT SETTINGS list
            Text(text = "ACCOUNT SETTINGS", fontWeight = FontWeight.Bold, fontSize = 11.sp, color = TextMuted)

            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                border = BorderStroke(1.dp, DividerGray)
            ) {
                Column(modifier = Modifier.padding(8.dp)) {
                    ProfileMenuRow("Edit Profile", Icons.Default.Edit) { onNavigate(Screen.EditProfile.route) }
                    ProfileMenuRow("My Orders", Icons.Default.ReceiptLong) { onNavigate(Screen.OrderHistory.route) }
                    ProfileMenuRow("Wishlist", Icons.Default.Favorite) { onNavigate(Screen.ReferralRewards.route) } // Nav mock
                    ProfileMenuRow("Saved Addresses", Icons.Default.LocationOn) { onNavigate(Screen.AddressManagement.route) }
                    ProfileMenuRow("Language", Icons.Default.Language) {}
                }
            }

            // HELP & SUPPORT
            Text(text = "HELP & SUPPORT", fontWeight = FontWeight.Bold, fontSize = 11.sp, color = TextMuted)

            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                border = BorderStroke(1.dp, DividerGray)
            ) {
                Column(modifier = Modifier.padding(8.dp)) {
                    ProfileMenuRow("Support", Icons.Default.SupportAgent) { onNavigate(Screen.CustomerSupport.route) }
                    ProfileMenuRow("Settings", Icons.Default.Settings) { onNavigate(Screen.SettingsScreen.route) }
                    ProfileMenuRow("Logout", Icons.Default.Logout) { onNavigate(Screen.SettingsScreen.route) }
                }
            }
        }
    }
}

@Composable
fun ProfileMenuRow(label: String, icon: androidx.compose.ui.graphics.vector.ImageVector, onClick: () -> Unit) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onClick() }
            .padding(12.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Icon(imageVector = icon, contentDescription = null, tint = GreenPrimary, modifier = Modifier.size(20.dp))
            Spacer(modifier = Modifier.width(16.dp))
            Text(text = label, fontWeight = FontWeight.Bold, fontSize = 13.sp, color = TextDark)
        }
        Icon(Icons.Default.ChevronRight, contentDescription = null, tint = TextMuted, modifier = Modifier.size(16.dp))
    }
}

// ==========================================
// 2. Edit Profile Screen
// ==========================================
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun EditProfileScreen(
    onBackClick: () -> Unit
) {
    val currentUser = AgroRepository.currentUser
    var name by remember { mutableStateOf(currentUser?.name ?: "Bhoomiputra Farmer") }
    var email by remember { mutableStateOf(currentUser?.email ?: "farmer.bhoomi@agrifarm.in") }
    var phone by remember { mutableStateOf(currentUser?.phone ?: "+91 98765 43210") }
    var address by remember { mutableStateOf(currentUser?.address ?: "Salem, Tamil Nadu") }
    var landArea by remember { mutableStateOf("5") }
    var crops by remember { mutableStateOf("Rice, Sugarcane, Turmeric") }
    
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
    val context = LocalContext.current

    // Camera integration state
    var capturedImageBitmap by remember { mutableStateOf<android.graphics.Bitmap?>(null) }
    val cameraLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.TakePicturePreview()
    ) { bitmap ->
        if (bitmap != null) {
            capturedImageBitmap = bitmap
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Edit Profile Screen", fontWeight = FontWeight.Bold, color = Color.White) },
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
            // Profile image editor circle
            Box(modifier = Modifier.fillMaxWidth(), contentAlignment = Alignment.Center) {
                Box(modifier = Modifier.size(90.dp).clickable { cameraLauncher.launch(null) }) {
                    Box(
                        modifier = Modifier
                            .fillMaxSize()
                            .clip(CircleShape)
                            .background(GreenLight),
                        contentAlignment = Alignment.Center
                    ) {
                        if (capturedImageBitmap != null) {
                            Image(
                                bitmap = capturedImageBitmap!!.asImageBitmap(),
                                contentDescription = "Profile Picture",
                                modifier = Modifier.fillMaxSize().clip(CircleShape),
                                contentScale = androidx.compose.ui.layout.ContentScale.Crop
                            )
                        } else {
                            val initials = name.split(" ").mapNotNull { it.firstOrNull() }.joinToString("").take(2).uppercase()
                            Text(initials, fontWeight = FontWeight.Bold, fontSize = 24.sp, color = GreenPrimary)
                        }
                    }

                    Box(
                        modifier = Modifier
                            .size(28.dp)
                            .clip(CircleShape)
                            .background(GreenPrimary)
                            .align(Alignment.BottomEnd)
                            .border(2.dp, Color.White, CircleShape),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(Icons.Default.Edit, contentDescription = null, tint = Color.White, modifier = Modifier.size(14.dp))
                    }
                }
            }

            Text("Personal Information", fontWeight = FontWeight.Bold, fontSize = 14.sp, color = TextDark)

            if (errorMessage != null) {
                Text(text = errorMessage!!, color = Color.Red, fontSize = 13.sp, fontWeight = FontWeight.Bold)
            }

            OutlinedTextField(
                value = name,
                onValueChange = { name = it },
                label = { Text("Full Name") },
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(10.dp),
                colors = textFieldColors
            )

            OutlinedTextField(
                value = email,
                onValueChange = { email = it },
                label = { Text("Email") },
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(10.dp),
                colors = textFieldColors
            )

            OutlinedTextField(
                value = phone,
                onValueChange = { phone = it },
                label = { Text("Phone Number") },
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(10.dp),
                colors = textFieldColors
            )

            OutlinedTextField(
                value = address,
                onValueChange = { address = it },
                label = { Text("Address") },
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(10.dp),
                colors = textFieldColors
            )

            Text("Farm Details", fontWeight = FontWeight.Bold, fontSize = 14.sp, color = TextDark)

            OutlinedTextField(
                value = landArea,
                onValueChange = { landArea = it },
                label = { Text("Total Land Area (Acres)") },
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(10.dp),
                colors = textFieldColors
            )

            OutlinedTextField(
                value = crops,
                onValueChange = { crops = it },
                label = { Text("Major Crops") },
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(10.dp),
                colors = textFieldColors
            )

            Spacer(modifier = Modifier.height(10.dp))

            Button(
                onClick = {
                    if (name.isEmpty() || email.isEmpty()) {
                        errorMessage = "Name and Email are required"
                        return@Button
                    }
                    coroutineScope.launch {
                        isLoading = true
                        errorMessage = null
                        val result = AgroRepository.updateUserProfile(
                            name = name,
                            email = email,
                            phone = phone,
                            address = address,
                            profileImage = ""
                        )
                        isLoading = false
                        if (result.isSuccess) {
                            Toast.makeText(context, "Profile updated successfully!", Toast.LENGTH_SHORT).show()
                            onBackClick()
                        } else {
                            errorMessage = result.exceptionOrNull()?.message ?: "Failed to update profile"
                        }
                    }
                },
                colors = ButtonDefaults.buttonColors(containerColor = GreenPrimary),
                shape = RoundedCornerShape(10.dp),
                modifier = Modifier.fillMaxWidth().height(50.dp),
                enabled = !isLoading
            ) {
                if (isLoading) {
                    CircularProgressIndicator(color = Color.White, modifier = Modifier.size(24.dp))
                } else {
                    Text("Save Changes", fontWeight = FontWeight.Bold, color = Color.White)
                }
            }
        }
    }
}

// ==========================================
// 3. Settings Screen
// ==========================================
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SettingsScreen(
    onBackClick: () -> Unit,
    onLogoutClick: () -> Unit,
    onEditProfileClick: () -> Unit
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
    var darkModeEnabled by remember {
        mutableStateOf(prefs.getBoolean(StringConstants.PREF_DARK_MODE_ENABLED, false))
    }

    // Fix 4: Change Password dialog state
    var showChangePasswordDialog by remember { mutableStateOf(false) }
    var currentPassword by remember { mutableStateOf("") }
    var newPassword by remember { mutableStateOf("") }
    var confirmNewPassword by remember { mutableStateOf("") }
    var passwordError by remember { mutableStateOf<String?>(null) }
    var isChangingPassword by remember { mutableStateOf(false) }

    val currentUser = AgroRepository.currentUser
    val initials = currentUser?.name?.split(" ")?.mapNotNull { it.firstOrNull() }?.joinToString("")?.take(2)?.uppercase() ?: "BF"

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
                                        currentPassword = ""; newPassword = ""; confirmNewPassword = ""
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
                    currentPassword = ""; newPassword = ""; confirmNewPassword = ""; passwordError = null
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
            // Profile details card row
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                border = BorderStroke(1.dp, DividerGray)
            ) {
                Row(modifier = Modifier.padding(16.dp), verticalAlignment = Alignment.CenterVertically) {
                    Box(
                        modifier = Modifier
                            .size(44.dp)
                            .clip(CircleShape)
                            .background(GreenLight),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(initials, fontWeight = FontWeight.Bold, color = GreenPrimary)
                    }
                    Spacer(modifier = Modifier.width(12.dp))
                    Column(modifier = Modifier.weight(1f)) {
                        Text(currentUser?.name ?: "Bhoomiputra Farmer", fontWeight = FontWeight.Bold, fontSize = 14.sp)
                        Text(
                            text = currentUser?.address ?: "Tamil Nadu, IN",
                            fontSize = 11.sp,
                            color = TextMuted
                        )
                    }
                    Text(
                        text = "Edit",
                        color = GreenPrimary,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.clickable { onEditProfileClick() }
                    )
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
                    SettingToggleRow(
                        StringConstants.SETTINGS_PREF_NOTIFICATIONS,
                        StringConstants.SETTINGS_PREF_NOTIFICATIONS_DESC,
                        notificationsEnabled
                    ) { newVal ->
                        notificationsEnabled = newVal
                        prefs.edit().putBoolean(StringConstants.PREF_NOTIFICATIONS_ENABLED, newVal).apply()
                    }
                    Divider(color = DividerGray, modifier = Modifier.padding(vertical = 8.dp))
                    SettingToggleRow(
                        StringConstants.SETTINGS_PREF_BIOMETRIC,
                        StringConstants.SETTINGS_PREF_BIOMETRIC_DESC,
                        biometricEnabled
                    ) { newVal ->
                        biometricEnabled = newVal
                        prefs.edit().putBoolean(StringConstants.PREF_BIOMETRIC_ENABLED, newVal).apply()
                    }
                    Divider(color = DividerGray, modifier = Modifier.padding(vertical = 8.dp))
                    SettingToggleRow(
                        StringConstants.SETTINGS_PREF_DARK_MODE,
                        StringConstants.SETTINGS_PREF_DARK_MODE_DESC,
                        darkModeEnabled
                    ) { newVal ->
                        darkModeEnabled = newVal
                        prefs.edit().putBoolean(StringConstants.PREF_DARK_MODE_ENABLED, newVal).apply()
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
                    // Fix 4: Account Security now opens the Change Password dialog
                    ProfileMenuRow(StringConstants.SETTINGS_MENU_ACCOUNT_SECURITY, Icons.Default.Security) {
                        showChangePasswordDialog = true
                    }
                    ProfileMenuRow(StringConstants.SETTINGS_MENU_PRIVACY_POLICY, Icons.Default.PrivacyTip) {}
                    ProfileMenuRow(StringConstants.SETTINGS_MENU_SUPPORT, Icons.Default.Help) {}
                    ProfileMenuRow(StringConstants.SETTINGS_MENU_ABOUT, Icons.Default.Info) {}
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

@Composable
fun SettingToggleRow(
    label: String,
    desc: String,
    checked: Boolean,
    onCheckedChange: (Boolean) -> Unit
) {
    Row(
        modifier = Modifier.fillMaxWidth().padding(4.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Column(modifier = Modifier.weight(1f)) {
            Text(text = label, fontWeight = FontWeight.Bold, fontSize = 13.sp)
            Text(text = desc, fontSize = 11.sp, color = TextMuted)
        }
        Switch(
            checked = checked,
            onCheckedChange = onCheckedChange,
            colors = SwitchDefaults.colors(checkedThumbColor = Color.White, checkedTrackColor = GreenPrimary)
        )
    }
}

// ==========================================
// 4. Customer Support Screen
// ==========================================
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CustomerSupportScreen(
    onBackClick: () -> Unit,
    onChatClick: () -> Unit
) {
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Customer Support Screen", fontWeight = FontWeight.Bold, color = Color.White) },
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
            // Help Banner
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(20.dp),
                colors = CardDefaults.cardColors(containerColor = GreenPrimary)
            ) {
                Column(modifier = Modifier.padding(20.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                    Text("How can we help you?", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 18.sp)
                    Text(
                        text = "Our support team is here to assist our Bhoomiputra farmers 24/7.",
                        color = Color.White.copy(alpha = 0.8f),
                        fontSize = 12.sp,
                        lineHeight = 16.sp
                    )
                }
            }

            // Quick Call/Chat
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                Card(
                    modifier = Modifier.weight(1f).clickable { onChatClick() },
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    border = BorderStroke(1.dp, DividerGray)
                ) {
                    Column(
                        modifier = Modifier.padding(16.dp).fillMaxWidth(),
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        Icon(Icons.Default.Chat, contentDescription = null, tint = GreenPrimary, modifier = Modifier.size(28.dp))
                        Text("Chat with Us", fontWeight = FontWeight.Bold, fontSize = 13.sp)
                        Text("Instant Support", fontSize = 11.sp, color = TextMuted)
                    }
                }

                Card(
                    modifier = Modifier.weight(1f).clickable {},
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    border = BorderStroke(1.dp, DividerGray)
                ) {
                    Column(
                        modifier = Modifier.padding(16.dp).fillMaxWidth(),
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        Icon(Icons.Default.Call, contentDescription = null, tint = GreenPrimary, modifier = Modifier.size(28.dp))
                        Text("Call Support", fontWeight = FontWeight.Bold, fontSize = 13.sp)
                        Text("Direct Assistance", fontSize = 11.sp, color = TextMuted)
                    }
                }
            }

            // Track ticket
            Text(text = "Track a Ticket", fontWeight = FontWeight.Bold, fontSize = 14.sp, color = TextDark)

            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                border = BorderStroke(1.dp, DividerGray)
            ) {
                Row(
                    modifier = Modifier.padding(16.dp).fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(
                            modifier = Modifier
                                .size(36.dp)
                                .clip(CircleShape)
                                .background(TintWeedKillers),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(Icons.Default.ConfirmationNumber, contentDescription = null, tint = OrangeAccent, modifier = Modifier.size(18.dp))
                        }
                        Spacer(modifier = Modifier.width(12.dp))
                        Column {
                            Text("Seed Quality Query", fontWeight = FontWeight.Bold, fontSize = 13.sp)
                            Text("ID: 7750-49210 • In Progress", fontSize = 11.sp, color = TextMuted)
                        }
                    }

                    Icon(Icons.Default.ChevronRight, contentDescription = null, tint = TextMuted)
                }
            }

            // FAQ accordion
            Text(text = "Common Help Topics", fontWeight = FontWeight.Bold, fontSize = 14.sp, color = TextDark)

            Column {
                FAQAccordion(title = "Delivery & Shipping Updates", content = "We ship farm supplies across Tamil Nadu within 2-4 business days. Standard delivery is free for orders above ₹999.")
                FAQAccordion(title = "Payment & Refund Process", content = "We support GPay, PhonePe, Cards, Net Banking, and Cash on Delivery. Refunds are processed within 24 hours of cancellation.")
                FAQAccordion(title = "Product Quality Guarantee", content = "All products on AgriFarm are verified for quality by our agronomists. We offer an easy return within 7 days if the seal is intact.")
            }
        }
    }
}

// ==========================================
// 5. Chat with Seller Screen
// ==========================================
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ChatWithSellerScreen(
    onBackClick: () -> Unit,
    onNavigate: (String) -> Unit
) {
    var chatText by remember { mutableStateOf("") }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(
                            modifier = Modifier
                                .size(36.dp)
                                .clip(CircleShape)
                                .background(GreenLight),
                            contentAlignment = Alignment.Center
                        ) {
                            Text("AS", fontWeight = FontWeight.Bold, color = GreenPrimary)
                        }
                        Spacer(modifier = Modifier.width(10.dp))
                        Column {
                            Text("AgriFarm Seller", fontSize = 14.sp, fontWeight = FontWeight.Bold)
                            Text("Online • Typically replies in 5m", fontSize = 10.sp, color = GreenDark)
                        }
                    }
                },
                navigationIcon = {
                    IconButton(onClick = onBackClick) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                },
                actions = {
                    IconButton(onClick = {}) {
                        Icon(Icons.Default.Call, contentDescription = "Call")
                    }
                    IconButton(onClick = {}) {
                        Icon(Icons.Default.MoreVert, contentDescription = "Menu")
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = Color.White)
            )
        },
        bottomBar = {
            // Text input bar
            Surface(
                tonalElevation = 8.dp,
                color = Color.White
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(12.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    IconButton(onClick = {}) {
                        Icon(Icons.Default.AttachFile, contentDescription = "Attach", tint = GreenPrimary)
                    }

                    OutlinedTextField(
                        value = chatText,
                        onValueChange = { chatText = it },
                        placeholder = { Text("Type a message...", fontSize = 13.sp) },
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(20.dp),
                        singleLine = true,
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = GreenPrimary,
                            focusedContainerColor = BackgroundWhite,
                            unfocusedContainerColor = BackgroundWhite
                        )
                    )

                    IconButton(
                        onClick = { chatText = "" },
                        modifier = Modifier
                            .clip(CircleShape)
                            .background(GreenPrimary)
                    ) {
                        Icon(Icons.Default.Send, contentDescription = "Send", tint = Color.White, modifier = Modifier.size(18.dp))
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
            Text(
                text = "Today",
                fontSize = 11.sp,
                color = TextMuted,
                textAlign = TextAlign.Center,
                modifier = Modifier.fillMaxWidth()
            )

            // Message 1 (Seller)
            Column(modifier = Modifier.fillMaxWidth(), horizontalAlignment = Alignment.Start) {
                Card(
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    border = BorderStroke(1.dp, DividerGray),
                    modifier = Modifier.widthIn(max = 280.dp)
                ) {
                    Column(modifier = Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        Text(
                            text = "Namaste! We have the organic NPK booster you inquired about. Here is the product profile.",
                            fontSize = 13.sp,
                            color = TextDark
                        )
                        
                        // Product Profile sub card
                        Card(
                            shape = RoundedCornerShape(10.dp),
                            colors = CardDefaults.cardColors(containerColor = TintFertilizers),
                            modifier = Modifier.clickable { onNavigate(Screen.FertilizersCategory.route) }
                        ) {
                            Row(modifier = Modifier.padding(8.dp), verticalAlignment = Alignment.CenterVertically) {
                                Box(
                                    modifier = Modifier
                                        .size(36.dp)
                                        .clip(RoundedCornerShape(6.dp))
                                        .background(Color.White),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Icon(Icons.Default.Eco, contentDescription = null, tint = GreenPrimary)
                                }
                                Spacer(modifier = Modifier.width(8.dp))
                                Column(modifier = Modifier.weight(1f)) {
                                    Text("Organic NPK 10-10-10", fontWeight = FontWeight.Bold, fontSize = 11.sp)
                                    Text("₹850.00 / bag", fontSize = 9.sp, color = TextMuted)
                                }
                                Box(
                                    modifier = Modifier
                                        .clip(RoundedCornerShape(6.dp))
                                        .background(GreenPrimary)
                                        .padding(horizontal = 6.dp, vertical = 2.dp)
                                ) {
                                    Text("View", color = Color.White, fontSize = 8.sp, fontWeight = FontWeight.Bold)
                                }
                            }
                        }
                    }
                }
            }

            // Message 2 (User)
            Column(modifier = Modifier.fillMaxWidth(), horizontalAlignment = Alignment.End) {
                Card(
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = GreenPrimary),
                    modifier = Modifier.widthIn(max = 280.dp)
                ) {
                    Text(
                        text = "Thanks! Is this suitable for paddy cultivation in the delta region?",
                        modifier = Modifier.padding(12.dp),
                        fontSize = 13.sp,
                        color = Color.White
                    )
                }
            }

            // Message 3 (Seller)
            Column(modifier = Modifier.fillMaxWidth(), horizontalAlignment = Alignment.Start) {
                Card(
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    border = BorderStroke(1.dp, DividerGray),
                    modifier = Modifier.widthIn(max = 280.dp)
                ) {
                    Text(
                        text = "Absolutely. Many farmers in Erode and Thanjavur have reported great results with paddy tillering using this booster.",
                        modifier = Modifier.padding(12.dp),
                        fontSize = 13.sp,
                        color = TextDark
                    )
                }
            }

            // Quick reply chips
            Spacer(modifier = Modifier.weight(1f))
            
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(8.dp))
                        .background(GreenLight)
                        .clickable { chatText = "Is it in stock?" }
                        .padding(horizontal = 10.dp, vertical = 6.dp)
                ) {
                    Text("Is in stock?", color = GreenDark, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                }

                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(8.dp))
                        .background(GreenLight)
                        .clickable { chatText = "When can you deliver?" }
                        .padding(horizontal = 10.dp, vertical = 6.dp)
                ) {
                    Text("When can you deliver?", color = GreenDark, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                }
            }
        }
    }
}
