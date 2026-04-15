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
                            <th>Username</th>
                            <th>Email</th>
                            <th>Referral Code</th>
                            <th>Joined Date</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse($referrals as $referral)
                            <tr>
                                <td>{{ $referral->id }}</td>
                                <td>{{ $referral->username ?? '-' }}</td>
                                <td>{{ $referral->email }}</td>
                                <td>
                                    <span class="badge badge--primary">{{ $referral->referral_code }}</span>
                                </td>
                                <td>{{ $referral->created_at->format('Y-m-d H:i') }}</td>
                                <td>
                                    <a href="{{ route('admin.game.referrals.show', $referral->id) }}" class="btn btn--primary btn--sm">
                                        View
                                    </a>
                                </td>
                            </tr>
                        @empty
                            <tr>
                                <td colspan="6" class="text-center py-4">
                                    <p class="mb-0">No referrals found</p>
                                </td>
                            </tr>
                        @endforelse
                    </tbody>
                </table>

                @if($referrals && $referrals->hasPages())
                    <div class="card-footer">
                        {{ $referrals->appends(request()->query())->render() }}
                    </div>
                @endif
            </div>
        </div>
    </div>
</div>
@endsection
