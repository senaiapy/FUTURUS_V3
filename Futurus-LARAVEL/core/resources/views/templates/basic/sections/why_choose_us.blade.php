@php
    $chooseContent = getContent('why_choose_us.content', true);
    $chooseElement = getContent('why_choose_us.element', false, 4, true);
    $choosesData = $chooseElement->chunk(2);
@endphp
<section class="account-style-three my-100">
    <div class="auto-container">
        <div class="row align-items-center flex-row-reverse gy-5">
            <div class="col-xl-6 col-md-12 col-sm-12 content-column">
                <div class="content_block_eight">
                    <div class="content-box ml_60">
                        <div class="sec-title pb_20">
                            <span class="sub-title mb_14">{{ __($chooseContent?->data_values?->heading ?? '') }}</span>
                            <h2 data-highlight-start="{{ $chooseContent?->data_values?->highlight_start ?? 4 }}" data-highlight-word="{{ $chooseContent?->data_values?->highlight_end ?? 5 }}">{{ __($chooseContent?->data_values?->subheading ?? '') }}</h2>
                        </div>
                        <div class="text-box">
                            <p>{{ __($chooseContent?->data_values?->short_details ?? '') }}</p>
                            <ul class="list-style-one mb_40 clearfix">
                                <li>{{ __($chooseContent?->data_values?->point_one ?? '') }}</li>
                                <li>{{ __($chooseContent?->data_values?->point_two ?? '') }}</li>
                                <li>{{ __($chooseContent?->data_values?->point_three ?? '') }}</li>
                            </ul>
                            <a href="{{ url($chooseContent?->data_values?->button_link ?? '') }}" class="theme-btn btn-one">{{ __($chooseContent?->data_values?->button_name ?? '') }}</a>
                        </div>
                    </div>
                </div>
            </div>

            <div class="col-xl-6 col-md-12 col-sm-12 inner-column">
                <div class="inner-content">
                    <div class="row clearfix gy-5">
                        @foreach ($choosesData as $choose)
                            <div class="col-lg-6 col-md-6 col-sm-6 account-block {{ $loop->odd ? '' : 'pt_75' }}">
                                @foreach ($choose as $chooseItem)
                                    <div class="account-block-one pb_1 wow fadeInUp animated animated" data-wow-delay="00ms" data-wow-duration="1500ms">
                                        <div class="inner-box">
                                            <div class="icon-box">
                                                @php
                                                    echo $chooseItem?->data_values?->icon ?? '';
                                                @endphp
                                            </div>
                                            <h3>
                                                {{ __($chooseItem?->data_values?->heading ?? '') }}
                                            </h3>
                                            <p>
                                                {{ __($chooseItem?->data_values?->short_details ?? '') }}
                                            </p>
                                        </div>
                                    </div>
                                @endforeach
                            </div>
                        @endforeach
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>
