<?php

namespace App\Models;

use App\Constants\Status;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;

class Purchase extends Model {

    protected $fillable = [
        'user_id',
        'market_id',
        'market_option_id',
        'amount',
        'price',
        'quantity',
        'payout',
        'trx',
        'type',
    ];

    public function user() {
        return $this->belongsTo(User::class);
    }

    public function option() {
        return $this->belongsTo(MarketOption::class, 'market_option_id', 'id');
    }

    public function market() {
        return $this->belongsTo(Market::class);
    }

    public function statusBadge(): Attribute {
        return Attribute::get(function () {
            $html = '';

            if ($this->status == Status::WAITING) {
                $html = '<span class="badge badge--warning">' . trans('Waiting') . '</span>';
            } else if ($this->status == Status::WON) {
                $html = '<span class="badge badge--success">' . trans('Won') . '</span>';
            } else if ($this->status == Status::LOST) {
                $html = '<span class="badge badge--danger">' . trans('Lost') . '</span>';
            } else if ($this->status == Status::REFUNDED) {
                $html = '<span class="badge badge--primary">' . trans('Refunded') . '</span>';
            } else if ($this->status == Status::SETTLED) {
                $html = '<span class="badge badge--success">' . trans('Settled') . '</span>';
            } else {
                $html = '<span class="badge badge--dark">' . trans('Unknown') . '</span>';
            }

            return $html;
        });
    }
}
