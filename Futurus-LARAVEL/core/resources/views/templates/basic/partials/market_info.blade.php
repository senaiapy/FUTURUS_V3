<div class="market-details-info">
    <div class="market-details-info-header">
        <div class="market-details-info-card">
            <span class="thumb">
                <img class="fit-image"
                     src="{{ getImage(getFilePath('marketOption') . '/' . $option->image, getFileSize('marketOption'), option: true) }}"
                     alt="market-details-info">
            </span>
            <h3 class="title"> {{ __($option->question) }} </h3>
        </div>
    </div>
    <div class="market-details-info-body">
        <form action="{{ route('user.market.buy', $market->id) }}" method="POST">
            @csrf
            <div class="market-details-info-block">
                <div class="flex-between gap-2">
                    <p class="title d-lg-none text--dark fw-semibold">
                        {{ __($option->question) }}
                    </p>
                </div>

                <div class="flex-align gap-2">
                    <label
                           class="btn btn-outline--success flex-fill option-btn {{ !isset($selectedType) || $selectedType == 'yes' ? 'active' : '' }}"
                           for="buy-yes-radio">
                        <input type="radio" name="buy_option" value="yes" hidden class="radio-input"
                               id="buy-yes-radio" data-type="yes"
                               {{ !isset($selectedType) || $selectedType == 'yes' ? 'checked' : '' }}>
                        @lang('Buy Yes')
                    </label>

                    <label
                           class="btn btn-outline--danger flex-fill option-btn {{ isset($selectedType) && $selectedType == 'no' ? 'active' : '' }}"
                           for="buy-no-radio">
                        <input type="radio" name="buy_option" value="no" hidden class="radio-input"
                               id="buy-no-radio" data-type="no"
                               {{ isset($selectedType) && $selectedType == 'no' ? 'checked' : '' }}>
                        @lang('Buy No')
                    </label>
                </div>
            </div>
            <div class="market-details-info-block">
                <span class="info-share-title ">@lang('Share')</span>
                <div class="market-details-info-share">
                    <input type="number" id="share-input" name="shares" autocomplete="off"
                           data-option-id="{{ encrypt($option->id) }}">
                    <input type="hidden" name="option_id" value="{{ $option->id }}">
                    <span class="btn-inner">
                        <span class="increase-btn">
                            <i class="fa-solid fa-chevron-up"></i>
                        </span>
                        <span class="decrease-btn">
                            <i class="fa-solid fa-chevron-down"></i>
                        </span>
                    </span>
                </div>
            </div>
            <div class="market-details-info-block d-lg-block">
                <div class="market-details-info-list">
                    <div
                         class="market-details-info-item price-row yes-price-row {{ !isset($selectedType) || $selectedType == 'yes' ? '' : 'd-none' }}">
                        <span class="label">@lang('Price')</span>
                        <span
                              class="value">{{ gs('cur_sym') }}{{ showAmount($calculations['yes_share_price'], currencyFormat: false) }}</span>
                    </div>

                    <div
                         class="market-details-info-item price-row no-price-row {{ isset($selectedType) && $selectedType == 'no' ? '' : 'd-none' }}">
                        <span class="label">@lang('Price')</span>
                        <span
                              class="value">{{ gs('cur_sym') }}{{ showAmount($calculations['no_share_price'], currencyFormat: false) }}</span>
                    </div>
                    <div class="market-details-info-item total-amount-row">
                        <span class="label">@lang('Purchase Amount')</span>
                        <span class="value">{{ gs('cur_sym') }}<span class="total-amount">0.00</span></span>
                    </div>
                    <div class="market-details-info-item">
                        <span class="label">@lang('Payout if') <span class="fw-bold yes-no">@lang('Yes')</span>
                            @lang('wins')</span>
                        <span class="value">
                            {{ gs('cur_sym') }}<span
                                  class="payout-amount">{{ showAmount($calculations['yes_payout_if_win'], currencyFormat: false) }}</span>
                            <span class="text--base fs-12">(@lang('Profit') +{{ gs('cur_sym') }}<span
                                      class="profit-amount">{{ showAmount($calculations['yes_profit_if_win'], currencyFormat: false) }}</span>)</span>
                        </span>
                    </div>
                </div>
            </div>

            @if ($option->isLocked())
                <button type="button" class="btn btn--base w-100" disabled>
                    <span class="icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                             fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                             stroke-linejoin="round">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                        </svg>
                    </span>
                    @lang('Option is Locked')
                </button>
            @elseif($option->market->isLOcked())
                <button type="button" class="btn btn--base w-100" disabled>
                    <span class="icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                             fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                             stroke-linejoin="round">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                        </svg>
                    </span>
                    @lang('Market is Locked')
                </button>
            @else
                <button type="submit" class="btn btn--base w-100 ">@lang('Buy')</button>
            @endif
        </form>
    </div>
</div>
