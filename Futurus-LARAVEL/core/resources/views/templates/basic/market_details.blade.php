@extends('Template::layouts.master')
@section('content')
    <div class="market-container">
        @include('Template::partials.category_navbar')

        <div class="dashboard__inner">

            <section class="market-details">
                <div class="container-fluid">
                    <div class="row">
                        <div class="col-xxl-8 col-lg-7">

                            <section class="market-insight">
                                <div class="market-insight-wrapper">
                                    <div class="market-insight-content">
                                        <div class="market-insight-card">
                                            <div class="market-insight-thumb">
                                                <img src="{{ getImage(getFilePath('market') . '/' . $market->image, getFileSize('market'), option: true) }}"
                                                     alt="image">
                                            </div>
                                            <h5 class="market-insight-title">{{ __($market->question) }}</h5>
                                        </div>
                                        <div class="market-insight-info">
                                            <div class="market-insight-info-item">
                                                <p class="title">@lang('Trade Volume')</p>
                                                <p class="value">{{ gs('cur_sym') }}{{ number_shorten($market->volume) }}
                                                    @lang('Vol').
                                                </p>
                                            </div>
                                            <div class="market-insight-info-item success">
                                                <p class="title"><strong>@lang('Yes')</strong> @lang('Trade')</p>
                                                <p class="value">
                                                    <span class="icon">
                                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                                                             width="24" height="24" color="currentColor"
                                                             fill="none">
                                                            <path
                                                                  d="M18.9905 19H19M18.9905 19C18.3678 19.6175 17.2393 19.4637 16.4479 19.4637C15.4765 19.4637 15.0087 19.6537 14.3154 20.347C13.7251 20.9374 12.9337 22 12 22C11.0663 22 10.2749 20.9374 9.68457 20.347C8.99128 19.6537 8.52349 19.4637 7.55206 19.4637C6.76068 19.4637 5.63218 19.6175 5.00949 19C4.38181 18.3776 4.53628 17.2444 4.53628 16.4479C4.53628 15.4414 4.31616 14.9786 3.59938 14.2618C2.53314 13.1956 2.00002 12.6624 2 12C2.00001 11.3375 2.53312 10.8044 3.59935 9.73817C4.2392 9.09832 4.53628 8.46428 4.53628 7.55206C4.53628 6.76065 4.38249 5.63214 5 5.00944C5.62243 4.38178 6.7556 4.53626 7.55208 4.53626C8.46427 4.53626 9.09832 4.2392 9.73815 3.59937C10.8044 2.53312 11.3375 2 12 2C12.6625 2 13.1956 2.53312 14.2618 3.59937C14.9015 4.23907 15.5355 4.53626 16.4479 4.53626C17.2393 4.53626 18.3679 4.38247 18.9906 5C19.6182 5.62243 19.4637 6.75559 19.4637 7.55206C19.4637 8.55858 19.6839 9.02137 20.4006 9.73817C21.4669 10.8044 22 11.3375 22 12C22 12.6624 21.4669 13.1956 20.4006 14.2618C19.6838 14.9786 19.4637 15.4414 19.4637 16.4479C19.4637 17.2444 19.6182 18.3776 18.9905 19Z"
                                                                  stroke="currentColor" stroke-width="1.5"></path>
                                                            <path
                                                                  d="M9 12.8929C9 12.8929 10.2 13.5447 10.8 14.5C10.8 14.5 12.6 10.75 15 9.5"
                                                                  stroke="currentColor" stroke-width="1.5"
                                                                  stroke-linecap="round" stroke-linejoin="round"></path>
                                                        </svg>
                                                    </span>
                                                    {{ $market->yes_share }}%
                                                </p>
                                            </div>
                                            <div class="market-insight-info-item danger">
                                                <p class="title"><strong>@lang('No')</strong> @lang('Trade')</p>
                                                <p class="value">
                                                    <span class="icon">
                                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                                                             width="24" height="24" color="currentColor"
                                                             fill="none">
                                                            <path
                                                                  d="M3.5 10.5V19.5C3.5 19.9659 3.5 20.1989 3.57612 20.3827C3.67761 20.6277 3.87229 20.8224 4.11732 20.9239C4.30109 21 4.53406 21 5 21C5.46594 21 5.69891 21 5.88268 20.9239C6.12771 20.8224 6.32239 20.6277 6.42388 20.3827C6.5 20.1989 6.5 19.9659 6.5 19.5V10.5C6.5 10.0341 6.5 9.80109 6.42388 9.61732C6.32239 9.37229 6.12771 9.17761 5.88268 9.07612C5.69891 9 5.46594 9 5 9C4.53406 9 4.30109 9 4.11732 9.07612C3.87229 9.17761 3.67761 9.37229 3.57612 9.61732C3.5 9.80109 3.5 10.0341 3.5 10.5Z"
                                                                  stroke="currentColor" stroke-width="1.5"
                                                                  stroke-linejoin="round" />
                                                            <path d="M17.5 7.99988L19.5 10.4999L17 12.4999"
                                                                  stroke="currentColor" stroke-width="1.5"
                                                                  stroke-linecap="round" stroke-linejoin="round" />
                                                            <path
                                                                  d="M19.0001 10.502C19.0001 10.502 11.5001 10.502 4.00012 3.00195"
                                                                  stroke="currentColor" stroke-width="1.5"
                                                                  stroke-linecap="round" stroke-linejoin="round" />
                                                            <path
                                                                  d="M10.5 14V19.5C10.5 19.9659 10.5 20.1989 10.5761 20.3827C10.6776 20.6277 10.8723 20.8224 11.1173 20.9239C11.3011 21 11.5341 21 12 21C12.4659 21 12.6989 21 12.8827 20.9239C13.1277 20.8224 13.3224 20.6277 13.4239 20.3827C13.5 20.1989 13.5 19.9659 13.5 19.5V14C13.5 13.5341 13.5 13.3011 13.4239 13.1173C13.3224 12.8723 13.1277 12.6776 12.8827 12.5761C12.6989 12.5 12.4659 12.5 12 12.5C11.5341 12.5 11.3011 12.5 11.1173 12.5761C10.8723 12.6776 10.6776 12.8723 10.5761 13.1173C10.5 13.3011 10.5 13.5341 10.5 14Z"
                                                                  stroke="currentColor" stroke-width="1.5"
                                                                  stroke-linejoin="round" />
                                                            <path
                                                                  d="M17.5 16.5V19.5C17.5 19.9659 17.5 20.1989 17.5761 20.3827C17.6776 20.6277 17.8723 20.8224 18.1173 20.9239C18.3011 21 18.5341 21 19 21C19.4659 21 19.6989 21 19.8827 20.9239C20.1277 20.8224 20.3224 20.6277 20.4239 20.3827C20.5 20.1989 20.5 19.9659 20.5 19.5V16.5C20.5 16.0341 20.5 15.8011 20.4239 15.6173C20.3224 15.3723 20.1277 15.1776 19.8827 15.0761C19.6989 15 19.4659 15 19 15C18.5341 15 18.3011 15 18.1173 15.0761C17.8723 15.1776 17.6776 15.3723 17.5761 15.6173C17.5 15.8011 17.5 16.0341 17.5 16.5Z"
                                                                  stroke="currentColor" stroke-width="1.5"
                                                                  stroke-linejoin="round" />
                                                        </svg>
                                                    </span>
                                                    {{ $market->no_share }}%
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="market-insight-aside">
                                        <div class="social-share">
                                            <ul class="social-share-list">
                                                <li class="social-share-item">
                                                    <a id="copyLinkBtn" class="social-share-link copy-link"
                                                       data-bs-toggle="tooltip" data-bs-placement="top" title="Copy Link"
                                                       href="javascript:void(0);">
                                                        <i class="fa-solid fa-link"></i>
                                                    </a>
                                                </li>
                                                <li class="social-share-item">
                                                    <a id="copyLinkBtn" class="social-share-link market-card-mark {{ $market?->bookmarks?->isNotEmpty() ? 'active' : '' }}" data-id="{{ $market->id }}"
                                                       data-bs-toggle="tooltip" data-bs-placement="top" title="Bookmark"
                                                       href="javascript:void(0);">
                                                        <i class="fa-regular fa-bookmark"></i>
                                                    </a>
                                                </li>
                                            </ul>
                                        </div>

                                        <div class="market-insight-date">
                                            <p class="noted">@lang('Estimated end time')
                                                <span class="icon" data-bs-toggle="tooltip" data-bs-placement="top"
                                                      title="@lang('Ending time may change depending on market conditions')">
                                                    <i class="fa-regular fa-circle-question"></i>
                                                </span>
                                            </p>

                                            <p class="text">{{ showDateTime($market->end_date, 'F j, Y h:i A') }}</p>
                                        </div>
                                    </div>
                                </div>
                            </section>
                            <div class="card mb-3">
                                <div class="card-body p-0">
                                    <div id="chart"></div>
                                </div>
                            </div>
                            <div class="table-wrapper overflow-hidden">
                                <div class="card">
                                    <div class="card-body p-0">
                                        <div class="table-responsive">
                                            <table class="table table--responsive--md">
                                                <thead>
                                                    <tr>
                                                        <th>@lang('Market')</th>
                                                        <th>@lang('Change')</th>
                                                        <th>@lang('Buy')</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    @forelse ($market?->activeMarketOptions as $option)
                                                        <tr class="cursor-pointer" data-option-id="{{ encrypt($option->id) }}">
                                                            <td>
                                                                <div class="customer">
                                                                    <div class="customer__thumb">
                                                                        <img src="{{ getImage(getFilePath('marketOption') . '/' . $option->image, getFileSize('marketOption'), option: true) }}"
                                                                             alt="user">
                                                                    </div>
                                                                    <div class="customer__content">
                                                                        <p class="customer__name fw-bold">{{ __($option->question) }}
                                                                        </p>
                                                                        <p class="fs-14">@lang('Trade Shares')</p>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <p class="text--dark fw-bold">{{ getAmount($option->chance) }}%</p>
                                                            </td>
                                                            <td>
                                                                <div class="flex-end gap-2">
                                                                    @if ($option->isLocked() || $option->market->isLocked())
                                                                        <button class="btn btn--sm btn-outline--success" disabled
                                                                                data-option-id="{{ encrypt($option->id) }}"
                                                                                data-type="yes">
                                                                            <span class="icon">
                                                                                <svg xmlns="http://www.w3.org/2000/svg" width="16"
                                                                                     height="16" viewBox="0 0 24 24" fill="none"
                                                                                     stroke="currentColor" stroke-width="2"
                                                                                     stroke-linecap="round" stroke-linejoin="round">
                                                                                    <rect x="3" y="11" width="18" height="11"
                                                                                          rx="2" ry="2"></rect>
                                                                                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                                                                                </svg>
                                                                            </span>
                                                                            @lang('Buy Yes')
                                                                        </button>
                                                                    @else
                                                                        <button class="btn btn--sm btn-outline--success option-row"
                                                                                data-option-id="{{ encrypt($option->id) }}"
                                                                                data-type="yes">@lang('Buy Yes')</button>
                                                                    @endif

                                                                    @if ($option->isLocked() || $option->market->isLocked())
                                                                        <button class="btn btn--sm btn-outline--danger" disabled
                                                                                data-option-id="{{ encrypt($option->id) }}"
                                                                                data-type="no">
                                                                            <span class="icon">
                                                                                <svg xmlns="http://www.w3.org/2000/svg" width="16"
                                                                                     height="16" viewBox="0 0 24 24" fill="none"
                                                                                     stroke="currentColor" stroke-width="2"
                                                                                     stroke-linecap="round" stroke-linejoin="round">
                                                                                    <rect x="3" y="11" width="18" height="11"
                                                                                          rx="2" ry="2"></rect>
                                                                                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                                                                                </svg>
                                                                            </span>
                                                                            @lang('Buy No')
                                                                        </button>
                                                                    @else
                                                                        <button class="btn btn--sm btn-outline--danger option-row"
                                                                                data-option-id="{{ encrypt($option->id) }}"
                                                                                data-type="no">@lang('Buy No')</button>
                                                                    @endif
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    @empty
                                                        <tr>
                                                            <td colspan="100%" class="text-center">{{ __($emptyMessage) }}</td>
                                                        </tr>
                                                    @endforelse
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="marked-details-des mb-4">
                                <h5 class="title">@lang('Description')</h5>
                                <p class="text">
                                    @php echo __($market->description) @endphp
                                </p>
                            </div>

                            <ul class="nav nav-pills custom--tab" role="tablist">
                                <li class="nav-item" role="presentation">
                                    <button class="nav-link active" data-bs-toggle="pill"
                                            data-bs-target="#related-markets-tab" type="button" role="tab"
                                            aria-controls="related-markets-tab" aria-selected="false">@lang('Related markets')</button>
                                </li>
                                <li class="nav-item" role="presentation">
                                    <button class="nav-link " data-bs-toggle="pill" data-bs-target="#comments-tab"
                                            type="button" role="tab" aria-controls="comments-tab"
                                            aria-selected="true">@lang('Comments')</button>
                                </li>
                                <li class="nav-item" role="presentation">
                                    <button class="nav-link" data-bs-toggle="pill" data-bs-target="#recent-activity-tab"
                                            type="button" role="tab" aria-controls="recent-activity-tab"
                                            aria-selected="false">@lang('Recent activity')</button>
                                </li>

                            </ul>
                            <div class="tab-content">
                                <div class="tab-pane fade show active" id="related-markets-tab" role="tabpanel"
                                     tabindex="0">
                                    @include('Template::partials.related_markets', [
                                        'relatedMarkets' => $relatedMarkets,
                                    ])
                                </div>
                                <div class="tab-pane fade " id="comments-tab" role="tabpanel" tabindex="0">
                                    <div class="flex-align gap-4 mb-3">
                                        <div class="comment-sort">
                                            <select class="select2 select2--filter" id="comment-sort" data-minimum-results-for-search="-1">
                                                <option value="" selected disabled>@lang('Sort by')</option>
                                                <option value="newest">@lang('Newest')</option>
                                                <option value="oldest">@lang('Oldest')</option>
                                            </select>
                                        </div>
                                        <div class="flex-fill comment-message">
                                            <form id="main-comment-form" class="input-group style-two">
                                                <input type="text" class="form-control sm-style form--control" id="main-comment-input" placeholder="@lang('Add a comment')">
                                                <button class="input-group-text" type="submit">
                                                    @lang('Send')
                                                </button>
                                            </form>
                                        </div>
                                    </div>



                                    <div id="comments-container">
                                        @include('Template::partials.comments', [
                                            'comments' => $comments,
                                        ])
                                    </div>


                                    <div class="d-flex justify-content-center">
                                        <button id="load-more-btn"
                                                class="btn btn-outline--base btn--sm load-more-btn {{ $comments->hasMorePages() ? '' : 'hide-btn' }}">
                                            @lang('Load More')
                                        </button>
                                    </div>
                                </div>
                                <div class="tab-pane fade" id="recent-activity-tab" role="tabpanel" tabindex="0">
                                    @include('Template::partials.recent_activity', [
                                        'recentPurchases' => $recentPurchases,
                                    ])
                                </div>

                            </div>
                        </div>

                        <div class="col-xxl-4 col-lg-5" id="market-details-container">
                            @include('Template::partials.market_info', [
                                'option' => $market->singleMarketOption,
                                'calculations' => $calculations,
                            ])
                        </div>
                    </div>
                </div>
                <div class="modal custom--modal fade" id="reportModal" tabindex="-1" aria-labelledby="reportModalLabel"
                     aria-hidden="true">
                    <div class="modal-dialog modal-dialog-centered">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title">@lang('Report Comment')</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal">
                                    <i class="las la-times"></i>
                                </button>
                            </div>
                            <div class="modal-body">
                                <form id="report-form">
                                    <div class="mb-3">
                                        <label for="report-reason" class="form-label">@lang('Reason')
                                            (@lang('Optional'))</label>
                                        <textarea class="form-control form--control sm-style" id="report-reason" rows="3"
                                                  placeholder="@lang('Please describe why you\'re reporting this comment')"></textarea>
                                    </div>
                                </form>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn--sm btn--dark"
                                        data-bs-dismiss="modal">@lang('Cancel')</button>
                                <button type="button" class="btn btn--sm btn--base"
                                        id="submit-report">@lang('Report')</button>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="modal custom--modal fade" id="loginModal" tabindex="-1" role="dialog"
                     aria-labelledby="loginModalTitle" aria-hidden="true">
                    <div class="modal-dialog modal-dialog-centered" role="document">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title fs-5" id="existModalLongTitle">@lang('Login Required')</h5>
                                <span type="button" class="close" data-bs-dismiss="modal" aria-label="Close">
                                    <i class="las la-times"></i>
                                </span>
                            </div>
                            <div class="modal-body">
                                <h6 class="text-center">@lang('You must be logged in to proceed.')</h6>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn--sm btn--secondary"
                                        data-bs-dismiss="modal">@lang('Close')</button>
                                <a href="{{ route('user.login') }}" class="btn btn--base btn--sm">@lang('Login')</a>
                            </div>
                        </div>
                    </div>
                </div>

            </section>
        </div>
    </div>
    <div class="footer"></div>
@endsection

@push('script-lib')
    <script src="{{ asset(activeTemplate(true) . 'user/js/lib/apexcharts.min.js') }}"></script>
@endpush

@push('script')
    <script>
        (function($) {
            "use strict";



            window.addEventListener("scroll", function() {
                const scrollTop = window.scrollY;
                const viewportHeight = window.innerHeight;
                const fullHeight = document.documentElement.scrollHeight;

                // When scrolled within 100px of bottom
                if (scrollTop + viewportHeight >= fullHeight - 200) {
                    $(".market-details-info").addClass("hide-card");
                } else {
                    $(".market-details-info").removeClass("hide-card");
                }
            });


            function chartConfig(series, xaxis, colors) {
                const options = {
                    grid: {
                        show: true,
                        strokeDashArray: 5,
                        strokeColor: '#c1c9d0',
                        strokeWidth: 1
                    },
                    series: series,

                    tooltip: {
                        shared: true,
                        intersect: false,
                        y: {
                            formatter: function(value, {
                                seriesIndex,
                                dataPointIndex,
                                w
                            }) {
                                return value.toFixed(2) + '%';
                            }
                        }
                    },

                    chart: {
                        type: 'area',
                        height: 350,
                        toolbar: {
                            show: false
                        },
                        animations: {
                            enabled: true,
                            easing: 'easeinout',
                            speed: 800,
                        }
                    },
                    dataLabels: {
                        enabled: false,
                    },
                    stroke: {
                        curve: 'smooth',
                        width: 2
                    },
                    xaxis: {
                        type: 'category',
                        categories: xaxis,
                        labels: {
                            style: {
                                colors: '#888e93',
                            }
                        },
                        axisBorder: {
                            show: false,
                        },
                        axisTicks: {
                            show: false,
                        }
                    },

                    yaxis: {
                        axisBorder: {
                            show: false,
                        },
                        axisTicks: {
                            show: false,
                        },
                        labels: {
                            style: {
                                colors: '#888e93',
                            },
                            formatter: function(value) {
                                return value.toFixed(1) + '%';
                            }
                        },
                        min: 0,
                        max: 100
                    },
                    fill: {
                        type: 'gradient',
                        gradient: {
                            shadeIntensity: 1,
                            opacityFrom: 0.4,
                            opacityTo: 0.1,
                            stops: [0, 90, 100]
                        }
                    },
                    colors: colors,
                    legend: {
                        show: true,
                        position: 'top',
                        horizontalAlign: 'left',
                        labels: {
                            colors: '#888e93',
                        }
                    }
                };
                return options;
            }

            const chartData = JSON.parse(`@php echo json_encode($chartData) @endphp`)

            if (chartData && chartData.series && chartData.series.length > 0) {
                const options = chartConfig(
                    chartData.series,
                    chartData.categories,
                    chartData.colors
                );

                const chart = new ApexCharts(document.querySelector("#chart"), options);
                chart.render();

                if (!chartData.hasData) {
                    const chartContainer = document.querySelector("#chart").parentElement;
                    if (chartContainer && !chartContainer.querySelector('.no-data-message')) {
                        const messageDiv = document.createElement('div');
                        messageDiv.className = 'text-center text-muted small mt-2 no-data-message';
                    }
                }
            } else {
                document.querySelector("#chart").innerHTML =
                    '<div class="text-center p-4"><p class="text-muted">No market options available</p></div>';
            }

            // Comment Start

            const config = {
                marketId: {{ $market->id }},
                currentPage: 1,
                hasMore: true,
                currentSort: 'newest'
            };

            $('.select2').select2();

            $.ajaxSetup({
                headers: {
                    'X-CSRF-TOKEN': '{{ csrf_token() }}',
                }
            });

            const isLoggedIn = {{ auth()->check() ? 'true' : 'false' }};

            $('#main-comment-form').on('submit', function(e) {
                e.preventDefault();
                const content = $('#main-comment-input').val().trim();

                if (!content) {
                    notify('error', 'Please enter a comment');
                    return;
                }
                if (!isLoggedIn) {
                    $('#loginModal').modal('show');
                    return;
                }
                submitComment(content);
            });

            $('#comment-sort').on('change', function() {
                config.currentSort = $(this).val() || 'newest';
                config.currentPage = 1;
                config.hasMore = true;
                loadComments(true);
            });

            $('#load-more-btn').on('click', function() {
                if (config.hasMore) {
                    config.currentPage++;
                    loadComments(false);
                }
            });

            $(document).on('click', '.reply-btn', function() {
                const commentItem = $(this).closest('.comment-item');
                const formWrapper = commentItem.find('.comment-form-wrapper').first();

                if (!isLoggedIn) {
                    $('#loginModal').modal('show');
                    return;
                }

                $('.comment-form-wrapper').not(formWrapper).hide();

                formWrapper.toggle();

                if (formWrapper.is(':visible')) {
                    formWrapper.find('textarea').focus();
                }
            });

            $(document).on('click', '.comment-form-cancel', function() {
                $(this).closest('.comment-form-wrapper').hide();
            });

            $(document).on('submit', '.reply-form', function(e) {
                e.preventDefault();
                const form = $(this);
                const content = form.find('textarea').val().trim();
                const parentId = form.data('parent-id');

                if (!content) {
                    notify('error', 'Please enter a reply');
                    return;
                }

                if (!isLoggedIn) {
                    $('#loginModal').modal('show');
                    return;
                }

                submitComment(content, parentId, form);
            });

            $(document).on('click', '.like-btn', function() {
                const commentId = $(this).data('comment-id');
                const btn = $(this);

                if (btn.hasClass('loading')) return;

                btn.addClass('loading');

                if (!isLoggedIn) {
                    $('#loginModal').modal('show');
                    return;
                }

                $.ajax({
                    url: "{{ route('user.comments.like', ['comment' => ':id']) }}".replace(
                        ':id', commentId),
                    method: 'POST',
                    data: {
                        comment_id: commentId
                    },
                    success: function(response) {
                        if (response.success) {
                            btn.toggleClass('liked', response.is_liked);
                            btn.find('.likes-count').text(response.likes_count);
                        }
                    },
                    error: function(xhr) {
                        const response = xhr.responseJSON;
                        notify('error', response.message || 'An error occurred');
                    },
                    complete: function() {
                        btn.removeClass('loading');
                    }
                });
            });

            let reportCommentId = null;
            $(document).on('click', '.report-btn', function(e) {
                e.preventDefault();
                if (!isLoggedIn) {
                    $('#loginModal').modal('show');
                    return;
                }
                reportCommentId = $(this).data('comment-id');
                $('#reportModal').modal('show');
            });

            $('#submit-report').on('click', function() {
                if (!reportCommentId) return;

                if (!isLoggedIn) {
                    $('#loginModal').modal('show');
                    return;
                }

                const reason = $('#report-reason').val();
                const btn = $(this);

                if (btn.hasClass('loading')) return;

                btn.addClass('loading').text('Reporting...');

                $.ajax({
                    url: "{{ route('user.comments.report', ['comment' => ':id']) }}"
                        .replace(':id', reportCommentId),
                    method: 'POST',
                    data: {
                        reason: reason,
                        comment_id: reportCommentId
                    },
                    success: function(response) {
                        if (response.success) {
                            $('#reportModal').modal('hide');
                            notify('success', 'Comment reported successfully');
                            $('#report-reason').val('');
                        } else {
                            notify('error', response.message);
                        }
                    },
                    error: function(xhr) {

                        const response = xhr.responseJSON;
                        notify('error', response.message || 'An error occurred');
                    },
                    complete: function() {
                        btn.removeClass('loading').text('Report');
                    }
                });
            });

            function loadComments(replace = false) {
                const container = $('#comments-container');
                const loadMoreBtn = $('#load-more-btn');

                if (replace) {
                    container.addClass('loading');
                } else {
                    loadMoreBtn.addClass('loading')
                        .prop('disabled', true)
                        .html('<span class="spinner-border spinner-border-sm me-2" role="status"></span>Loading...');
                }

                $.ajax({
                    url: "{{ route('user.comments.index') }}",
                    method: 'GET',
                    data: {
                        market_id: config.marketId,
                        sort_by: config.currentSort,
                        page: config.currentPage
                    },
                    success: function(response) {
                        if (response.success) {

                            if (replace) {
                                container.html(response.html);
                            } else {
                                container.append(response.html);
                            }

                            config.hasMore = response.has_more;

                            if (config.hasMore) {
                                loadMoreBtn.removeClass('hide-btn');
                            } else {
                                loadMoreBtn.addClass('hide-btn');
                            }
                        }
                    },
                    error: function(xhr) {
                        if (replace) {
                            container.html('<p>Error loading comments. Please try again.</p>');
                        }
                    },
                    complete: function() {
                        container.removeClass('loading');
                        loadMoreBtn.removeClass('loading')
                            .prop('disabled', false)
                            .html('@lang('Load More')');
                    }
                });
            }

            function submitComment(content, parentId = null, form = null) {
                const mainForm = $('#main-comment-form');
                const mainInput = $('#main-comment-input');
                const submitBtn = form ? form.find('button[type="submit"]') : mainForm.find(
                    'button[type="submit"]');
                const textarea = form ? form.find('textarea') : null;

                if (submitBtn.hasClass('loading')) return;

                submitBtn.addClass('loading');
                if (form) {
                    submitBtn.find('i').removeClass('fa-paper-plane').addClass('fa-spinner fa-spin');
                } else {
                    submitBtn.text('Sending...');
                }

                $.ajax({
                    url: "{{ route('user.comments.store') }}",
                    method: 'POST',
                    data: {
                        comment: content,
                        market_id: config.marketId,
                        parent_id: parentId
                    },
                    success: function(response) {
                        if (response.success) {
                            if (parentId) {
                                const parentComment = $(
                                    `.comment-item-block[data-comment-id="${parentId}"]`);
                                let replyBlock = parentComment.find('.comment-reply-block');

                                if (replyBlock.length === 0) {
                                    replyBlock = $('<div class="comment-reply-block"></div>');
                                    parentComment.append(replyBlock);
                                }

                                replyBlock.append(response.html);
                                form.closest('.comment-form-wrapper').hide();
                                textarea.val('');
                            } else {
                                $('#comments-container').prepend(response.html);
                                $('#empty-div').addClass('d-none');
                                mainInput.val('');
                            }
                        }
                    },
                    error: function(xhr) {
                        const response = xhr.responseJSON;
                        notify('error', response.message || 'An error occurred');
                    },
                    complete: function() {
                        submitBtn.removeClass('loading');
                        if (form) {
                            submitBtn.find('i').removeClass('fa-spinner fa-spin').addClass(
                                'fa-paper-plane');
                        } else {
                            submitBtn.text('Send');
                        }
                    }
                });
            }


            // Comment replies
            const repliesConfig = {
                currentPages: {},
                hasMore: {}
            };

            function loadMoreReplies(commentId, page = 1, replace = false, $btn = null) {
                const seeMoreBtn = $btn || $(`.see-more-replies-btn[data-comment-id="${commentId}"]`).first();
                const replyBlock = seeMoreBtn.closest('.comment-reply-block');
                const repliesContainer = replyBlock.find('.replies-container');

                if (!replace) {
                    seeMoreBtn
                        .addClass('loading')
                        .prop('disabled', true)
                        .html('<span class="spinner-border spinner-border-sm me-2" role="status"></span>Loading...');
                }

                $.ajax({
                    url: "{{ route('user.comments.replies') }}",
                    method: 'GET',
                    data: {
                        comment_id: commentId,
                        replies_page: page
                    },
                    cache: false,
                    success: function(response) {
                        if (!response || !response.success) return;

                        if (replace) {
                            repliesContainer.html(response.html);
                        } else {
                            repliesContainer.append(response.html);
                        }

                        repliesConfig.currentPages[commentId] = response.current_page;
                        repliesConfig.hasMore[commentId] = response.has_more;

                        const perPage = response.per_page ?? 1;
                        const remainingReplies = Math.max(0, response.total - (response.current_page *
                            perPage));

                        if (response.has_more) {
                            seeMoreBtn
                                .removeClass('hide-btn')
                                .attr('data-page', response.current_page + 1)
                                .data('page', response.current_page + 1)
                                .html(
                                    `<i class="fas fa-chevron-down me-1"></i>@lang('See') ${remainingReplies} @lang('more replies')`
                                );
                        } else {
                            seeMoreBtn.addClass('hide-btn');
                        }
                    },
                    error: function(xhr) {
                        if (!replace) {
                            repliesContainer.append(
                                '<p class="text-danger small">Error loading replies. Please try again.</p>'
                            );
                        }
                    },
                    complete: function() {
                        seeMoreBtn.removeClass('loading').prop('disabled', false);
                    }
                });
            }

            $(document).on('click', '.see-more-replies-btn', function(e) {
                e.preventDefault();
                const $btn = $(this);
                const commentId = $btn.attr('data-comment-id');

                const current = repliesConfig.currentPages[commentId] ?? 1;
                const nextPage = current + 1;

                if (!$btn.hasClass('loading')) {
                    loadMoreReplies(commentId, nextPage, false, $btn);
                }
            });

            $(document).ready(function() {
                $('.see-more-replies-btn').each(function() {
                    const $btn = $(this);
                    const commentId = $btn.attr('data-comment-id');
                    const nextAttr = parseInt($btn.attr('data-page'), 3) || 2;
                    repliesConfig.currentPages[commentId] = nextAttr - 1;
                    repliesConfig.hasMore[commentId] = true;
                });
            });

            // Comment End

            let selectedOptionId = null;
            let selectedType = null;

            function initializeDefaultSelection() {
                const defaultChecked = $('input[name="buy_option"]:checked');
                if (defaultChecked.length) {
                    selectedType = defaultChecked.val();
                }
            }

            initializeDefaultSelection();

            $(document).on('click', '.option-row', function() {
                selectedOptionId = $(this).data('option-id');
                selectedType = $(this).data('type') || null;
                const shareInputVal = $('[name=shares]').val() || 0;

                $.get("{{ route('markets.option.details', ':id') }}".replace(':id', selectedOptionId), {
                        type: selectedType,
                        shares: shareInputVal
                    },
                    function(response) {
                        if (response.success) {
                            $('#market-details-container').html(response.html);
                            if (shareInputVal > 0) {
                                $('[name=shares]').val(shareInputVal).trigger('change');
                            }
                            initializeDefaultSelection();
                        }
                    });
            });

            $(document).on('change', 'input[name="buy_option"]', function() {
                selectedType = $(this).val();
                $('.option-btn').removeClass('active');
                $(this).closest('label').addClass('active');

                if (selectedType === 'yes') {
                    $('.yes-no').text('Yes');
                    $('.yes-price-row').removeClass('d-none');
                    $('.no-price-row').addClass('d-none');
                } else if (selectedType === 'no') {
                    $('.yes-no').text('No');
                    $('.no-price-row').removeClass('d-none');
                    $('.yes-price-row').addClass('d-none');
                }

                const shareInput = $('[name=shares]');
                if (shareInput.length && shareInput.val() && parseFloat(shareInput.val()) > 0) {
                    shareInput.trigger('change');
                }
            });


            $(document).on('change keyup', '[name=shares]', function() {
                const shares = parseFloat($(this).val());
                selectedOptionId = $(this).data('option-id');

                if (!selectedType) {
                    notify('error', 'Please select Buy Yes or Buy No');
                    return;
                }

                if (!selectedOptionId || isNaN(shares) || shares <= 0) {
                    $('.yes-no').text('');
                    $('.payout-amount').text('0.00');
                    $('.profit-amount').text('0.00');
                    $('.total-amount').text('0.00');
                    return;
                }

                $.get("{{ route('markets.option.details', ':id') }}".replace(':id', selectedOptionId), {
                        shares: shares,
                        type: selectedType
                    },
                    function(response) {
                        if (response.success && response.calculations) {
                            let payout = 0;
                            let profit = 0;
                            let label = '';
                            let sharePrice = 0;
                            let totalAmount = 0;

                            if (selectedType === 'yes') {
                                sharePrice = response.calculations.yes_share_price;
                                totalAmount = response.calculations.total_amount;
                                payout = response.calculations.yes_payout_if_win;
                                profit = response.calculations.yes_profit_if_win;
                                label = 'Yes';
                            } else if (selectedType === 'no') {
                                sharePrice = response.calculations.no_share_price;
                                totalAmount = response.calculations.total_amount;
                                payout = response.calculations.no_payout_if_win;
                                profit = response.calculations.no_profit_if_win;
                                label = 'No';
                            }

                            $('.yes-no').text(label);
                            $('.payout-amount').text(payout.toFixed(2));
                            $('.profit-amount').text(profit.toFixed(2));
                            $('.total-amount').text(totalAmount.toFixed(2));
                        }
                    }
                );
            });


            $(document).on('click', '.copy-link', function(e) {
                e.preventDefault();

                const currentUrl = window.location.href;
                navigator.clipboard.writeText(currentUrl).then(function() {
                    notify('success', 'URL copied successfully!');
                }).catch(function(err) {
                    notify('error', 'Failed to copy URL.');
                });
            });


            $(document).off('click', '.market-card-mark').on('click', '.market-card-mark', function(e) {
                e.preventDefault();

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

@push('style')
    <style>
        .market-details {
            margin-top: 30px;
        }

        @media screen and (max-width: 991px) {
            .market-details-info {
                position: fixed !important;
                top: auto !important;
                bottom: 0;
                left: 50%;
                -webkit-transform: translateX(-50%);
                transform: translateX(-50%);
                width: 100%;
                height: auto;
                z-index: 99;
                background: hsl(var(--white));
                border: none;
                -webkit-box-shadow: 0px -2px 4px 0px hsl(var(--black)/0.1);
                box-shadow: 0px -2px 4px 0px hsl(var(--black)/0.1);
                border-radius: 0;
                -webkit-transition: all linear 0.3s;
                transition: all linear 0.3s;
            }

            .market-details-info.hide-card {
                -webkit-transform: translateX(-50%) translateY(100%);
                transform: translateX(-50%) translateY(100%);
            }
        }

        .empty-message {
            text-align: center;

            img {
                width: 140px;

            }
        }

        p.empty-message-text {
            font-size: 16px;
            font-weight: 500;
        }

        .hide-btn {
            display: none !important;
        }

        .action-dropdown .dropdown-btn {
            --size: 24px;
            width: var(--size);
            height: var(--size);
            border-radius: 50%;
            color: hsl(var(--black)/0.6);
            font-size: calc(var(--size) * 0.5);
            border: 1px solid hsl(var(--border-color));
            background-color: transparent;
        }

        .action-dropdown .dropdown-menu {
            border: 1px solid hsl(var(--border-color));
        }

        .action-dropdown .dropdown-item {
            font-size: 0.875rem;
            font-weight: 500;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 8px;
            transition: .3s ease;
        }

        .action-dropdown .dropdown-item i {
            font-size: 1em;
        }

        .action-dropdown .dropdown-item:hover,
        .action-dropdown .dropdown-item:focus {
            color: hsl(var(--white));
            background-color: hsl(var(--base));
        }
    </style>
@endpush

@push('style-lib')
    <link rel="stylesheet" href="{{ asset(activeTemplate(true) . 'user/css/market.css') }}">
@endpush
