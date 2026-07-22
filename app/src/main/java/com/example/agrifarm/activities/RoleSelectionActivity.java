package com.satish.agrifarm.activities;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import androidx.appcompat.app.AppCompatActivity;
import androidx.cardview.widget.CardView;
import com.satish.agrifarm.R;

public class RoleSelectionActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_role_selection);

        CardView cardFarmer = findViewById(R.id.cardFarmer);
        CardView cardOwner = findViewById(R.id.cardOwner);

        cardFarmer.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                // Navigate to Farmer Login
                // Intent intent = new Intent(RoleSelectionActivity.this, FarmerLoginActivity.class);
                // startActivity(intent);
            }
        });

        cardOwner.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                // Navigate to Owner Login
                // Intent intent = new Intent(RoleSelectionActivity.this, OwnerLoginActivity.class);
                // startActivity(intent);
            }
        });
    }
}
