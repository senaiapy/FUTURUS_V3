@php
    $aboutContent = getContent('about.content', true);
    $aboutElement = getContent('about.element', orderById: true);
@endphp

<section class="about-style-three my-100">
    <div class="auto-container">

        <div class="row clearfix">
            <div class="col-lg-6 col-md-12 col-sm-12 content-column">
                <div class="row">
                    <div class="col-lg-12 col-sm-8 col-12">
                        <div class="sec-title pb_50">
                            <span class="sub-title mb_14">{{ __($aboutContent?->data_values?->heading ?? '') }}</span>
                            <h2 data-highlight-start="{{ $aboutContent?->data_values?->highlight_start ?? 4 }}" data-highlight-word="{{ $aboutContent?->data_values?->highlight_end ?? 5 }}">{{ __($aboutContent?->data_values?->subheading ?? '') }}</h2>
                        </div>

                    </div>
                    <div class="col-lg-12 col-sm-4  d-lg-none col-4 d-sm-block d-none">
                        <div class="video_block_one">
                            <div class="video-box z_1 p_relative ml_50 centred">
                                <div class="video-content">
                                    <div class="curve-text">
                                        <span class="curved-circle">{{ __($aboutContent?->data_values?->circle_text ?? '') }}</span>
                                    </div>


                                    <a
                                       href="{{ url($aboutContent?->data_values?->youtube_link ?? '#') }}"
                                       class="lightbox-image video-btn"
                                       data-caption=""><i class="icon-11"></i></a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="content_block_seven">
                    <div class="content-box">
                        <ul class="accordion-box">
                            @foreach ($aboutElement as $about)
                                <li class="accordion block {{ $loop->first ? 'active-block' : '' }}">
                                    <div class="acc-btn active">
                                        <div class="icon-box"><i class="icon-29"></i></div>
                                        <h3>{{ __($about?->data_values?->title ?? '') }}</h3>
                                    </div>
                                    <div class="acc-content {{ $loop->first ? 'current' : '' }}">
                                        <div class="content">
                                            <p>{{ __($about?->data_values?->short_details ?? '') }}</p>
                                            <a href="{{ url($about?->data_values?->button_link ?? '') }}">{{ __($about?->data_values?->button_name ?? '') }}</a>
                                        </div>
                                    </div>
                                </li>
                            @endforeach
                        </ul>
                    </div>
                </div>
            </div>
            <div class="col-lg-6 d-none d-lg-block video-column">
                <div class="video_block_one">
                    <div class="video-box z_1 p_relative ml_50 centred">
{{--
                        <figure class="image-box">
                            <img src="{{ frontendImage('about', $aboutContent?->data_values?->image ?? '', '580x640') }}" alt="img">
                        </figure>
--}}
                        <div class="video-content">
                            <div class="curve-text">
                                <span class="curved-circle">{{ __($aboutContent?->data_values?->circle_text ?? '') }}</span>
                            </div>
                            <a
                               href="{{ url($aboutContent?->data_values?->youtube_link ?? '#') }}"
                               class="lightbox-image video-btn"
                               data-caption=""><i class="icon-11"></i></a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>
