<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MarketBookmark extends Model
{
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function market()
    {
        return $this->belongsTo(Market::class);
    }
    
}
