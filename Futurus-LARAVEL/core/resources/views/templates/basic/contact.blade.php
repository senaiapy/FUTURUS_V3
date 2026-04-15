@extends('Template::layouts.frontend')
@section('content')

    @php
        $contactContent = getContent('contact_us.content', true);
    @endphp
    <section class="contact-section my-100 ">
        <div class="auto-container">
            <div class="info-inner mb-50">
                <div class="row justify-content-center gy-4">
                    <div class="col-sm-4">
                        <div class="contact-item">
                            <div class="contact-item__icon">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48" color="hsl(var(--base))" fill="none">
                                    <path d="M14.5 9C14.5 10.3807 13.3807 11.5 12 11.5C10.6193 11.5 9.5 10.3807 9.5 9C9.5 7.61929 10.6193 6.5 12 6.5C13.3807 6.5 14.5 7.61929 14.5 9Z" stroke="currentColor" stroke-width="1.5" />
                                    <path d="M18.2222 17C19.6167 18.9885 20.2838 20.0475 19.8865 20.8999C19.8466 20.9854 19.7999 21.0679 19.7469 21.1467C19.1724 22 17.6875 22 14.7178 22H9.28223C6.31251 22 4.82765 22 4.25311 21.1467C4.20005 21.0679 4.15339 20.9854 4.11355 20.8999C3.71619 20.0475 4.38326 18.9885 5.77778 17" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                    <path d="M13.2574 17.4936C12.9201 17.8184 12.4693 18 12.0002 18C11.531 18 11.0802 17.8184 10.7429 17.4936C7.6543 14.5008 3.51519 11.1575 5.53371 6.30373C6.6251 3.67932 9.24494 2 12.0002 2C14.7554 2 17.3752 3.67933 18.4666 6.30373C20.4826 11.1514 16.3536 14.5111 13.2574 17.4936Z" stroke="currentColor" stroke-width="1.5" />
                                </svg>
                            </div>
                            <div class="contact-item__content">
                                <h5 class="contact-item__title">@lang('Contact Address')</h5>

                                <p class="contact-item__desc">
                                    {{ $contactContent->data_values?->contact_details ?? '' }}
                                </p>

                            </div>
                        </div>
                    </div>
                    <div class="col-sm-4">
                        <div class="contact-item">
                            <div class="contact-item__icon">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48" color="hsl(var(--base))" fill="none">
                                    <path d="M21.0477 3.05293C18.8697 0.707363 2.48648 6.4532 2.50001 8.551C2.51535 10.9299 8.89809 11.6617 10.6672 12.1581C11.7311 12.4565 12.016 12.7625 12.2613 13.8781C13.3723 18.9305 13.9301 21.4435 15.2014 21.4996C17.2278 21.5892 23.1733 5.342 21.0477 3.05293Z" stroke="currentColor" stroke-width="1.5" />
                                    <path d="M11.4999 12.5L14.9999 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                </svg>
                            </div>
                            <div class="contact-item__content">
                                <h5 class="contact-item__title">@lang('Email Address')</h5>
                                <p class="contact-item__desc">
                                    <a href="mailto:{{ $contactContent->data_values?->email_address ?? '' }}">
                                        {{ $contactContent->data_values?->email_address ?? '' }}
                                    </a>
                                </p>
                            </div>
                        </div>
                    </div>
                    <div class="col-sm-4">
                        <div class="contact-item">
                            <div class="contact-item__icon">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48" color="hsl(var(--base))" fill="none">
                                    <path d="M9.1585 5.71217L8.75584 4.80619C8.49256 4.21382 8.36092 3.91762 8.16405 3.69095C7.91732 3.40688 7.59571 3.19788 7.23592 3.08779C6.94883 2.99994 6.6247 2.99994 5.97645 2.99994C5.02815 2.99994 4.554 2.99994 4.15597 3.18223C3.68711 3.39696 3.26368 3.86322 3.09497 4.35054C2.95175 4.76423 2.99278 5.18937 3.07482 6.03964C3.94815 15.0901 8.91006 20.052 17.9605 20.9254C18.8108 21.0074 19.236 21.0484 19.6496 20.9052C20.137 20.7365 20.6032 20.3131 20.818 19.8442C21.0002 19.4462 21.0002 18.972 21.0002 18.0237C21.0002 17.3755 21.0002 17.0514 20.9124 16.7643C20.8023 16.4045 20.5933 16.0829 20.3092 15.8361C20.0826 15.6393 19.7864 15.5076 19.194 15.2443L18.288 14.8417C17.6465 14.5566 17.3257 14.414 16.9998 14.383C16.6878 14.3533 16.3733 14.3971 16.0813 14.5108C15.7762 14.6296 15.5066 14.8543 14.9672 15.3038C14.4304 15.7511 14.162 15.9748 13.834 16.0946C13.5432 16.2009 13.1588 16.2402 12.8526 16.1951C12.5071 16.1442 12.2426 16.0028 11.7135 15.7201C10.0675 14.8404 9.15977 13.9327 8.28011 12.2867C7.99738 11.7576 7.85602 11.4931 7.80511 11.1476C7.75998 10.8414 7.79932 10.457 7.90554 10.1662C8.02536 9.83822 8.24905 9.5698 8.69643 9.03294C9.14586 8.49362 9.37058 8.22396 9.48939 7.91885C9.60309 7.62688 9.64686 7.31234 9.61719 7.00042C9.58618 6.67446 9.44362 6.3537 9.1585 5.71217Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
                                </svg>
                            </div>
                            <div class="contact-item__content">
                                <h5 class="contact-item__title">@lang('Contact Number')</h5>
                                <p class="contact-item__desc">
                                    <a href="tel:{{ $contactContent->data_values?->contact_number ?? '' }}">{{ $contactContent->data_values?->contact_number ?? '' }}</a>
                                </p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
            <div class="contact-inner mb-50">
                <div class="row gx-5 gy-4 justify-content-between ">
                    <div class="col-lg-6 d-none d-lg-flex flex-column justify-content-between">
                        <div class="contact-form__header mb-4">
                            <h2 class="contact-form__title mb-2">
                                {{ __($contactContent->data_values?->heading ?? '') }}
                            </h2>
                            <p class="contact-form__desc">
                                {{ __($contactContent->data_values?->subheading ?? '') }}
                            </p>
                        </div>
                        <img src="{{ frontendImage('contact_us', $contactContent?->data_values?->image ?? '', '645x720') }}" alt="">
                    </div>
                    <div class="col-xxl-6 col-lg-6">
                        <div class="form-inner">
                            <form method="POST" id="contact-form1" class="verify-gcaptcha">
                                @csrf
                                <div class="contact-form__body">
                                    <div class="row">
                                        <div class="col-12">
                                            <div class="form-group">
                                                <label for="name" class="form--label">@lang('Name')</label>
                                                <input type="text" id="name" name="name"
                                                       class="form--control form-control" placeholder="@lang('Enter your name')"
                                                       value="{{ old('name', $user?->fullname) }}"
                                                       @if ($user && $user->profile_complete) readonly @endif required>
                                            </div>
                                        </div>
                                        <div class="col-12">
                                            <div class="form-group">
                                                <label for="email" class="form--label">@lang('Email')</label>
                                                <input type="email" id="email" name="email"
                                                       class="form--control form-control" placeholder="@lang('Enter your email')"
                                                       value="{{ old('email', $user?->email) }}"
                                                       @if ($user) readonly @endif required>
                                            </div>
                                        </div>
                                        <div class="col-12">
                                            <div class="form-group">
                                                <label for="subject" class="form--label">@lang('Subject')</label>
                                                <input type="text" id="subject" name="subject"
                                                       class="form--control form-control" value="{{ old('subject') }}" required>
                                            </div>
                                        </div>
                                        <div class="col-12">
                                            <div class="form-group">
                                                <label for="message" class="form--label">@lang('Message')</label>
                                                <textarea id="message" name="message" class="form--control form-control" required>{{ old('message') }}</textarea>
                                            </div>
                                        </div>
                                        <div class="col-12">
                                            <x-captcha frontend="true" />
                                        </div>
                                        <div class="col-12">
                                            <button type="submit" class="w-100 theme-btn btn-one">@lang('Send Message')</button>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            <div class="map-inner">
                <iframe src="{{ $contactContent?->data_values?->map_link ?? '' }}" width="100%" height="500"
                        frameborder="0" style="border:0; width: 100%" allowfullscreen="" aria-hidden="false"
                        tabindex="0"></iframe>
            </div>
        </div>
    </section>



    @if (isset($sections->secs) && $sections->secs != null)
        @foreach (json_decode($sections->secs) as $sec)
            @include('Template::sections.' . $sec)
        @endforeach
    @endif
@endsection

@push('style')
    <style>
        .contact-inner {
            background-color: hsl(var(--base) / 0.01);
            border-radius: 10px;
            padding: 40px;
            border: 1px solid hsl(var(--base) / 0.2);
        }

        .form-inner {
            background-color: hsl(var(--white));
            padding: 24px;
            border: 1px solid hsl(0deg, 0%, 94%);
            border-radius: 10px;
        }
    </style>
@endpush
