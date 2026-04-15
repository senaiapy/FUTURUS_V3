<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class IAControlController extends Controller {
    public function index() {
        $pageTitle = "IA Control";
        return view('admin.ia-control.index', compact('pageTitle'));
    }
}
