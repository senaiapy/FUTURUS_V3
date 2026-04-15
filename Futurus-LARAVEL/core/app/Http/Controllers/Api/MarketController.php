<?php

namespace App\Http\Controllers\Api;

use App\Constants\Status;
use App\Http\Controllers\Controller;
use App\Models\Market;
use App\Models\MarketBookmark;
use App\Models\MarketOption;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class MarketController extends Controller
{
    /**
     * Get list of markets with pagination
     */
    public function index(Request $request)
    {
        $query = Market::with(['category', 'subcategory', 'activeMarketOptions', 'bookmarks' => function ($q) {
            $q->where('user_id', Auth::id());
        }])
            ->where('status', Status::ENABLE);

        // Apply filters
        if ($request->filled('search')) {
            $query->where('question', 'like', '%' . $request->search . '%');
        }

        if ($request->filled('category')) {
            $category = $request->category;
            if (is_numeric($category)) {
                $query->where('category_id', $category);
            } else {
                $query->whereHas('category', function ($q) use ($category) {
                    $q->where('slug', strtolower($category))->orWhere('name', 'like', '%' . $category . '%');
                });
            }
        }

        if ($request->filled('status')) {
            switch ($request->status) {
                case 'OPEN':
                    $query->running();
                    break;
                case 'UPCOMING':
                    $query->upcoming();
                    break;
                case 'CLOSED':
                    $query->closed();
                    break;
                case 'RESOLVED':
                    $query->declared();
                    break;
            }
        }

        if ($request->filled('is_featured')) {
            $query->where('is_trending', $request->boolean('is_featured'));
        }

        $page = $request->get('page', 1);
        $limit = $request->get('limit', 20);

        $markets = $query->latest()->paginate($limit, ['*'], 'page', $page);

        $data = $markets->map(function ($market) {
            $outcomes = $market->activeMarketOptions->map(function ($option) use ($market) {
                return [
                    'id' => (string) $option->id,
                    'title' => $option->question,
                    'probability' => $option->chance / 100,
                    'price' => (string) ($option->price ?? ($option->chance / 100)),
                    'totalShares' => (string) $option->total_shares,
                    'yesPool' => (string) $option->yes_pool,
                    'noPool' => (string) $option->no_pool,
                    'isWinner' => null,
                ];
            })->toArray();

            $totalVolume = $market->yes_pool + $market->no_pool;

            return [
                'id' => (string) $market->id,
                'title' => $market->question,
                'slug' => $market->slug,
                'description' => $market->description ?? '',
                'imageUrl' => $market->image ? '/' . getFilePath('market') . '/' . $market->image : null,
                'image' => $market->image ? '/' . getFilePath('market') . '/' . $market->image : null,
                'category' => $market->category?->name ?? 'OTHER',
                'categoryId' => $market->category_id,
                'subcategory' => $market->subcategory?->name,
                'subcategoryId' => $market->subcategory_id,
                'startDate' => $market->start_date?->toIso8601String(),
                'endDate' => $market->end_date?->toIso8601String(),
                'status' => $this->getMarketStatus($market),
                'totalVolume' => (string) $totalVolume,
                'liquidityPool' => (string) $totalVolume,
                'yesShare' => (string) $market->yes_share,
                'noShare' => (string) $market->no_share,
                'volume' => (string) $market->volume,
                'isTrending' => $market->is_trending,
                'isLocked' => $market->isLocked(),
                'outcomes' => $outcomes,
                'isBookmarked' => $market->bookmarks->isNotEmpty(),
                'createdById' => (string) $market->created_by,
                'createdAt' => $market->created_at->toIso8601String(),
            ];
        })->toArray();

        return response()->json([
            'success' => true,
            'message' => 'Success',
            'data' => [
                'data' => $data,
                'meta' => [
                    'total' => $markets->total(),
                    'page' => $markets->currentPage(),
                    'limit' => $markets->perPage(),
                    'totalPages' => $markets->lastPage(),
                ],
            ]
        ]);
    }

    /**
     * Get single market by slug
     */
    public function show($slug)
    {
        $market = Market::with(['category', 'subcategory', 'activeMarketOptions', 'bookmarks' => function ($q) {
            $q->where('user_id', Auth::id());
        }, 'comments' => function ($q) {
            $q->with(['user', 'likes' => function ($lq) {
                $lq->where('user_id', Auth::id());
            }])->whereNull('parent_id')->latest();
        }])
            ->where('slug', $slug)
            ->firstOrFail();

        $outcomes = $market->activeMarketOptions->map(function ($option) use ($market) {
            return [
                'id' => (string) $option->id,
                'title' => $option->question,
                'probability' => $option->chance / 100,
                'price' => (string) ($option->price ?? ($option->chance / 100)),
                'totalShares' => (string) $option->total_shares,
                'yesPool' => (string) $option->yes_pool,
                'noPool' => (string) $option->no_pool,
                'isWinner' => $option->status === Status::YES ? true : null,
                'isLocked' => $option->isLocked(),
            ];
        })->toArray();

        $totalVolume = $market->yes_pool + $market->no_pool;

        $marketData = [
            'id' => (string) $market->id,
            'title' => $market->question,
            'slug' => $market->slug,
            'description' => $market->description ?? '',
            'imageUrl' => $market->image ? '/' . getFilePath('market') . '/' . $market->image : null,
            'image' => $market->image ? '/' . getFilePath('market') . '/' . $market->image : null,
            'category' => $market->category?->name ?? 'OTHER',
            'categoryId' => $market->category_id,
            'subcategory' => $market->subcategory?->name,
            'subcategoryId' => $market->subcategory_id,
            'startDate' => $market->start_date?->toIso8601String(),
            'endDate' => $market->end_date?->toIso8601String(),
            'status' => $this->getMarketStatus($market),
            'totalVolume' => (string) $totalVolume,
            'liquidityPool' => (string) $totalVolume,
            'yesShare' => (string) $market->yes_share,
            'noShare' => (string) $market->no_share,
            'volume' => (string) $market->volume,
            'isTrending' => $market->is_trending,
            'isLocked' => $market->isLocked(),
            'outcomes' => $outcomes,
            'isBookmarked' => $market->bookmarks->isNotEmpty(),
            'createdById' => (string) $market->created_by,
            'createdAt' => $market->created_at->toIso8601String(),
            'comments' => $market->comments->map(function ($comment) {
                return [
                    'id' => (string) $comment->id,
                    'content' => $comment->comment,
                    'user' => [
                        'id' => (string) $comment->user_id,
                        'name' => $comment->user->name ?? 'Anonymous',
                    ],
                    'likesCount' => $comment->likes_count ?? 0,
                    'isLiked' => $comment->likes?->isNotEmpty() ?? false,
                    'createdAt' => $comment->created_at->toIso8601String(),
                ];
            })->toArray(),
        ];

        return response()->json([
            'success' => true,
            'message' => 'Success',
            'data' => $marketData
        ]);
    }

    /**
     * Get market categories
     */
    public function categories()
    {
        $categories = \App\Models\Category::where('status', Status::ENABLE)
            ->get()
            ->map(function ($category) {
                return [
                    'id' => (string) $category->id,
                    'name' => $category->name,
                    'slug' => $category->slug,
                    'icon' => $category->icon,
                ];
            });

        return response()->json([
            'data' => $categories,
        ]);
    }

    /**
     * Toggle bookmark
     */
    public function toggleBookmark(Request $request, $marketId)
    {
        $user = Auth::user();

        $bookmark = MarketBookmark::where('user_id', $user->id)
            ->where('market_id', $marketId)
            ->first();

        if ($bookmark) {
            $bookmark->delete();
            return response()->json([
                'success' => true,
                'bookmarked' => false,
                'message' => 'Bookmark removed successfully',
            ]);
        } else {
            $bookmark = new MarketBookmark();
            $bookmark->user_id = $user->id;
            $bookmark->market_id = $marketId;
            $bookmark->save();

            return response()->json([
                'success' => true,
                'bookmarked' => true,
                'message' => 'Bookmarked successfully',
            ]);
        }
    }

    /**
     * Get user's bookmarked markets
     */
    public function bookmarks()
    {
        $user = Auth::user();

        $markets = Market::with(['category', 'subcategory', 'activeMarketOptions'])
            ->whereHas('bookmarks', function ($query) use ($user) {
                $query->where('user_id', $user->id);
            })
            ->where('status', Status::ENABLE)
            ->latest()
            ->get();

        $data = $markets->map(function ($market) {
            $outcomes = $market->activeMarketOptions->map(function ($option) {
                return [
                    'id' => (string) $option->id,
                    'title' => $option->question,
                    'probability' => $option->chance / 100,
                    'price' => (string) ($option->price ?? ($option->chance / 100)),
                    'totalShares' => (string) $option->total_shares,
                    'isWinner' => null,
                ];
            })->toArray();

            $totalVolume = $market->yes_pool + $market->no_pool;

            return [
                'id' => (string) $market->id,
                'title' => $market->question,
                'slug' => $market->slug,
                'description' => $market->description ?? '',
                'imageUrl' => $market->image ? '/' . getFilePath('market') . '/' . $market->image : null,
                'category' => $market->category?->name ?? 'OTHER',
                'endDate' => $market->end_date?->toIso8601String(),
                'status' => $this->getMarketStatus($market),
                'totalVolume' => (string) $totalVolume,
                'outcomes' => $outcomes,
                'isBookmarked' => true,
                'createdAt' => $market->created_at->toIso8601String(),
            ];
        })->toArray();

        return response()->json([
            'data' => $data,
        ]);
    }

    /**
     * Get market trends/charts
     */
    public function trends($id)
    {
        $market = Market::with('marketOptions')->findOrFail($id);

        $trends = \App\Models\MarketTrend::where('market_id', $id)
            ->with('marketOption')
            ->latest()
            ->get()
            ->groupBy('market_option_id');

        $trendsData = [];

        foreach ($trends as $optionId => $trendGroup) {
            $trendsData[] = [
                'optionId' => (string) $optionId,
                'optionTitle' => $trendGroup->first()->marketOption->question ?? 'Option',
                'data' => $trendGroup->map(function ($t) {
                    return [
                        'chance' => $t->chance,
                        'timestamp' => $t->created_at->toIso8601String(),
                    ];
                })->toArray(),
            ];
        }

        return response()->json([
            'data' => $trendsData,
        ]);
    }

    /**
     * Convert Laravel status to mobile app status
     */
    private function getMarketStatus($market): string
    {
        if ($market->status == Status::MARKET_CANCELLED) {
            return 'CANCELLED';
        }

        if ($market->status == Status::MARKET_SETTLED) {
            return 'RESOLVED';
        }

        if ($market->status == Status::MARKET_COMPLETED) {
            return 'RESOLVED';
        }

        if ($market->end_date < now()) {
            return 'CLOSED';
        }

        if ($market->start_date > now()) {
            return 'UPCOMING';
        }

        if (!$market->activeMarketOptions()->exists()) {
            return 'DRAFT';
        }

        return 'OPEN';
    }
}
