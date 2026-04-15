<?php

namespace App\Http\Controllers\Admin;

use App\Constants\Status;
use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Market;
use App\Models\MarketOption;
use App\Models\SubCategory;
use App\Rules\FileTypeValidate;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ManageMarketController extends Controller {
    public function index() {
        $pageTitle  = "All Markets";
        $markets    = $this->marketData();
        $categories = Category::active()->get();
        return view('admin.market.index', compact('pageTitle', 'markets', 'categories'));
    }

    public function upcoming() {
        $pageTitle  = "Upcoming Markets";
        $markets    = $this->marketData('upcoming');
        $categories = Category::active()->get();
        return view('admin.market.index', compact('pageTitle', 'markets', 'categories'));
    }

    public function draft() {
        $pageTitle  = "Draft Markets";
        $markets    = $this->marketData('draft');
        $categories = Category::active()->get();
        return view('admin.market.index', compact('pageTitle', 'markets', 'categories'));
    }

    public function live() {
        $pageTitle  = "Live Markets";
        $markets    = $this->marketData('live');
        $categories = Category::active()->get();
        return view('admin.market.index', compact('pageTitle', 'markets', 'categories'));
    }

    public function expired() {
        $pageTitle  = "Expired Markets";
        $markets    = $this->marketData('expired');
        $categories = Category::active()->get();
        return view('admin.market.index', compact('pageTitle', 'markets', 'categories'));
    }

    public function pendingDeclare() {
        $pageTitle  = "Closed Markets";
        $markets    = $this->marketData('closed');
        $categories = Category::active()->get();
        return view('admin.market.index', compact('pageTitle', 'markets', 'categories'));
    }

    public function cancelled() {
        $pageTitle  = "Cancelled Markets";
        $markets    = $this->marketData('cancelled');
        $categories = Category::active()->get();
        return view('admin.market.index', compact('pageTitle', 'markets', 'categories'));
    }

    public function trendingMarkets() {
        $pageTitle  = "Trending Markets";
        $markets    = $this->marketData('trending');
        $categories = Category::active()->get();
        return view('admin.market.index', compact('pageTitle', 'markets', 'categories'));
    }

    public function closingSoon() {
        $pageTitle  = "Closing Soon Markets";
        $markets    = $this->marketData('closingSoon');
        $categories = Category::active()->get();
        return view('admin.market.index', compact('pageTitle', 'markets', 'categories'));
    }

    public function declared() {
        $pageTitle  = "Declared Markets";
        $markets    = $this->marketData('declared');
        $categories = Category::active()->get();
        return view('admin.market.index', compact('pageTitle', 'markets', 'categories'));
    }

    public function completed() {
        $pageTitle  = "Payout Completed Markets";
        $markets    = $this->marketData('completed');
        $categories = Category::active()->get();
        return view('admin.market.index', compact('pageTitle', 'markets', 'categories'));
    }

    public function disabled() {
        $pageTitle  = "Disabled Markets";
        $markets    = $this->marketData('disabled');
        $categories = Category::active()->get();
        return view('admin.market.index', compact('pageTitle', 'markets', 'categories'));
    }

    protected function marketData($scope = null) {
        $query = Market::with(['category', 'subcategory', 'marketOptions']);

        if ($scope && method_exists(Market::class, 'scope' . ucfirst($scope))) {
            $query->$scope();
        }

        return $query->latest()
            ->searchable(['question'])
            ->filter(['category_id', 'type'])
            ->dateFilter()
            ->paginate(getPaginate());
    }

    public function marketForm($id = null) {
        $pageTitle = $id ? "Edit Market" : "Add New Market";

        $categories    = Category::active()->orderBy('name')->get();
        $subCategories = SubCategory::active()->orderBy('name')->get();

        $market        = null;
        $marketOptions = collect();

        if ($id) {
            $market = Market::with(['marketOptions', 'category', 'subcategory'])
                ->findOrFail($id);
            $marketOptions = $market->marketOptions;
        }

        return view('admin.market.form', compact('pageTitle', 'market', 'categories', 'marketOptions', 'subCategories'));
    }

    public function save(Request $request, $id = null) {
        $imgValidation = $id ? 'nullable' : 'required';
        $request->validate([
            'category_id'      => 'required|exists:categories,id',
            'subcategory_id'   => 'nullable|exists:sub_categories,id',
            'question'         => 'required|string|max:255',
            'slug'             => 'required|unique:markets,slug,' . $id,
            'type'             => 'required|integer|in:1,2',
            'image'            => [$imgValidation, 'image', new FileTypeValidate(['jpeg', 'jpg', 'png'])],

            'initial_yes_pool' => 'required_if:type,1|numeric',
            'initial_no_pool'  => 'required_if:type,1|numeric',
            'commission'       => 'required_if:type,1|numeric|min:0|max:100',

            'start_date'       => 'required|date',
            'end_date'         => 'required|date|after:start_date',
        ]);

        try {
            DB::beginTransaction();

            if ($id) {
                $market = Market::findOrFail($id);

                if ($market->purchases()->exists()) {
                    $notify[] = ['error', 'This market is not editable'];
                    return back()->withNotify($notify);
                }

                if ($market->type == Status::SINGLE_MARKET && $request->type != Status::SINGLE_MARKET) {
                    $marketOption = MarketOption::where('market_id', $id)->first();
                    if ($marketOption && !$marketOption->purchases()->exists()) {
                        $marketOption->delete();
                    }
                }

                $notify[] = ['success', 'Market updated successfully'];
            } else {
                $market   = new Market();
                $notify[] = ['success', 'Market added successfully'];
            }

            if ($request->hasFile('image')) {
                $oldImage      = $market->image;
                $market->image = fileUploader($request->image, getFilePath('market'), getFileSize('market'), $oldImage);
            }

            $market->category_id    = $request->category_id;
            $market->subcategory_id = $request->subcategory_id ?? 0;
            $market->question       = $request->question;
            $market->slug           = slug($request->slug);
            $market->type           = $request->type;
            $market->start_date     = Carbon::createFromFormat('Y-m-d h:i A', $request->start_date)
                ->format('Y-m-d H:i:s');
            $market->end_date = Carbon::createFromFormat('Y-m-d h:i A', $request->end_date)
                ->format('Y-m-d H:i:s');
            $market->description = $request->description;
            $market->save();

            if ($request->type == Status::SINGLE_MARKET) {
                if (!$id) {
                    $marketOption = new MarketOption();
                } else {
                    $marketOption = MarketOption::where('market_id', $id)->firstOrFail();
                }

                $marketOption->market_id        = $market->id;
                $marketOption->question         = $request->question;
                $marketOption->initial_yes_pool = $request->initial_yes_pool;
                $marketOption->initial_no_pool  = $request->initial_no_pool;
                $marketOption->yes_pool         = $request->initial_yes_pool;
                $marketOption->no_pool          = $request->initial_no_pool;
                $marketOption->commission       = $request->commission;

                $totalPool            = $marketOption->yes_pool + $marketOption->no_pool;
                $marketOption->chance = $totalPool > 0 ? round(($marketOption->yes_pool / $totalPool) * 100, 2) : 0;

                $marketOption->save();

                $totalPool = $marketOption->yes_pool + $marketOption->no_pool;

                $market->volume    = $totalPool;
                $market->yes_share = $totalPool > 0 ? round(($marketOption->yes_pool / $totalPool) * 100, 2) : 0;
                $market->no_share  = $totalPool > 0 ? round(($marketOption->no_pool / $totalPool) * 100, 2) : 0;

                $market->save();
            }

            DB::commit();

            if ($request->type == Status::SINGLE_MARKET) {
                return back()->withNotify($notify);
            } else {
                return redirect()->route('admin.market.option', $market->id)->withNotify($notify);
            }
        } catch (\Exception $e) {
            DB::rollBack();
            $notify[] = ['error', 'Something went wrong: ' . $e->getMessage()];
            return back()->withNotify($notify);
        }
    }

    public function options($id) {
        $market = Market::with(['category', 'subcategory'])->findOrFail($id);

        $pageTitle = 'Options - ' . $market->question;

        $marketOptions = MarketOption::where('market_id', $id)
            ->searchable(['question'])
            ->paginate(getPaginate());

        return view('admin.market.options', compact('pageTitle', 'market', 'marketOptions'));
    }

    public function optionSave(Request $request, $marketId, $optionId = NULL) {
        $market = Market::findOrFail($marketId);

        $isEdit = !empty($optionId);

        if ($market->type == Status::SINGLE_MARKET && !$isEdit) {
            $existingOption = MarketOption::where('market_id', $marketId)->first();
            if ($existingOption) {
                $notify[] = ['error', 'Single type market can only have one option.'];
                return back()->withNotify($notify);
            }
        }

        $request->validate([
            'question'         => 'required|string|max:255',
            'initial_yes_pool' => 'required|numeric|gt:0',
            'initial_no_pool'  => 'required|numeric|gt:0',
            'commission'       => 'required|numeric|min:0|max:100',
            'image'            => ['nullable', 'image', new FileTypeValidate(['jpeg', 'jpg', 'png'])],
        ]);

        try {
            DB::beginTransaction();

            if ($isEdit) {
                $marketOption = MarketOption::findOrFail($optionId);

                if ($marketOption->purchases()->exists()) {
                    $notify[] = ['error', 'This market option is not editable'];
                    return back()->withNotify($notify);
                }

                $notify[] = ['success', 'Market option updated successfully'];
            } else {
                $marketOption = new MarketOption();
                $notify[]     = ['success', 'Market option added successfully'];
            }

            if ($request->hasFile('image')) {
                $oldImage            = $marketOption->image ?? null;
                $marketOption->image = fileUploader($request->image, getFilePath('market'), getFileSize('market'), $oldImage);
            }

            $marketOption->market_id        = $marketId;
            $marketOption->question         = $request->question;
            $marketOption->initial_yes_pool = $request->initial_yes_pool;
            $marketOption->initial_no_pool  = $request->initial_no_pool;
            $marketOption->yes_pool         = $request->initial_yes_pool;
            $marketOption->no_pool          = $request->initial_no_pool;
            $marketOption->commission       = $request->commission;

            $totalPool            = $marketOption->yes_pool + $marketOption->no_pool;
            $marketOption->chance = $totalPool > 0 ? round(($marketOption->yes_pool / $totalPool) * 100, 2) : 0;
            $marketOption->save();

            $this->updateMarketStatsMultiple($market->id);

            DB::commit();

            return back()->withNotify($notify);
        } catch (\Exception $e) {
            DB::rollBack();
            $notify[] = ['error', 'Something went wrong: ' . $e->getMessage()];
            return back()->withNotify($notify);
        }
    }

    public function status($id) {
        return Market::changeStatus($id);
    }

    public function cancel($id) {
        $market = Market::findOrFail($id);

        if ($market->status == Status::MARKET_SETTLED || $market->status == Status::MARKET_CANCELLED) {
            $notify[] = ['error', 'This market is already cancelled or settled'];
            return back()->withNotify($notify);
        }

        try {
            $market->status = Status::MARKET_CANCELLED;
            $market->save();

            $market->purchases()->update(['status' => Status::REFUNDED, 'is_paid' => Status::PAYMENT_AWAIT]);

            $notify[] = ['success', 'Market has been marked as cancelled'];
            return back()->withNotify($notify);
        } catch (\Exception $e) {
            $notify[] = ['error', 'Failed to cancel market: ' . $e->getMessage()];
            return back()->withNotify($notify);
        }
    }

    public function optionStatus($id) {
        return MarketOption::changeStatus($id);
    }

    public function getSubcategories(Request $request) {
        $subcategories = SubCategory::active()
            ->where('category_id', $request->category_id)
            ->orderBy('name')
            ->get(['id', 'name']);

        return response()->json($subcategories);
    }

    public function trending($id) {
        $query = Market::find($id);

        if (!$query) {
            return responseError('validation_error', 'Market not found');
        }

        $query->is_trending = ($query->is_trending == Status::YES) ? Status::NO : Status::YES;
        $query->save();
        return responseSuccess('success', 'Market trending status updated successfully.');
    }

    public function lock($id) {
        $query = Market::find($id);

        if (!$query) {
            return responseError('validation_error', 'Market not found');
        }

        $query->is_lock = ($query->is_lock == Status::YES) ? Status::NO : Status::YES;
        $query->save();

        return responseSuccess('success', 'Market lock status updated successfully.');
    }

    public function optionLock($id) {
        $query = MarketOption::find($id);

        if (!$query) {
            return responseError('validation_error', 'Market Option not found');
        }

        $query->is_lock = ($query->is_lock == Status::YES) ? Status::NO : Status::YES;
        $query->save();
        $notify[] = ['success', 'Market Option lock status updated successfully.'];
        return back()->withNotify($notify);
    }

    public function checkSlug(Request $request, $id) {
        $exists = Market::where('id', '!=', $id)->where('slug', $request->slug)->exists();
        return response([
            'status' => $exists,
        ]);
    }

    private function updateMarketStatsMultiple($marketId) {
        $marketOptions = MarketOption::where('market_id', $marketId)->get();

        $totalVolume  = 0;
        $totalYesPool = 0;
        $totalNoPool  = 0;

        foreach ($marketOptions as $option) {
            $totalVolume += ($option->yes_pool + $option->no_pool);
            $totalYesPool += $option->yes_pool;
            $totalNoPool += $option->no_pool;
        }

        $yesSharePercentage = $totalVolume > 0 ? ($totalYesPool / $totalVolume) * 100 : 0.00;
        $noSharePercentage  = $totalVolume > 0 ? ($totalNoPool / $totalVolume) * 100 : 0.00;

        $market            = Market::findOrFail($marketId);
        $market->volume    = $totalVolume;
        $market->yes_share = round($yesSharePercentage, 2);
        $market->no_share  = round($noSharePercentage, 2);
        $market->save();
    }

}
