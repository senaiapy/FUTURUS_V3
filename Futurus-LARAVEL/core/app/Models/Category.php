<?php

namespace App\Models;

use App\Traits\GlobalStatus;
use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    use GlobalStatus;

    public function subcategories()
    {
        return $this->hasMany(SubCategory::class);
    }

    public function markets()
    {
        return $this->hasMany(Market::class);
    }

}
