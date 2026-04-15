<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActionProcess;
use App\Models\Frontend;
use App\Models\GeneralSetting;
use App\Models\Language;
use App\Models\SupportMessage;
use App\Models\SupportTicket;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AppController extends Controller
{
    public function generalSetting()
    {
        $general = gs();

        // SECURITY FIX: Remove sensitive configuration from public API response
        // Removed: firebase_config, socialite_credentials, email_from, sms_template,
        // commission rates, bonus amounts, system_customized, available_version, etc.
        $safeSettings = [
            'site_name' => $general->site_name ?? null,
            'cur_text' => $general->cur_text ?? null,
            'cur_sym' => $general->cur_sym ?? null,
            'base_color' => $general->base_color ?? null,
            'secondary_color' => $general->secondary_color ?? null,
            'ev' => $general->ev ?? 0,
            'sv' => $general->sv ?? 0,
            'pn' => $general->pn ?? 0,
            'maintenance_mode' => $general->maintenance_mode ?? 0,
            'registration' => $general->registration ?? 1,
            'multi_language' => $general->multi_language ?? 1,
            'active_template' => $general->active_template ?? 'basic',
            'currency_format' => $general->currency_format ?? 1,
            'agree' => $general->agree ?? 1,
        ];

        return response()->json([
            'success' => true,
            'data' => [
                'general_setting' => $safeSettings,
            ],
        ]);
    }

    public function getCountries()
    {
        $countries = json_decode(file_get_contents(resource_path('views/partials/country.json')), true);
        return response()->json([
            'success' => true,
            'data' => [
                'countries' => $countries,
            ],
        ]);
    }

    public function getLanguage($key = null)
    {
        $languages = Language::get();
        $languageData = [];
        if ($key) {
            $language = Language::where('code', $key)->first();
            if ($language) {
                $json = file_get_contents(resource_path('lang/' . $language->code . '.json'));
                $languageData = json_decode($json);
            }
        }
        return response()->json([
            'success' => true,
            'data' => [
                'languages' => $languages,
                'language_data' => $languageData,
            ],
        ]);
    }

    public function policies()
    {
        $policies = Frontend::where('data_keys', 'policy_pages.element')->get();
        return response()->json([
            'success' => true,
            'data' => [
                'policies' => $policies,
            ],
        ]);
    }

    public function faq()
    {
        $faqs = Frontend::where('data_keys', 'faq.element')->get();
        return response()->json([
            'success' => true,
            'data' => [
                'faqs' => $faqs,
            ],
        ]);
    }

    public function seo()
    {
        $seo = Frontend::where('data_keys', 'seo.data')->first();
        return response()->json([
            'success' => true,
            'data' => [
                'seo' => $seo,
            ],
        ]);
    }
}
