<div class="language_switcher ms-3">
    @php
        $language = App\Models\Language::all();
        $selectLang = $language->where('code', config('app.locale'))->first();
        $currentLang = session('lang') ? $language->where('code', session('lang'))->first() : $language->where('is_default', Status::YES)->first();
    @endphp
    <div class="language_switcher__caption">
        <span class="icon">
            <img src="{{ getImage(getFilePath('language') . '/' . $currentLang->image, getFileSize('language')) }}" alt="@lang('image')">
        </span>
        <span class="text"> {{ __($selectLang->name) }} </span>
    </div>
    <div class="language_switcher__list">
        @foreach ($language as $item)
            <div class="language_switcher__item    @if (session('lang') == $item->code) selected @endif" data-value="{{ $item->code }}">
                <a href="{{ route('lang', $item->code) }}" class="thumb">
                    <span class="icon">
                        <img src="{{ getImage(getFilePath('language') . '/' . $item->image, getFileSize('language')) }}" alt="@lang('image')">
                    </span>
                    <span class="text"> {{ __($item->name) }}</span>
                </a>
            </div>
        @endforeach
    </div>
</div>


@push('script')
    <script>
        (function($) {
            "use strict";

            $('.language_switcher > .language_switcher__caption').on('click', function() {
                $(this).parent().toggleClass('open');
            });
            $(document).on('keyup', function(evt) {
                if ((evt.keyCode || evt.which) === 27) {
                    $('.language_switcher').removeClass('open');
                }
            });
            $(document).on('click', function(evt) {
                if ($(evt.target).closest(".language_switcher > .language_switcher__caption").length === 0) {
                    $('.language_switcher').removeClass('open');
                }
            });
        })(jQuery);
    </script>
@endpush

@push('style')
    <style>
        /* language */
       
    </style>
@endpush
