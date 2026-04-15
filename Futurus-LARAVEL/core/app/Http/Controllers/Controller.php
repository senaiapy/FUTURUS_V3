<?php

namespace App\Http\Controllers;

abstract class Controller
{
    public function __construct()
    {
        // License check removed
    }

    public static function middleware()
    {
        return [];
    }

}
