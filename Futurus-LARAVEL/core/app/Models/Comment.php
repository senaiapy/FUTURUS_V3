<?php

namespace App\Models;

use App\Constants\Status;
use App\Traits\GlobalStatus;
use Illuminate\Database\Eloquent\Model;

class Comment extends Model
{
    use GlobalStatus;


    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function market()
    {
        return $this->belongsTo(Market::class);
    }

    public function parent()
    {
        return $this->belongsTo(Comment::class, 'parent_id');
    }

    public function replies()
    {
        return $this->hasMany(Comment::class, 'parent_id')->active()->with('user', 'likes');
    }

    public function likes()
    {
        return $this->hasMany(CommentLike::class);
    }

    public function authUserLike()
    {
        return $this->hasOne(CommentLike::class)->where('user_id', auth()->id());
    }

    public function reports()
    {
        return $this->hasMany(CommentReport::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', Status::ENABLE);
    }

    public function scopeParentComments($query)
    {
        return $query->where(function ($q) {
            $q->whereNull('parent_id')
                ->orWhere('parent_id', 0);
        });
    }

    public function scopeWithReplies($query)
    {
        return $query->with(['replies' => function ($q) {
            $q->with('user')->orderBy('created_at', 'asc');
        }]);
    }

    public function scopeForMarket($query, $marketId)
    {
        return $query->where('market_id', $marketId);
    }

    // Methods
    public function toggleLike()
    {
        if (!auth()->check()) {
            return false;
        }

        $like = $this->likes()->where('user_id', auth()->id())->first();

        if ($like) {
            $like->delete();
            $this->decrement('likes_count');
            return false;
        } else {
            $this->likes()->create(['user_id' => auth()->id()]);
            $this->increment('likes_count');
            return true;
        }
    }

    public function incrementRepliesCount()
    {
        if ($this->parent_id) {
            $this->parent->increment('replies_count');
        }
    }

}
