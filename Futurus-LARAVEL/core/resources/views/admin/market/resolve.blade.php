@extends('admin.layouts.app')

@section('panel')
    <form action="{{ route('admin.market.resolve.store', $market->id) }}" method="POST" id="resolveForm">
        @csrf
        <input type="hidden" name="profit_loss" id="profit_loss">
        <div class="row mb-none-30">
            <div class="col-lg-12 col-xl-4 col-md-12 mb-30">
                <div class="card mb-4">
                    <div class="card-header">
                        <h5>@lang('Market Details')</h5>
                    </div>
                    <div class="card-body">


                        <ul class="list-group">
                            <li class="list-group-item d-flex justify-content-between align-items-center flex-wrap gap-2">
                                <span>@lang('Category')</span>
                                <span class="fw-bold">{{ __($market?->category?->name ?? '') }}</span>
                            </li>
                            @if ($market->subcategory_id)
                                <li class="list-group-item d-flex justify-content-between align-items-center flex-wrap gap-2">
                                    <span>@lang('Subcategory')</span>
                                    <span class="fw-bold">{{ __($market?->subcategory?->name ?? '') }}</span>
                                </li>
                            @endif
                            <li class="list-group-item d-flex justify-content-between align-items-center flex-wrap gap-2">
                                <span>@lang('Title')</span>
                                <span class="fw-bold">{{ __($market->question ?? '') }}</span>
                            </li>
                            <li class="list-group-item d-flex justify-content-between align-items-center flex-wrap gap-2">
                                <span>@lang('Total Volume')</span>
                                <span class="fw-bold">{{ gs('cur_sym') }}{{ number_shorten($market->volume) }} @lang('Vol')</span>
                            </li>
                            <li class="list-group-item d-flex justify-content-between align-items-center flex-wrap gap-2">
                                <span>@lang('Started At')</span>
                                <span class="fw-bold">{{ showDateTime($market->start_date, 'Y-m-d h:i A') }}</span>
                            </li>
                            <li class="list-group-item d-flex justify-content-between align-items-center flex-wrap gap-2">
                                <span>@lang('Ended At')</span>
                                <span class="fw-bold">{{ showDateTime($market->end_date, 'Y-m-d h:i A') }}</span>
                            </li>
                            <li class="list-group-item d-flex justify-content-between align-items-center flex-wrap gap-2">
                                <span>@lang('Status')</span>
                                @php
                                    echo $market->statusBadge;
                                @endphp
                            </li>
                        </ul>
                    </div>
                </div>

                <div class="card">
                    <div class="card-header ">
                        <h5>@lang('Market Summary')</h5>
                    </div>
                    <div class="card-body">
                        <ul class="list-group">
                            <li class="list-group-item d-flex justify-content-between align-items-center">
                                @lang('Total Invested Volume')
                                <span class="fw-bold">{{ showAmount($totalInvested) }}</span>
                            </li>
                            <li class="list-group-item d-flex justify-content-between align-items-center">
                                @lang('Participants')
                                <span class="fw-bold">{{ $totalParticipants }}</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
            <div class="col-lg-12 col-xl-8 col-md-12 mb-30">
                <div class="card">
                    <div class="card-header">
                        <h5 class="card-title mb-0"><i class="las la-check-circle"></i> @lang('Select the Winning Outcome')</h5>
                        <small class="text-muted">@lang('Choose the outcome to settle all purchases. This action is irreversible.')</small>
                    </div>
                    <div class="card-body">
                        <div class="row gy-4">
                            @if ($market->type == Status::SINGLE_MARKET && !empty($optionsData))
                                <input type="hidden" name="market_option_id" value="{{ $optionsData['yes']['id'] }}">
                                @php
                                    $yesProfit = $totalInvested - $optionsData['yes']['potential_payout'];
                                @endphp

                                <div class="col-xxl-6">
                                    <label for="resolve_yes" class="w-100" for="resolve_yes">
                                        <div class="card resolve-option-card single-option">
                                            <div class="card-body">
                                                <div class="option-details">
                                                    <div class="form-check">
                                                        <input class="form-check-input" type="radio"
                                                               name="winning_outcome" id="resolve_yes" value="yes" required
                                                               data-label="Yes" data-profit="{{ $yesProfit }}">
                                                        <div class="form-check-label">
                                                            <h5 class="mb-1 text--primary">@lang('Declare YES as Winner')</h5>
                                                            <small class="text-muted">@lang('Select to mark this option as the winner')</small>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="payout-summary-card">
                                                    <div class="summary-item">
                                                        <small
                                                               class="text-muted">@lang('Total Payout')</small>
                                                        <h6 class="mb-0">
                                                            {{ showAmount($optionsData['yes']['potential_payout']) }}
                                                        </h6>
                                                    </div>
                                                    <div class="summary-item profit-summary">
                                                        <small
                                                               class="text-muted">@lang('Profit/Loss')</small>
                                                        <h6 class="mb-0 @if ($yesProfit >= 0) text--success @else text--danger @endif">
                                                            @if ($yesProfit >= 0)
                                                                +
                                                            @endif{{ showAmount($yesProfit) }}
                                                        </h6>
                                                    </div>
                                                </div>
                                                <div class="row g-3">
                                                    <div class="col-12">
                                                        <div class="bet-summary">
                                                            <div class="bet-header">
                                                                <h6 class="mb-2 text--dark"><i
                                                                       class="las la-thumbs-up"></i> @lang('YES Share')
                                                                </h6>
                                                            </div>
                                                            <div class="bet-stats">
                                                                <div class="stat-row">
                                                                    <span class="stat-label">@lang('Purchased'):</span>
                                                                    <span
                                                                          class="stat-value">{{ showAmount($optionsData['yes']['total_wagered']) }}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </label>
                                </div>
                                {{-- NO OPTION --}}
                                @php
                                    $noProfit = $totalInvested - $optionsData['no']['potential_payout'];
                                @endphp
                                <div class="col-xxl-6">
                                    <label for="resolve_no" class="w-100">
                                        <div class="card resolve-option-card single-option">
                                            <div class="card-body">
                                                <div class="option-details">
                                                    <div class="form-check">
                                                        <input class="form-check-input" type="radio"
                                                               name="winning_outcome" id="resolve_no" value="no" required
                                                               data-label="No" data-profit="{{ $noProfit }}">
                                                        <div class="form-check-label">
                                                            <h5 class="mb-1 text--primary">@lang('Declare NO as Winner')</h5>
                                                            <small class="text-muted">@lang('Select to mark this option as the winner')</small>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="payout-summary-card">
                                                    <div class="summary-item">
                                                        <small
                                                               class="text-muted">@lang('Total Payout')</small>
                                                        <h6 class="mb-0">
                                                            {{ showAmount($optionsData['no']['potential_payout']) }}
                                                        </h6>
                                                    </div>
                                                    <div class="summary-item profit-summary">
                                                        <small
                                                               class="text-muted">@lang('Profit/Loss')</small>
                                                        <h6 class="mb-0 @if ($noProfit >= 0) text--success @else text--danger @endif">
                                                            @if ($noProfit >= 0)
                                                                +
                                                            @endif{{ showAmount($noProfit) }}
                                                        </h6>
                                                    </div>
                                                </div>
                                                <div class="row g-3">
                                                    <div class="col-12">
                                                        <div class="bet-summary">
                                                            <div class="bet-header">
                                                                <h6 class="mb-2 text--dark"><i
                                                                       class="las la-thumbs-up"></i> @lang('No Share')
                                                                </h6>
                                                            </div>
                                                            <div class="bet-stats">
                                                                <div class="stat-row">
                                                                    <span class="stat-label">@lang('Purchased'):</span>
                                                                    <span
                                                                          class="stat-value">{{ showAmount($optionsData['no']['total_wagered']) }}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </label>
                                </div>
                            @elseif($market->type == Status::MULTI_MARKET)
                                @foreach ($optionsData as $option)
                                    @php
                                        $totalProfit = $totalInvested - $option['total_payout_if_winner'];
                                    @endphp
                                    <div class="col-xxl-6">
                                        <div class="card resolve-option-card multi-option">
                                            <div class="card-body">
                                                <label class="w-100" for="resolve_option_{{ $option['id'] }}">
                                                    <div class="option-details">
                                                        <div class="form-check">
                                                            <input class="form-check-input" type="radio"
                                                                   name="winning_option_id"
                                                                   id="resolve_option_{{ $option['id'] }}"
                                                                   value="{{ $option['id'] }}" required
                                                                   data-label="{{ __($option['label']) }}"
                                                                   data-profit="{{ $totalProfit }}">
                                                            <div class="form-check-label">
                                                                <h5 class="mb-1 text--primary">{{ __($option['label']) }}</h5>
                                                                <small class="text-muted">@lang('Select to mark this option as the winner')</small>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div class="payout-summary-card">
                                                        <div class="summary-item">
                                                            <small
                                                                   class="text-muted">@lang('Total Payout')</small>
                                                            <h6 class="mb-0">
                                                                {{ showAmount($option['total_payout_if_winner']) }}
                                                            </h6>
                                                        </div>
                                                        <div class="summary-item profit-summary">
                                                            <small
                                                                   class="text-muted">@lang('Profit/Loss')</small>
                                                            <h6
                                                                class="mb-0 @if ($totalProfit >= 0) text--success @else text--danger @endif">
                                                                @if ($totalProfit >= 0)
                                                                    +
                                                                @endif
                                                                {{ showAmount($totalProfit) }}
                                                            </h6>
                                                        </div>
                                                    </div>

                                                    <div class="row g-3">
                                                        <div class="col-sm-6">
                                                            <div class="bet-summary">
                                                                <div class="bet-header">
                                                                    <h6 class="mb-2 text--dark"><i
                                                                           class="las la-thumbs-up"></i> @lang('YES Share')
                                                                    </h6>
                                                                </div>
                                                                <div class="bet-stats">
                                                                    <div class="stat-row">
                                                                        <span class="stat-label">@lang('Purchased'):</span>
                                                                        <span
                                                                              class="stat-value">{{ showAmount($option['yes_wagered']) }}</span>
                                                                    </div>
                                                                    <div class="stat-row">
                                                                        <span class="stat-label">@lang('Payout'):</span>
                                                                        <span
                                                                              class="stat-value">{{ showAmount($option['yes_payout']) }}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div class="col-sm-6">
                                                            <div class="bet-summary">
                                                                <div class="bet-header">
                                                                    <h6 class="mb-2 text--dark"><i
                                                                           class="las la-thumbs-down"></i> @lang('NO Share')
                                                                    </h6>
                                                                </div>
                                                                <div class="bet-stats">
                                                                    <div class="stat-row">
                                                                        <span class="stat-label">@lang('Purchased'):</span>
                                                                        <span
                                                                              class="stat-value">{{ showAmount($option['no_wagered']) }}</span>
                                                                    </div>
                                                                    <div class="stat-row">
                                                                        <span class="stat-label">@lang('Payout'):</span>
                                                                        <span
                                                                              class="stat-value">{{ showAmount($option['no_payout']) }}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                @endforeach
                            @else
                                <div class="col-12">
                                    <div class="alert alert-warning" role="alert">
                                        <i class="las la-exclamation-triangle"></i> @lang('This market has no valid options to resolve.')
                                    </div>
                                </div>
                            @endif
                        </div>
                    </div>
                    <div class="card-footer">
                        <button type="button" class="btn btn--primary w-100 h-45"
                                data-action="{{ route('admin.market.status', $market->id) }}"
                                data-question="@lang('Are you sure to disable this market?')" id="resolveBtn" disabled>
                            <i class="las la-check-double"></i> @lang('Confirm & Resolve Market')
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </form>

    <div class="modal fade" id="confirmationModal" tabindex="-1" role="dialog" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered" role="document">
            <div class="modal-content">
                <div class="modal-body p-md-5">
                    <h5 class="alert-title">@lang('Confirm Alert!')</h5>
                    <p class="alert-desc">@lang('Are you sure to declare the result as') <span class="result-text"></span></p>
                    <div class="note-alert text-start mb-4 mt-2">
                        <span class="note-alert-title">
                            <i class="fa-solid fa-triangle-exclamation"></i>
                            @lang('Warning')
                        </span>
                        <p class="note-alert-desc">
                            @lang('Once the result is declared, all users will receive their payments. After this action, the result cannot be changed or updated. Please double-check before confirming.')
                        </p>
                    </div>
                    <div class="d-flex align-items-center justify-content-end gap-3 mt-4">
                        <button type="button" class="btn btn--dark btn-sm" data-bs-dismiss="modal">
                            <i class="las la-times"></i> @lang('Cancel')
                        </button>
                        <button type="button" class="btn btn--primary btn-sm" id="confirmSubmitBtn">
                            <i class="las la-check"></i> @lang('Confirm')
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
@endsection

@push('style')
    <style>
        .result-text {
            color: #000;
        }

        .alert-title {
            margin-bottom: 12px;
            font-weight: 600;
            color: #000;
        }

        .alert-desc {
            font-weight: 600;
            color: #000;
            text-align: left;
        }

        .note-alert {
            background: #ffe9d9;
            padding: 6px;
            padding-left: 12px;
            border-left: 4px solid #be5033;
        }

        span.note-alert-title {
            color: #771505;
            font-size: 1rem;
            font-weight: 700;
        }

        .note-alert-desc {
            color: #be5033;
            font-weight: 500;
        }

        .resolve-option-card {
            border: 1px solid #e9ecef;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            cursor: pointer;
            position: relative;
            overflow: hidden;

            hr {
                border-color: #d5d5d5;
            }
        }

        .resolve-option-card:hover {
            border-color: #4634ff;
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
        }

        .resolve-option-card.selected {
            border-color: var(--bs-primary);
            box-shadow: 0 0 0 0.2rem rgba(var(--primary-rgb), 0.25);
            transform: translateY(-2px);
        }


        .resolve-option-card.single-option .form-check-input {
            width: 1.5em;
            height: 1.5em;
        }

        .stats-box {
            background: #f8f9fa;
            border-radius: 8px;
            padding: 1rem;
            border: 1px solid #e9ecef;
        }

        .stat-item {
            text-align: center;
            padding: 0.5rem 0;
            border-bottom: 1px solid #e9ecef;
        }

        .stat-item:last-child {
            border-bottom: none;
        }

        .stat-item h6 {
            font-weight: 600;
            font-size: 1.1rem;
            margin-top: 0.25rem;
        }

        /* Multi Option Styles */

        .form-check {
            display: flex;
        }

        .resolve-option-card.single-option .form-check-input {
            width: 1.75em;
            height: 1.75em;
            margin-top: 0.25rem;
            margin-right: 1rem;
            flex-shrink: 0;
        }

        .resolve-option-card.multi-option .form-check-input {
            width: 1.75em;
            height: 1.75em;
            margin-top: 0.25rem;
            margin-right: 1rem;
            flex-shrink: 0;
        }

        .payout-summary-card {
            background: rgba(0, 0, 0, 0.03);
            border-radius: 4px;
            padding: 1rem;
            margin-block: 12px;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        .summary-item {
            text-align: center;
            border-radius: 6px;
            transition: all 0.2s ease;
        }

        .summary-item.impact-indicator {
            display: flex;
            align-items: center;
            justify-content: center;
            border: none;
        }

        .summary-item h6 {
            font-weight: 600;
            font-size: 1rem;
            margin-top: 0.25rem;
        }

        .bet-summary {
            background: rgba(0, 0, 0, 0.03);
            border-radius: 8px;
            padding: 1rem;
            transition: all 0.2s ease;
        }

        .stat-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 0.5rem;
            font-size: 0.875rem;
            flex-direction: column;
        }

        .stat-row:last-child {
            margin-bottom: 0;
        }

        .stat-label {
            font-size: 0.75rem;
            color: rgb(0, 0, 0, 70%);
        }

        .text--dark {
            color: rgb(0, 0, 0, 90%);
        }

        .stat-value {
            font-weight: 600;
            color: rgb(0, 0, 0, 80%);
        }

        /* Responsive Design */
        @media (max-width: 768px) {
            .resolve-option-card.single-option .card-header {
                padding: 0.75rem;
            }

            .resolve-option-card.single-option .card-header h6 {
                font-size: 0.9rem;
            }

            .stats-box {
                padding: 0.75rem;
            }

            .stat-item {
                padding: 0.375rem 0;
            }

            .payout-summary-card {
                padding: 0.75rem;
                margin-top: 1rem;
            }

            .bet-summary {
                padding: 0.75rem;
            }
        }

        @media (max-width: 576px) {
            .summary-item {
                margin-bottom: 0.5rem;
            }

            .summary-item:last-child {
                margin-bottom: 0;
            }

            .summary-item h6 {
                font-size: .8rem;
            }
        }
    </style>
@endpush

@push('script')
    <script>
        (function($) {
            "use strict";

            const $resolveBtn = $('#resolveBtn');
            const $confirmationModal = $('#confirmationModal');
            const $resolveForm = $('#resolveForm');
            const $radioButtons = $(
                'input[type="radio"][name="winning_outcome"], input[type="radio"][name="winning_option_id"]');

            $radioButtons.on('change', function() {
                $('.resolve-option-card').removeClass('selected');

                if ($(this).is(':checked')) {
                    $(this).closest('.resolve-option-card').addClass('selected');
                    $resolveBtn.prop('disabled', false);
                }
            });

            $resolveBtn.on('click', function() {
                let selectedRadio = $radioButtons.filter(':checked');
                if (selectedRadio.length) {
                    let selectedLabel = selectedRadio.data('label');
                    $('.result-text').text(` - ${selectedLabel}`);
                    $confirmationModal.modal('show');
                } else {
                    notify('error', 'Please select a winning outcome first.');
                }
            });

            $('#confirmSubmitBtn').on('click', function() {
                let selectedRadio = $radioButtons.filter(':checked');
                if (selectedRadio.length) {
                    let profitValue = selectedRadio.data('profit');
                    $('#profit_loss').val(profitValue);
                }
                $(this).prop('disabled', true);
                $('#resolveForm').submit();
            });

        })(jQuery);
    </script>
@endpush
