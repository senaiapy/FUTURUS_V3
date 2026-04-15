@extends('Template::layouts.frontend')
@section('content')
    <div class="my-120">
        <div class="container">
            <div class="d-flex justify-content-center">
                <div class="verification-code-wrapper">
                    <div class="verification-area">
                        <form action="{{ route('user.2fa.verify') }}" method="POST" class="submit-form">
                            @csrf

                            @include('Template::partials.verification_code')

                            <button type="submit" class="w-100 theme-btn btn-one">@lang('Submit')</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
@endsection
@push('style')
    <style>
        .verification-code-wrapper {
            border-radius: 12px;
            overflow: hidden;
            -webkit-transition: all 0.3s linear;
            transition: all 0.3s linear;
            background-color: hsl(var(--white));
            border: 1px solid hsl(var(--base)/0.2) !important;
        }

        .verification-code span {
            background: transparent;
            border: solid 1px hsl(var(--base)/0.5);
            color: hsl(var(--base)/0.5);
        }

        .verification-code::after {
            background-color: transparent;
        }

        .verification-code::after {
            display: none;
        }

        .cursor-color {
            caret-color: transparent;
        }
    </style>
@endpush
