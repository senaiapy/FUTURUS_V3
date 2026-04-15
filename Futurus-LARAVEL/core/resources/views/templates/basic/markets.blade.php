@extends('Template::layouts.master')
@section('content')
    <div class="market-container">
        @include('Template::partials.category_navbar')
        <section class="market-section">
            <div class="dashboard__inner">
                <div class="container-fluid">
                    <div class="row">
                        <div class="col-12">
                            <div class="filters-nav">
                                <div class="nav-left">
                                    <p class="count">
                                        @lang('Total')
                                        <span class="total-count">{{ $markets->total() }}</span> @lang('Result found')
                                    </p>
                                </div>
                                <div class="nav-right">
                                    @if ($category)
                                        <select name="subcategory_id" id="" class="select2 select2--filter">
                                            <option value="" selected>@lang('All')</option>
                                            @foreach ($category->subcategories as $sub)
                                                <option value="{{ $sub->id }}">{{ __($sub->name) }}</option>
                                            @endforeach
                                        </select>
                                    @endif
                                    <div class="custom-search">
                                        <input type="search" name="search_market" placeholder="Search Market..." value="{{ request()->search }}">
                                        <button class="search-btn btn" type="button">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24"
                                                 height="24" color="currentColor" fill="none">
                                                <path d="M17 17L21 21" stroke="currentColor" stroke-width="1.5"
                                                      stroke-linecap="round" stroke-linejoin="round" />
                                                <path
                                                      d="M19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19C15.4183 19 19 15.4183 19 11Z"
                                                      stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
                                                      stroke-linejoin="round" />
                                            </svg>
                                        </button>

                                    </div>
                                    <button class="btn btn-outline--base d-lg-none" id="show-search" type="button">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24"
                                             height="24" color="currentColor" fill="none">
                                            <path d="M17 17L21 21" stroke="currentColor" stroke-width="1.5"
                                                  stroke-linecap="round" stroke-linejoin="round" />
                                            <path
                                                  d="M19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19C15.4183 19 19 15.4183 19 11Z"
                                                  stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
                                                  stroke-linejoin="round" />
                                        </svg>
                                    </button>
                                    <div class="category-filter">
                                        <div class="dropdown">
                                            <button class="btn btn-outline--base dropdown-toggle" type="button"
                                                    data-bs-toggle="dropdown" aria-expanded="false">
                                                @lang('Filter')
                                            </button>
                                            <ul class="dropdown-menu border-0">
                                                <div class=" p-1">
                                                    <div class="form--radio">
                                                        <label class="form-check-label" for="volume-low">
                                                            <input type="radio" class="form-check-input" name="sort_by"
                                                                   id="volume-low" value="volume_asc" @checked(request()->sort_by == 'volume_asc')>
                                                            @lang('Volume Low to High')
                                                        </label>
                                                    </div>
                                                    <div class="form--radio">
                                                        <label class="form-check-label" for="volume-high">
                                                            <input type="radio" class="form-check-input" name="sort_by"
                                                                   id="volume-high" value="volume_desc"
                                                                   @checked(request()->sort_by == 'volume_desc')>
                                                            @lang('Volume High to Low')
                                                        </label>
                                                    </div>
                                                    <div class="form--radio">
                                                        <label class="form-check-label" for="trending">
                                                            <input type="radio" class="form-check-input" name="sort_by"
                                                                   id="trending" value="trending" @checked(request()->sort_by == 'trending')>
                                                            @lang('Trending')
                                                        </label>
                                                    </div>
                                                    <div class="form--radio">
                                                        <label class="form-check-label" for="newest">
                                                            <input type="radio" class="form-check-input" name="sort_by"
                                                                   id="newest" value="start_date_desc"
                                                                   @checked(request()->sort_by == 'start_date_desc')>
                                                            @lang('Newest')
                                                        </label>
                                                    </div>
                                                    <div class="form--radio">
                                                        <label class="form-check-label" for="oldest">
                                                            <input type="radio" class="form-check-input" name="sort_by"
                                                                   id="oldest" value="start_date_asc"
                                                                   @checked(request()->sort_by == 'start_date_asc')>
                                                            @lang('Oldest')
                                                        </label>
                                                    </div>
                                                    <div class="form--radio">
                                                        <label class="form-check-label" for="closing-soon">
                                                            <input type="radio" class="form-check-input" name="sort_by"
                                                                   id="closing-soon" value="end_date_asc"
                                                                   @checked(request()->sort_by == 'end_date_asc')>
                                                            @lang('Closing Soon')
                                                        </label>
                                                    </div>
                                                </div>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="col-12">
                            <div class="row justify-content-center g-4 g-xxl-4" id="market-results">
                                @include('Template::partials.markets', [
                                    'markets' => $markets,
                                    'paginate' => true,
                                ])
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    </div>
@endsection


@push('style')
    <style>
        .empty-message {
            text-align: center;
            margin-top: 60px;
            background: hsl(var(--white));
            border-radius: 10px;
            padding: 60px;

            img {
                width: 140px;

            }
        }

        p.empty-message-text {
            font-size: 16px;
            font-weight: 500;
        }
    </style>
@endpush



@push('script')
    <script>
        (function($) {
            "use strict";


            $('#show-search').on('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                $('.custom-search').toggleClass('show');
            });

            $('body').on('click', function() {
                $('.custom-search').removeClass('show');
            });

            $('.custom-search').on('click', function(e) {
                e.stopPropagation();
            });



            let page = null;

            $('[name=sort_by]').on('change', function(e) {
                e.preventDefault();
                fetchMarkets();

            });
            $('[name=subcategory_id]').on('change', function(e) {
                e.preventDefault();
                fetchMarkets();
            });

            $('.search-btn').on('click', function(e) {
                e.preventDefault();
                fetchMarkets();
            });


            function fetchMarkets(bookmark = false) {
                let sortBy = $('[name="sort_by"]:checked').val();
                let subcategoryId = $('[name=subcategory_id]').find('option:selected').val() ?? 0;
                let searchValue = $('[name=search_market]').val();
                let categoryId = Number("{{ $category?->id }}") ?? 0


                let data = {};
                data.sort_by = sortBy;
                data.subcategory_id = subcategoryId;
                data.search = searchValue;
                data.category_id = categoryId
                data.bookmark = bookmark;



                const urlParams = new URLSearchParams(window.location.search);

                if (sortBy) urlParams.set('sort_by', sortBy);
                else urlParams.delete('sort_by');
                if (subcategoryId) urlParams.set('subcategory_id', subcategoryId);
                else urlParams.delete('subcategory_id');
                if (searchValue) urlParams.set('search', searchValue);
                else urlParams.delete('search');
                urlParams.set('category_id', categoryId);

                if (page) {
                    urlParams.set('page', page);
                } else {
                    urlParams.delete('page');
                }

                const newUrl = `${window.location.pathname}?${urlParams.toString()}`;
                window.history.replaceState({}, '', newUrl);


                const container = $('#market-results');
                container.html(`@include('Template::partials.market_skeleton')`);

                let url = `{{ route('markets.filter') }}`;
                if (page) {
                    url = `{{ route('markets.filter') }}?page=${page}`;
                }

                $.ajax({
                    type: "GET",
                    url: url,
                    data: data,
                    success: function(response) {
                        if (response.success) {
                            $('#market-results').html(response.html);
                            $('.total-count').text(response.total);
                        } else {
                            notify('error', 'Invalid request');
                        }
                    }
                });
            }

            $(document).on('click', '.pagination a', function(event) {
                event.preventDefault();
                page = $(this).attr('href').split('page=')[1];
                fetchMarkets();
            });


            $('.reset-btn').on('click', function() {
                $('[name=sort_by]').prop('checked', false);
                $('[name=subcategory_id]').prop('checked', false);
                $("#subcategory-all").prop('checked', true);
                $('[name=search_market]').val('');
                page = null;
                window.history.replaceState({}, '', window.location.pathname);
                fetchMarkets('');
            });

            $(document).on('click', '.market-bookmark-btn', function(e) {
                e.preventDefault();
                fetchMarkets(true);
            });

            // Open sidebar
            $('.product-filter-arrow-btn').on('click', function() {
                $('.filters-sidebar').addClass('show');
            });

            // Close sidebar
            $('.filter-closs').on('click', function() {
                $('.filters-sidebar').removeClass('show');
            });



            function horizontalMenuScrolling(element, baseClass = "category-nav") {
                let prev = $(element).find(`.${baseClass}-btn.prev`);
                let next = $(element).find(`.${baseClass}-btn.next`);
                let menu = $(element).find(`.${baseClass}-list`);
                let menuItems = $(menu).find(`.${baseClass}-item`);
                let menuItemFirst = $(menu).find(`.${baseClass}-item:first-child`);
                let menuItemLast = $(menu).find(`.${baseClass}-item:last-child`);
                let menuItemTotalWidth = 0;
                let menuScrollLeft = 0;
                let observerOptions = {
                    root: menu[0],
                    rootMargin: "1px",
                    threshold: 1,
                };
                let setIntersectionObserver = function(element, btn) {
                    let observer = new IntersectionObserver((entries) => {
                        entries.forEach((entry) => {
                            entry.intersectionRatio >= 1 ?
                                $(btn).removeClass("show") :
                                $(btn).addClass("show");
                        });
                    }, observerOptions);
                    return observer.observe(element);
                };
                menu[0].scrollLeft = 0;
                setIntersectionObserver(menuItemFirst[0], prev[0]);
                setIntersectionObserver(menuItemLast[0], next[0]);
                menuItems.each(
                    (index, element) => (menuItemTotalWidth += element.scrollWidth)
                );
                menuScrollLeft = Math.floor(menuItemTotalWidth / menuItems.length);
                next.on("click", function() {
                    menu[0].scrollLeft += menuScrollLeft;
                });
                prev.on("click", function() {
                    if (menu[0].scrollLeft === 0) {
                        return;
                    }
                    menu[0].scrollLeft -= menuScrollLeft;
                });
            }
            $(".category-nav-slider").each((index, element) =>
                horizontalMenuScrolling(element)
            );

        })(jQuery);
    </script>
@endpush
@push('style-lib')
    <link rel="stylesheet" href="{{ asset(activeTemplate(true) . 'user/css/market.css') }}">
@endpush
