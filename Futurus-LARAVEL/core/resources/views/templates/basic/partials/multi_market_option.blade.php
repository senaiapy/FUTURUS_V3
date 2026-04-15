<div class="market-card border-0 bg-transparent shadow-none w-100">
    <div class="market-card__body">
        <div class="market-card-list p-0">
            @foreach ($market?->activeMarketOptions as $option)
                <div class="market-card-list-item style-two">
                    <span class="title">{{ __($option->question) }}</span>
                    <span class="flex-align gap-2">
                        <button
                                class="btn btn-alt--success market-buy-btn @if ($option->isLocked()) disabled @endif"
                                data-option-id="{{ encrypt($option->id) }}" data-type="yes">
                            @lang('Buy Yes')
                        </button>
                        <button
                                class="btn btn-alt--danger market-buy-btn @if ($option->isLocked()) disabled @endif"
                                data-option-id="{{ encrypt($option->id) }}" data-type="no">
                            @lang('Buy No')
                        </button>
                    </span>
                </div>
            @endforeach
        </div>
    </div>
</div>
