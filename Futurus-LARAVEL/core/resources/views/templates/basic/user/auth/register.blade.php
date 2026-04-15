@extends('Template::layouts.app')
@section('app')
    @if (gs('registration'))
        @php
            $register = getContent('register.content', true);
        @endphp
        <section class="account-auth">
            <div class="account-auth-thumb bg-img" data-background-image="{{ frontendImage('register', $register->data_values?->image ?? '', '1175x945') }}">
            </div>
            <div class="account-auth-content">
                <div class="account-auth-header">
                    <a class="account-auth-logo" href="{{ route('home') }}">
                        <img src="{{ siteLogo('dark') }}" alt="img">
                    </a>
                    <div class="account-auth-heading">
                        <h2 class="account-auth-heading__title"> {{ __($register->data_values?->heading ?? '') }}</h2>
                        <p class="account-auth-heading__subtitle">{{ __($register->data_values?->subheading ?? '') }}</p>
                    </div>
                </div>

                <div class="account-auth-body">
                    @include('Template::partials.social_login', ['register' => true])
                    <form class="account-auth-form" action="{{ route('user.register') }}" method="POST">
                        @csrf
                        <div class="row">
                            @if (session()->get('reference') != null)
                                <div class="col-md-12">
                                    <div class="form-group">
                                        <label for="referenceBy" class="form--label">@lang('Reference by')</label>
                                        <input type="text" name="referBy" id="referenceBy" class="form--control form-control"
                                               value="{{ session()->get('reference') }}" readonly>
                                    </div>
                                </div>
                            @endif
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label for="firstname" class="form--label">@lang('First Name')</label>
                                    <input id="firstname" class="form--control form-control"
                                           type="text" name="firstname"
                                           value="{{ old('firstname') }}" required>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label for="lastname" class="form--label">@lang('Last Name')</label>
                                    <input id="lastname" class="form--control form-control"
                                           type="text" name="lastname"
                                           value="{{ old('lastname') }}" required>
                                </div>
                            </div>
                            <div class="col-12">
                                <div class="form-group">
                                    <label for="email" class="form--label">@lang('Email')</label>
                                    <input id="email" name="email" class="form--control form-control checkUser"
                                           type="email" value="{{ old('email') }}"
                                           required>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label class="form--label">@lang('Password')</label>
                                    <div class="input-group input--group input--group-password">
                                        <input class="form-control form--control @if (gs('secure_password')) secure-password @endif" type="password" name="password" required>
                                        <span class="input-group-text input-group-btn">
                                            <i class="far fa-eye-slash"></i>
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label class="form--label">@lang('Confirm Password')</label>
                                    <div class="input-group input--group input--group-password">
                                        <input class="form-control form--control" type="password" name="password_confirmation" required>
                                        <span class="input-group-text input-group-btn">
                                            <i class="far fa-eye-slash"></i>
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div class="col-12">
                                <x-captcha frontend="true" />
                            </div>
                            @if (gs('agree'))
                                @php
                                    $policyPages = getContent('policy_pages.element', false, null, true);
                                @endphp
                                <div class="col-sm-12">
                                    <div class="form--check form-group">
                                        <input type="checkbox" id="agree" name="agree" class="form-check-input" required="">
                                        <label for="agree" class="form-check-label">
                                            @lang('I agree with ')
                                            @foreach ($policyPages as $policy)
                                                <a class="fs-14 ms-1"
                                                   href="{{ route('policy.pages', $policy->slug) }}"
                                                   target="blank">
                                                    {{ __($policy->data_values->title) }}</a>
                                                @if (!$loop->last)
                                                    ,
                                                @endif
                                            @endforeach
                                        </label>
                                    </div>
                                </div>
                            @endif
                        </div>
                        <button class="w-100 theme-btn btn-one" type="submit">
                            @lang('Submit')
                        </button>
                    </form>
                    <p class="account-auth-info"> @lang('Already have an account?') <a href="{{ route('user.login') }}">@lang('Login Now')</a></p>
                </div>
            </div>
        </section>

        <div class="modal custom--modal fade" id="existModalCenter" tabindex="-1" role="dialog" aria-labelledby="existModalCenterTitle" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="existModalLongTitle">@lang('You are with us')</h5>
                        <span type="button" class="close" data-bs-dismiss="modal" aria-label="Close">
                            <i class="las la-times"></i>
                        </span>
                    </div>
                    <div class="modal-body">
                        <h6 class="text-center">@lang('You already have an account please Login ')</h6>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-dark btn--sm" data-bs-dismiss="modal">@lang('Close')</button>
                        <a href="{{ route('user.login') }}" class="btn btn--base btn--sm">@lang('Login')</a>
                    </div>
                </div>
            </div>
        </div>
    @else
        @include('Template::partials.registration_disabled')
    @endif
@endsection
@if (gs('registration'))

    @push('style')
        <style>
            .social-login-btn {
                border: 1px solid #cbc4c4;
            }
        </style>
    @endpush

    @if (gs('secure_password'))
        @push('script-lib')
            <script src="{{ asset('assets/global/js/secure_password.js') }}"></script>
        @endpush
    @endif

    @push('script')
        <script>
            "use strict";
            (function($) {

                $('.checkUser').on('focusout', function(e) {
                    var url = '{{ route('user.checkUser') }}';
                    var value = $(this).val();
                    var token = '{{ csrf_token() }}';

                    var data = {
                        email: value,
                        _token: token
                    }

                    $.post(url, data, function(response) {
                        if (response.data != false) {
                            $('#existModalCenter').modal('show');
                        }
                    });
                });
            })(jQuery);
        </script>
    @endpush

@endif
