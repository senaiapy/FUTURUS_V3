@php
    $historyElement = getContent('history.element', orderById: true);
@endphp
<section class="history-section my-100 ">
    <div class="auto-container">
        <div class="row clearfix gy-4">
            @foreach ($historyElement as $history)
                <div class="col-lg-6 col-md-12 col-sm-12 history-block">
                    <div class="history-block-one">
                        <div class="inner-box clearfix">
                            <figure class="image-box"><img src="{{ frontendImage('history', $history?->data_values?->image ?? '', '415x280') }}" alt="img"></figure>
                            <div class="text-box">
                                <h3>{{ __($history?->data_values?->title ?? '') }}</h3>
                                <p>{{ __($history?->data_values?->description ?? '') }}</p>
                                <div class="btn-box"><a href="{{ url($history?->data_values?->button_link ?? '#') }}" class="theme-btn btn-two">{{ __($history?->data_values?->button_name ?? '') }}</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            @endforeach
        </div>
    </div>
</section>
