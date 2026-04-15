    <section class="page-title centred pt-100">
        <div class="pattern-layer rotate-me" style="background-image: url({{ getImage(activeTemplate(true) . 'images/shape/shape-34.png') }});"></div>
        <div class="auto-container">
            <div class="content-box">
                <h1>{{ isset($customPageTitle) ? __($customPageTitle) : __($pageTitle) }}</h1>
                <ul class="bread-crumb clearfix">
                    <li><a href="{{ route('home') }}">@lang('Home')</a></li>
                    <li>{{ isset($customPageTitle) ? __($customPageTitle) : __($pageTitle) }}</li>
                </ul>
            </div>
        </div>
    </section>
