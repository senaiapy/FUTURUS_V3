@extends('admin.layouts.app')

@section('panel')
<div class="row">
    <div class="col-lg-12">
        <div class="card">
            <div class="card-header">
                <h5 class="card-title mb-0">{{ $pageTitle }}</h5>
                <a href="{{ route('admin.game.coins.transactions') }}" class="btn btn--secondary btn--sm">
                    Back to Transactions
                </a>
            </div>
            <div class="card-body">
                @if($transaction)
                    <div class="row">
                        <div class="col-md-6">
                            <div class="mb-3">
                                <label class="fw-bold">Transaction ID</label>
                                <p class="mb-0">{{ $transaction['id'] }}</p>
                            </div>
                            <div class="mb-3">
                                <label class="fw-bold">User ID</label>
                                <p class="mb-0">{{ $transaction['user_id'] }}</p>
                            </div>
                            <div class="mb-3">
                                <label class="fw-bold">Amount</label>
                                <p class="mb-0">
                                    <span class="badge badge--{{ $transaction['amount'] > 0 ? 'success' : 'danger' }}">
                                        {{ $transaction['amount'] > 0 ? '+' : '' }}{{ number_format($transaction['amount']) }} Coins
                                    </span>
                                </p>
                            </div>
                            <div class="mb-3">
                                <label class="fw-bold">Type</label>
                                <p class="mb-0">
                                    <span class="badge badge--primary">{{ $transaction['type'] }}</span>
                                </p>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="mb-3">
                                <label class="fw-bold">Source</label>
                                <p class="mb-0">{{ $transaction['source'] }}</p>
                            </div>
                            <div class="mb-3">
                                <label class="fw-bold">Reference</label>
                                <p class="mb-0">{{ $transaction['reference'] ?? '-' }}</p>
                            </div>
                            <div class="mb-3">
                                <label class="fw-bold">Created At</label>
                                <p class="mb-0">{{ $transaction['created_at']->format('Y-m-d H:i:s') }}</p>
                            </div>
                        </div>
                    </div>
                @else
                    <p class="text-center text-muted">Transaction not found.</p>
                @endif
            </div>
        </div>
    </div>
</div>
@endsection
