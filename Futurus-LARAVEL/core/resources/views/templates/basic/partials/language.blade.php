@if (gs()->multi_language)
    @php
        $language = App\Models\Language::all();
        $selectedLang = $language->where('code', session('lang'))->first() ?? $language->where('is_default', App\Constants\Status::ENABLE)->first() ?? $language->first();
    @endphp
    <li>
        <div class="dropdown dropdown--lang">
            <button class="dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                <img class="dropdown-toggle__flag" src="{{ getImage(getFilePath('language') . '/' . @$selectedLang?->image, getFileSize('language')) }}" alt="img">
                <span>{{ __(@$selectedLang?->name) }}</span>
            </button>
            <div class="dropdown-menu">
                @foreach ($language as $lang)
                    <a class="dropdown-item" href="{{ route('lang', $lang->code) }}">
                        <img class="dropdown-item__flag" src="{{ getImage(getFilePath('language') . '/' . $lang->image, getFileSize('language')) }}" alt="img">
                        <span>{{ $lang->name }}</span>
                    </a>
                @endforeach
            </div>
        </div>
    </li>
@endif
