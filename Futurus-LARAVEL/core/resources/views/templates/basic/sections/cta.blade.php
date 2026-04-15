@php
    $ctaContent = getContent('cta.content', true);
@endphp

<section class="cta-section">
    <div class="auto-container">
        <div class="inner-container">
            <div class="shape" style="background-image: url({{ getImage(activeTemplate(true) . 'images/shape/shape-16.png') }})"></div>
            <div class="icon-box">
                <img src="{{ frontendImage('cta', $ctaContent?->data_values?->image ?? '', '235x235') }}" alt="img" />
            </div>
            <h2>{{ __($ctaContent?->data_values?->heading ?? '') }}</h2>
            <div class="btn-box">
                <a href="{{ url($ctaContent?->data_values?->button_link ?? '') }}" class="theme-btn btn-one">{{ __($ctaContent?->data_values?->button_name ?? '') }}</a>
            </div>
        </div>
    </div>
</section>
