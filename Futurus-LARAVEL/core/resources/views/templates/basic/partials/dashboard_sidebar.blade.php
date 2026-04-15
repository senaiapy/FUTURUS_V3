<aside class="dashboard-sidebar" id="dashboard-sidebar">
    <div class="dashboard-sidebar__header">
        <a href="{{ route('home') }}" class="dashboard-sidebar-logo">
            <img src="{{ siteLogo() }}" alt="img">
        </a>
        <button class="dashboard-sidebar-close d-lg-none" type="button">
            <i class="fas fa-times"></i>
        </button>
    </div>
    <div class="dashboard-sidebar__body">
        <ul class="dashboard-sidebar-menu">
            <li class="dashboard-sidebar-menu__item active">
                <a class="dashboard-sidebar-menu__link" href="{{ route('user.home') }}">
                    <i class="las la-tachometer-alt"></i>
                    <span class="text">@lang('Dashboard')</span>
                </a>
            </li>
            <li class="dashboard-sidebar-menu__item {{ menuActive('user.deposit.*') }}">
                <a class="dashboard-sidebar-menu__link" href="{{ route('user.deposit.history') }}">
                    <i class="las la-university"></i>
                    <span class="text">@lang('Deposit History')</span>
                </a>
            </li>
            <li class="dashboard-sidebar-menu__item {{ menuActive('user.withdraw*') }}">
                <a class="dashboard-sidebar-menu__link" href="{{ route('user.withdraw.history') }}">
                    <i class="las la-hand-holding-usd"></i>
                    <span class="text">@lang('Withdraw History')</span>
                </a>
            </li>
            <li class="dashboard-sidebar-menu__item {{ menuActive('ticket.*') }}">
                <a class="dashboard-sidebar-menu__link" href="{{ route('ticket.index') }}">
                    <i class="las la-ticket-alt"></i>
                    <span class="text">@lang('Support Tickets')</span>
                </a>
            </li>

            <li class="dashboard-sidebar-menu__item {{ menuActive('user.transactions') }}">
                <a class="dashboard-sidebar-menu__link" href="{{ route('user.transactions') }}">
                    <i class="las la-exchange-alt"></i>
                    <span class="text">@lang('Transactions')</span>
                </a>
            </li>
            <li class="dashboard-sidebar-menu__item {{ menuActive('user.referrals') }}">
                <a class="dashboard-sidebar-menu__link" href="{{ route('user.referrals') }}">
                    <i class="las la-user-friends"></i>
                    <span class="text">@lang('Referrals')</span>
                </a>
            </li>
            <li class="dashboard-sidebar-menu__item {{ menuActive('user.gamify') }}">
                <a class="dashboard-sidebar-menu__link" href="{{ route('user.gamify') }}">
                    <i class="las la-gamepad"></i>
                    <span class="text">@lang('Game Center')</span>
                </a>
            </li>

            <li class="dashboard-sidebar-menu__item {{ menuActive('user.profile.setting') }}">
                <a class="dashboard-sidebar-menu__link" href="{{ route('user.profile.setting') }}">
                    <i class="las la-user-circle"></i>
                    <span class="text">@lang('Profile Setting')</span>
                </a>
            </li>

            <li class="dashboard-sidebar-menu__item {{ menuActive('user.change.password') }}">
                <a class="dashboard-sidebar-menu__link" href="{{ route('user.change.password') }}">
                    <i class="las la-lock"></i>
                    <span class="text">@lang('Change Password')</span>
                </a>
            </li>

            <li class="dashboard-sidebar-menu__item {{ menuActive('user.twofactor') }}">
                <a class="dashboard-sidebar-menu__link" href="{{ route('user.twofactor') }}">
                    <i class="las la-shield-alt"></i>
                    <span class="text">@lang('2FA Security')</span>
                </a>
            </li>
            <li class="dashboard-sidebar-menu__item logout">
                <a href="{{ route('user.logout') }}" class="dashboard-sidebar-menu__link">
                    <i class="las la-sign-out-alt"></i>
                    <span class="text">@lang('Logout')</span>
                </a>
            </li>
        </ul>
    </div>
</aside>
