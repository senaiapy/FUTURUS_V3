@extends('Template::layouts.master')
@section('content')
    <div class="dashboard-inner">
        <div class="row">
            <div class="col-md-12">
                <div class="text-end mb-3 d-flex flex-wrap justify-content-between gap-1">
                    <h3>{{ __($pageTitle) }}</h3>

                    <form class="dashboard-search-form">
                        <div class="custom-search">
                            <input type="search" name="search" placeholder="@lang('Search..')" value="{{ request()->search }}">
                            <button class="search-btn btn" type="submit">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24"
                                     height="24" color="currentColor" fill="none">
                                    <path d="M17 17L21 21" stroke="currentColor" stroke-width="1.5"
                                          stroke-linecap="round" stroke-linejoin="round" />
                                    <path
                                          d="M19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19C15.4183 19 19 15.4183 19 11Z"
                                          stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
                                          stroke-linejoin="round" />
                                </svg>
                            </button>

                        </div>
                    </form>
                </div>
                <div class="card">
                    @if (!blank($purchases))
                        <div class="card-body p-0">
                            <div class="table-responsive">
                                <table class="table table--responsive--md">
                                    <thead>
                                        <tr>
                                            <th>@lang('Market')</th>
                                            <th>@lang('Option')</th>
                                            <th>@lang('Share')</th>
                                            <th>@lang('Amount')</th>
                                            <th>@lang('Win')</th>
                                            <th>@lang('Status')</th>
                                            <th>@lang('Action')</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        @forelse($purchases as $purchase)
                                            <tr>
                                                <td>
                                                    <div>
                                                        <p class="fw-semibold fs-14">{{ __($purchase?->market?->question) }}
                                                        </p>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div>
                                                        <p class="fw-semibold fs-14">{{ __($purchase?->option?->question) }}</p>
                                                    </div>
                                                </td>

                                                <td>
                                                    <div>
                                                        <p class="fw-semibold fs-14">{{ ucfirst($purchase->type) }}</p>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div>
                                                        <p class="fw-semibold fs-14">{{ gs('cur_sym') }}{{ showAmount($purchase->amount, currencyFormat: false) }}</p>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div>
                                                        <p class="fw-semibold fs-14">{{ gs('cur_sym') }}{{ showAmount($purchase->win_amount, currencyFormat: false) }}</p>
                                                    </div>
                                                </td>
                                                <td>
                                                    @php echo $purchase->statusBadge @endphp
                                                </td>
                                                <td>
                                                    <button type="button" class="btn btn--base btn--sm detailBtn" data-purchase="{{ $purchase }}">
                                                        <i class="las la-desktop"></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        @empty
                                            <tr>
                                                <td colspan="100%">
                                                    @include('Template::partials.empty', [
                                                        'message' => 'No purchase history found',
                                                    ])
                                                </td>
                                            </tr>
                                        @endforelse
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    @else
                        <div class="card-body text-center">
                            <h4 class="text--muted"><i class="far fa-frown"></i> {{ __($emptyMessage) }}</h4>
                        </div>
                    @endif
                </div>
                @if ($purchases->hasPages())
                    <div class="custom--pagination">
                        {{ paginateLinks($purchases) }}
                    </div>
                @endif
            </div>
        </div>
    </div>


    <div class="modal custom--modal fade" id="detailModal" role="dialog" tabindex="-1">
        <div class="modal-dialog  modal-dialog-centered" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">@lang('Purchase Details')</h5>
                    <span type="button" class="close" data-bs-dismiss="modal" aria-label="Close">
                        <i class="las la-times"></i>
                    </span>
                </div>
                <div class="modal-body">
                    <ul class="list-group list-group-flush">
                        <li class="list-group-item d-flex justify-content-between align-items-center flex-wrap gap-2">
                            @lang('Market')
                            <span class="fw-bold market-question"></span>
                        </li>
                        <li class="list-group-item d-flex justify-content-between align-items-center flex-wrap gap-2">
                            @lang('Option')
                            <span class="fw-bold option-question"></span>
                        </li>
                        <li class="list-group-item d-flex justify-content-between align-items-center flex-wrap gap-2">
                            @lang('Share Type')
                            <span class="fw-bold share-type"></span>
                        </li>
                        <li class="list-group-item d-flex justify-content-between align-items-center flex-wrap gap-2">
                            @lang('Total Shares')
                            <span class="fw-bold total-share"></span>
                        </li>
                        <li class="list-group-item d-flex justify-content-between align-items-center flex-wrap gap-2">
                            @lang('Invested Amount')
                            <span class="fw-bold amount"></span>
                        </li>
                        <li class="list-group-item d-flex justify-content-between align-items-center flex-wrap gap-2">
                            @lang('Winning Amount')
                            <span class="fw-bold win-amount"></span>
                        </li>
                        <li class="list-group-item d-flex justify-content-between align-items-center flex-wrap gap-2">
                            @lang('Profit/Loss')
                            <span class="fw-bold profit"></span>
                        </li>
                        <li class="list-group-item d-flex justify-content-between align-items-center flex-wrap gap-2">
                            @lang('Transaction ID')
                            <span class="fw-bold trx"></span>
                        </li>
                        <li class="list-group-item d-flex justify-content-between align-items-center flex-wrap gap-2">
                            @lang('Purchased At')
                            <span class="fw-bold purchased_at"></span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
@endsection
@push('script')
    <script>
        (function($) {
            "use strict";


            $('.detailBtn').on('click', function() {
                let modal = $('#detailModal');
                let purchase = $(this).data('purchase');
                let currency = "{{ gs('cur_sym') }}";

                modal.find('.trx').text(purchase.trx);
                modal.find('.market-question').text(purchase.market?.question ?? '');
                modal.find('.option-question').text(purchase.option?.question ?? '');
                modal.find('.share-type').text(purchase.type.charAt(0).toUpperCase() + purchase.type.slice(1) + ' Share');
                modal.find('.total-share').text(purchase.total_share);
                modal.find('.amount').text(currency + parseFloat(purchase.amount).toFixed(2));
                modal.find('.win-amount').text(currency + parseFloat(purchase.win_amount).toFixed(2));
                modal.find('.profit').text(currency + parseFloat(purchase.profit).toFixed(2));

                let date = new Date(purchase.created_at);
                let formattedDate = date.getFullYear() + '-' +
                    String(date.getMonth() + 1).padStart(2, '0') + '-' +
                    String(date.getDate()).padStart(2, '0') + ' ' +
                    String(date.getHours()).padStart(2, '0') + ':' +
                    String(date.getMinutes()).padStart(2, '0') + ' ' +
                    (date.getHours() >= 12 ? 'PM' : 'AM');

                modal.find('.purchased_at').text(formattedDate);

                modal.modal('show');
            });

        })(jQuery);
    </script>
@endpush
