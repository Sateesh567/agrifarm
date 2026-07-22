package com.satish.agrifarm.ui.auth

import androidx.compose.foundation.Image
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.satish.agrifarm.ui.theme.AgrifarmTheme
import com.satish.agrifarm.ui.theme.GreenPrimary

@Composable
fun RoleSelectionScreen(
    onSelectFarmer: () -> Unit,
    onSelectOwner: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Text(
            text = "Welcome to AgroLink",
            style = MaterialTheme.typography.headlineLarge,
            color = GreenPrimary,
            fontWeight = FontWeight.Bold,
            textAlign = TextAlign.Center
        )
        Text(
            text = "Select your role to continue",
            style = MaterialTheme.typography.bodyLarge,
            color = Color.Gray,
            modifier = Modifier.padding(top = 8.dp)
        )

        Spacer(modifier = Modifier.height(64.dp))

        RoleButton(
            title = "Login as Farmer / User",
            subtitle = "Buy fertilizers, seeds & more",
            onClick = onSelectFarmer
        )

        Spacer(modifier = Modifier.height(16.dp))

        RoleButton(
            title = "Login as Shop Owner",
            subtitle = "Manage your shop and orders",
            onClick = onSelectOwner
        )
    }
}

@Composable
fun RoleButton(
    title: String,
    subtitle: String,
    onClick: () -> Unit
) {
    OutlinedButton(
        onClick = onClick,
        modifier = Modifier
            .fillMaxWidth()
            .height(100.dp),
        shape = RoundedCornerShape(16.dp),
        colors = ButtonDefaults.outlinedButtonColors(contentColor = GreenPrimary),
        border = ButtonDefaults.outlinedButtonBorder.copy(width = 2.dp)
    ) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Text(text = title, fontSize = 18.sp, fontWeight = FontWeight.Bold)
            Text(text = subtitle, fontSize = 14.sp, color = Color.Gray)
        }
    }
}

@Preview(showBackground = true)
@Composable
fun RoleSelectionScreenPreview() {
    AgrifarmTheme {
        RoleSelectionScreen(onSelectFarmer = {}, onSelectOwner = {})
    }
}
