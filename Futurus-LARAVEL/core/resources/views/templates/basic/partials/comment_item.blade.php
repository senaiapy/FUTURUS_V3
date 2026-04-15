<div class="comment-item-block" data-comment-id="{{ $comment->id }}">
    <div class="comment-item">
        <div class="comment-item__thumb">
            @if ($comment?->user?->image)
                <img class="fit-image"
                     src="{{ getImage(getFilePath('userProfile') . '/' . $comment?->user?->image, getFileSize('userProfile'), avatar: true) }}"
                     alt="comment">
            @else
                <x-user-initials :user="$comment?->user" />
            @endif
        </div>
        <div class="comment-item__content">
            <div class="comment-item__top">
                <p class="comment-item__name">{{ $comment?->user?->fullname }}</p>
                <span>•</span>
                <span class="comment-item__date">{{ diffForHumans($comment->created_at) }}</span>
            </div>
            <p class="comment-item__text">{{ $comment->comment }}</p>
            <div class="flex-align gap-3">
                <button class="comment-item__like like-btn {{ $comment->authUserLike ? 'liked' : '' }}"
                        data-comment-id="{{ $comment->id }}">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"
                         fill="none">
                        <path
                              d="M18.2812 6.25938C18.1053 6.05994 17.8888 5.90023 17.6464 5.79086C17.4039 5.68148 17.141 5.62495 16.875 5.625H12.5V4.375C12.5 3.5462 12.1708 2.75134 11.5847 2.16529C10.9987 1.57924 10.2038 1.25 9.375 1.25C9.25889 1.24992 9.14505 1.28218 9.04625 1.34317C8.94744 1.40417 8.86758 1.49148 8.81562 1.59531L5.86406 7.5H2.5C2.16848 7.5 1.85054 7.6317 1.61612 7.86612C1.3817 8.10054 1.25 8.41848 1.25 8.75V15.625C1.25 15.9565 1.3817 16.2745 1.61612 16.5089C1.85054 16.7433 2.16848 16.875 2.5 16.875H15.9375C16.3943 16.8752 16.8354 16.7085 17.1781 16.4065C17.5208 16.1044 17.7413 15.6876 17.7984 15.2344L18.7359 7.73438C18.7692 7.47033 18.7458 7.20224 18.6674 6.94792C18.589 6.6936 18.4574 6.45888 18.2812 6.25938ZM2.5 8.75H5.625V15.625H2.5V8.75ZM17.4953 7.57812L16.5578 15.0781C16.5388 15.2292 16.4653 15.3681 16.351 15.4688C16.2368 15.5695 16.0898 15.6251 15.9375 15.625H6.875V8.27266L9.74297 2.53594C10.168 2.62101 10.5505 2.85075 10.8253 3.18605C11.1 3.52135 11.2501 3.9415 11.25 4.375V6.25C11.25 6.41576 11.3158 6.57473 11.4331 6.69194C11.5503 6.80915 11.7092 6.875 11.875 6.875H16.875C16.9637 6.87497 17.0514 6.89382 17.1322 6.93028C17.2131 6.96675 17.2852 7.02001 17.3439 7.08652C17.4026 7.15303 17.4464 7.23126 17.4725 7.31602C17.4986 7.40078 17.5064 7.49013 17.4953 7.57812Z"
                              fill="currentColor" />
                    </svg>
                    <span class="likes-count">{{ $comment->likes_count }}</span>
                </button>
                <button class="comment-item__reply reply-btn" data-comment-id="{{ $comment->id }}">
                    @lang('Reply')
                </button>
            </div>
            <div class="comment-form-wrapper" style="display: none;">
                <form action="#" class="comment-form reply-form" data-parent-id="{{ $comment->id }}">
                    <textarea class="comment-form__input" placeholder="@lang('Write a reply...')"></textarea>
                    <button type="submit" class="comment-form__btn">
                        <svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 24 24" fill="none" class="injected-svg" data-src="https://cdn.hugeicons.com/icons/sent-stroke-standard.svg?v=1.0.1" xmlns:xlink="http://www.w3.org/1999/xlink" role="img" color="currentColor">
                            <path d="M11.5 12.5L15 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
                            <path d="M2.74669 8.40628C1.68668 8.78486 1.77814 10.3132 2.87573 10.5627L11.5 12.5L13.4373 21.1243C13.6868 22.2219 15.2151 22.3133 15.5937 21.2533L21.9322 3.50557C22.2514 2.61167 21.3883 1.74856 20.4944 2.06781L2.74669 8.40628Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
                        </svg>
                    </button>
                </form>
                <button class="comment-form-cancel btn btn--sm btn-outline--secondary">@lang('Cancel')</button>
            </div>
        </div>
        @if ($comment?->user?->id != auth()->id())
            <div class="dropdown action-dropdown">
                <button class="dropdown-btn" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                    <i class="fa-solid fa-ellipsis-vertical"></i>
                </button>
                <ul class="dropdown-menu dropdown-menu-end overflow-hidden p-0">
                    <li>
                        <a class="dropdown-item report-btn" href="#" data-comment-id="{{ $comment->id }}"
                           disabled>
                            <i class="fa-regular fa-flag"></i>
                            @lang('Report')
                        </a>
                    </li>
                </ul>
            </div>
        @endif
    </div>

    {{-- Replies Section --}}

    @if ($comment->replies_count > 0)
        <div class="comment-reply-block" data-comment-id="{{ $comment->id }}">
            @php
                $initialReplies = $comment
                    ->replies()
                    ->with(['user'])
                    ->withCount('likes')
                    ->latest()
                    ->take(3)
                    ->get();
            @endphp

            <div class="replies-container">
                @include('Template::partials.comment_replies', ['replies' => $initialReplies])
            </div>

            @if ($comment->replies_count > $initialReplies->count())
                <button class="btn btn-link btn--xsm see-more-replies-btn mb-2" data-comment-id="{{ $comment->id }}"
                        data-page="2" data-total-replies="{{ $comment->replies_count }}">
                    <i class="fas fa-chevron-down me-1"></i>
                    @lang('See') {{ $comment->replies_count - $initialReplies->count() }} @lang('more replies')
                </button>
            @endif
        </div>
    @endif

</div>
