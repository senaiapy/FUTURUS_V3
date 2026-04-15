<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class GruposController extends Controller {
    public function index() {
        $pageTitle = "Grupos";
        return view('admin.grupos.index', compact('pageTitle'));
    }
}
