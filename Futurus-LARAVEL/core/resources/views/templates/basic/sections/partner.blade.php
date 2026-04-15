@php
    $partnerElement = getContent('partner.element', orderById: true);
@endphp
<section class="clients-section my-100">
    <div class="large-container">
        <div class="clients-slider">
            @foreach ($partnerElement as $partner)
                <div class="clients-slider__logo">
                    <img src="{{ frontendImage('partner', $partner?->data_values?->image ?? '', '220x50') }}" alt="alt">
                </div>
            @endforeach
        </div>
    </div>
</section>
