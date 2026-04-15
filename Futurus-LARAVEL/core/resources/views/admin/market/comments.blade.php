@extends('admin.layouts.app')

@section('panel')
    <div class="row">
        <div class="col-lg-12">
            <div class="card">
                <div class="card-body p-0">
                    <div class="table-responsive--md table-responsive">
                        <table class="table table--light style--two">
                            <thead>
                                <tr>
                                    <th>@lang('S.N.')</th>
                                    <th>@lang('Comment')</th>
                                    <th>@lang('Report Count')</th>
                                    <th>@lang('Market')</th>
                                    <th>@lang('Status')</th>
                                    <th>@lang('Action')</th>
                                </tr>
                            </thead>
                            <tbody>
                                @forelse($comments as $comment)
                                    <tr>
                                        <td>{{ $comments->firstItem() + $loop->index }}</td>

                                        <td>
                                            <div>
                                                <span class="fw-bold cursor-pointer" data-bs-toggle="tooltip"
                                                      data-bs-placement="top" title="{{ $comment->comment }}">
                                                    {{ __(strLimit($comment->comment, 50)) }}
                                                </span>
                                            </div>
                                        </td>

                                        <td>
                                            {{ $comment->reports->count() }}
                                        </td>

                                        <td>
                                            {{ $comment?->market?->question }}
                                        </td>

                                        <td>
                                            @php
                                                echo $comment->statusBadge;
                                            @endphp
                                        </td>

                                        <td>
                                            <div class="button--group">
                                                <button class="btn btn-sm btn-outline--primary cuModalBtn"
                                                        data-resource="{{ $comment }}"
                                                        data-modal_title="@lang('Report Details')">
                                                    <i class="la la-desktop"></i>@lang('Details')
                                                </button>
                                                @if ($comment->status == Status::DISABLE)
                                                    <button type="button"
                                                            class="btn btn-sm btn-outline--success confirmationBtn"
                                                            data-action="{{ route('admin.comments.status', $comment->id) }}"
                                                            data-question="@lang('Are you sure to enable this comment?')">
                                                        <i class="la la-eye"></i>@lang('Enable')
                                                    </button>
                                                @else
                                                    <button type="button"
                                                            class="btn btn-sm btn-outline--danger confirmationBtn"
                                                            data-action="{{ route('admin.comments.status', $comment->id) }}"
                                                            data-question="@lang('Are you sure to disable this comment?')">
                                                        <i class="la la-eye-slash"></i>@lang('Disable')
                                                    </button>
                                                @endif
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

                @if ($comments->hasPages())
                    <div class="card-footer py-4">
                        {{ paginateLinks($comments) }}
                    </div>
                @endif
            </div>
        </div>
    </div>

    <div class="modal fade" id="cuModal" role="dialog" tabindex="-1">
        <div class="modal-dialog modal-lg" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">@lang('Report Details')</h5>
                    <button class="close" data-bs-dismiss="modal" type="button" aria-label="Close">
                        <i class="las la-times"></i>
                    </button>
                </div>
                <div class="modal-body" id="modalContent">

                </div>
                <div class="modal-footer">
                    <button class="btn btn--primary w-100 h-45" type="submit">@lang('Submit')</button>
                </div>
            </div>
        </div>
    </div>

    <x-confirmation-modal />
@endsection


@push('style')
    <style>
        .fab-menu {
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 1000;
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
    </style>
@endpush

@push('script-lib')
    <script src="{{ asset('assets/admin/js/cu-modal.js') }}"></script>
@endpush

@push('script')
    <script>
        (function($) {
            "use strict";

            $('.cuModalBtn').on('click', function() {
                const comment = $(this).data('resource');

                let reportsHtml = '';
                comment.reports.forEach(function(report) {
                    reportsHtml += `
                        <div class="border p-3 mb-2 rounded">
                            <div class="d-flex justify-content-between">
                                <strong>${report.user ? report.user.username : 'Unknown'}</strong>
                                <small class="text-muted">${new Date(report.created_at).toLocaleDateString()}</small>
                            </div>
                            <p class="mb-0 mt-2">${report.reason || 'No reason provided'}</p>
                        </div>
                    `;
                });

                const content = `
                    <div class="mb-4">
                        <h6>@lang('Comment')</h6>
                        <div class="bg-light p-3 rounded">
                            <p>${comment.comment}</p>
                        </div>
                        <small class="text-muted">
                            @lang('By') ${comment.user.username} - ${new Date(comment.created_at).toLocaleDateString()}
                        </small>
                    </div>
                    <div>
                        <h6>@lang('Reports') (${comment.reports.length})</h6>
                        ${reportsHtml}
                    </div>
                `;

                $('#modalContent').html(content);
                $('#cuModal').modal('show');
            });

        })(jQuery);
    </script>
@endpush
