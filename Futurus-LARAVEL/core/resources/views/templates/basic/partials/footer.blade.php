@php
    $socials = getContent('social_icon.element', orderById: true);
    $paymentElement = getContent('payments.element', orderById: true);
    $policyPages = getContent('policy_pages.element', false, null, true);
    $contactContent = getContent('contact_us.content', true);
    $footerContent = getContent('footer.content', true);
@endphp
<footer class="main-footer">
    <div class="widget-section p_relative pt-100 pb-60">
        <div class="auto-container">
            <div class="row justify-content-between gy-5">
                <div class="col-lg-4">
                    <div class="footer-item">
                        <div class="footer-item__logo">
                            <figure class="footer-logo">
                                <a href="{{ route('home') }}"><img src="{{ siteLogo('dark') }}" alt="img"></a>
                            </figure>
                        </div>
                        <p class="footer-item__desc">{{ __($footerContent->data_values?->short_description ?? '') }}</p>

                    </div>
                </div>
                <div class="col-sm-3 col-md-4 col-lg-2">
                    <div class="footer-item">
                        <h4 class="footer-item__title">@lang('Useful Link')</h4>
                        <ul class="footer-menu">
                            <li class="footer-menu__item">
                                <a class="footer-menu__link" href="{{ route('home') }}">@lang('Home')</a>
                            </li>
                            <li class="footer-menu__item">
                                <a class="footer-menu__link" href="{{ route('blogs') }}">@lang('Blog')</a>
                            </li>
                            <li class="footer-menu__item">
                                <a class="footer-menu__link" href="{{ route('contact') }}">@lang('Contact')</a>
                            </li>
                        </ul>
                    </div>
                </div>
                <div class="col-sm-3 col-md-4 col-lg-2">
                    <div class="footer-item">
                        <h4 class="footer-item__title">@lang('Policy Link')</h4>
                        <ul class="footer-menu">
                            @foreach ($policyPages as $policy)
                                <li class="footer-menu__item">
                                    <a href="{{ route('policy.pages', $policy->slug) }}" class="footer-menu__link">{{ __($policy?->data_values?->title) }}</a>
                                </li>
                            @endforeach
                            <li class="footer-menu__item">
                                <a href="{{ route('account.removal') }}" class="footer-menu__link">@lang('Remover Conta')</a>
                            </li>
                        </ul>
                    </div>
                </div>
                <div class="col-sm-6 col-md-4 col-lg-4">
                    <div class="footer-item footer-item--contact">
                        <h4 class="footer-item__title">@lang('Contact Information')</h4>
                        <ul class="footer-menu">
                            <li class="footer-menu__item">
                                <a href="mailto:{{ $contactContent->data_values?->email_address ?? '' }}" class="footer-menu__link">
                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none"
                                         xmlns="http://www.w3.org/2000/svg">
                                        <path
                                              d="M1.66675 5L7.4276 8.26414C9.55141 9.4675 10.4487 9.4675 12.5726 8.26414L18.3334 5"
                                              stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
                                        <path
                                              d="M1.67989 11.23C1.73436 13.7847 1.76161 15.0619 2.70421 16.0082C3.64681 16.9543 4.95869 16.9872 7.58244 17.0532C9.1995 17.0938 10.8007 17.0938 12.4177 17.0532C15.0415 16.9872 16.3533 16.9543 17.296 16.0082C18.2386 15.0619 18.2658 13.7847 18.3202 11.23C18.3378 10.4086 18.3378 9.59208 18.3202 8.77066C18.2658 6.21604 18.2386 4.93873 17.296 3.99254C16.3533 3.04635 15.0415 3.01339 12.4177 2.94747C10.8007 2.90683 9.1995 2.90683 7.58243 2.94746C4.95869 3.01338 3.64681 3.04633 2.70421 3.99253C1.7616 4.93873 1.73436 6.21603 1.67988 8.77066C1.66236 9.59208 1.66237 10.4086 1.67989 11.23Z"
                                              stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
                                    </svg>
                                    <span>{{ $contactContent->data_values?->email_address ?? '' }}</span>
                                </a>
                            </li>
                            <li class="footer-menu__item">
                                <a href="tel:{{ $contactContent->data_values?->contact_number ?? '' }}" class="footer-menu__link">
                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none"
                                         xmlns="http://www.w3.org/2000/svg">
                                        <path d="M10 15.833H10.0083" stroke="currentColor" stroke-width="1.5"
                                              stroke-linecap="round" stroke-linejoin="round" />
                                        <path
                                              d="M11.2499 1.66699H8.74992C6.78574 1.66699 5.80364 1.66699 5.19344 2.27718C4.58325 2.88738 4.58325 3.86948 4.58325 5.83366V14.167C4.58325 16.1312 4.58325 17.1132 5.19344 17.7235C5.80364 18.3337 6.78574 18.3337 8.74992 18.3337H11.2499C13.2141 18.3337 14.1962 18.3337 14.8064 17.7235C15.4166 17.1132 15.4166 16.1312 15.4166 14.167V5.83366C15.4166 3.86948 15.4166 2.88738 14.8064 2.27718C14.1962 1.66699 13.2141 1.66699 11.2499 1.66699Z"
                                              stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
                                              stroke-linejoin="round" />
                                    </svg>
                                    <span>{{ $contactContent->data_values?->contact_number ?? '' }}</span>
                                </a>
                            </li>
                            <li class="footer-menu__item">
                                <a href="javascript:void(0)" class="footer-menu__link">
                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none"
                                         xmlns="http://www.w3.org/2000/svg">
                                        <path
                                              d="M12.0834 7.50033C12.0834 8.65091 11.1507 9.58366 10.0001 9.58366C8.8495 9.58366 7.91675 8.65091 7.91675 7.50033C7.91675 6.34973 8.8495 5.41699 10.0001 5.41699C11.1507 5.41699 12.0834 6.34973 12.0834 7.50033Z"
                                              stroke="currentColor" stroke-width="1.5" />
                                        <path
                                              d="M11.0479 14.5783C10.7668 14.849 10.3912 15.0003 10.0002 15.0003C9.60925 15.0003 9.23358 14.849 8.9525 14.5783C6.37866 12.0843 2.92941 9.29824 4.61151 5.25343C5.521 3.06643 7.7042 1.66699 10.0002 1.66699C12.2962 1.66699 14.4794 3.06643 15.3889 5.25343C17.0689 9.29316 13.6281 12.0929 11.0479 14.5783Z"
                                              stroke="currentColor" stroke-width="1.5" />
                                        <path
                                              d="M15 16.667C15 17.5875 12.7614 18.3337 10 18.3337C7.23857 18.3337 5 17.5875 5 16.667"
                                              stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
                                    </svg>
                                    <span>{{ $contactContent->data_values?->contact_details ?? '' }}</span>
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
            <div class="footer-lower">
                <div class="d-flex flex-wrap align-items-center gap-3">
                    <h5>@lang('Follow Us On'):</h5>
                    <ul class="social-links">
                        @foreach ($socials as $social)
                            <li>
                                <a href="{{ url($social->data_values?->url) ?? '' }}" target="blank">
                                    @php echo $social->data_values?->social_icon ?? '' @endphp
                                </a>
                            </li>
                        @endforeach
                    </ul>
                </div>
                <div class="d-flex flex-wrap align-items-center gap-3">
                    <h5>@lang('We Accept:')</h5>
                    <ul class="footer-card clearfix">
                        @foreach ($paymentElement as $payment)
                            <li><img src="{{ frontendImage('payments', $payment?->data_values?->image, '60x40') }}" alt="img"></li>
                        @endforeach
                    </ul>
                </div>
            </div>
        </div>
    </div>
    <div class="footer-bottom">
        <div class="auto-container">
            <div class="bottom-inner">
                <p>@lang('Copyright') &copy; <a href="{{ route('home') }}">{{ gs('site_name') }}</a> {{ date('Y') }} @lang('All rights reserved').</p>
                @if(env('PUBLIC_APP_VERSION'))
                    <p class="app-version" style="font-size: 0.75rem; opacity: 0.7; margin-top: 0.5rem;">v{{ env('PUBLIC_APP_VERSION') }}</p>
                @endif
            </div>
        </div>
    </div>
</footer>
