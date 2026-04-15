<div class="related-market">
    @forelse ($relatedMarkets as $related)
        <div class="related-market-item">
            <div class="related-market-item__info">
                <span class="thumb">
                    <img class="fit-image"
                         src="{{ getImage(getFilePath('market') . '/' . $related->image, getFileSize('market'), option: true) }}"
                         alt="related-market">
                </span>
                <div class="content">
                    <a href="{{ route('markets.details', $related->slug) }}" class="title">
                        {{ __($related->question) }}
                    </a>
                    <p class="description">
                        {{ gs('cur_sym') }}{{ number_shorten($related->volume) }} @lang('Vol').
                    </p>
                </div>
            </div>
            <div class="related-market-item__action flex-align gap-2">
                <a href="{{ route('markets.details', $related->slug) }}" class="btn btn--sm btn--base">@lang('Details')</a>
            </div>
        </div>
    @empty
        @include('Template::partials.empty', [
            'message' => 'No data found',
        ])
    @endforelse
</div>
