<div class="recent-activity">
    <div class="flex-align gap-2 mb-3 activity-sort">
        <select class="select2 select2--filter" id="sort-filter" data-minimum-results-for-search="-1">
            <option value="newest">@lang('Newest')</option>
            <option value="oldest">@lang('Oldest')</option>
        </select>
        <select class="select2 select2--filter" id="amount-filter" data-minimum-results-for-search="-1">
            <option value="0">@lang('All Amounts')</option>
            <option value="10-100">{{ gs('cur_sym') }}@lang('10') - {{ gs('cur_sym') }}@lang('100')</option>
            <option value="101-300">{{ gs('cur_sym') }}@lang('101') - {{ gs('cur_sym') }}@lang('300')</option>
            <option value="301-500">{{ gs('cur_sym') }}@lang('301') - {{ gs('cur_sym') }}@lang('500')</option>
            <option value="501">{{ gs('cur_sym') }}@lang('500')+</option>
        </select>
    </div>

    <div id="activity-list-container">
        @include('Template::partials.recent_activity_list', ['recentPurchases' => $recentPurchases])
    </div>



    <div id="activity-loading" style="display: none;">
        @for ($i = 0; $i < 5; $i++)
            <div class="recent-activity-item skeleton-loader">
                <div class="recent-activity-item__auth">
                    <span class="skeleton-avatar"></span>
                    <span class="skeleton-name"></span>
                </div>
                <div class="skeleton-content">
                    <div class="skeleton-line skeleton-line--medium"></div>
                </div>
                <div class="skeleton-date"></div>
            </div>
        @endfor
    </div>

</div>

@push('style')
    <style>
        /* Skeleton css */

        .skeleton-loader {
            --fs: 16px;
            display: -webkit-box;
            display: -ms-flexbox;
            display: flex;
            -webkit-box-align: center;
            -ms-flex-align: center;
            align-items: center;
            -webkit-box-pack: justify;
            -ms-flex-pack: justify;
            justify-content: space-between;
            gap: 16px;
            -ms-flex-wrap: wrap;
            flex-wrap: wrap;
            animation: skeleton-pulse 1.5s infinite ease-in-out;
        }

        @media screen and (max-width: 1399px) {
            .skeleton-loader {
                --fs: 14px;
            }
        }

        .skeleton-loader:not(:last-child) {
            margin-bottom: 16px;
            padding-bottom: 16px;
            border-bottom: 1px solid hsl(var(--border-color)/0.4);
        }

        .skeleton-loader .recent-activity-item__auth {
            --size: 32px;
            display: -webkit-box;
            display: -ms-flexbox;
            display: flex;
            -webkit-box-align: center;
            -ms-flex-align: center;
            align-items: center;
            gap: 16px;
            -ms-flex-negative: 0;
            flex-shrink: 0;
        }

        @media screen and (max-width: 1399px) {
            .skeleton-loader .recent-activity-item__auth {
                --size: 24px;
                gap: 12px;
            }
        }

        .skeleton-content {
            font-size: var(--fs);
            -webkit-box-flex: 1;
            -ms-flex: 1;
            flex: 1;
        }

        @media screen and (max-width: 767px) {
            .skeleton-content {
                width: 100%;
                -webkit-box-flex: unset;
                -ms-flex: unset;
                flex: unset;
                -webkit-box-ordinal-group: 3;
                -ms-flex-order: 2;
                order: 2;
            }
        }

        .skeleton-avatar,
        .skeleton-name,
        .skeleton-line,
        .skeleton-date {
            background: hsl(var(--border-color)/0.2);
            border-radius: 4px;
            animation: skeleton-pulse 1.5s infinite ease-in-out;
            position: relative;
            overflow: hidden;
        }

        html[data-theme=dark] .skeleton-avatar,
        html[data-theme=dark] .skeleton-name,
        html[data-theme=dark] .skeleton-line,
        html[data-theme=dark] .skeleton-date {
            background: hsl(var(--border-color)/0.15);
        }

        .skeleton-avatar::before,
        .skeleton-name::before,
        .skeleton-line::before,
        .skeleton-date::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg,
                    transparent,
                    hsl(var(--border-color)/0.4),
                    transparent);
            animation: skeleton-shimmer 2s infinite;
        }

        html[data-theme=dark] .skeleton-avatar::before,
        html[data-theme=dark] .skeleton-name::before,
        html[data-theme=dark] .skeleton-line::before,
        html[data-theme=dark] .skeleton-date::before {
            background: linear-gradient(90deg,
                    transparent,
                    hsl(var(--static-white)/0.1),
                    transparent);
        }

        .skeleton-avatar {
            width: var(--size);
            height: var(--size);
            border-radius: 50%;
            display: inline-block;
            flex-shrink: 0;
        }

        .skeleton-name {
            width: 120px;
            height: var(--fs);
            display: inline-block;
        }

        .skeleton-line {
            height: calc(var(--fs) - 2px);
            margin-bottom: 4px;
            display: block;
        }

        .skeleton-line--long {
            width: 85%;
        }

        .skeleton-line--medium {
            width: 65%;
        }

        .skeleton-date {
            width: 80px;
            height: 0.875rem;
            display: inline-block;
            -ms-flex-negative: 0;
            flex-shrink: 0;
        }

        @keyframes skeleton-pulse {

            0%,
            100% {
                opacity: 1;
            }

            50% {
                opacity: 0.6;
            }
        }

        @keyframes skeleton-shimmer {
            0% {
                left: -100%;
            }

            100% {
                left: 100%;
            }
        }
    </style>
@endpush

@push('script')
    <script>
        (function($) {
            "use strict";

            $('#sort-filter, #amount-filter').select2();

            $('#sort-filter, #amount-filter').on('change', function() {
                filterActivity();
            });

            function filterActivity() {
                const sortValue = $('#sort-filter').val();
                const amountValue = $('#amount-filter').val();
                const currentUrl = window.location.pathname;

                $('#activity-list-container').hide();
                $('#activity-loading').show();
                $('#activity-list-container').addClass('opacity-50');

                $.ajax({
                    url: currentUrl,
                    type: 'GET',
                    data: {
                        sort: sortValue,
                        range: amountValue
                    },
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest'
                    },
                    success: function(response) {
                        $('#activity-list-container').html(response.html);
                    },
                    error: function(xhr, status, error) {
                        console.error('Filter error:', error);
                    },
                    complete: function() {
                        $('#activity-loading').hide();
                        $('#activity-list-container').show();
                        $('#activity-list-container').removeClass('opacity-50');
                    }
                });
            }

        })(jQuery);
    </script>
@endpush
