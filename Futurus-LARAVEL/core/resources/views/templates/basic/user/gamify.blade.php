@extends('Template::layouts.master')
@section('content')
    <div class="dashboard-inner">
        <div class="row gy-3">
            <div class="col-12">
                <div class="card custom--card h-100">
                    <div class="card-body p-4 p-xl-5">
                        <div class="row align-items-center">
                            <div class="col-lg-8">
                                <h2 class="mb-2">@lang('Game Center')</h2>
                                <p class="mb-4 text--secondary">@lang('Complete tasks, earn coins, and unlock rewards to boost your performance in the markets.')</p>
                                <div class="d-flex flex-wrap gap-3">
                                    <div class="stat-badge d-flex align-items-center gap-2 bg--base-light p-2 px-3 rounded-pill text--base border border--base">
                                        <i class="las la-coins fs-4"></i>
                                        <span class="fw-bold">{{ $data['coinBalance'] }} @lang('Coins')</span>
                                    </div>
                                    <div class="stat-badge d-flex align-items-center gap-2 bg--success-light p-2 px-3 rounded-pill text--success border border--success">
                                        <i class="las la-check-circle fs-4"></i>
                                        <span class="fw-bold">{{ $data['completedTasks'] }}/{{ $data['totalTasks'] }} @lang('Tasks Done')</span>
                                    </div>
                                    <div class="stat-badge d-flex align-items-center gap-2 bg--info-light p-2 px-3 rounded-pill text--info border border--info">
                                        <i class="las la-users fs-4"></i>
                                        <span class="fw-bold">{{ $data['referralCount'] }} @lang('Referrals')</span>
                                    </div>
                                </div>
                            </div>
                            <div class="col-lg-4 d-none d-lg-block text-end">
                                <i class="las la-trophy text--base" style="font-size: 120px; opacity: 0.2;"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Referral Card -->
            <div class="col-lg-6">
                <div class="card custom--card h-100">
                    <div class="card-header">
                        <h5 class="card-title mb-0"><i class="las la-share-alt text--base me-2"></i>@lang('Invite & Earn')</h5>
                    </div>
                    <div class="card-body">
                        <p>@lang('Invite your friends and earn bonus coins when they join and complete their first task!')</p>
                        <div class="referral-box mt-4">
                            <label class="form-label">@lang('Your Referral Link')</label>
                            <div class="input-group">
                                <input type="text" class="form-control" id="referralLink" value="{{ route('home') }}?reference={{ $user->username }}" readonly>
                                <button class="input-group-text bg--base text-white border--base copytext" data-copy="referralLink">
                                    <i class="las la-copy"></i>
                                </button>
                            </div>
                        </div>
                        <div class="referral-code-box mt-3 text-center p-3 bg-light rounded border">
                            <p class="mb-1 small text-muted">@lang('Referral Code')</p>
                            <h3 class="letter-spacing-5 text--base mb-0">{{ $data['referralCode'] }}</h3>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Stats Overvew -->
            <div class="col-lg-6">
                <div class="card custom--card h-100">
                    <div class="card-header">
                        <h5 class="card-title mb-0"><i class="las la-chart-bar text--base me-2"></i>@lang('Progress Summary')</h5>
                    </div>
                    <div class="card-body">
                        <div class="row g-3">
                            <div class="col-6">
                                <div class="bg-light p-3 rounded border text-center">
                                    <h4 class="mb-0">{{ $data['totalCoinsEarned'] }}</h4>
                                    <p class="small text-muted mb-0">@lang('Total Earned')</p>
                                </div>
                            </div>
                            <div class="col-6">
                                <div class="bg-light p-3 rounded border text-center">
                                    <h4 class="mb-0">{{ $data['referralCount'] }}</h4>
                                    <p class="small text-muted mb-0">@lang('Total Indications')</p>
                                </div>
                            </div>
                            <div class="col-12 mt-4">
                                <label class="d-flex justify-content-between">
                                    <span>@lang('Tasks Completion')</span>
                                    <span>{{ round(($data['completedTasks'] / max(1, $data['totalTasks'])) * 100) }}%</span>
                                </label>
                                <div class="progress mt-2" style="height: 10px;">
                                    <div class="progress-bar bg--base" role="progressbar" style="width: {{ ($data['completedTasks'] / max(1, $data['totalTasks'])) * 100 }}%"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Tasks List -->
            <div class="col-12">
                <h4 class="mt-4 mb-3">@lang('Available Tasks')</h4>
                <div class="row g-3">
                    @foreach($data['tasks'] as $task)
                        <div class="col-md-6 col-xl-4">
                            <div class="card task-card h-100 border">
                                <div class="card-body">
                                    <div class="d-flex align-items-center mb-3">
                                        <div class="task-icon bg--base-light text--base rounded p-3 me-3">
                                            <i class="{{ $task['icon'] }} fs-3"></i>
                                        </div>
                                        <div>
                                            <h5 class="mb-0">{{ __($task['name']) }}</h5>
                                            <span class="badge bg--success">+{{ $task['reward'] }} @lang('Coins')</span>
                                        </div>
                                    </div>
                                    <p class="small text--secondary">{{ __($task['description']) }}</p>
                                    <a href="{{ $task['url'] }}" target="_blank" class="btn btn-outline--base btn--sm w-100 mt-3">
                                        @lang('Go to Task') <i class="las la-external-link-alt ms-1"></i>
                                    </a>
                                </div>
                            </div>
                        </div>
                    @endforeach
                </div>
            </div>
        </div>
    </div>
@endsection

@push('style')
<style>
    .letter-spacing-5 {
        letter-spacing: 5px;
    }
    .bg--base-light {
        background-color: rgba(99, 102, 241, 0.1) !important;
    }
    .bg--success-light {
        background-color: rgba(40, 167, 69, 0.1) !important;
    }
    .bg--info-light {
        background-color: rgba(23, 162, 184, 0.1) !important;
    }
    .task-card {
        transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
    .task-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 20px rgba(0,0,0,0.1);
    }
    .copytext {
        cursor: pointer;
    }
</style>
@endpush

@push('script')
<script>
    (function ($) {
        "use strict";
        $('.copytext').on('click', function () {
            var copyText = document.getElementById($(this).data('copy'));
            copyText.select();
            copyText.setSelectionRange(0, 99999);
            document.execCommand("copy");
            notify('success', 'Copied to clipboard: ' + copyText.value);
        });
    })(jQuery);
</script>
@endpush
