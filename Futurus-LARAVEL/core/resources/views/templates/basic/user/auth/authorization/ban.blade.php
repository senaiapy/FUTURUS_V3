@extends('Template::layouts.master')
@section('content')
    @php
        $bannedContent = getContent('banned.content', true);
    @endphp
    <section class="my-100">
        <div class="container">
            <div class="row justify-content-center">
                <div class="col-md-6">
                    <div class="banned-area">
                        <div class="banned-image">
                            <img src="{{ frontendImage('banned', $bannedContent?->data_values?->image ?? '') }}" alt="image">
                        </div>
                        <div class="mt-5 text-center">
                            <h3 class="text--danger pb-2">@lang('You are banned')</h3>
                            <p class="fw-bold mb-1">@lang('Reason'):</p>
                            <p>{{ __($user->ban_reason) }}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
@endsection
@push('style')
    <style>
        .banned-area {
            display: grid;
            place-content: center;
            height: 100vh;
        }

        .banned-image {
            max-width: 400px;
            text-align: center;
            margin: 0 auto;
        }

        .banned-image img {
            width: 100%;
        }
    </style>
@endpush
