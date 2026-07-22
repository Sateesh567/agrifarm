package com.satish.agrifarm.ui.farmer.search

import android.widget.Toast
import androidx.compose.animation.*
import androidx.compose.animation.core.*
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.satish.agrifarm.ui.theme.*
import kotlinx.coroutines.delay

// Camera and Image Handling Imports
import androidx.compose.ui.graphics.asImageBitmap
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.Image

import com.satish.agrifarm.data.model.DiseaseInfo
import com.satish.agrifarm.data.model.UiState
import com.satish.agrifarm.data.repository.AgroRepository

enum class ScannerState {
    IDLE,
    SCANNING,
    DIAGNOSED
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CropScannerScreen(
    onBackClick: () -> Unit,
    onProductClick: (String) -> Unit
) {
    val context = LocalContext.current
    var scannerState by remember { mutableStateOf(ScannerState.IDLE) }
    var selectedCrop by remember { mutableStateOf("Rice") }
    var analysisText by remember { mutableStateOf("Ready to scan") }
    
    // Camera integration state
    var capturedImageBitmap by remember { mutableStateOf<android.graphics.Bitmap?>(null) }
    val cameraLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.TakePicturePreview()
    ) { bitmap ->
        if (bitmap != null) {
            capturedImageBitmap = bitmap
            scannerState = ScannerState.SCANNING
        }
    }
    
    val crops = listOf("Rice", "Tomato", "Chilli", "Cotton", "Sugarcane")
    val cropDiseasesState by AgroRepository.cropDiseasesState.collectAsState()

    LaunchedEffect(Unit) {
        AgroRepository.fetchCropDiseases()
    }

    val diseases = when (val state = cropDiseasesState) {
        is UiState.Success -> state.data
        else -> emptyList()
    }

    val selectedDisease = diseases.firstOrNull { it.crop.equals(selectedCrop, ignoreCase = true) } ?: DiseaseInfo(
        crop = selectedCrop,
        name = "No pathogen detected",
        scientificName = "Healthy specimen",
        confidence = 98,
        severity = "LOW",
        description = "This crop shows normal physiology with no diagnostic signs of active disease.",
        symptoms = listOf("Uniform green pigmentation", "Intact cellular boundaries"),
        solutions = listOf("Maintain current fertilizer schedule", "Provide moderate irrigation regularly"),
        recommendedProductName = "BioNeem Pesticide",
        recommendedProductPrice = "₹299",
        recommendedProductCategory = "Pesticides"
    )

    // Simulate scanning task
    LaunchedEffect(scannerState) {
        if (scannerState == ScannerState.SCANNING) {
            val stages = listOf(
                "Initializing camera sensors...",
                "Scanning leaf texture...",
                "Analyzing spot patterns...",
                "Matching with database...",
                "Finalizing report..."
            )
            for (stage in stages) {
                analysisText = stage
                delay(700)
            }
            scannerState = ScannerState.DIAGNOSED
        }
    }

    // Infinite transition for laser animation
    val infiniteTransition = rememberInfiniteTransition(label = "laser")
    val laserOffset by infiniteTransition.animateFloat(
        initialValue = 0f,
        targetValue = 1f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = 2000, easing = LinearEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "laserOffset"
    )

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("AI Crop Doctor", fontWeight = FontWeight.Bold, color = Color.White) },
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
        ) {
            if (scannerState != ScannerState.DIAGNOSED) {
                // Viewfinder / Camera Simulation area
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .weight(1.3f)
                        .background(Color.Black)
                ) {
                    if (capturedImageBitmap != null) {
                        Image(
                            bitmap = capturedImageBitmap!!.asImageBitmap(),
                            contentDescription = "Captured Crop Leaf",
                            modifier = Modifier.fillMaxSize(),
                            contentScale = androidx.compose.ui.layout.ContentScale.Crop
                        )
                    } else {
                        // Simulated Viewfinder Crop Backdrop
                        Box(
                            modifier = Modifier
                                .fillMaxSize()
                                .background(
                                    Brush.radialGradient(
                                        colors = listOf(
                                            Color(0xFF2E7D32).copy(alpha = 0.5f),
                                            Color(0xFF004D40)
                                        )
                                    )
                                ),
                            contentAlignment = Alignment.Center
                        ) {
                            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                Icon(
                                    imageVector = Icons.Default.Grass,
                                    contentDescription = null,
                                    tint = Color.White.copy(alpha = 0.15f),
                                    modifier = Modifier.size(120.dp)
                                )
                                Spacer(modifier = Modifier.height(8.dp))
                                Text(
                                    text = "Position Leaf Inside Frame",
                                    color = Color.White.copy(alpha = 0.6f),
                                    fontSize = 14.sp
                                )
                            }
                        }
                    }

                    // Targeting Brackets Frame
                    Box(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(40.dp)
                            .border(2.dp, Color.White.copy(alpha = 0.3f), RoundedCornerShape(24.dp))
                    ) {
                        // Corner brackets highlight
                        Box(
                            modifier = Modifier
                                .align(Alignment.TopStart)
                                .size(24.dp)
                                .border(
                                    BorderStroke(4.dp, GreenLight),
                                    shape = RoundedCornerShape(topStart = 12.dp)
                                )
                        )
                        Box(
                            modifier = Modifier
                                .align(Alignment.TopEnd)
                                .size(24.dp)
                                .border(
                                    BorderStroke(4.dp, GreenLight),
                                    shape = RoundedCornerShape(topEnd = 12.dp)
                                )
                        )
                        Box(
                            modifier = Modifier
                                .align(Alignment.BottomStart)
                                .size(24.dp)
                                .border(
                                    BorderStroke(4.dp, GreenLight),
                                    shape = RoundedCornerShape(bottomStart = 12.dp)
                                )
                        )
                        Box(
                            modifier = Modifier
                                .align(Alignment.BottomEnd)
                                .size(24.dp)
                                .border(
                                    BorderStroke(4.dp, GreenLight),
                                    shape = RoundedCornerShape(bottomEnd = 12.dp)
                                )
                        )
                    }

                    // Scanning Laser Line Overlay
                    if (scannerState == ScannerState.SCANNING) {
                        Canvas(modifier = Modifier.fillMaxSize()) {
                            val laserY = size.height * laserOffset
                            drawLine(
                                color = GreenLight,
                                start = androidx.compose.ui.geometry.Offset(0f, laserY),
                                end = androidx.compose.ui.geometry.Offset(size.width, laserY),
                                strokeWidth = 8f
                            )
                        }
                        
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(60.dp)
                                .align(Alignment.BottomCenter)
                                .background(Color.Black.copy(alpha = 0.7f)),
                            contentAlignment = Alignment.Center
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(10.dp)
                            ) {
                                CircularProgressIndicator(color = GreenLight, modifier = Modifier.size(20.dp), strokeWidth = 2.dp)
                                Text(
                                    text = analysisText,
                                    color = Color.White,
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 13.sp
                                )
                            }
                        }
                    }
                }

                // Control and Settings panel below viewfinder
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .weight(1f)
                        .padding(16.dp),
                    shape = RoundedCornerShape(20.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    border = BorderStroke(1.dp, DividerGray)
                ) {
                    Column(
                        modifier = Modifier.padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(16.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text(
                            text = "AI Leaf Disease Diagnostic",
                            fontWeight = FontWeight.Bold,
                            fontSize = 16.sp,
                            color = TextDark
                        )
                        
                        Text(
                            text = "Select your target crop below to improve scanning accuracy.",
                            fontSize = 12.sp,
                            color = TextMuted,
                            textAlign = TextAlign.Center
                        )

                        // Scrollable Crop Selector
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(8.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            crops.forEach { crop ->
                                val active = selectedCrop == crop
                                Box(
                                    modifier = Modifier
                                        .clip(RoundedCornerShape(10.dp))
                                        .background(if (active) GreenPrimary else GreenLight)
                                        .clickable(enabled = scannerState == ScannerState.IDLE) {
                                            selectedCrop = crop
                                        }
                                        .padding(horizontal = 14.dp, vertical = 8.dp)
                                ) {
                                    Text(
                                        text = crop,
                                        fontWeight = FontWeight.Bold,
                                        color = if (active) Color.White else GreenDark,
                                        fontSize = 12.sp
                                    )
                                }
                            }
                        }

                        Spacer(modifier = Modifier.weight(1f))

                        Button(
                            onClick = { cameraLauncher.launch(null) },
                            enabled = scannerState == ScannerState.IDLE,
                            colors = ButtonDefaults.buttonColors(containerColor = GreenPrimary),
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(52.dp),
                            shape = RoundedCornerShape(12.dp)
                        ) {
                            Icon(Icons.Default.Camera, contentDescription = null)
                            Spacer(modifier = Modifier.width(8.dp))
                            Text("Scan Leaf Now", fontWeight = FontWeight.Bold, fontSize = 16.sp)
                        }
                    }
                }
            } else {
                // Diagnostics result report layout
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .verticalScroll(rememberScrollState())
                        .padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    // Confirmed Result Header
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(20.dp),
                        colors = CardDefaults.cardColors(containerColor = Color.White),
                        border = BorderStroke(1.dp, DividerGray)
                    ) {
                        Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Box(
                                    modifier = Modifier
                                        .clip(RoundedCornerShape(8.dp))
                                        .background(if (selectedDisease.severity == "HIGH" || selectedDisease.severity == "CRITICAL") TintPesticides else TintWeedKillers)
                                        .padding(horizontal = 8.dp, vertical = 4.dp)
                                ) {
                                    Text(
                                        text = "${selectedDisease.severity} SEVERITY",
                                        color = if (selectedDisease.severity == "HIGH" || selectedDisease.severity == "CRITICAL") RedAccent else OrangeAccent,
                                        fontWeight = FontWeight.Bold,
                                        fontSize = 9.sp
                                    )
                                }

                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Icon(Icons.Default.Verified, contentDescription = null, tint = GreenPrimary, modifier = Modifier.size(16.dp))
                                    Spacer(modifier = Modifier.width(4.dp))
                                    Text(
                                        text = "${selectedDisease.confidence}% Match",
                                        fontWeight = FontWeight.Bold,
                                        color = GreenPrimary,
                                        fontSize = 12.sp
                                    )
                                }
                            }

                            Text(
                                text = selectedDisease.name,
                                fontWeight = FontWeight.Bold,
                                fontSize = 20.sp,
                                color = TextDark
                            )

                            Text(
                                text = selectedDisease.scientificName,
                                fontSize = 12.sp,
                                color = TextMuted,
                                fontWeight = FontWeight.Medium
                            )

                            Divider(color = DividerGray, modifier = Modifier.padding(vertical = 4.dp))

                            Text(
                                text = selectedDisease.description,
                                fontSize = 13.sp,
                                color = TextDark,
                                lineHeight = 18.sp
                            )
                        }
                    }

                    // Symptoms checklist
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(16.dp),
                        colors = CardDefaults.cardColors(containerColor = Color.White),
                        border = BorderStroke(1.dp, DividerGray)
                    ) {
                        Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                            Text("Observed Symptoms", fontWeight = FontWeight.Bold, fontSize = 14.sp, color = TextDark)
                            selectedDisease.symptoms.forEach { symptom ->
                                Row(verticalAlignment = Alignment.Top) {
                                    Icon(
                                        imageVector = Icons.Default.Info,
                                        contentDescription = null,
                                        tint = OrangeAccent,
                                        modifier = Modifier.size(16.dp).padding(top = 2.dp)
                                    )
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Text(text = symptom, fontSize = 13.sp, color = TextDark, lineHeight = 16.sp)
                                }
                            }
                        }
                    }

                    // Recommended Action list
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(16.dp),
                        colors = CardDefaults.cardColors(containerColor = Color.White),
                        border = BorderStroke(1.dp, DividerGray)
                    ) {
                        Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                            Text("Remedial Actions", fontWeight = FontWeight.Bold, fontSize = 14.sp, color = TextDark)
                            selectedDisease.solutions.forEach { solution ->
                                Row(verticalAlignment = Alignment.Top) {
                                    Icon(
                                        imageVector = Icons.Default.CheckCircle,
                                        contentDescription = null,
                                        tint = GreenPrimary,
                                        modifier = Modifier.size(16.dp).padding(top = 2.dp)
                                    )
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Text(text = solution, fontSize = 13.sp, color = TextDark, lineHeight = 16.sp)
                                }
                            }
                        }
                    }

                    // Product recommendations card
                    Text("Recommended Treatment Product", fontWeight = FontWeight.Bold, fontSize = 14.sp, color = TextDark)

                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(16.dp),
                        colors = CardDefaults.cardColors(containerColor = Color.White),
                        border = BorderStroke(1.dp, DividerGray)
                    ) {
                        Row(modifier = Modifier.padding(12.dp), verticalAlignment = Alignment.CenterVertically) {
                            Box(
                                modifier = Modifier
                                    .size(60.dp)
                                    .clip(RoundedCornerShape(8.dp))
                                    .background(GreenLight),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(
                                    imageVector = if (selectedDisease.recommendedProductCategory == "Pesticides") Icons.Default.BugReport else Icons.Default.Eco,
                                    contentDescription = null,
                                    tint = GreenPrimary,
                                    modifier = Modifier.size(28.dp)
                                )
                            }
                            
                            Spacer(modifier = Modifier.width(12.dp))

                            Column(modifier = Modifier.weight(1f)) {
                                Text(
                                    text = selectedDisease.recommendedProductName,
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 14.sp,
                                    color = TextDark
                                )
                                Text(text = selectedDisease.recommendedProductCategory, fontSize = 11.sp, color = TextMuted)
                                Spacer(modifier = Modifier.height(4.dp))
                                Text(
                                    text = selectedDisease.recommendedProductPrice,
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 14.sp,
                                    color = GreenDark
                                )
                            }

                            Button(
                                onClick = {
                                    Toast.makeText(context, "${selectedDisease.recommendedProductName} added to cart!", Toast.LENGTH_SHORT).show()
                                },
                                colors = ButtonDefaults.buttonColors(containerColor = GreenPrimary),
                                shape = RoundedCornerShape(8.dp),
                                contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp)
                            ) {
                                Text("Add", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 12.sp)
                            }
                        }
                    }

                    // Retake photo button
                    OutlinedButton(
                        onClick = { 
                            capturedImageBitmap = null
                            scannerState = ScannerState.IDLE 
                        },
                        border = BorderStroke(1.5.dp, GreenPrimary),
                        colors = ButtonDefaults.outlinedButtonColors(contentColor = GreenPrimary),
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(52.dp)
                    ) {
                        Icon(Icons.Default.Refresh, contentDescription = null)
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("Retake & Rescan", fontWeight = FontWeight.Bold, fontSize = 15.sp)
                    }
                    
                    Spacer(modifier = Modifier.height(24.dp))
                }
            }
        }
    }
}
