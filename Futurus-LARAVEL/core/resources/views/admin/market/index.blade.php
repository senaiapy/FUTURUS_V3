@extends('admin.layouts.app')

@section('panel')
    <div class="row">
        <div class="col-lg-12">

            <div class="show-filter mb-3 text-end">
                <button type="button" class="btn btn-outline--primary showFilterBtn btn-sm"><i class="las la-filter"></i>
                    @lang('Filter')</button>
            </div>
            <div class="card responsive-filter-card mb-4">
                <div class="card-body">
                    <form>
                        <div class="d-flex flex-wrap gap-4">
                            <div class="flex-grow-1">
                                <label>@lang('Title')</label>
                                <input type="search" name="search" value="{{ request()->search }}" class="form-control">
                            </div>
                            <div class="flex-grow-1">
                                <label>@lang('Type')</label>
                                <select name="type" class="form-control select2" data-minimum-results-for-search="-1">
                                    <option value="">@lang('All')</option>
                                    <option value="1" @selected(request()->type == '1')>@lang('Single')</option>
                                    <option value="2" @selected(request()->type == '2')>@lang('Multiple')</option>
                                </select>
                            </div>
                            <div class="flex-grow-1">
                                <label>@lang('Category')</label>
                                <select class="form-control select2" name="category_id">
                                    <option value="">@lang('All')</option>
                                    @foreach ($categories as $category)
                                        <option value="{{ $category->id }}" @selected(request()->category_id == $category->id)>
                                            {{ __(keyToTitle($category->name)) }}</option>
                                    @endforeach
                                </select>
                            </div>
                            <div class="flex-grow-1">
                                <label>@lang('Create Date')</label>
                                <input name="date" type="search"
                                       class="datepicker-here form-control bg--white pe-2 date-range"
                                       placeholder="@lang('Start Date - End Date')" autocomplete="off" value="{{ request()->date }}">
                            </div>
                            <div class="flex-grow-1 align-self-end">
                                <button class="btn btn--primary w-100 h-45"><i class="fas fa-filter"></i>
                                    @lang('Filter')</button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>


            <div class="card">
                <div class="card-body p-0">
                    <div class="table-responsive--md table-responsive">
                        <table class="table table--light style--two">
                            <thead>
                                <tr>
                                    <th>@lang('Title')</th>
                                    <th>@lang('Category')</th>
                                    <th>@lang('Type')</th>
                                    <th>@lang('Volume')</th>
                                    <th>@lang('Status')</th>
                                    <th>@lang('Lock')</th>
                                    <th>@lang('Trending')</th>
                                    @if (request()->routeIs('admin.market.declared'))
                                        <th>@lang('Profit/Loss')</th>
                                        <th>@lang('Resolved At')</th>
                                    @endif
                                    @if (request()->routeIs('admin.market.upcoming'))
                                        <th>@lang('Start Time')</th>
                                    @endif
                                    @if (!in_array(request()->route()->getName(), ['admin.market.upcoming', 'admin.market.declared']))
                                        <th>@lang('End Time')</th>
                                    @endif
                                    <th>@lang('Action')</th>
                                </tr>
                            </thead>
                            <tbody>
                                @forelse($markets as $market)
                                    <tr>

                                        <td>
                                            <div class="d-flex align-items-center">
                                                @if ($market->image)
                                                    <div class="table-thumb me-2">
                                                        <img src="{{ getImage(getFilePath('market') . '/' . $market->image, getFileSize('market'), option: true) }}"
                                                             alt="@lang('image')">
                                                    </div>
                                                @endif
                                                <div>
                                                    <span class="fw-bold cursor-pointer" data-bs-toggle="tooltip"
                                                          data-bs-placement="top" title="{{ $market->question }}">
                                                        {{ __(strLimit($market->question, 30)) }}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>

                                        <td>
                                            <span class="fw-bold">{{ $market->category->name }}</span>
                                            @if ($market->subcategory)
                                                <br><small class="text-muted">{{ $market->subcategory->name }}</small>
                                            @endif
                                        </td>

                                        <td>
                                            @if ($market->type == Status::SINGLE_MARKET)
                                                <p> @lang('Single')</p>
                                            @else
                                                <p> @lang('Multiple')</p>
                                            @endif
                                        </td>

                                        <td>
                                            {{ number_shorten($market->volume) }}
                                        </td>

                                        <td>
                                            @php
                                                echo $market->statusBadge;
                                            @endphp
                                        </td>

                                        <td>
                                            <x-toggle-switch class="change_lock" :checked="$market->is_lock"
                                                             data-id="{{ $market->id }}" />
                                        </td>

                                        <td>
                                            <x-toggle-switch class="change_trending" :checked="$market->is_trending"
                                                             data-id="{{ $market->id }}" />
                                        </td>

                                        @if (request()->routeIs('admin.market.declared'))
                                            <td class="{{ $market->profit_loss >= 0 ? 'text--success' : 'text--danger' }}">
                                                @if ($market->profit_loss >= 0)
                                                    +{{ showAmount($market->profit_loss) }}
                                                @else
                                                    {{ showAmount($market->profit_loss) }}
                                                @endif
                                            </td>

                                            <td>
                                                {{ showDateTime($market->resolved_at) }}<br>
                                                {{ diffForHumans($market->resolved_at) }}<br>
                                            </td>
                                        @endif

                                        @if (request()->routeIs('admin.market.upcoming'))
                                            <td>
                                                {{ showDateTime($market->start_date) }}<br>
                                                {{ diffForHumans($market->start_date) }}<br>
                                            </td>
                                        @endif
                                        @if (!in_array(request()->route()->getName(), ['admin.market.upcoming', 'admin.market.declared']))
                                            <td>
                                                {{ showDateTime($market->end_date) }}<br>
                                                {{ diffForHumans($market->end_date) }}
                                            </td>
                                        @endif
                                        <td>
                                            <div class="button--group">
                                                <button class="btn btn--sm btn-outline--info" type="button"
                                                        data-bs-toggle="dropdown" aria-expanded="false">
                                                    <i class="las la-ellipsis-v"></i> @lang('Actions')
                                                </button>
                                                <div class="dropdown-menu">
                                                    <a class="dropdown-item"
                                                       href="{{ route('admin.market.option', $market->id) }}">
                                                        <i class="la la-cogs"></i> @lang('Options')
                                                    </a>

                                                    @php
                                                        $canEdit = !$market->purchases()->exists() && $market->status != Status::MARKET_SETTLED && $market->status != Status::MARKET_CANCELLED;
                                                    @endphp

                                                    @if ($canEdit)
                                                        <a class="dropdown-item"
                                                           href="{{ route('admin.market.form', $market->id) }}">
                                                            <i class="la la-pencil"></i> @lang('Edit')
                                                        </a>
                                                    @else
                                                        <div class="dropdown-item-wrapper" data-bs-toggle="tooltip"
                                                             data-bs-placement="top"
                                                             title="@if ($market->purchases()->exists()) @lang('Cannot edit market with purchases') @else @lang('Cannot edit settled/cancelled market') @endif">
                                                            <span class="dropdown-item disabled text-muted">
                                                                <i class="la la-pencil"></i> @lang('Edit')
                                                            </span>
                                                        </div>
                                                    @endif


                                                    @if (!in_array($market->status, [Status::MARKET_CLOSED, Status::MARKET_CANCELLED, Status::MARKET_SETTLED, Status::MARKET_COMPLETED]))
                                                        @if ($market->status == Status::DISABLE)
                                                            <a class="dropdown-item confirmationBtn" href="javascript:void(0);"
                                                               data-action="{{ route('admin.market.status', $market->id) }}"
                                                               data-question="@lang('Are you sure to enable this market?')">
                                                                <i class="la la-eye"></i> @lang('Enable')
                                                            </a>
                                                        @else
                                                            <a class="dropdown-item confirmationBtn" href="javascript:void(0);"
                                                               data-action="{{ route('admin.market.status', $market->id) }}"
                                                               data-question="@lang('Are you sure to disable this market?')">
                                                                <i class="la la-eye-slash"></i> @lang('Disable')
                                                            </a>
                                                        @endif
                                                    @endif


                                                    @if (!in_array($market->status, [Status::MARKET_CANCELLED, Status::MARKET_SETTLED, Status::MARKET_COMPLETED]))
                                                        <a class="dropdown-item confirmationBtn" href="javascript:void(0);"
                                                           data-action="{{ route('admin.market.cancel', $market->id) }}"
                                                           data-question="@lang('Are you sure you want to cancel this market? All purchases will be refunded to the users.')">
                                                            <i class="la la-ban"></i> @lang('Cancel')
                                                        </a>
                                                    @endif

                                                    @if ($market->status == Status::MARKET_CLOSED)
                                                        <a href="{{ route('admin.market.resolve', $market->id) }}"
                                                           class="dropdown-item">
                                                            <i class="la la-gavel"></i> @lang('Declare Result')
                                                        </a>
                                                    @endif
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                @empty
                                    <tr>
                                        <td class="text-muted text-center" colspan="100%">{{ __($emptyMessage) }}</td>
                                    </tr>
                                @endforelse
                            </tbody>
                        </table>
                    </div>
                </div>

                @if ($markets->hasPages())
                    <div class="card-footer py-4">
                        {{ paginateLinks($markets) }}
                    </div>
                @endif
            </div>
        </div>
    </div>

    <div class="modal fade" id="resolveModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <form id="resolveForm" method="POST" action="#">
                    @csrf
                    <input type="hidden" name="market_id" id="market_id">

                    <div class="modal-header">
                        <h5 class="modal-title" id="resolveModalTitle"></h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>

                    <div class="modal-body" id="resolveModalContent">
                        <!-- Dynamic content comes here -->
                    </div>

                    <div class="modal-footer">
                        <button type="submit" class="btn btn--success">
                            <i class="la la-check-circle"></i> @lang('Confirm Resolve')
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <x-confirmation-modal />
@endsection

@push('script-lib')
    <script src="{{ asset('assets/admin/js/moment.min.js') }}"></script>
    <script src="{{ asset('assets/admin/js/daterangepicker.min.js') }}"></script>
    <script src="{{ asset('assets/admin/js/cu-modal.js') }}"></script>
@endpush

@push('style-lib')
    <link rel="stylesheet" type="text/css" href="{{ asset('assets/admin/css/daterangepicker.css') }}">
@endpush


@push('style')
    <style>
        .fab-menu {
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 1000;
        }

        .table-thumb img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .fab-btn {
            display: block;
            width: 56px;
            height: 56px;
            border-radius: 50%;
            background: #5b6582;
            color: white;
            text-align: center;
            line-height: 56px;
            font-size: 24px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            transition: all 0.3s ease;
        }

        .fab-btn:hover {
            background: #4a5568;
            transform: scale(1.1);
            color: white;
            text-decoration: none;
        }

        .dropdown-item.active,
        .dropdown-item:active {
            background-color: #4634ff !important;
        }
    </style>
@endpush

@push('script')
    <script>
        (function($) {
            "use strict";

            $('.change_lock').on('change', function() {
                var id = $(this).data('id');

                var data = {
                    _token: `{{ csrf_token() }}`,
                };

                $.ajax({
                    url: `{{ route('admin.market.lock', '') }}/${$(this).data('id')}`,
                    method: 'POST',
                    data: data,
                    success: function(response) {
                        notify(response.status, response.message);
                    }
                });
            });

            $('.change_trending').on('change', function() {
                var id = $(this).data('id');

                var data = {
                    _token: `{{ csrf_token() }}`,
                };

                $.ajax({
                    url: `{{ route('admin.market.trending', '') }}/${$(this).data('id')}`,
                    method: 'POST',
                    data: data,
                    success: function(response) {
                        notify(response.status, response.message);
                    }
                });
            });

            const datePicker = $('.date-range').daterangepicker({
                autoUpdateInput: false,
                locale: {
                    cancelLabel: 'Clear'
                },
                showDropdowns: true,
                ranges: {
                    'Today': [moment(), moment()],
                    'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
                    'Last 7 Days': [moment().subtract(6, 'days'), moment()],
                    'Last 15 Days': [moment().subtract(14, 'days'), moment()],
                    'Last 30 Days': [moment().subtract(30, 'days'), moment()],
                    'This Month': [moment().startOf('month'), moment().endOf('month')],
                    'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month')
                        .endOf('month')
                    ],
                    'Last 6 Months': [moment().subtract(6, 'months').startOf('month'), moment().endOf('month')],
                    'This Year': [moment().startOf('year'), moment().endOf('year')],
                },
                maxDate: moment()
            });
            const changeDatePickerText = (event, startDate, endDate) => {
                $(event.target).val(startDate.format('MMMM DD, YYYY') + ' - ' + endDate.format('MMMM DD, YYYY'));
            }


            $('.date-range').on('apply.daterangepicker', (event, picker) => changeDatePickerText(event, picker
                .startDate, picker.endDate));


            if ($('.date-range').val()) {
                let dateRange = $('.date-range').val().split(' - ');
                $('.date-range').data('daterangepicker').setStartDate(new Date(dateRange[0]));
                $('.date-range').data('daterangepicker').setEndDate(new Date(dateRange[1]));
            }

        })(jQuery);
    </script>
@endpush
