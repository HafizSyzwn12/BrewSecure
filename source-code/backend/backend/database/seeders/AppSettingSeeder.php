<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use \App\Models\AppSetting;

class AppSettingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $setting = new AppSetting();
        $setting->companyName = 'BrewSecure';
        $setting->dashboardType = 'inventory';
        $setting->tagLine = 'Manage your Inventory, Sales, Purchases etc';
        $setting->address = 'Shamelin Star';
        $setting->phone = '0176969793';
        $setting->email = 'solution@omega.ac';
        $setting->website = 'https://solution.omega.ac';
        $setting->footer = 'BrewSecure copyright by Hafiz Syazwan';
        $setting->logo = 'BrewSecureLogo.png';
        $setting->currencyId = 3;

        $setting->save();
    }
}
