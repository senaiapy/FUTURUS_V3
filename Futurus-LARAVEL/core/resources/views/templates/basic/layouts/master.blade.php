<!DOCTYPE html>
<html lang="{{ config('app.locale') }}">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title> {{ gs()->siteName(__($pageTitle)) }}</title>
    @include('partials.seo')
    <!-- font  -->
    <link href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@1,400;1,500&family=Maven+Pro:wght@400;500;600&display=swap" rel="stylesheet">


    <link href="{{ asset('assets/global/css/bootstrap.min.css') }}" rel="stylesheet">
    <link href="{{ asset('assets/global/css/all.min.css') }}" rel="stylesheet">
    <link rel="stylesheet" href="{{ asset('assets/global/css/line-awesome.min.css') }}" />
    <link rel="stylesheet" href="{{ asset('assets/global/css/select2.min.css') }}">
    <link rel="stylesheet" href="{{ asset(activeTemplate(true) . 'user/css/lib/animate.css') }}">

    <!-- Plugin Link -->
    <link rel="stylesheet" href="{{ asset(activeTemplate(true) . 'user/css/lib/slick.css') }}">
    <link rel="stylesheet" href="{{ asset(activeTemplate(true) . 'user/css/lib/magnific-popup.css') }}">
    <link rel="stylesheet" href="{{ asset(activeTemplate(true) . 'user/css/lib/apexcharts.css') }}">

    @stack('style-lib')

    <link rel="stylesheet" href="{{ asset(activeTemplate(true) . 'user/css/main.css') }}">
    <link rel="stylesheet" href="{{ asset(activeTemplate(true) . 'user/css/custom.css') }}">

    @stack('style')

    <style>
        .pb-120 {
            padding-bottom: clamp(40px, 4vw, 40px);
        }

        .pt-120 {
            padding-top: clamp(40px, 4vw, 40px);
        }

        .container {
            max-width: 1140px;
        }
    </style>

    @stack('style')

    <link rel="stylesheet" href="{{ asset(activeTemplate(true) . 'user/css/color.php') }}?color={{ gs('base_color') }}&secondColor={{ gs('secondary_color') }}">


</head>

@php echo loadExtension('google-analytics') @endphp

<body>

    <div class="d-flex flex-wrap">

        @include('Template::partials.sidebar')

        <div class="dashboard-wrapper">

            @include('Template::partials.topbar')

            <div class="{{ in_array(request()->route()->getName(), ['markets.index', 'markets.details']) ? 'dashboard-container-fluid' : 'dashboard-container' }}">

                @yield('content')

            </div>
        </div>
    </div>


    <script src="{{ asset('assets/global/js/jquery-3.7.1.min.js') }}"></script>
    <script src="{{ asset('assets/global/js/bootstrap.bundle.min.js') }}"></script>
    <script src="{{ asset('assets/global/js/select2.min.js') }}"></script>

    <script src="{{ asset(activeTemplate(true) . 'user/js/lib/slick.min.js') }}"></script>
    <script src="{{ asset(activeTemplate(true) . 'user/js/lib/magnific-popup.min.js') }}"></script>
    <script src="{{ asset(activeTemplate(true) . 'user/js/lib/apexcharts.min.js') }}"></script>

    @stack('script-lib')

    <!-- Main js -->
    <script src="{{ asset(activeTemplate(true) . 'user/js/main.js') }}"></script>

    @include('partials.notify')

    @if (gs('pn'))
        @include('partials.push_script')
    @endif
    @stack('script')

    <script>
        $('.select2').select2();

        Array.from(document.querySelectorAll('table')).forEach(table => {
            let heading = table.querySelectorAll('thead tr th');
            Array.from(table.querySelectorAll('tbody tr')).forEach((row) => {
                Array.from(row.querySelectorAll('td')).forEach((colum, i) => {
                    colum.setAttribute('data-label', heading[i].innerText)
                });
            });
        });

        $.each($('input, select, textarea'), function(i, element) {
            var elementType = $(element);
            if (elementType.attr('type') != 'checkbox') {
                if (element.hasAttribute('required')) {
                    $(element).closest('.form-group').find('label').addClass('required');
                }
            }
        });

        var inputElements = $('[type=text],[type=password],[type=email],[type=number],select,textarea');
        $.each(inputElements, function(index, element) {
            element = $(element);
            element.closest('.form-group').find('label').attr('for', element.attr('name'));
            element.attr('id', element.attr('name'))
        });

        $('.policy').on('click', function() {
            $.get('{{ route('cookie.accept') }}', function(response) {
                $('.cookies-card').addClass('d-none');
            });
        });


        setTimeout(function() {
            $('.cookies-card').removeClass('hide')
        }, 2000);

        let disableSubmission = false;
        $('.disableSubmission').on('submit', function(e) {
            if (disableSubmission) {
                e.preventDefault()
            } else {
                disableSubmission = true;
            }
        });
    </script>

    {{-- WhatsApp Fixed Button --}}
    <x-whatsapp-button />

</body>

</html>
