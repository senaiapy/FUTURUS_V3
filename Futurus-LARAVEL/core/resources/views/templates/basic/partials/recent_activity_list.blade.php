@if ($recentPurchases->count() > 0)
    @foreach ($recentPurchases as $recentPurchase)
        <div class="recent-activity-item">
            <div class="recent-activity-item__left">
                <div class="recent-activity-item__auth">
                    @if ($recentPurchase?->user?->image)
                        <span class="image">
                            <img class="fit-image"
                                 src="{{ getImage(getFilePath('userProfile') . '/' . $recentPurchase?->user?->image, getFileSize('userProfile'), avatar: true) }}"
                                 alt="activity">
                        </span>
                    @else
                        <x-user-initials :user="$recentPurchase?->user" />
                    @endif
                    <span class="name">
                        {{ __($recentPurchase?->user?->fullname) }}
                    </span>
                </div>
                <p class="recent-activity-item__date">
                    {{ diffForHumans($recentPurchase->created_at) }}
                </p>
            </div>

            <p class="recent-activity-item__content">
                @lang('Bought') <span class="highlight">{{ $recentPurchase->total_share }}
                    {{ ucfirst($recentPurchase->type) }}</span> @lang('share for')
                {{ __($recentPurchase?->option?->question) }} at <span
                      class="highlight">{{ showAmount($recentPurchase->price_per_share, currencyFormat: false) }}
                    {{ gs('cur_text') }}
                    ({{ gs('cur_sym') }}{{ showAmount($recentPurchase->amount, currencyFormat: false) }})
                </span>
            </p>
        </div>
    @endforeach
@else
    @include('Template::partials.empty', [
        'message' => 'No data found',
    ])
@endif
