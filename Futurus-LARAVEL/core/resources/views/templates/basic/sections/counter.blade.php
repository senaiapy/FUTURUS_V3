@php
    $counterElement = getContent('counter.element', orderById: true);
@endphp
<section class="funfact-style-two centred my-100">
    <div class="auto-container">
        <div class="inner-container">
            <div class="row clearfix gy-4">
                @foreach ($counterElement as $counter)
                    <div class="col-lg-3 col-sm-6 col-xsm-6  funfact-block">
                        <div class="funfact-block-two">
                            <div class="shape" style="background-image: url({{ getImage(activeTemplate(true) . 'images/shape/shape-8.png') }});">
                            </div>
                            <div class="inner-box">
                                <div class="count-outer">
                                    <span class="odometer" data-odometer-final="{{ $counter?->data_values?->counter_digit ?? 1 }}">0</span><span>{{ __($counter?->data_values?->symbol ?? '') }}</span>
                                </div>
                                <p>{{ __($counter?->data_values?->title ?? '') }}</p>
                            </div>
                        </div>
                    </div>
                @endforeach
            </div>
        </div>
    </div>
</section>
