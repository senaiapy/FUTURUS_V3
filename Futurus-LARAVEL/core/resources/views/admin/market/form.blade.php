@extends('admin.layouts.app')

@section('panel')
    <div class="container-fluid">
        <div class="row justify-content-center">
            <div class="col-lg-10">
                <div class="card shadow-sm border-0">
                    <div class="card-header bg-white border-0 py-4">
                        <div class="d-flex align-items-center">
                            <div class="bg-primary bg-opacity-10 rounded-circle p-2 me-3">
                                <i class="las la-chart-line text-primary fs-4"></i>
                            </div>
                            <div>
                                <h4 class="mb-1 fw-bold text-dark">
                                    {{ isset($market) ? 'Update Market' : 'Create New Market' }}
                                </h4>
                                <p class="text-muted mb-0 small">@lang('Configure your prediction market details')</p>
                            </div>
                        </div>
                    </div>

                    <form action="{{ route('admin.market.save', $market->id ?? '') }}" method="POST" enctype="multipart/form-data">
                        @csrf
                        <div class="card-body px-4 py-4">
                            <div class="field-wrapper mb-4">
                                <div class="field-wrapper-label">
                                    <p class="title">@lang('Market Image')</p>
                                    <p class="note">@lang('Upload the image representing the market')</p>
                                </div>
                                <div class="field-wrapper-view">
                                    <x-image-uploader image="{{ $market->image ?? '' }}" class="w-100" type="market" :required="false" />
                                </div>
                            </div>

                            <div class="field-wrapper mb-4">
                                <div class="field-wrapper-label">
                                    <p class="title">@lang('Category')</p>
                                    <p class="note">@lang('Select the category for this market')</p>
                                </div>
                                <div class="field-wrapper-view">
                                    <select name="category_id" class="form-control select2" required id="categorySelect">
                                        <option value="">@lang('Select Category')</option>
                                        @foreach ($categories as $category)
                                            <option value="{{ $category->id }}" @selected(old('category_id', $market?->category_id) == $category->id) data-subcategories="{{ $category->subcategories }}">
                                                {{ __($category->name) }}
                                            </option>
                                        @endforeach
                                    </select>
                                </div>
                            </div>

                            <div class="field-wrapper mb-4">
                                <div class="field-wrapper-label">
                                    <p class="title">@lang('Subcategory')</p>
                                    <p class="note">@lang('Select the subcategory for this market')</p>
                                </div>
                                <div class="field-wrapper-view">
                                    <select name="subcategory_id" class="form-control select2"></select>
                                </div>
                            </div>

                            <div class="field-wrapper mb-4">
                                <div class="field-wrapper-label">
                                    <p class="title">@lang('Market Question')</p>
                                    <p class="note">@lang('Enter the main prediction question')</p>
                                </div>
                                <div class="field-wrapper-view">
                                    <textarea name="question" class="form-control" rows="3" required placeholder="@lang('e.g., Who will win the 2024 Presidential Election?')">{{ old('question', $market?->question ?? '') }}</textarea>
                                </div>
                            </div>

                            <div class="field-wrapper mb-4">
                                <div class="field-wrapper-label">
                                    <p class="title">@lang('Slug')</p>
                                    <p class="note">@lang('Give an unique slug')</p>
                                </div>
                                <div class="field-wrapper-view">
                                    <input type="text" class="form-control" value="{{ old('slug', $market?->slug) }}" name="slug" required>
                                    <div class="d-flex justify-content-between flex-wrap gap-2">
                                        <span class="text--small cursor-pointer fst-italic text-muted" id="makeSlugBtn">@lang('Make Slug')</span>
                                        <span class="text--small text--danger fst-italic slugMsg d-none">@lang('This slug already exists')</span>
                                    </div>
                                </div>
                            </div>

                            <div class="field-wrapper mb-4">
                                <div class="field-wrapper-label">
                                    <p class="title">@lang('Start Date')</p>
                                    <p class="note">@lang('Select the start date and time')</p>
                                </div>
                                <div class="field-wrapper-view">
                                    <input type="text" name="start_date" class="form-control" value="{{ old('start_date', isset($market?->start_date) ? showDateTime($market?->start_date, 'Y-m-d h:i:s A') : '') }}" placeholder="@lang('Start Date')">
                                </div>
                            </div>

                            <div class="field-wrapper mb-4">
                                <div class="field-wrapper-label">
                                    <p class="title">@lang('End Date')</p>
                                    <p class="note">@lang('Select the end date and time')</p>
                                </div>
                                <div class="field-wrapper-view">
                                    <input type="text" name="end_date" class="form-control" value="{{ old('end_date', isset($market?->end_date) ? showDateTime($market?->end_date, 'Y-m-d h:i:s A') : '') }}" placeholder="@lang('End Date')">
                                </div>
                            </div>

                            <div class="field-wrapper mb-4">
                                <div class="field-wrapper-label">
                                    <p class="title">@lang('Market Type')</p>
                                    <p class="note">@lang('Single: Simple Yes/No. Multiple: Several options to choose from.')</p>
                                </div>
                                <div class="field-wrapper-view">
                                    <select name="type" class="form-control select2" data-minimum-results-for-search="-1" required id="marketType">
                                        <option value="1" {{ old('type', $market->type ?? '') == 1 ? 'selected' : '' }}>
                                            @lang('Single')
                                        </option>
                                        <option value="2" {{ old('type', $market->type ?? '') == 2 ? 'selected' : '' }}>
                                            @lang('Multiple')
                                        </option>
                                    </select>
                                </div>
                            </div>

                            <div class="field-wrapper mb-4 single-market">
                                <div class="field-wrapper-label">
                                    <p class="title">@lang('Initial Yes Pool')</p>
                                    <p class="note">@lang('Starting fund for Yes pool')</p>
                                </div>
                                <div class="field-wrapper-view">
                                    <div class="input-group">
                                        <span class="input-group-text">{{ gs('cur_sym') }}</span>
                                        <input type="number" step="0.01" name="initial_yes_pool" class="form-control" value="{{ old('initial_yes_pool', getAmount($market?->singleMarketOption?->initial_yes_pool) ?? 0) }}" min="0">
                                    </div>
                                </div>
                            </div>

                            <div class="field-wrapper mb-4 single-market">
                                <div class="field-wrapper-label">
                                    <p class="title">@lang('Initial No Pool')</p>
                                    <p class="note">@lang('Starting fund for No pool')</p>
                                </div>
                                <div class="field-wrapper-view">
                                    <div class="input-group">
                                        <span class="input-group-text">{{ gs('cur_sym') }}</span>
                                        <input type="number" step="0.01" name="initial_no_pool" class="form-control" value="{{ old('initial_no_pool', getAmount($market?->singleMarketOption?->initial_no_pool) ?? 0) }}" min="0">
                                    </div>
                                </div>
                            </div>

                            <div class="field-wrapper mb-4 single-market">
                                <div class="field-wrapper-label">
                                    <p class="title">@lang('Commission')</p>
                                    <p class="note">@lang('Commission percentage for trades')</p>
                                </div>
                                <div class="field-wrapper-view">
                                    <div class="input-group">
                                        <input type="number" step="0.1" name="commission" class="form-control" value="{{ old('commission', getAmount($market?->singleMarketOption?->commission) ?? 0) }}" min="0" max="100">
                                        <span class="input-group-text">%</span>
                                    </div>
                                </div>
                            </div>
                            <div class="field-wrapper mb-4">
                                <div class="field-wrapper-label">
                                    <p class="title">@lang('Description')</p>
                                    <p class="note">@lang('Description of the market')</p>
                                </div>
                                <div class="field-wrapper-view">
                                    <textarea rows="8" class="form-control border-radius-5 nicEdit" name="description">{{ old('description', $market?->description) }}</textarea>
                                </div>
                            </div>
                        </div>
                        <div class="card-footer bg-white border-0 px-4 py-4">
                            <button class="btn btn--primary w-100 h-45" type="submit">@lang('Submit')</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
@endsection

@push('breadcrumb-plugins')
    <x-back route="{{ route('admin.market.index') }}" />
@endpush

@push('style')
    <style>
        .card.bg-card-style .card-heading {
            padding: 12px 16px;
            background-color: rgb(0, 0, 0, 5%);
            border-radius: 8px;
            margin-bottom: 24px
        }

        .card.bg-card-style .card-body {}

        .field-wrapper {
            display: flex;
            align-items: center;
            gap: 16px 24px;
            flex-wrap: wrap;
        }

        .field-wrapper:not(:last-child) {
            margin-bottom: 24px;
        }

        .field-wrapper-label {
            width: 320px;
        }

        .field-wrapper-label .title {
            color: black;
            font-weight: 600;
        }

        .field-wrapper-label .note {
            font-size: 0.75rem;
        }

        .field-wrapper-view {
            flex: 1;
            max-width: 700px;
        }

        .field-wrapper .image-upload-wrapper {
            height: 150px;
            position: relative;
            width: 160px;
        }

        @media (max-width: 767px) {
            .field-wrapper {
                flex-direction: column;
                align-items: flex-start;
            }

            .field-wrapper-label {
                width: 100%;
            }
        }
    </style>
@endpush


@push('script-lib')
    <script src="{{ asset('assets/admin/js/moment.min.js') }}"></script>
    <script src="{{ asset('assets/admin/js/daterangepicker.min.js') }}"></script>
@endpush

@push('style-lib')
    <link rel="stylesheet" type="text/css" href="{{ asset('assets/admin/css/daterangepicker.css') }}">
@endpush

@push('script')
    <script>
        (function($) {
            "use strict";

            let subcategoryId = Number("{{ $market?->subcategory_id }}") ?? 0;

            $('[name=category_id]').on('change', function() {
                let subcategories = $(this).find(':selected').data('subcategories');
                let html = `<option  disabled selected>@lang('Select one')</option>`;
                $.each(subcategories, function(id, subcategory) {
                    html += `<option  value="${subcategory.id}" ${subcategory.id == subcategoryId ? 'selected' : ''}>${subcategory.name}</option>`
                });
                $('[name=subcategory_id]').html(html);
            }).change()


            $('[name=type]').on('change', function(e) {
                e.preventDefault();
                let selectedType = $(this).find('option:selected').val();
                if (selectedType == 2) {
                    $('.single-market').addClass('d-none')
                } else {
                    $('.single-market').removeClass('d-none')
                }
            }).change();


            const startInput = $('[name="start_date"]');
            const endInput = $('[name="end_date"]');

            const existingStart = startInput.val() ? startInput.val() : moment();
            const existingEnd = endInput.val() ? moment(endInput.val()) : moment().add(7, 'days');

            startInput.daterangepicker({
                singleDatePicker: true,
                timePicker: true,
                showDropdowns: true,
                startDate: existingStart,
                minDate: existingStart,
                locale: {
                    format: 'YYYY-MM-DD hh:mm A'
                }
            });

            endInput.daterangepicker({
                singleDatePicker: true,
                timePicker: true,
                showDropdowns: true,
                startDate: existingEnd,
                minDate: moment(),
                locale: {
                    format: 'YYYY-MM-DD hh:mm A'
                }
            });

            startInput.on('apply.daterangepicker', function(ev, picker) {
                const selectedStart = picker.startDate;

                endInput.data('daterangepicker').minDate = selectedStart;

                if (moment(endInput.val()).isBefore(selectedStart)) {
                    endInput.data('daterangepicker').setStartDate(selectedStart.clone().add(7, 'days'));
                }
            });

            const makeSlugButton = $('#makeSlugBtn');
            const slugField = $('[name=slug]');
            const questionField = $('[name=question]');

            const checkSlug = () => {
                let slug = slugField.val();
                const marketId = {{ isset($market) ? $market?->id : 0 }};
                if (slug) {
                    $.get(`{{ route('admin.market.check.slug', '') }}/${marketId}`, {
                        slug: slug
                    }, function(response) {
                        if (response.status) {
                            $('.slugMsg').removeClass('d-none');
                        } else {
                            $('.slugMsg').addClass('d-none');
                        }
                    });
                }
            };

            const setSlugField = (value) => {
                if (!value) return false;
                slugField.val(createSlug(value));
                checkSlug();
            };

            const handleMakeSlugBtnClick = () => setSlugField(questionField.val());

            makeSlugButton.on('click', handleMakeSlugBtnClick);

            slugField.on('focusout', function() {
                var text = createSlug($(this).val());
                $(this).val(text);
                checkSlug();
            });

            function createSlug(text) {
                return text
                    .toString()
                    .toLowerCase()
                    .trim()
                    .replace(/&/g, '-and-')
                    .replace(/[\s\W-]+/g, '-')
                    .replace(/^-+|-+$/g, '');
            }

        })(jQuery);
    </script>
@endpush
