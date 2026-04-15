@php
    $blogContent = getContent('blog.content', true);
    $blogElement = getContent('blog.element', false, 3, false);
@endphp
<section class="blog my-100">
    <div class="auto-container">
        <div class="sec-title centred mb-60">
            <span class="sub-title mb_14">{{ __($blogContent?->data_values?->heading ?? '') }}</span>
            <h2>{{ __($blogContent?->data_values?->subheading ?? '') }}</h2>
        </div>
        <div class="row gy-4">
            @include('Template::partials.blogs', ['blogs' => $blogElement])
        </div>
    </div>
</section>
