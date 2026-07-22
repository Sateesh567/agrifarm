package com.satish.agrifarm.ui.auth

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.satish.agrifarm.ui.theme.*
import com.satish.agrifarm.util.StringConstants

import kotlinx.coroutines.launch
import com.satish.agrifarm.data.repository.AgroRepository

// Camera & Layout Imports
import androidx.compose.ui.graphics.asImageBitmap
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.Image
import androidx.compose.foundation.clickable
import androidx.compose.foundation.border
import androidx.compose.foundation.BorderStroke
import com.satish.agrifarm.ui.theme.DividerGray
import androidx.compose.ui.draw.clip

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun OwnerRegisterScreen(
    onRegisterSuccess: () -> Unit,
    onBackToLogin: () -> Unit
) {
    var ownerName by remember { mutableStateOf("") }
    var shopName by remember { mutableStateOf("") }
    var phone by remember { mutableStateOf("") }
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var address by remember { mutableStateOf("") }
    var shopCategory by remember { mutableStateOf("") }
    var shopDescription by remember { mutableStateOf("") }
    var showSuccessDialog by remember { mutableStateOf(false) }
    var isLoading by remember { mutableStateOf(false) }
    var errorMessage by remember { mutableStateOf<String?>(null) }
    val coroutineScope = rememberCoroutineScope()

    // Fix 1: Use MaterialTheme.colorScheme for theme-aware text/border colors
    // This ensures text is readable in both light and dark mode.
    val textFieldColors = OutlinedTextFieldDefaults.colors(
        focusedTextColor = MaterialTheme.colorScheme.onSurface,
        unfocusedTextColor = MaterialTheme.colorScheme.onSurface,
        focusedContainerColor = MaterialTheme.colorScheme.surface,
        unfocusedContainerColor = MaterialTheme.colorScheme.surface,
        cursorColor = GreenPrimary,
        focusedBorderColor = GreenPrimary,
        unfocusedBorderColor = MaterialTheme.colorScheme.outline,
        focusedLabelColor = GreenPrimary,
        unfocusedLabelColor = MaterialTheme.colorScheme.onSurfaceVariant,
        focusedLeadingIconColor = GreenPrimary,
        unfocusedLeadingIconColor = MaterialTheme.colorScheme.onSurfaceVariant,
        focusedTrailingIconColor = GreenPrimary,
        unfocusedTrailingIconColor = MaterialTheme.colorScheme.onSurfaceVariant
    )

    // Camera & Gallery integration state
    val context = androidx.compose.ui.platform.LocalContext.current
    var capturedImageBitmap by remember { mutableStateOf<android.graphics.Bitmap?>(null) }
    val cameraLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.TakePicturePreview()
    ) { bitmap ->
        if (bitmap != null) {
            capturedImageBitmap = bitmap
        }
    }
    val galleryLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.GetContent()
    ) { uri ->
        if (uri != null) {
            try {
                val bitmap = if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.P) {
                    android.graphics.ImageDecoder.decodeBitmap(
                        android.graphics.ImageDecoder.createSource(context.contentResolver, uri)
                    )
                } else {
                    @Suppress("DEPRECATION")
                    android.provider.MediaStore.Images.Media.getBitmap(context.contentResolver, uri)
                }
                capturedImageBitmap = bitmap
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }

    if (showSuccessDialog) {
        AlertDialog(
            onDismissRequest = { },
            title = { Text(StringConstants.MSG_REGISTRATION_SUBMITTED_TITLE) },
            text = { Text(StringConstants.MSG_REGISTRATION_SUBMITTED_BODY) },
            confirmButton = {
                Button(onClick = { 
                    showSuccessDialog = false
                    onRegisterSuccess() 
                }) {
                    Text(StringConstants.BTN_OK)
                }
            }
        )
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(StringConstants.TITLE_OWNER_REGISTER) },
                navigationIcon = {
                    IconButton(onClick = onBackToLogin) {
                        Icon(Icons.Default.ArrowBack, contentDescription = StringConstants.CD_BACK)
                    }
                },
                // Fix 1: Explicit top bar colors for readability
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = GreenPrimary,
                    titleContentColor = Color.White,
                    navigationIconContentColor = Color.White
                )
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .padding(padding)
                .fillMaxSize()
                .padding(24.dp)
                .verticalScroll(rememberScrollState()),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.Center,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Box(
                    modifier = Modifier
                        .size(120.dp)
                        .clip(RoundedCornerShape(12.dp))
                        .border(BorderStroke(1.dp, DividerGray), RoundedCornerShape(12.dp))
                        .background(GreenLight),
                    contentAlignment = Alignment.Center
                ) {
                    if (capturedImageBitmap != null) {
                        Image(
                            bitmap = capturedImageBitmap!!.asImageBitmap(),
                            contentDescription = StringConstants.CD_SHOP_IMAGE,
                            modifier = Modifier.fillMaxSize(),
                            contentScale = androidx.compose.ui.layout.ContentScale.Crop
                        )
                    } else {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Icon(Icons.Default.Image, contentDescription = null, tint = GreenPrimary, modifier = Modifier.size(36.dp))
                            Text("No Photo", fontSize = 11.sp, color = GreenPrimary)
                        }
                    }
                }
                
                Spacer(modifier = Modifier.width(16.dp))
                
                Column(
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Button(
                        onClick = { cameraLauncher.launch(null) },
                        colors = ButtonDefaults.buttonColors(containerColor = GreenPrimary),
                        shape = RoundedCornerShape(8.dp),
                        modifier = Modifier.width(160.dp)
                    ) {
                        Icon(Icons.Default.AddAPhoto, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(StringConstants.BTN_TAKE_PHOTO, fontSize = 12.sp)
                    }
                    
                    OutlinedButton(
                        onClick = { galleryLauncher.launch("image/*") },
                        border = BorderStroke(1.5.dp, GreenPrimary),
                        colors = ButtonDefaults.outlinedButtonColors(contentColor = GreenPrimary),
                        shape = RoundedCornerShape(8.dp),
                        modifier = Modifier.width(160.dp)
                    ) {
                        Icon(Icons.Default.Image, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(StringConstants.BTN_FROM_GALLERY, fontSize = 12.sp)
                    }
                }
            }
            
            Spacer(modifier = Modifier.height(24.dp))

            OutlinedTextField(
                value = ownerName, onValueChange = { ownerName = it },
                label = { Text(StringConstants.LABEL_OWNER_NAME) },
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp),
                colors = textFieldColors
            )
            Spacer(modifier = Modifier.height(16.dp))
            OutlinedTextField(
                value = shopName, onValueChange = { shopName = it },
                label = { Text(StringConstants.LABEL_SHOP_NAME) },
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp),
                colors = textFieldColors
            )
            Spacer(modifier = Modifier.height(16.dp))
            OutlinedTextField(
                value = phone, onValueChange = { phone = it },
                label = { Text(StringConstants.LABEL_PHONE_NUMBER) },
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp),
                colors = textFieldColors
            )
            Spacer(modifier = Modifier.height(16.dp))
            OutlinedTextField(
                value = email, onValueChange = { email = it },
                label = { Text(StringConstants.LABEL_EMAIL_ADDRESS) },
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp),
                colors = textFieldColors
            )
            Spacer(modifier = Modifier.height(16.dp))
            OutlinedTextField(
                value = password, onValueChange = { password = it },
                label = { Text(StringConstants.LABEL_PASSWORD) },
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp),
                visualTransformation = PasswordVisualTransformation(),
                colors = textFieldColors
            )
            Spacer(modifier = Modifier.height(16.dp))
            OutlinedTextField(
                value = address, onValueChange = { address = it },
                label = { Text(StringConstants.LABEL_SHOP_ADDRESS) },
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp),
                minLines = 2,
                colors = textFieldColors
            )
            Spacer(modifier = Modifier.height(16.dp))
            OutlinedTextField(
                value = shopCategory, onValueChange = { shopCategory = it },
                label = { Text(StringConstants.LABEL_SHOP_CATEGORY) },
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp),
                colors = textFieldColors
            )
            Spacer(modifier = Modifier.height(16.dp))
            // Fix 2: Shop Description is now truly optional — label updated to reflect this.
            // Removed shopDescription.isEmpty() from the validation check below.
            OutlinedTextField(
                value = shopDescription, onValueChange = { shopDescription = it },
                label = { Text(StringConstants.LABEL_SHOP_DESCRIPTION) },
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp),
                colors = textFieldColors,
                minLines = 2
            )

            errorMessage?.let {
                Text(text = it, color = MaterialTheme.colorScheme.error, modifier = Modifier.padding(top = 12.dp))
            }

            Spacer(modifier = Modifier.height(24.dp))

            Button(
                onClick = {
                    // Fix 2: shopDescription is NOT validated as required — it is optional.
                    if (ownerName.isEmpty() || shopName.isEmpty() || email.isEmpty() || password.isEmpty() || shopCategory.isEmpty()) {
                        errorMessage = StringConstants.ERR_FILL_REQUIRED_FIELDS
                        return@Button
                    }
                    coroutineScope.launch {
                        isLoading = true
                        errorMessage = null
                        val userResult = AgroRepository.registerUser(ownerName, email, phone, StringConstants.ROLE_SHOP_OWNER, address)
                        if (userResult.isSuccess) {
                            val user = userResult.getOrThrow()
                            val imgUrl = when (shopCategory.lowercase(java.util.Locale.ROOT)) {
                                "seeds" -> "images/seeds_shop.png"
                                "fertilizers", "manure", "manures" -> "images/organic_farm.png"
                                else -> "images/seeds_shop.png"
                            }
                            val imageBase64 = capturedImageBitmap?.let { bitmap ->
                                try {
                                    val maxDim = 1024
                                    val scaledBitmap = if (bitmap.width > maxDim || bitmap.height > maxDim) {
                                        val aspectRatio = bitmap.width.toFloat() / bitmap.height.toFloat()
                                        val newWidth = if (aspectRatio > 1) maxDim else (maxDim * aspectRatio).toInt()
                                        val newHeight = if (aspectRatio > 1) (maxDim / aspectRatio).toInt() else maxDim
                                        android.graphics.Bitmap.createScaledBitmap(bitmap, newWidth, newHeight, true)
                                    } else {
                                        bitmap
                                    }
                                    val outputStream = java.io.ByteArrayOutputStream()
                                    scaledBitmap.compress(android.graphics.Bitmap.CompressFormat.JPEG, 80, outputStream)
                                    val byteArray = outputStream.toByteArray()
                                    android.util.Base64.encodeToString(byteArray, android.util.Base64.NO_WRAP)
                                } catch (e: Exception) {
                                    e.printStackTrace()
                                    null
                                }
                            }
                            val shopResult = AgroRepository.registerShop(
                                name = shopName,
                                category = shopCategory,
                                address = address,
                                description = shopDescription, // optional — may be blank
                                imageUrl = imgUrl,
                                ownerId = user.uid,
                                imageBase64 = imageBase64
                            )
                            isLoading = false
                            if (shopResult.isSuccess) {
                                showSuccessDialog = true
                            } else {
                                errorMessage = StringConstants.ERR_SHOP_SUBMIT_PARTIAL + shopResult.exceptionOrNull()?.message
                            }
                        } else {
                            isLoading = false
                            errorMessage = userResult.exceptionOrNull()?.message ?: StringConstants.ERR_REGISTRATION_FAILED
                        }
                    }
                },
                modifier = Modifier.fillMaxWidth().height(56.dp),
                shape = RoundedCornerShape(12.dp),
                colors = ButtonDefaults.buttonColors(containerColor = GreenPrimary),
                enabled = !isLoading
            ) {
                if (isLoading) {
                    CircularProgressIndicator(color = Color.White, modifier = Modifier.size(24.dp))
                } else {
                    Text(StringConstants.BTN_SUBMIT_FOR_APPROVAL, fontSize = 18.sp, fontWeight = FontWeight.Bold)
                }
            }
        }
    }
}

@Preview(showBackground = true)
@Composable
fun OwnerRegisterScreenPreview() {
    AgrifarmTheme {
        OwnerRegisterScreen(onRegisterSuccess = {}, onBackToLogin = {})
    }
}
