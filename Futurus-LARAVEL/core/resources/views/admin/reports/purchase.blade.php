@extends('admin.layouts.app')

@section('panel')
    <div class="row">

        <div class="col-lg-12">
            <div class="card">
                <div class="card-body p-0">

                    <div class="table-responsive--sm table-responsive">
                        <table class="table table--light style--two">
                            <thead>
                                <tr>
                                    <th>@lang('TRX NO')</th>
                                    <th>@lang('User')</th>
                                    <th>@lang('Amount')</th>
                                    <th>@lang('Win Amount')</th>
                                    <th>@lang('Status')</th>
                                    <th>@lang('Purchased At')</th>
                                    <th>@lang('Action')</th>
                                </tr>
                            </thead>
                            <tbody>
                                @forelse($purchases as $purchase)
                                    <tr>
                                        <td>
                                            <span class="fw-bold">{{ $purchase->trx }}</span>
                                        </td>
                                        <td>
                                            <span class="fw-bold">{{ __($purchase->user?->fullname) }}</span>
                                            <br>
                                            <span class="small"> <a
                                                   href="{{ route('admin.users.detail', $purchase->user_id) }}"><span>@</span>{{ __($purchase->user?->username) }}</a>
                                            </span>
                                        </td>
                                        <td>
                                            <span>{{ showAmount($purchase->amount) }}</span>
                                        </td>
                                        <td>
                                            <span>{{ showAmount($purchase->win_amount) }}</span>
                                        </td>
                                        <td>
                                            @php echo $purchase->statusBadge @endphp
                                        </td>
                                        <td>
                                            <span>
                                                {{ showDateTime($purchase->created_at, 'd M Y h:i A') }}
                                                <br>
                                                {{ diffForHumans($purchase->created_at) }}
                                            </span>
                                        </td>
                                        <td>
                                            <button type="button" class="btn btn--sm btn-outline--primary detailBtn" data-purchase="{{ $purchase }}">
                                                <i class="las la-desktop"></i> @lang('Details')
                                            </button>
                                        </td>
                                    </tr>
                                @empty
                                    <tr>
                                        <td class="text-muted text-center" colspan="100%">{{ __($emptyMessage) }}</td>
                                    </tr>
                                @endforelse

                            </tbody>
                        </table>
                    </div>
                </div>
                @if ($purchases->hasPages())
                    <div class="card-footer py-4">
                        {{ paginateLinks($purchases) }}
                    </div>
                @endif
            </div><!-- card end -->
        </div>
    </div>

    <div class="modal fade" id="detailModal" role="dialog" tabindex="-1">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">@lang('Purchase Details')</h5>
                    <button type="button" class="close" data-bs-dismiss="modal" aria-label="Close">
                        <i class="las la-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <ul class="list-group list-group-flush">
                        <li class="list-group-item d-flex justify-content-between align-items-center">
                            @lang('Market')
                            <span class="fw-bold market-question"></span>
                        </li>
                        <li class="list-group-item d-flex justify-content-between align-items-center">
                            @lang('Option')
                            <span class="fw-bold option-question"></span>
                        </li>
                        <li class="list-group-item d-flex justify-content-between align-items-center">
                            @lang('Share Type')
                            <span class="fw-bold share-type"></span>
                        </li>
                        <li class="list-group-item d-flex justify-content-between align-items-center">
                            @lang('Total Shares')
                            <span class="fw-bold total-share"></span>
                        </li>
                        <li class="list-group-item d-flex justify-content-between align-items-center">
                            @lang('Invested Amount')
                            <span class="fw-bold amount"></span>
                        </li>
                        <li class="list-group-item d-flex justify-content-between align-items-center">
                            @lang('Winning Amount')
                            <span class="fw-bold win-amount"></span>
                        </li>
                        <li class="list-group-item d-flex justify-content-between align-items-center">
                            @lang('Profit/Loss')
                            <span class="fw-bold profit"></span>
                        </li>
                        <li class="list-group-item d-flex justify-content-between align-items-center">
                            @lang('Transaction ID')
                            <span class="fw-bold trx"></span>
                        </li>
                    </ul>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn--dark" data-bs-dismiss="modal">@lang('Close')</button>
                </div>
            </div>
        </div>
    </div>
@endsection



@push('breadcrumb-plugins')
    <x-search-form dateSearch='yes' placeholder='Username / TRX' />
@endpush


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

                modal.modal('show');
            });

        })(jQuery);
    </script>
@endpush
