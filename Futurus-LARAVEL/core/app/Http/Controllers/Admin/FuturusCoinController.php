<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class FuturusCoinController extends Controller {
    public function index() {
        $pageTitle = "Futurus Coin";
        return view('admin.futurus-coin.index', compact('pageTitle'));
    }
}
