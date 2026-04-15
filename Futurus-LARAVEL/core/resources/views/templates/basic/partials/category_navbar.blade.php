@php
    $categories = App\Models\Category::active()->get();
@endphp


<div class="category-nav">

    <div class="category-nav-slider">
        <button class="category-nav-btn prev">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" stroke-width="1.67" stroke-linecap="round"
                      stroke-linejoin="round" />
            </svg>
        </button>
        <button class="category-nav-btn next">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" stroke-width="1.67" stroke-linecap="round"
                      stroke-linejoin="round" />
            </svg>
        </button>
        <ul class="category-nav-list">
            <li class="category-nav-item">
                <a class="category-nav-link" href="{{ route('markets.index') }}">
                    @lang('All Categories')
                </a>
            </li>
            @foreach ($categories as $category)
                <li class="category-nav-item">
                    <a class="category-nav-link" href="{{ route('markets.index', $category->slug) }}">
                        {{ __($category->name) }}
                    </a>
                </li>
            @endforeach

        </ul>
    </div>
</div>
