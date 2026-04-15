@php
    $subscribeContent = getContent('subscribe.content', true);
@endphp
<section class="subscribe-section my-50">
    <div class="auto-container">
        <div class="inner-container">
            <div class="shape" style="background-image: url({{ getImage(activeTemplate(true) . 'images/shape/shape-5.png') }});"></div>
            <div class="row align-items-center">
                <div class="col-lg-6 col-md-12 col-sm-12 text-column">
                    <div class="text-box">
                        <h2>{{ __($subscribeContent?->data_values?->heading ?? '') }}</h2>
                    </div>
                </div>
                <div class="col-lg-6 col-md-12 col-sm-12 form-column">
                    <div class="form-inner">
                        <form method="POST" class="newsletter-form">
                            @csrf
                            <div class="form-group">
                                <input type="email" name="email" id="email" placeholder="@lang('Email Address')">
                                <button type="submit" class="theme-btn btn-one">@lang('Subscribe')<i class="icon-26"></i></button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>

@push('script')
    <script>
        (function($) {
            "use strict";
            $('.newsletter-form').on('submit', function(e) {
                e.preventDefault();
                var data = $('.newsletter-form').serialize();
                $.ajax({
                    type: "POST",
                    url: "{{ route('subscribe') }}",
                    data: data,
                    success: function(response) {
                        if (response.status == 'success') {
                            notify('success', response.message);
                            $('#email').val('');
                        } else {
                            notify('error', response.message);
                        }
                    }
                });
            });
        })(jQuery);
    </script>
@endpush
