@php
    $workContent = getContent('how_it_works.content', true);
    $workElements = getContent('how_it_works.element', orderById: true);
@endphp
<section class="trading-style-four my-100 p-0">
    <div class="auto-container">
        <div class="sec-title centred mb-60">
            <span class="sub-title mb_14">{{ __($workContent?->data_values?->heading ?? '') }}</span>
            <h2>{{ __($workContent?->data_values?->subheading ?? '') }}</h2>
        </div>
        <div class="tabs-box">
            <ul class="tab-btns tab-buttons clearfix">
                @foreach ($workElements as $key => $howWorksElement)
                    <li class="tab-btn  {{ $loop->first ? 'active-btn' : '' }}" data-tab="#htab-{{ $key + 1 }}">
                        <div class="icon-box">
                            @php
                                echo $howWorksElement?->data_values?->icon ?? '';
                            @endphp
                        </div>
                        <h4> {{ __($howWorksElement?->data_values?->title ?? '') }}</h4>
                    </li>
                @endforeach
            </ul>
            <div class="tabs-content">
                @foreach ($workElements as $key => $howWorksElement)
                    <div class="tab {{ $loop->first ? 'active-tab' : '' }}" id="htab-{{ $key + 1 }}">
                        <div class="row align-items-center">
                            <div class="col-lg-6 col-md-12 col-sm-12 content-column">
                                <div class="content_block_three">
                                    <div class="content-box mr_30">
                                        <h2>{{ __($howWorksElement?->data_values?->heading ?? '') }}</h2>
                                        <p>{{ __($howWorksElement?->data_values?->short_description ?? '') }}</p>
                                        <div class="btn-box">
                                            <a href="{{ url($howWorksElement?->data_values?->button_one_link ?? '') }}"
                                                class="theme-btn btn-one mr_20">
                                                {{ __($howWorksElement?->data_values?->button_one_name ?? '') }}
                                            </a>
                                            <a href="i{{ url($howWorksElement?->data_values?->button_two_link ?? '') }}"
                                                class="theme-btn btn-two">
                                                {{ __($howWorksElement?->data_values?->button_two_name ?? '') }}
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="col-lg-6 col-md-12 col-sm-12 image-column">
                                <div class="image-box ml_70">
                                    <figure class="image">
                                        <img src="{{ frontendImage('how_it_works', $howWorksElement?->data_values?->image ?? '', '785x600') }}"
                                            alt="img">
                                    </figure>
                                </div>
                            </div>
                        </div>
                    </div>
                @endforeach
            </div>
        </div>
    </div>
</section>
