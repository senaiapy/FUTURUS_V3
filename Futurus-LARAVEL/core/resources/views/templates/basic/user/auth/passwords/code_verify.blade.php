@extends('Template::layouts.frontend')
@section('content')
    <div class="my-120">
        <div class="container">
            <div class="row justify-content-center">
                <div class="col-md-8 col-lg-7 col-xl-5">
                    <div class="d-flex justify-content-center">
                        <div class="verification-code-wrapper">
                            <div class="verification-area">
                                <form action="{{ route('user.password.verify.code') }}" method="POST" class="submit-form">
                                    @csrf
                                    <p class="mb-4">@lang('A 6 digit verification code sent to your email address') : {{ showEmailAddress($email) }}</p>
                                    <input type="hidden" name="email" value="{{ $email }}">
                                    @include('Template::partials.verification_code')
                                    <div class="form-group">
                                        <button type="submit" class="w-100 theme-btn btn-one">@lang('Submit')</button>
                                    </div>
                                    <div class="mt-4">
                                        <p>@lang('Please check including your Junk/Spam Folder. if not found, you can')
                                            <a href="{{ route('user.password.request') }}" class="text--base">@lang('Try to send again')</a>
                                        </p>
                                    </div>
                                </form>
                            </div>
                        </div>
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


@push('script')
    <script>
        (function($) {
            "use strict";
            $('#verification-code').on('input', function() {
                var inputLength = $(this).val().length;
                if (inputLength == 6) {
                    $(this).addClass('cursor-color');
                } else {
                    $(this).removeClass('cursor-color');
                }
            });
        })(jQuery)
    </script>
@endpush
