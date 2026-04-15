<?php

namespace App\Http\Controllers;

use App\Constants\Status;
use App\Lib\MarketPrice;
use App\Models\Category;
use App\Models\Comment;
use App\Models\Market;
use App\Models\MarketOption;
use App\Models\MarketTrend;
use App\Models\Purchase;
use Carbon\Carbon;
use Illuminate\Contracts\Encryption\DecryptException;
use Illuminate\Http\Request;

class MarketController extends Controller {

    public function marketDetails($slug) {
        $market    = Market::running()->where('slug', $slug)->with('comments')->withWhereHas('activeMarketOptions')->firstOrFail();
        $pageTitle = 'Market Details';

        $comments     = Comment::forMarket($market->id)->active()->parentComments()->with(['user', 'replies.user', 'replies'])->withCount('replies')->paginate(getPaginate(2));
        $calculations = MarketPrice::getMarketCalculations($market->singleMarketOption->id);
        if (request()->ajax()) {
            $recentPurchases = $this->getFilteredPurchases($market->id);
            return response()->json([
                'html' => view('Template::partials.recent_activity_list', compact('recentPurchases'))->render(),
            ]);
        }
        $chartData       = $this->getMarketTrendsChartData($market);
        $recentPurchases = Purchase::where('market_id', $market->id)->with(['user', 'market', 'option'])->latest()->limit(10)->get();
        $relatedMarkets  = Market::running()->where('category_id', $market->category_id)->where('id', '!=', $market->id)->latest()->limit(10)->get();
        return view('Template::market_details', compact('market', 'comments', 'chartData', 'pageTitle', 'relatedMarkets', 'calculations', 'recentPurchases'));
    }

    public function getOptionDetails(Request $request, $optionId) {
        try {
            $decryptedOptionId = decrypt($optionId);
        } catch (DecryptException $e) {
            return responseError('not_found', ['Invalid market option']);
        }

        $option = MarketOption::active()->withWhereHas('market', function ($query) {
            $query->active();
        })->find($decryptedOptionId);
        $shares       = (float) $request->shares;
        $selectedType = $request->type;
        $calculations = MarketPrice::getMarketCalculations($decryptedOptionId, $shares, $selectedType);
        $market       = $option->market;

        $html = view('Template::partials.market_info', compact('option', 'calculations', 'selectedType', 'market'))->render();

        if ($shares > 0) {
            return response()->json([
                'success'      => true,
                'html'         => $html,
                'calculations' => [
                    'yes_profit_if_win' => $calculations['yes_profit_if_win'],
                    'no_profit_if_win'  => $calculations['no_profit_if_win'],
                    'yes_payout_if_win' => $calculations['yes_payout_if_win'],
                    'no_payout_if_win'  => $calculations['no_payout_if_win'],
                    'total_amount'      => $calculations['total_amount'],
                ],
            ]);
        }

        return response()->json([
            'success' => true,
            'html'    => $html,
        ]);
    }

    public function markets(Request $request, $slug = NULL) {
        $pageTitle = 'Market';
        $markets   = Market::running()
            ->with(['bookmarks' => function ($q) {
                $q->where('user_id', auth()->id());
            }]);

        if (request('bookmark') === 'true') {
            $markets->whereHas('bookmarks', function ($q) {
                $q->where('user_id', auth()->id());
            });
        }

        $category = null;
        if ($slug) {
            $category = Category::active()->where('slug', $slug)->with(['subcategories' => function ($query) {
                $query->active();
            }])->firstOrFail();
            $markets->where('category_id', $category->id);
        }

        $markets = $this->getFilterMarket($markets, $request);
        $markets = $markets->with('activeMarketOptions')->withCount('purchases')->searchable(['question', 'category:name', 'subcategory:name'])->latest()->paginate(getPaginate(24));
        return view('Template::markets', compact('markets', 'pageTitle', 'category'));
    }

    public function filterMarket(Request $request) {
        $markets = Market::running()->with('activeMarketOptions')->with(['bookmarks' => function ($q) {
            $q->where('user_id', auth()->id());
        }])->searchable(['question', 'description', 'category:name', 'subcategory:name']);

        $markets = $this->getFilterMarket($markets, $request);

        $markets  = $markets->paginate(getPaginate(24));
        $paginate = true;

        $html = view('Template::partials.markets', compact('markets', 'paginate'))->render();
        return response()->json([
            'success' => true,
            'html'    => $html,
            'total'   => $markets->total(),
        ]);
    }

    public function getFilterMarket($markets, $request) {
        if ($request->category_id) {
            $markets->where('category_id', $request->category_id);
        }

        if ($request->subcategory_id) {
            $markets->where('subcategory_id', $request->subcategory_id);
        }

        if ($request->sort_by == 'trending') {
            $markets->trending();
        }

        if (in_array($request->sort_by, ['start_date_desc', 'start_date_asc'])) {
            $column = explode('start_date_', $request->sort_by)[1];
            $markets->orderBy('start_date', $column);
        }

        if ($request->sort_by == 'end_date_asc') {
            $markets->orderBy('end_date', 'asc');
        }

        if (in_array($request->sort_by, ['volume_asc', 'volume_desc'])) {
            $column = explode('volume_', $request->sort_by)[1];
            $markets->orderBy('volume', $column);
        }

        if ($request->bookmark == 'true') {
            $markets->whereHas('bookmarks', function ($q) {
                $q->where('user_id', auth()->id());
            });
        }

        return $markets;
    }

    public function searchMarkets(Request $request) {
        $markets = Market::running()
            ->searchable(['question', 'category:name', 'subcategory:name'])
            ->limit(8)
            ->get(['id', 'question', 'description', 'image', 'slug'])
            ->map(function ($market) {
                $market->image = getImage(
                    getFilePath('market') . '/' . $market->image,
                    getFileSize('market'),
                    option: true
                );
                return $market;
            });

        return response()->json(['markets' => $markets]);
    }

    public function getTrendingMarkets($categoryId = null) {
        $query = Market::running()
            ->with(['bookmarks' => function ($q) {
                $q->where('user_id', auth()->id());
            }])
            ->trending()
            ->with('activeMarketOptions');

        if ($categoryId && $categoryId !== 'all') {
            $query->where('category_id', $categoryId);
        }
        $markets = $query->latest()->limit(12)->get();

        $paginate = false;
        $class    = true;

        $view = view('Template::partials.markets', compact('markets', 'class', 'paginate'))->render();
        return response()->json([
            'html' => $view,
        ]);
    }

    private function getFilteredPurchases($marketId) {
        $query = Purchase::where('market_id', $marketId)->with(['user', 'market', 'option']);

        $sort = request('sort', 'newest');
        if ($sort === 'oldest') {
            $query->oldest();
        } else {
            $query->latest();
        }

        $range = request('range');

        if ($range && $range != '0') {
            if (strpos($range, '-') !== false) {
                $amounts = explode('-', $range);
                $query->whereBetween('amount', [$amounts[0], $amounts[1]]);
            } else {
                $query->where('amount', '>=', $range);
            }
        }

        return $query->limit(10)->get();
    }

    private function getMarketTrendsChartData($market) {
        $colors        = ['#FF4C51', '#0BF', '#56CA00', '#FF9500', '#8B5CF6', '#d9e320ff'];
        $marketOptions = $market->activeMarketOptions;

        if ($marketOptions->isEmpty()) {
            return [
                'series'     => [],
                'categories' => [],
                'colors'     => [],
                'hasData'    => false,
            ];
        }

        $startDate = now()->subDays(29)->startOfDay();
        $endDate   = now()->endOfDay();

        $trendsExist = MarketTrend::whereIn('market_option_id', $marketOptions->pluck('id'))
            ->whereBetween('created_at', [$startDate, $endDate])
            ->exists();

        if (!$trendsExist) {
            $categories = [];
            for ($i = 29; $i >= 0; $i--) {
                $categories[] = now()->subDays($i)->format('M d');
            }

            $chartData = [
                'series'     => [],
                'categories' => $categories,
                'colors'     => [],
                'hasData'    => false,
            ];

            foreach ($marketOptions as $index => $option) {
                $defaultValue = getAmount($option->chance ?? 50);
                $data         = array_fill(0, 30, $defaultValue);

                $chartData['series'][] = [
                    'name' => $option->option ?? $option->question ?? "Option " . ($index + 1),
                    'data' => $data,
                ];

                $chartData['colors'][] = $colors[$index % count($colors)];
            }

            return $chartData;
        }

        $dateRange = [];
        for ($i = 29; $i >= 0; $i--) {
            $dateRange[] = now()->subDays($i)->format('Y-m-d');
        }

        $categories = array_map(function ($date) {
            return Carbon::parse($date)->format('M d');
        }, $dateRange);

        $chartData = [
            'series'     => [],
            'categories' => $categories,
            'colors'     => [],
            'hasData'    => true,
        ];

        foreach ($marketOptions as $index => $option) {
            $data = [];

            $optionTrends = MarketTrend::where('market_option_id', $option->id)
                ->whereBetween('created_at', [$startDate, $endDate])
                ->orderBy('created_at')
                ->get()
                ->groupBy(function ($trend) {
                    return $trend->created_at->format('Y-m-d');
                })
                ->map(function ($dayTrends) {
                    return $dayTrends->last();
                });

            $initialTrend = MarketTrend::where('market_option_id', $option->id)
                ->where('created_at', '<', $startDate)
                ->orderBy('created_at', 'desc')
                ->first();

            $currentValue = $initialTrend ? getAmount($initialTrend->chance) : getAmount($option->chance ?? 50);

            foreach ($dateRange as $date) {
                if ($optionTrends->has($date)) {
                    $currentValue = getAmount($optionTrends[$date]->chance);
                }
                $data[] = $currentValue;
            }

            $chartData['series'][] = [
                'name' => $option->option ?? $option->question ?? "Option " . ($index + 1),
                'data' => $data,
            ];

            $chartData['colors'][] = $colors[$index % count($colors)];
        }

        return $chartData;
    }

    public function getMultiOption($id) {
        $market = Market::running()->where('type', Status::MULTI_MARKET)->with('activeMarketOptions')->where('id', $id)->first();
        if (!$market) {
            return responseError('invalid_market', 'Invalid Market Selected');
        }

        $html = view('Template::partials.multi_market_option', compact('market'))->render();
        $data = [
            'html' => $html,
        ];
        return responseSuccess('success', 'Market Option', $data);

    }
}
