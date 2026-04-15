@extends('Template::layouts.master')
@section('content')
    @php
        $kyc = getContent('kyc.content', true);
    @endphp

    <div class="dashboard-inner">

        <div class="notice"></div>

        @if ($user->kv == Status::KYC_UNVERIFIED && $user->kyc_rejection_reason)
            <div class="alert border border--danger" role="alert">
                <div class="alert__icon d-flex align-items-center text--danger"><i class="fas fa-times-circle"></i>
                </div>
                <p class="alert__message">
                    <span class="fw-bold">@lang('KYC Documents Rejected')</span><br>
                    <small>
                        {{ __($kyc?->data_values?->reject ?? '') }}
                        <a href="javascript::void(0)" class="link-color" data-bs-toggle="modal" data-bs-target="#kycRejectionReason">@lang('Click here')</a> @lang('to show the reason').

                        <a href="{{ route('user.kyc.form') }}" class="link-color">@lang('Click Here')</a> @lang('to Re-submit Documents').
                        <a href="{{ route('user.kyc.data') }}" class="link-color">@lang('See KYC Data')</a>
                    </small>
                </p>
            </div>
        @elseif($user->kv == Status::KYC_UNVERIFIED)
            <div class="alert border border--info" role="alert">
                <div class="alert__icon d-flex align-items-center text--info"><i class="fas fa-exclamation-circle"></i>
                </div>
                <p class="alert__message">
                    <span class="fw-bold">@lang('KYC Verification Required')</span><br>
                    <small>{{ __($kyc?->data_values?->required ?? '') }} <a href="{{ route('user.kyc.form') }}" class="link-color">@lang('Click Here to Submit Documents')</a>
                    </small>
                </p>
            </div>
        @elseif($user->kv == Status::KYC_PENDING)
            <div class="alert border border--warning" role="alert">
                <div class="alert__icon d-flex align-items-center text--warning"><i class="las la-hourglass-half"></i>
                </div>
                <p class="alert__message">
                    <span class="fw-bold">@lang('KYC Verification Pending')</span><br>
                    <small>{{ __($kyc?->data_values?->pending ?? '') }} <a href="{{ route('user.kyc.data') }}" class="link-color">@lang('See KYC Data')</a>
                    </small>
                </p>
            </div>
        @endif

        @if ($user->balance <= 0)
            <div class="alert border border--danger" role="alert">
                <div class="alert__icon d-flex align-items-center text--danger"><i class="fas fa-exclamation-triangle"></i></div>
                <p class="alert__message">
                    <span class="fw-bold">@lang('Empty Balance')</span><br>
                    <small><i>@lang('Your balance is empty. Please make') <a href="{{ route('user.deposit.index') }}" class="link-color">@lang('deposit')</a> @lang('for your next investment.')</i></small>
                </p>
            </div>
        @endif

        @if ($user->deposits->where('status', 1)->count() == 1 && !$user->purchases->count())
            <div class="alert border border--success" role="alert">
                <div class="alert__icon d-flex align-items-center text--success"><i class="fas fa-check"></i></div>
                <p class="alert__message">
                    <span class="fw-bold">@lang('First Deposit')</span><br>
                    <small><i><span class="fw-bold">@lang('Congratulations!')</span> @lang('You\'ve made your first deposit successfully. Go to') <a href="{{ route('markets.index') }}" class="link-color">@lang('markets')</a> @lang('page and invest now')</i></small>
                </p>
            </div>
        @endif

        @if ($pendingWithdrawals)
            <div class="alert border border--primary" role="alert">
                <div class="alert__icon d-flex align-items-center text--primary"><i class="fas fa-spinner"></i></div>
                <p class="alert__message">
                    <span class="fw-bold">@lang('Withdrawal Pending')</span><br>
                    <small><i>@lang('Total') {{ showAmount($pendingWithdrawals) }} @lang('withdrawal request is pending. Please wait for admin approval. The amount will send to the account which you\'ve provided. See') <a href="{{ route('user.withdraw.history') }}" class="link-color">@lang('withdrawal history')</a></i></small>
                </p>
            </div>
        @endif

        @if ($pendingDeposits)
            <div class="alert border border--primary" role="alert">
                <div class="alert__icon d-flex align-items-center text--primary"><i class="fas fa-spinner"></i></div>
                <p class="alert__message">
                    <span class="fw-bold">@lang('Deposit Pending')</span><br>
                    <small><i>@lang('Total') {{ showAmount($pendingDeposits) }} @lang('deposit request is pending. Please wait for admin approval. See') <a href="{{ route('user.deposit.history') }}" class="link-color">@lang('deposit history')</a></i></small>
                </p>
            </div>
        @endif

        @if (!$user->ts)
            <div class="alert border border--warning" role="alert">
                <div class="alert__icon d-flex align-items-center text--warning"><i class="fas fa-user-lock"></i></div>
                <p class="alert__message">
                    <span class="fw-bold">@lang('2FA Authentication')</span><br>
                    <small><i>@lang('To keep safe your account, Please enable') <a href="{{ route('user.twofactor') }}" class="link-color">@lang('2FA')</a> @lang('security').</i> @lang('It will make secure your account and balance.')</small>
                </p>
            </div>
        @endif



        <div class="row gy-3 mt-4">
            <div class="col-lg-4">
                <div class="dashboard-widget">
                    <div class="d-flex justify-content-between">
                        <h5 class="text-secondary">@lang('Successful Deposits')</h5>
                    </div>
                    <h3 class="text--secondary my-4">{{ showAmount($successfulDeposits) }}</h3>
                    <div class="widget-lists">
                        <div class="row">
                            <div class="col-4">
                                <p class="fw-bold">@lang('Submitted')</p>
                                <span>{{ gs('cur_sym') }}{{ showAmount($submittedDeposits, currencyFormat: false) }}</span>
                            </div>
                            <div class="col-4">
                                <p class="fw-bold">@lang('Pending')</p>
                                <span>{{ gs('cur_sym') }}{{ showAmount($pendingDeposits, currencyFormat: false) }}</span>
                            </div>
                            <div class="col-4">
                                <p class="fw-bold">@lang('Rejected')</p>
                                <span>{{ gs('cur_sym') }}{{ showAmount($rejectedDeposits, currencyFormat: false) }}</span>
                            </div>
                        </div>
                        <hr>
                        <p><small><i>@lang('You\'ve requested to deposit') {{ gs('cur_sym') }}{{ showAmount($requestedDeposits, currencyFormat: false) }}. @lang('Where') {{ gs('cur_sym') }}{{ showAmount($initiatedDeposits, currencyFormat: false) }} @lang('is just initiated but not submitted.')</i></small></p>
                    </div>
                </div>
            </div>
            <div class="col-lg-4">
                <div class="dashboard-widget">
                    <div class="d-flex justify-content-between">
                        <h5 class="text-secondary">@lang('Successful Withdrawals')</h5>
                    </div>
                    <h3 class="text--secondary my-4">{{ showAmount($successfulWithdrawals) }}</h3>
                    <div class="widget-lists">
                        <div class="row">
                            <div class="col-4">
                                <p class="fw-bold">@lang('Submitted')</p>
                                <span>{{ gs('cur_sym') }}{{ showAmount($submittedWithdrawals, currencyFormat: false) }}</span>
                            </div>
                            <div class="col-4">
                                <p class="fw-bold">@lang('Pending')</p>
                                <span>{{ gs('cur_sym') }}{{ showAmount($pendingWithdrawals, currencyFormat: false) }}</span>
                            </div>
                            <div class="col-4">
                                <p class="fw-bold">@lang('Rejected')</p>
                                <span>{{ gs('cur_sym') }}{{ showAmount($rejectedWithdrawals, currencyFormat: false) }}</span>
                            </div>
                        </div>
                        <hr>
                        <p><small><i>@lang('You\'ve requested to withdraw') {{ gs('cur_sym') }}{{ showAmount($requestedWithdrawals, currencyFormat: false) }}. @lang('Where') {{ gs('cur_sym') }}{{ showAmount($initiatedWithdrawals, currencyFormat: false) }} @lang('is just initiated but not submitted.')</i></small></p>
                    </div>
                </div>
            </div>
            <div class="col-lg-4">
                <div class="dashboard-widget">
                    <div class="d-flex justify-content-between">
                        <h5 class="text-secondary">@lang('Share Purchased Amount')</h5>
                    </div>
                    <h3 class="text--secondary my-4">{{ showAmount($purchaseAmount) }}</h3>
                    <div class="widget-lists">
                        <div class="row">
                            <div class="col-4">
                                <p class="fw-bold">@lang('Profit/Loss')</p>
                                <span>{{ gs('cur_sym') }}{{ showAmount($user->total_profit, currencyFormat: false) }}</span>
                            </div>
                            <div class="col-4">
                                <p class="fw-bold">@lang('Trades')</p>
                                <span>{{ $marketTrades }}</span>
                            </div>
                            <div class="col-4">
                                <p class="fw-bold">@lang('Waiting')</p>
                                <span>{{ getAmount($waitingTrades) }}</span>
                            </div>
                        </div>
                        <hr>
                        <p><small><i>@lang('You\'ve purchased a trade worth ') {{ showAmount($waitingTradeAmount) }} @lang('and it\'s now in progress.')</i></small></p>
                    </div>
                </div>
            </div>

            <div class="col-xl-6 col-lg-6">
                <h5 class="mb-3">@lang('Recent Market')</h5>
                <div class="card">
                    <div class="card-body p-0">
                        <div class="table-responsive">
                            <table class="table table--responsive--md">
                                <thead>
                                    <tr>
                                        <th>@lang('Market')</th>
                                        <th class="text-end">@lang('Value')</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    @forelse($markets as $market)
                                        <tr>
                                            <td>
                                                <div class="recent-market">
                                                    <div class="thumb">
                                                        <img src="{{ getImage(getFilePath('market') . '/' . $market->image, getFileSize('market'), option: true) }}"
                                                             alt="image">
                                                    </div>
                                                    <div class="content">
                                                        <a href="{{ route('markets.details', $market->slug) }}" class="title">
                                                            {{ __($market->question) }}
                                                        </a>
                                                        <p class="desc">{{ __($market?->category?->name) }}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td class="text-end">
                                                <div class="flex-end">
                                                    <a href="{{ route('markets.details', $market->slug) }}" class="btn btn--xsm btn-outline--base">@lang('Details')</a>
                                                </div>
                                            </td>
                                        </tr>
                                    @empty
                                        <tr>
                                            <td colspan="100%" class="text-center">{{ __($emptyMessage) }}</td>
                                        </tr>
                                    @endforelse
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-xl-6 col-lg-12">
                <h5 class="mb-3">@lang('Recent Purchased')</h5>
                <div class="card">
                    <div class="card-body p-0">
                        <div class="table-responsive">
                            <table class="table table--responsive--md">
                                <thead>
                                    <tr>
                                        <th>@lang('Market')</th>
                                        <th class="text-end">@lang('Value')</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    @forelse($recentPurchases as $purchase)
                                        <tr>
                                            <td>
                                                <div class="recent-market recent-purchased">
                                                    <div class="thumb">
                                                        <img src="{{ getImage(getFilePath('marketOption') . '/' . $purchase?->option?->image, getFileSize('marketOption'), option: true) }}"
                                                             alt="market">
                                                    </div>
                                                    <div class="content">
                                                        <p class="title">
                                                            {{ __($purchase?->option?->question) }}
                                                        </p>
                                                        <p class="desc">@lang('Share amount'):
                                                            {{ showAmount($purchase->total_share, currencyFormat: false) }}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td class="text-end">
                                                <div>
                                                    <p class="fs-14 text--dark">
                                                        {{ gs('cur_sym') }}{{ showAmount($purchase->amount, currencyFormat: false) }}
                                                    </p>
                                                    <p class="fs-14 text--base">
                                                        {{ gs('cur_sym') }}{{ showAmount($purchase->win_amount, currencyFormat: false) }}({{ gs('cur_sym') }}{{ showAmount($purchase->profit, currencyFormat: false) }})
                                                    </p>
                                                </div>
                                            </td>
                                        </tr>
                                    @empty
                                        <tr>
                                            <td colspan="100%" class="text-center">{{ __($emptyMessage) }}</td>
                                        </tr>
                                    @endforelse
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    @if ($user->kv == Status::KYC_UNVERIFIED && $user->kyc_rejection_reason)
        <div class="modal fade" id="kycRejectionReason">
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">@lang('KYC Document Rejection Reason')</h5>
                        <button type="button" class="close" data-bs-dismiss="modal">
                            <i class="las la-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <p>{{ $user->kyc_rejection_reason }}</p>
                    </div>
                </div>
            </div>
        </div>
    @endif
@endsection
