@extends('admin.layouts.app')

@section('panel')
<div class="row">
    <div class="col-lg-12">
        <div class="card">
            <div class="card-header">
                <h5 class="card-title mb-0">{{ $pageTitle }}</h5>
            </div>
            <div class="card-body">
                @if($stats)
                    <div class="row">
                        <div class="col-md-3">
                            <div class="stat-card text-center">
                                <div class="stat-icon bg-primary">
                                    <i class="las la-users"></i>
                                </div>
                                <h3 class="stat-value">{{ number_format($stats['total_users']) }}</h3>
                                <p class="stat-label">Total Users</p>
                            </div>
                        </div>

                        <div class="col-md-3">
                            <div class="stat-card text-center">
                                <div class="stat-icon bg-success">
                                    <i class="las la-coins"></i>
                                </div>
                                <h3 class="stat-value">{{ number_format($stats['total_coins_earned']) }}</h3>
                                <p class="stat-label">Total Coins Earned</p>
                            </div>
                        </div>

                        <div class="col-md-3">
                            <div class="stat-card text-center">
                                <div class="stat-icon bg-info">
                                    <i class="las la-tasks"></i>
                                </div>
                                <h3 class="stat-value">{{ number_format($stats['total_tasks_completed']) }}</h3>
                                <p class="stat-label">Tasks Completed</p>
                            </div>
                        </div>

                        <div class="col-md-3">
                            <div class="stat-card text-center">
                                <div class="stat-icon bg-warning">
                                    <i class="las la-user-plus"></i>
                                </div>
                                <h3 class="stat-value">{{ number_format($stats['total_referrals']) }}</h3>
                                <p class="stat-label">Total Referrals</p>
                            </div>
                        </div>
                    </div>

                    @if($stats['pending_verifications'] > 0)
                        <div class="alert alert--warning mt-4">
                            <i class="las la-exclamation-triangle"></i>
                            <strong>Pending Verifications:</strong> {{ $stats['pending_verifications'] }} tasks awaiting review
                        </div>
                    @endif
                @else
                    <p class="text-center text-muted">No statistics available.</p>
                @endif
            </div>
        </div>
    </div>
</div>

<style>
.stat-card {
    padding: 24px;
    border-radius: 12px;
    background: #f8f9fa;
    margin-bottom: 24px;
}

.stat-icon {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 16px;
}

.stat-icon i {
    font-size: 24px;
    color: white;
}

.bg-primary { background: #6366f1; }
.bg-success { background: #10b981; }
.bg-info { background: #3b82f6; }
.bg-warning { background: #f59e0b; }

.stat-value {
    font-size: 32px;
    font-weight: bold;
    margin-bottom: 8px;
}

.stat-label {
    color: #6b7280;
    margin: 0;
}
</style>
@endsection
