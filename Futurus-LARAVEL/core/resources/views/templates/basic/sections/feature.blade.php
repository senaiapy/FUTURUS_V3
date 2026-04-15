@php
    $featureContent = getContent('feature.content', true);
    $featureElement = getContent('feature.element', orderById: true);
@endphp
<section class="account-style-two centred py-100">
    <div class="pattern-layer">
        <div class="pattern-1" style="background-image: url({{ getImage(activeTemplate(true) . 'images/shape/shape-9.png') }});"></div>
        <div class="pattern-2" style="background-image: url({{ getImage(activeTemplate(true) . 'images/shape/shape-6.png') }});"></div>
    </div>
    <div class="auto-container">
        <div class="sec-title light pb_50">
            <span class="sub-title mb_14">{{ __($featureContent?->data_values?->heading ?? '') }}</span>
            <h2>{{ __($featureContent?->data_values?->subheading ?? '') }}</h2>
        </div>
        <div class="row gy-4">
            @php
                $i = 00;
            @endphp
            @foreach ($featureElement as $feature)
                <div class="col-xl-3 col-sm-6 account-block">
                    <div class="account-block-two wow fadeInUp animated" data-wow-delay="{{ $i }}ms" data-wow-duration="1500ms">
                        <div class="inner-box">
                            <div class="icon-box">
                                @php
                                    echo $feature?->data_values?->icon ?? '';
                                @endphp
                            </div>
                            <h3>{{ __($feature?->data_values?->title ?? '') }}</h3>
                            <p>{{ __($feature?->data_values?->description ?? '') }}</p>
                            <div class="btn-box"><a href="{{ url($feature?->data_values?->button_link ?? '') }}" class="theme-btn btn-one">{{ __($feature?->data_values?->button_name ?? '') }}</a></div>
                        </div>
                    </div>
                </div>
                @php
                    $i += 100;
                @endphp
            @endforeach
        </div>
    </div>
</section>
