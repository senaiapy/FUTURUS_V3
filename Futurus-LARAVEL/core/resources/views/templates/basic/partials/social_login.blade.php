@php
    $text = isset($register) ? 'Register' : 'Login';
@endphp

@if (gs('socialite_credentials')->linkedin->status ||
        gs('socialite_credentials')->facebook->status == Status::ENABLE ||
        gs('socialite_credentials')->google->status == Status::ENABLE)
    <div class="social-auth">
        @if (gs('socialite_credentials')->google->status == Status::ENABLE)
            <a class="social-auth__btn" href="{{ route('user.social.login', 'google') }}">
                <img src="{{ asset(activeTemplate(true) . 'images/google.svg') }}" alt="img">
                <figure class="text mb-0">
                    <span class="continue">@lang("$text with")</span>
                    @lang('Google')
                </figure>
            </a>
        @endif
        @if (gs('socialite_credentials')->facebook->status == Status::ENABLE)
            <a class="social-auth__btn" href="{{ route('user.social.login', 'facebook') }}">
                <img src="{{ asset(activeTemplate(true) . 'images/facebook.svg') }}" alt="img">
                <figure class="text mb-0">
                    <span class="continue">@lang("$text with")</span>
                    @lang('Facebook')
                </figure>
            </a>
        @endif
        @if (gs('socialite_credentials')->linkedin->status == Status::ENABLE)
            <a class="social-auth__btn" href="{{ route('user.social.login', 'linkedin') }}">
                <img src="{{ asset(activeTemplate(true) . 'images/linkdin.svg') }}" alt="img">
                <figure class="text mb-0">
                    <span class="continue">@lang("$text with")</span>
                    @lang('Linkedin')
                </figure>
            </a>
        @endif
    </div>

    <div class="account-auth-divider">
        <span>@lang('Or')</span>
    </div>
@endif
