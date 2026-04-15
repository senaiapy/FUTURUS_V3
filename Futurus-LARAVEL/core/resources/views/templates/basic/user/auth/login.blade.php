@extends('Template::layouts.app')
@section('app')
    @php
        $loginContent = getContent('login.content', true);
    @endphp
    <section class="account-auth">
        <div class="account-auth-thumb bg-img" data-background-image="{{ frontendImage('login', $loginContent->data_values?->image ?? '', '1175x945') }}">
        </div>
        <div class="account-auth-content">
            <div class="account-auth-header">
                <a class="account-auth-logo" href="{{ route('home') }}">
                    <img src="{{ siteLogo('dark') }}" alt="img">
                </a>
                <div class="account-auth-heading">
                    <h2 class="account-auth-heading__title">{{ __($loginContent->data_values?->heading ?? '') }}</h2>
                    <p class="account-auth-heading__subtitle">{{ __($loginContent->data_values?->subheading ?? '') }}</p>
                </div>
            </div>

            <div class="account-auth-body">
                @include('Template::partials.social_login')

                <form class="account-auth-form verify-gcaptcha" action="{{ route('user.login') }}" method="POST">
                    @csrf
                    <div class="row">
                        <div class="col-sm-12">
                            <div class="form-group">
                                <label class="form--label">@lang('Username Or Email')</label>
                                <input class="form-control form--control" type="text" value="{{ old('username') }}" name="username" required>
                            </div>
                        </div>
                        <div class="col-sm-12">
                            <div class="form-group">
                                <div class="form-field form-field--password">
                                    <label class="form--label">@lang('Password')</label>
                                    <div class="input-group input--group input--group-password">
                                        <input id="password" type="password" class="form--control form-control" name="password" required>
                                        <span class="input-group-text input-group-btn">
                                            <i class="far fa-eye-slash"></i>
                                        </span>
                                    </div>
                                </div>
                                <div class="account-auth-form__extra">
                                    <div class="form--check">
                                        <input class="form-check-input" type="checkbox" value="" id="remember-me">
                                        <label class="form-check-label" for="remember-me">@lang('Remember me')</label>
                                    </div>
                                    <a href="{{ route('user.password.request') }}" class="account-auth-form__forgot-link">@lang('Forgot password?')</a>
                                </div>
                            </div>
                        </div>
                        <div class="col-12">
                            <x-captcha frontend="true" />
                        </div>
                    </div>

                    <button class="w-100 theme-btn btn-one" type="submit">
                        @lang('Submit')
                    </button>
                </form>
                @if (gs('registration'))
                    <p class="account-auth-info"> @lang('Don\'t have an account?') <a href="{{ route('user.register') }}">@lang('Register Now')</a></p>
                @endif
            </div>
        </div>
    </section>
@endsection
