@extends('admin.layouts.app')

@section('panel')
<div class="row">
    <div class="col-lg-12">
        <div class="card">
            <div class="card-header">
                <h5 class="card-title mb-0">{{ $pageTitle }}</h5>
                <a href="{{ route('admin.game.referrals.index') }}" class="btn btn--secondary btn--sm">
                    Back to List
                </a>
            </div>
            <div class="card-body">
                @if($referral)
                    <div class="row">
                        <div class="col-md-6">
                            <div class="mb-3">
                                <label class="fw-bold">User ID</label>
                                <p class="mb-0">{{ $referral->id }}</p>
                            </div>
                            <div class="mb-3">
                                <label class="fw-bold">Username</label>
                                <p class="mb-0">{{ $referral->username ?? '-' }}</p>
                            </div>
                            <div class="mb-3">
                                <label class="fw-bold">Email</label>
                                <p class="mb-0">{{ $referral->email }}</p>
                            </div>
                            <div class="mb-3">
                                <label class="fw-bold">Referral Code</label>
                                <p class="mb-0">
                                    <span class="badge badge--primary">{{ $referral->referral_code }}</span>
                                </p>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="mb-3">
                                <label class="fw-bold">Joined Date</label>
                                <p class="mb-0">{{ $referral->created_at->format('Y-m-d H:i:s') }}</p>
                            </div>
                            <div class="mb-3">
                                <label class="fw-bold">Last Updated</label>
                                <p class="mb-0">{{ $referral->updated_at ? $referral->updated_at->format('Y-m-d H:i:s') : '-' }}</p>
                            </div>
                            <div class="mb-3">
                                <label class="fw-bold">Status</label>
                                <p class="mb-0">
                                    @if($referral->status ?? $referral->status === 1)
                                        <span class="badge badge--success">Active</span>
                                    @else
                                        <span class="badge badge--warning">Inactive</span>
                                    @endif
                                </p>
                            </div>
                        </div>
                    </div>

                    <div class="card-tools border-top pt-3 mt-3">
                        <form action="{{ route('admin.game.referrals.approve', $referral->id) }}" method="POST" class="d-inline">
                            @csrf
                            <button type="submit" class="btn btn--success">Approve</button>
                        </form>
                        <form action="{{ route('admin.game.referrals.reject', $referral->id) }}" method="POST" class="d-inline">
                            @csrf
                            <button type="submit" class="btn btn--danger">Reject</button>
                        </form>
                    </div>
                @else
                    <p class="text-center text-muted">Referral not found.</p>
                @endif
            </div>
        </div>
    </div>
</div>
@endsection
