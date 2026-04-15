<?php

namespace App\Models;

use App\Constants\Status;
use App\Traits\GlobalStatus;
use Illuminate\Database\Eloquent\Model;

class MarketOption extends Model
{
    Use GlobalStatus;

    public function market()
    {
        return $this->belongsTo(Market::class);
    }

    public function purchases()
    {
        return $this->hasMany(Purchase::class);
    }

    public function isLocked()
    {
        return $this->is_lock == Status::YES;
    }

}
