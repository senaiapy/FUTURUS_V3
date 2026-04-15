@extends('admin.layouts.app')

@section('panel')
    <div class="row g-3 g-xl-4">

        @forelse($marketOptions as $option)
            <div class="col-xxl-4 col-md-6">
                <div class="card">
                    <div class="card-body">
                        <div class="market-option-heading">
                            <div class="market-option-img">
                                <img src="{{ getImage(getFilePath('market') . '/' . $option->image, getFileSize('market'), option: true) }}" alt="@lang('image')">
                            </div>
                            <p class="market-option-title">{{ __($option->question) }}</p>
                        </div>
                        <div class="market-option-body">
                            <div class="market-option-pool">
                                <p class="market-option-pool-title">@lang('Yes Pool')</p>
                                @lang('Current'): {{ showAmount($option->yes_pool) }} (@lang('Initial'): {{ showAmount($option->initial_yes_pool) }})
                            </div>
                            <div class="market-option-pool">
                                <p class="market-option-pool-title">@lang('No Pool')</p>
                                @lang('Current'): {{ showAmount($option->no_pool) }} (@lang('Initial'): {{ showAmount($option->initial_no_pool) }})
                            </div>

                            <div class="status-area">
                                <div class="market-option-pool">
                                    <p class="market-option-pool-title">@lang('Commission')</p>
                                    {{ getAmount($option->commission) }}%
                                </div>
                                <div class="market-option-pool">
                                    <p class="market-option-pool-title">@lang('Status')</p>
                                    @php echo $option->statusBadge @endphp
                                </div>
                                <div class="market-option-pool">
                                    <p class="market-option-pool-title">@lang('Lock')</p>
                                    @if ($option->is_lock)
                                        <span class="text--danger"><i class="las la-lock"></i> @lang('Locked')</span>
                                    @else
                                        <span class="text--success"><i class="las la-lock-open"></i> @lang('Unlocked')</span>
                                    @endif
                                </div>
                            </div>

                            <div class="action-area">
                                <div class="d-flex gap-2">
                                    @php
                                        $option->image_with_path = getImage(getFilePath('market') . '/' . $option->image);
                                    @endphp

                                    <button class="btn btn-outline--primary cuModalBtn editBtn btn-sm flex-grow-1 @if ($option->purchases()->exists()) disabled @endif"
                                            data-modal_title="@lang('Update Market Option')"
                                            data-resource="{{ $option }}">
                                        <i class="las la-pen"></i>@lang('Edit')
                                    </button>

                                    @if ($option->is_lock)
                                        <button class="btn btn-sm btn-outline--success confirmationBtn flex-grow-1"
                                                data-action="{{ route('admin.market.option.lock', $option->id) }}"
                                                data-question="@lang('Are you sure to unlock this option?')">
                                            <i class="las la-lock-open"></i> @lang('Unlock')
                                        </button>
                                    @else
                                        <button class="btn btn-sm btn-outline--dark confirmationBtn flex-grow-1"
                                                data-action="{{ route('admin.market.option.lock', $option->id) }}"
                                                data-question="@lang('Are you sure to lock this option?')">
                                            <i class="las la-lock"></i> @lang('Lock')
                                        </button>
                                    @endif

                                    @if ($option->status == Status::ENABLE)
                                        <button class="btn btn-sm btn-outline--danger confirmationBtn flex-grow-1"
                                                data-action="{{ route('admin.market.option.status', $option->id) }}"
                                                data-question="@lang('Are you sure to disable this option?')">
                                            <i class="la la-eye-slash"></i> @lang('Disable')
                                        </button>
                                    @else
                                        <button class="btn btn-sm btn-outline--success confirmationBtn flex-grow-1"
                                                data-action="{{ route('admin.market.option.status', $option->id) }}"
                                                data-question="@lang('Are you sure to enable this option?')">
                                            <i class="la la-eye"></i> @lang('Enable')
                                        </button>
                                    @endif
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        @empty
            <div class="col-12">
                <div class="card">
                    <div class="card-body">
                        <h5 class="text-center">{{ __($emptyMessage) }}</h5>
                    </div>
                </div>
            </div>
        @endforelse

        @if ($marketOptions->hasPages())
            <div class="col-12">
                <div class="card-footer py-4">
                    {{ paginateLinks($marketOptions) }}
                </div>
            </div>
        @endif
    </div>

    <div class="modal fade" id="cuModal" role="dialog" tabindex="-1">
        <div class="modal-dialog modal-lg" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title"></h5>
                    <button class="close" data-bs-dismiss="modal" type="button" aria-label="Close">
                        <i class="las la-times"></i>
                    </button>
                </div>
                <form action="{{ route('admin.market.option.save', $market->id) }}" method="POST"
                      enctype="multipart/form-data">
                    @csrf
                    <div class="modal-body">
                        <div class="row">
                            <input type="hidden" name="option_id" id="optionId">
                            <div class="field-wrapper mb-4">
                                <div class="field-wrapper-label">
                                    <p class="title">@lang('Market Option Image')</p>
                                    <p class="note">@lang('Upload the image representing the market option')</p>
                                </div>
                                <div class="field-wrapper-view">
                                    <x-image-uploader image="" class="w-100" type="market" :required="false" />
                                </div>
                            </div>

                            <div class="field-wrapper mb-4">
                                <div class="field-wrapper-label">
                                    <p class="title">@lang('Option')</p>
                                    <p class="note">@lang('Enter the market option')</p>
                                </div>
                                <div class="field-wrapper-view">
                                    <textarea name="question" class="form-control" rows="2" placeholder="@lang('Enter the market option')" required></textarea>
                                </div>
                            </div>

                            <div class="field-wrapper mb-4">
                                <div class="field-wrapper-label">
                                    <p class="title">@lang('Initial Yes Pool')</p>
                                    <p class="note">@lang('Starting fund for Yes pool')</p>
                                </div>
                                <div class="field-wrapper-view">
                                    <div class="input-group">
                                        <span class="input-group-text">{{ gs('cur_sym') }}</span>
                                        <input type="number" step="0.01" name="initial_yes_pool" class="form-control"
                                               placeholder="0.00" min="0" required>
                                    </div>
                                </div>
                            </div>

                            <div class="field-wrapper mb-4">
                                <div class="field-wrapper-label">
                                    <p class="title">@lang('Initial No Pool')</p>
                                    <p class="note">@lang('Starting fund for No pool')</p>
                                </div>
                                <div class="field-wrapper-view">
                                    <div class="input-group">
                                        <span class="input-group-text">{{ gs('cur_sym') }}</span>
                                        <input type="number" step="0.01" name="initial_no_pool" class="form-control"
                                               placeholder="0.00" min="0" required>
                                    </div>
                                </div>
                            </div>

                            <div class="field-wrapper mb-4">
                                <div class="field-wrapper-label">
                                    <p class="title">@lang('Commission')</p>
                                    <p class="note">@lang('Commission percentage for trades')</p>
                                </div>
                                <div class="field-wrapper-view">
                                    <div class="input-group">
                                        <input type="number" step="0.1" name="commission" class="form-control"
                                               placeholder="0.0" min="0" max="100" required>
                                        <span class="input-group-text">%</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn--primary w-100 h-45" type="submit">@lang('Submit')</button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <x-confirmation-modal />
@endsection

@push('breadcrumb-plugins')
    <x-search-form placeholder="Search by question..." />
    @if ($market->type == Status::MULTI_MARKET && !in_array($market->status, [Status::MARKET_CLOSED, Status::MARKET_CANCELLED, Status::MARKET_SETTLED]))
        <button type="button" class="btn btn-sm btn-outline--primary cuModalBtn" data-modal_title="@lang('Add New Option')"
                data-default_image="{{ getImage(null, getFileSize('market')) }}">
            <i class="las la-plus"></i>@lang('Add New')
        </button>
    @endif
    <x-back route="{{ route('admin.market.index') }}" />
@endpush

@push('style')
    <style>
        .market-option-heading {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 16px
        }

        .market-option-img {
            flex-shrink: 0;
            height: 32px;
            width: 32px;
            overflow: hidden;
            border-radius: 5px;
        }

        .market-option-title {
            flex: 1;
            line-height: 1;
            font-weight: 600;
            color: #222223;
        }

        .market-option-pool {
            margin-bottom: 12px;
            font-size: 0.8125rem;
            color: #595959;
        }

        .market-option-pool-title {
            color: #222223;
            font-weight: 500;
            margin-block: 6px;
            line-height: 1;
        }

        @media (max-width: 1499px) {
            .market-option-pool-title {
                font-size: 0.8rem;
            }
        }

        .status-area {
            display: flex;
            padding: 12px;
            gap: 12px;
            margin-block: 16px;
            background: rgb(0 0 0 / 5%);
            border-radius: 4px;
        }

        @media (max-width: 1499px) {
            .status-area {
                padding: 8px;
                gap: 8px;
            }
        }

        .status-area .market-option-pool {
            flex: 1;
            margin-bottom: 0;
        }

        @media (max-width: 424px) {
            .status-area {
                gap: 20px;
                flex-wrap: wrap;
            }

            .status-area .market-option-pool {
                flex: unset;
            }
        }

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
            width: 280px;
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
    <script src="{{ asset('assets/admin/js/cu-modal.js') }}"></script>
@endpush
