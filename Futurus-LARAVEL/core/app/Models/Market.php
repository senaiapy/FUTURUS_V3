<?php

namespace App\Models;

use App\Constants\Status;
use App\Traits\GlobalStatus;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;

class Market extends Model {
    Use GlobalStatus;
    
    protected $casts = [
        'start_date' => 'datetime',
        'end_date' => 'datetime',
    ];

    public function category() {
        return $this->belongsTo(Category::class);
    }

    public function comments() {
        return $this->hasMany(Comment::class);
    }

    public function subcategory() {
        return $this->belongsTo(SubCategory::class);
    }

    public function purchases() {
        return $this->hasMany(Purchase::class);
    }

    public function marketOptions() {
        return $this->hasMany(MarketOption::class);
    }

    public function singleMarketOption() {
        return $this->hasOne(MarketOption::class)->where('status', Status::ENABLE);
    }

    public function activeMarketOptions() {
        return $this->hasMany(MarketOption::class)->where('status', Status::ENABLE);
    }

    public function resolveMarketOptions() {
        return $this->hasMany(MarketOption::class);
    }

    public function bookmarks() {
        return $this->hasMany(MarketBookmark::class);
    }

    public function isLocked() {
        return $this->is_lock == Status::YES;
    }

    public function scopeUpcoming($query) {
        return $query->whereHas('activeMarketOptions')->where('start_date', '>', now());
    }

    public function scopeExpired($query) {
        return $query->where('end_date', '<', now());
    }

    public function scopeClosed($query) {
        return $query->pendingResolution();
    }

    public function scopeDisabled($query) {
        return $query->where('status', Status::MARKET_DISABLE);
    }

    public function scopeDeclared($query) {
        return $query->where('status', Status::MARKET_SETTLED);
    }

    public function scopeCompleted($query) {
        return $query->where('status', Status::MARKET_COMPLETED)->where('is_paid', Status::PAID);
    }

    public function scopeCancelled($query) {
        return $query->where('status', Status::MARKET_CANCELLED);
    }

    public function scopeClosingSoon($query) {
        return $query->where('start_date', '<=', now())
            ->where('end_date', '>', now())
            ->where('end_date', '<=', now()->addDays(7));
    }

    public function scopeTrending($query) {
        return $query->where('is_trending', true);
    }

    public function scopeDraft($query) {
        return $query->whereDoesntHave('activeMarketOptions')
            ->whereNotIn('status', [Status::MARKET_SETTLED, Status::MARKET_CANCELLED]);
    }

    public function scopeLive($query) {
        return $query->running();
    }

    public function isDraft(): bool {
        return !$this->activeMarketOptions()->exists()
        && !in_array($this->status, [Status::MARKET_SETTLED, Status::MARKET_CANCELLED]);
    }

    public function isLive(): bool {
        return $this->status == Status::MARKET_ENABLE
        && $this->start_date <= now()
        && $this->end_date >= now()
        && $this->activeMarketOptions()->exists()
        && $this->category?->status == Status::ENABLE
            && (
            !$this->subcategory_id
            || $this->subcategory?->status == Status::ENABLE
        );
    }

    public function isUpcoming(): bool {
        return $this->status == Status::MARKET_ENABLE
        && $this->start_date > now();
    }

    public function isClosed(): bool {
        return $this->status == Status::MARKET_ENABLE
        && $this->end_date < now();
    }

    public function scopeRunning($query) {
        return $query->where('status', Status::ENABLE)
            ->where('start_date', '<=', now())
            ->where('end_date', '>=', now())
            ->whereHas('activeMarketOptions')
            ->whereHas('category', function ($q) {
                $q->where('status', Status::ENABLE);
            })
            ->where(function ($q) {
                $q->whereNull('subcategory_id')
                    ->orWhere('subcategory_id', 0)
                    ->orWhereHas('subcategory', function ($sub) {
                        $sub->where('status', Status::ENABLE);
                    });
            });
    }

    public function scopePendingResolution($query) {
        return $query->where('end_date', '<', now())->where('status', '!=', Status::MARKET_SETTLED)
            ->where('status', '!=', Status::MARKET_CANCELLED)->whereHas('activeMarketOptions');
    }

    public function scopeSingle($query) {
        return $query->where('type', Status::SINGLE_MARKET);
    }

    public function scopeMultiple($query) {
        return $query->where('type', Status::MULTI_MARKET);
    }

    public function statusBadge(): Attribute {
        return Attribute::get(function () {
            $html = '';
            if ($this->status == Status::MARKET_ENABLE) {
                if ($this->isDraft()) {
                    $html = '<span class="badge badge--warning">' . trans('Draft') . '</span>';
                } else if ($this->isLive()) {
                    $html = '<span class="badge badge--success">' . trans('Live') . '</span>';
                } else if ($this->isUpcoming()) {
                    $html = '<span class="badge badge--info">' . trans('Upcoming') . '</span>';
                } else {
                    $html = '<span class="badge badge--success">' . trans('Enable') . '</span>';
                }
            } else if ($this->status == Status::MARKET_CLOSED) {
                $html = '<span class="badge badge--dark">' . trans('Closed') . '</span>';
            } else if ($this->status == Status::MARKET_DISABLE) {
                $html = '<span class="badge badge--warning">' . trans('Disable') . '</span>';
            } else if ($this->status == Status::MARKET_SETTLED) {
                $html = '<span class="badge badge--primary">' . trans('Declared') . '</span>';
            } else if ($this->status == Status::MARKET_CANCELLED) {
                $html = '<span class="badge badge--danger">' . trans('Cancelled') . '</span>';
            } else if ($this->status == Status::MARKET_COMPLETED) {
                $html = '<span class="badge badge--success">' . trans('Completed') . '</span>';
            } else {
                $html = '<span class="badge badge--dark">' . trans('Unknown') . '</span>';
            }
            return $html;
        });
    }

    // Helper methods
    public function getTotalVolume() {
        return $this->marketOptions->sum(function ($option) {
            return $option->yes_pool + $option->no_pool;
        });
    }

    public function getOptionsCount() {
        return $this->marketOptions->count();
    }

}
