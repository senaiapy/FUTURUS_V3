@props(['class' => false])
@forelse ($markets as $market)
    <div class="{{ $class ? 'col-xxl-3 col-lg-4 col-sm-6 col-xsm-6' : 'col-xxl-3 col-lg-4  col-sm-6 col-xsm-6' }}">
        <div class="market-card market-card-clickable" data-href="{{ route('markets.details', $market->slug) }}" style="cursor: pointer;">
            <div class="market-card-header">
                <div class="thumb">
                    <img src="{{ getImage(getFilePath('market') . '/' . $market->image, getFileSize('market'), option: true) }}" alt="card-thumb">
                </div>

                <div class="user header-badge">
                    <span class="icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" class="injected-svg" data-src="https://cdn.hugeicons.com/icons/legal-hammer-stroke-rounded.svg?v=1.0.1" xmlns:xlink="http://www.w3.org/1999/xlink" role="img" color="#ffffff">
                            <path d="M11.8333 12.1667C12.8883 13.2216 14.2778 14.2937 14.2778 14.2937L16.1825 12.3889C16.1825 12.3889 15.1105 10.9994 14.0556 9.94444C13.0006 8.8895 11.6111 7.81746 11.6111 7.81746L9.70635 9.72222C9.70635 9.72222 10.7784 11.1117 11.8333 12.1667ZM11.8333 12.1667L8.5 15.5M16.5 12.0714L13.9603 14.6111M11.9286 7.5L9.38889 10.0397" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
                            <path d="M21 11.1833V8.28029C21 6.64029 21 5.82028 20.5959 5.28529C20.1918 4.75029 19.2781 4.49056 17.4507 3.9711C16.2022 3.6162 15.1016 3.18863 14.2223 2.79829C13.0234 2.2661 12.424 2 12 2C11.576 2 10.9766 2.2661 9.77771 2.79829C8.89839 3.18863 7.79784 3.61619 6.54933 3.9711C4.72193 4.49056 3.80822 4.75029 3.40411 5.28529C3 5.82028 3 6.64029 3 8.28029V11.1833C3 16.8085 8.06277 20.1835 10.594 21.5194C11.2011 21.8398 11.5046 22 12 22C12.4954 22 12.7989 21.8398 13.406 21.5194C15.9372 20.1835 21 16.8085 21 11.1833Z" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round"></path>
                        </svg>
                    </span>
                    <span class="count">{{ getAmount($market->purchases_count ?? 0) }}</span>
                </div>
                <div class="capital header-badge">
                    <span class="icon">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"
                             color="currentColor" fill="none">
                            <path
                                  d="M20.9427 16.8354C20.2864 12.8866 18.2432 9.94613 16.467 8.219C15.9501 7.71642 15.6917 7.46513 15.1208 7.23257C14.5499 7 14.0592 7 13.0778 7H10.9222C9.94081 7 9.4501 7 8.87922 7.23257C8.30834 7.46513 8.04991 7.71642 7.53304 8.219C5.75682 9.94613 3.71361 12.8866 3.05727 16.8354C2.56893 19.7734 5.27927 22 8.30832 22H15.6917C18.7207 22 21.4311 19.7734 20.9427 16.8354Z"
                                  stroke="currentColor" stroke-width="1.5" stroke-linecap="round"></path>
                            <path
                                  d="M7.25662 4.44287C7.05031 4.14258 6.75128 3.73499 7.36899 3.64205C8.00392 3.54651 8.66321 3.98114 9.30855 3.97221C9.89237 3.96413 10.1898 3.70519 10.5089 3.33548C10.8449 2.94617 11.3652 2 12 2C12.6348 2 13.1551 2.94617 13.4911 3.33548C13.8102 3.70519 14.1076 3.96413 14.6914 3.97221C15.3368 3.98114 15.9961 3.54651 16.631 3.64205C17.2487 3.73499 16.9497 4.14258 16.7434 4.44287L15.8105 5.80064C15.4115 6.38146 15.212 6.67187 14.7944 6.83594C14.3769 7 13.8373 7 12.7582 7H11.2418C10.1627 7 9.6231 7 9.20556 6.83594C8.78802 6.67187 8.5885 6.38146 8.18945 5.80064L7.25662 4.44287Z"
                                  stroke="currentColor" stroke-width="1.5"></path>
                        </svg>
                    </span>
                    <span class="count deposit-count">
                        {{ gs('cur_sym') }}{{ number_shorten($market->volume) }}
                    </span>
                </div>
            </div>

            <div class="market-card-body">
                <div class="market-count">
                    @php
                        echo formatCountdown($market->end_date);
                    @endphp
                </div>
                <div class="market-card-info">
                    <p class="market-card-info-item">
                        <span class="title">@lang('Yes') :</span>
                        <span class="value">

                            <span class="icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="17" height="10"
                                     viewBox="0 0 17 10" fill="none">
                                    <path
                                          d="M11.8332 0L13.7415 1.90833L9.67484 5.975L6.3415 2.64167L0.166504 8.825L1.3415 10L6.3415 5L9.67484 8.33333L14.9248 3.09167L16.8332 5V0H11.8332Z"
                                          fill="#80BDFF" />
                                </svg>
                            </span>
                            {{ $market->yes_share }}%
                        </span>
                    </p>

                    <p class="market-card-info-item">
                        <span class="title	">@lang('No') :</span>
                        <span class="value">
                            <span class="icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                                     viewBox="0 0 20 20" fill="none">
                                    <path
                                          d="M13.3332 15L15.2415 13.0917L11.1748 9.025L7.8415 12.3583L1.6665 6.175L2.8415 5L7.8415 10L11.1748 6.66667L16.4248 11.9083L18.3332 10V15H13.3332Z"
                                          fill="#FF8082" />
                                </svg>
                            </span>
                            {{ $market->no_share }}%
                        </span>
                    </p>
                </div>
                <a href="{{ route('markets.details', $market->slug) }}" class="market-card-title">
                    {{ __($market->question) }}
                </a>
            </div>
        </div>
    </div>
@empty
    <div class="col-md-6">
        @include('Template::partials.empty', [
            'message' => 'No data found',
        ])
    </div>
@endforelse


@if ($paginate)
    @if ($markets->hasPages())
        <div class="pagination-wrapper">
            {{ paginateLinks($markets) }}
        </div>
    @endif
@endif

@push('style')
    <style>
        .market-card-clickable {
            transition: transform 0.2s ease, box-shadow 0.2s ease;
            -webkit-tap-highlight-color: transparent;
        }
        .market-card-clickable:hover {
            transform: translateY(-4px);
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        }
        .market-card-clickable:active {
            transform: translateY(-2px);
        }
        @media (max-width: 768px) {
            .market-card-clickable:hover {
                transform: none;
            }
            .market-card-clickable:active {
                transform: scale(0.98);
                opacity: 0.9;
            }
        }
    </style>
@endpush

@push('script')
    <script>
        (function($) {
            "use strict";
            const isLoggedIn = {{ auth()->check() ? 'true' : 'false' }};

            // Make entire market card clickable
            $(document).off('click', '.market-card-clickable').on('click', '.market-card-clickable', function(e) {
                // Don't redirect if clicking on a link or button inside the card
                if ($(e.target).closest('a, button, .market-card-mark').length) {
                    return;
                }

                const href = $(this).data('href');
                if (href) {
                    window.location.href = href;
                }
            });

            // Add touch support for mobile devices
            $(document).off('touchend', '.market-card-clickable').on('touchend', '.market-card-clickable', function(e) {
                // Don't redirect if touching a link or button inside the card
                if ($(e.target).closest('a, button, .market-card-mark').length) {
                    return;
                }

                const href = $(this).data('href');
                if (href) {
                    window.location.href = href;
                }
            });

            $(document).off('click', '.market-card-mark').on('click', '.market-card-mark', function(e) {
                e.preventDefault();
                e.stopPropagation();

                const marketId = $(this).data('id');
                const button = $(this);

                if (!isLoggedIn) {
                    $('#loginModal').modal('show');
                    return;
                }

                $.post("{{ route('user.market.bookmark', ':id') }}".replace(':id', marketId), {
                    _token: "{{ csrf_token() }}"
                }, function(response) {
                    if (response.success) {
                        notify('success', response.message);
                        $(`.market-card-mark[data-id="${marketId}"]`).toggleClass('active', response
                            .bookmarked);
                    } else {
                        notify('error', 'Something went wrong');
                    }
                });
            });
        })(jQuery);
    </script>
@endpush
