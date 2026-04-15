<!doctype html>
<html lang="{{ config('app.locale') }}" itemscope itemtype="http://schema.org/WebPage">

<head>
    <!-- Required meta tags -->
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <title> {{ gs()->siteName(__($pageTitle)) }}</title>

    @include('partials.seo')

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@400;500;600;700&display=swap" rel="stylesheet">
    
    <link href="{{ asset('assets/global/css/bootstrap.min.css') }}" rel="stylesheet">
    <link href="{{ asset('assets/global/css/all.min.css') }}" rel="stylesheet">
    <link rel="stylesheet" href="{{ asset('assets/global/css/line-awesome.min.css') }}">

    @stack('style-lib')

    <link rel="stylesheet" href="{{ asset(activeTemplate(true) . 'css/flaticon.css') }}">
    <link rel="stylesheet" href="{{ asset(activeTemplate(true) . 'css/owl.css') }}">
    <link rel="stylesheet" href="{{ asset(activeTemplate(true) . 'css/slick.css') }}">
    <link rel="stylesheet" href="{{ asset(activeTemplate(true) . 'css/jquery.fancybox.min.css') }}">
    <link rel="stylesheet" href="{{ asset(activeTemplate(true) . 'css/animate.css') }}">
    <link rel="stylesheet" href="{{ asset(activeTemplate(true) . 'css/nice-select.css') }}">
    <link rel="stylesheet" href="{{ asset(activeTemplate(true) . 'css/odometer.css') }}">
    <link rel="stylesheet" href="{{ asset(activeTemplate(true) . 'css/elpath.css') }}">
    <link rel="stylesheet" href="{{ asset(activeTemplate(true) . 'css/color.css') }}">
    <link rel="stylesheet" href="{{ asset(activeTemplate(true) . 'css/style.css') }}">
    <link rel="stylesheet" href="{{ asset(activeTemplate(true) . 'css/section.css') }}">
    <link rel="stylesheet" href="{{ asset(activeTemplate(true) . 'css/responsive.css') }}">
    <link rel="stylesheet" href="{{ asset(activeTemplate(true) . 'css/custom.css') }}?v={{ time()+1 }}">

    @stack('style')

    <link rel="stylesheet" href="{{ asset(activeTemplate(true) . 'css/color.php') }}?color={{ gs('base_color') }}&secondColor={{ gs('secondary_color') }}">
</head>
@php echo loadExtension('google-analytics') @endphp

<body>
    @stack('fbComment')


    <div class="body-overlay"></div>
    <div class="sidebar-overlay"></div>
    <div class="preloader">
        <div class="loader-p"></div>
    </div>
    <div class="scroll-to-top">
        <svg class="scroll-top-inner" viewBox="-1 -1 102 102">
            <path d="M50,1 a49,49 0 0,1 0,98 a49,49 0 0,1 0,-98" />
        </svg>
    </div>

    @yield('app')

    @php
        $cookie = App\Models\Frontend::where('data_keys', 'cookie.data')->first();
    @endphp
    @if ($cookie->data_values->status == Status::ENABLE && !\Cookie::get('gdpr_cookie'))
        <div class="cookies-card text-center hide">
            <div class="cookies-card__icon">
                <i class="las la-cookie-bite"></i>
            </div>
            <p class="mt-4 cookies-card__content">{{ $cookie->data_values->short_desc }} <a href="{{ route('cookie.policy') }}" class="text--base" target="_blank">@lang('learn more')</a></p>
            <div class="cookies-card__btn mt-4">
                <a href="javascript:void(0)" class="btn btn--base w-100 policy">@lang('Allow')</a>
            </div>
        </div>
    @endif


    <script src="{{ asset(activeTemplate(true) . 'js/jquery.js') }}"></script>
    <script src="{{ asset('assets/global/js/bootstrap.bundle.min.js') }}"></script>

    @stack('script-lib')

    <script src="{{ asset(activeTemplate(true) . 'js/owl.js') }}"></script>
    <script src="{{ asset(activeTemplate(true) . 'js/slick.min.js') }}"></script>
    <script src="{{ asset(activeTemplate(true) . 'js/wow.js') }}"></script>
    <script src="{{ asset(activeTemplate(true) . 'js/validation.js') }}"></script>
    <script src="{{ asset(activeTemplate(true) . 'js/jquery.fancybox.js') }}"></script>
    <script src="{{ asset(activeTemplate(true) . 'js/appear.js') }}"></script>
    <script src="{{ asset(activeTemplate(true) . 'js/isotope.js') }}"></script>
    <script src="{{ asset(activeTemplate(true) . 'js/parallax-scroll.js') }}"></script>
    <script src="{{ asset(activeTemplate(true) . 'js/jquery.nice-select.min.js') }}"></script>
    <script src="{{ asset(activeTemplate(true) . 'js/scrolltop.min.js') }}"></script>
    <script src="{{ asset(activeTemplate(true) . 'js/language.js') }}"></script>
    <script src="{{ asset(activeTemplate(true) . 'js/jquery-ui.js') }}"></script>
    <script src="{{ asset(activeTemplate(true) . 'js/odometer.js') }}"></script>
    <script src="{{ asset(activeTemplate(true) . 'js/jquery.lettering.min.js') }}"></script>
    <script src="{{ asset(activeTemplate(true) . 'js/jquery.circleType.js') }}"></script>
    <script src="{{ asset(activeTemplate(true) . 'js/jquery.treeView.js') }}"></script>
    <script src="{{ asset(activeTemplate(true) . 'js/script.js') }}"></script>

    @php echo loadExtension('tawk-chat') @endphp

    @include('partials.notify')

    @if (gs('pn'))
        @include('partials.push_script')
    @endif
    @stack('script')



    <script>
        (function($) {
            "use strict";
            $(".langSel").on("change", function() {
                window.location.href = "{{ route('home') }}/change/" + $(this).val();
            });

            $('.policy').on('click', function() {
                $.get('{{ route('cookie.accept') }}', function(response) {
                    $('.cookies-card').addClass('d-none');
                });
            });

            setTimeout(function() {
                $('.cookies-card').removeClass('hide')
            }, 2000);

            var inputElements = $('[type=text],select,textarea');
            $.each(inputElements, function(index, element) {
                element = $(element);
                element.closest('.form-group').find('label').attr('for', element.attr('name'));
                element.attr('id', element.attr('name'))
            });

            $.each($('input, select, textarea'), function(i, element) {
                var elementType = $(element);
                if (elementType.attr('type') != 'checkbox') {
                    if (element.hasAttribute('required')) {
                        $(element).closest('.form-group').find('label').addClass('required');
                    }
                }

            });


            let disableSubmission = false;
            $('.disableSubmission').on('submit', function(e) {
                if (disableSubmission) {
                    e.preventDefault()
                } else {
                    disableSubmission = true;
                }
            });

        })(jQuery);
    </script>

    {{-- WhatsApp Fixed Button --}}
    <x-whatsapp-button />

</body>

</html>
