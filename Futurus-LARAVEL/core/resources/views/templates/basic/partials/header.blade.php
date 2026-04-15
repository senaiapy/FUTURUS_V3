<!-- main header -->
<header class="main-header header-style-{{ request()->routeIs('home') ? 'two' : 'two two-fix' }}">
    <!-- header-lower -->
    <div class="header-lower">
        <div class="large-container">
            <div class="outer-box">
                <div class="header-left d-flex align-items-center">
                    <a class="logo-box" href="{{ route('home') }}">
                        <img src="{{ siteLogo('dark') }}" alt="img">
                    </a>
                    <div class="header-auth-buttons d-flex align-items-center ms-3">
                        @auth
                            <a href="{{ route('user.home') }}" class="theme-btn btn-one navbar-btn">
                                @lang('Dashboard')
                            </a>
                        @else
                            <a href="{{ route('user.login') }}" class="theme-btn btn-one navbar-btn">
                                @lang('Login') <i class="las la-lg la-sign-in-alt"></i>
                            </a>
                        @endauth
                    </div>
                </div>
                <div class="menu-area">
                    <nav class="main-menu navbar-expand-md navbar-light clearfix">
                        <div class="collapse navbar-collapse show clearfix" id="navbarSupportedContent">
                            <ul class="navigation clearfix">
                                <li class="{{ menuActive('home') }}">
                                    <a href="{{ route('home') }}">@lang('Home')</a>
                                </li>
                                @foreach ($pages as $page)
                                    <li class="footer-menu-item {{ request()->segment(1) == $page->slug ? 'active' : '' }}">
                                        <a href="{{ route('pages', [$page->slug]) }}">{{ __($page->name) }}</a>
                                    </li>
                                @endforeach


                                <li class="{{ menuActive('blogs') }}">
                                    <a href="{{ route('blogs') }}">@lang('Blogs')</a>
                                </li>
                                <li class="{{ menuActive('user.gamify') }}">
                                    <a href="{{ route('user.gamify') }}">@lang('Game')</a>
                                </li>
                                <li class="{{ menuActive('contact') }}">
                                    <a href="{{ route('contact') }}">@lang('Contact')</a>
                                </li>

                            </ul>
                        </div>
                    </nav>
                </div>
                <div class="menu-right-content">
                    <div class="btn-box  d-sm-flex d-none align-items-center gap-3">
                        @include('Template::partials.language')
                    </div>
                    <div class="mobile-nav-toggler">
                        <i class="las la-bars"></i>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="sticky-header">
        <div class="large-container">
            <div class="outer-box">
                <div class="header-left d-flex align-items-center">
                    <figure class="logo-box">
                        <a href="{{ route('home') }}">
                            <img src="{{ siteLogo('dark') }}" alt="img">
                        </a>
                    </figure>
                    <div class="header-auth-buttons ms-3">
                        @auth
                            <a href="{{ route('user.home') }}" class="theme-btn btn-one">@lang('Dashboard')</a>
                        @else
                            <a href="{{ route('user.login') }}" class="theme-btn btn-one"> @lang('Login') <i class="las la-lg la-sign-in-alt"></i></a>
                        @endauth
                    </div>
                </div>
                <div class="menu-area">
                    <nav class="main-menu clearfix"></nav>
                </div>
                <div class="menu-right-content">
                    <div class="btn-box">
                    </div>
                    <div class="mobile-nav-toggler">
                        <i class="las la-bars"></i>
                    </div>
                </div>
            </div>
        </div>
    </div>
</header>


<div class="mobile-menu">
    <div class="menu-backdrop"></div>
    <div class="close-btn"><i class="fas fa-times"></i></div>
    <nav class="menu-box">
        <div class="nav-logo">
            <a href="{{ route('home') }}">
                <img src="{{ siteLogo() }}" alt="img" title="">
            </a>
        </div>
        <div class="btn-box my-3 d-sm-none d-flex justify-content-between align-items-center gap-3 p-2">
            @include('Template::partials.language')
            @auth
                <a href="{{ route('user.home') }}" class="theme-btn btn-one navbar-btn">
                    @lang('Dashboard')
                </a>
            @else
                <a href="{{ route('user.login') }}" class="theme-btn btn-one navbar-btn">
                    @lang('Login') <i class="las la-lg la-sign-in-alt"></i>
                </a>
            @endauth
        </div>
        <div class="menu-outer">
        </div>
    </nav>
</div>
