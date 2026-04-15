@php
    $testimonialContent = getContent('testimonial.content', true);
    $testimonialElement = getContent('testimonial.element', orderById: true);
@endphp

<section class="testimonial-section centred my-100">
    <div class="auto-container">
        <div class="sec-title pb_60">
            <span class="sub-title mb_14">{{ __($testimonialContent?->data_values?->heading ?? '') }}</span>
            <h2>{{ __($testimonialContent?->data_values?->subheading ?? '') }}</h2>
        </div>
        <div class="inner-container">
            <div class="thumb-box">
                @foreach ($testimonialElement as $key => $testimonial)
                    <div class="thumb thumb-{{ $key + 1 }}">
                        <img src="{{ frontendImage('testimonial', $testimonial?->data_values?->image ?? '', '100x100') }}" alt="img" />
                    </div>
                @endforeach
            </div>
            <div class="single-item-carousel owl-carousel owl-theme owl-nav-none dots-style-one">
                @foreach ($testimonialElement as $testimonial)
                    <div class="testimonial-content">
                        <h2>
                            “{{ $testimonial?->data_values?->heading ?? '' }}”
                        </h2>
                        <p>
                            {{ $testimonial?->data_values?->review ?? '' }}
                        </p>
                        <h3>{{ $testimonial?->data_values?->user ?? '' }}</h3>
                        <span class="designation">{{ $testimonial?->data_values?->designation ?? '' }}</span>
                    </div>
                @endforeach
            </div>
        </div>
    </div>
</section>
