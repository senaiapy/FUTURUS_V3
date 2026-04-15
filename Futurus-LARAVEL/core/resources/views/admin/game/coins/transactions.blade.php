@extends('admin.layouts.app')

@section('panel')
<div class="row">
    <div class="col-lg-12">
        <div class="card">
            <div class="card-header">
                <h5 class="card-title mb-0">{{ $pageTitle }}</h5>
            </div>
            <div class="card-body p-0">
                <table class="table table-bordered">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>User ID</th>
                            <th>Amount</th>
                            <th>Type</th>
                            <th>Source</th>
                            <th>Date</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse($transactions as $transaction)
                            <tr>
                                <td>{{ $transaction['id'] }}</td>
                                <td>{{ $transaction['user_id'] }}</td>
                                <td>
                                    <span class="badge badge--{{ $transaction['amount'] > 0 ? 'success' : 'danger' }}">
                                        {{ $transaction['amount'] > 0 ? '+' : '' }}{{ number_format($transaction['amount']) }} Coins
                                    </span>
                                </td>
                                <td>
                                    <span class="badge badge--primary">{{ $transaction['type'] }}</span>
                                </td>
                                <td>{{ $transaction['source'] }}</td>
                                <td>{{ $transaction['created_at']->format('Y-m-d H:i') }}</td>
                                <td>
                                    <a href="{{ route('admin.game.coins.transaction.show', $transaction['id']) }}" class="btn btn--primary btn--sm">
                                        View
                                    </a>
                                </td>
                            </tr>
                        @empty
                            <tr>
                                <td colspan="7" class="text-center py-4">
                                    <p class="mb-0">No coin transactions found</p>
                                </td>
                            </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>
@endsection
