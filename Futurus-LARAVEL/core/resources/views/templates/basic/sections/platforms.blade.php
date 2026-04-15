@php
    $markets = \App\Models\Market::running()->limit(10)->get();
@endphp

<section class="market-carousel-section">
    <div class="auto-container">
        <div class="sec-title centred mb-40">
            <span class="sub-title mb_14">@lang('MERCADOS ATIVOS')</span>
            <h2>@lang('Explore Nossa Previsão')</h2>
        </div>
        
        <div class="market-carousel-container">
            <div class="market-slick">
                @foreach($markets as $market)
                    @php
                        $detailsUrl = route('markets.details', $market->slug);
                        $loginUrl = route('user.login');
                        $redirectUrl = auth()->check() ? $detailsUrl : $loginUrl;
                    @endphp
                    <div class="carousel-item-wrapper">
                        <a href="{{ $redirectUrl }}" class="market-card-premium">
                            <div class="market-card-header">
                                <div class="market-card-thumb">
                                    <img src="{{ getImage(getFilePath('market') . '/' . $market->image, getFileSize('market'), option: true) }}" alt="{{ __($market->question) }}">
                                </div>
                                <h5 class="market-card-title">{{ __($market->question) }}</h5>
                            </div>
                            
                            <div class="market-card-body">
                                <div class="market-stat-item">
                                    <span class="market-stat-label">@lang('Volume')</span>
                                    <span class="market-stat-value vol">{{ gs('cur_sym') }}{{ number_shorten($market->volume) }}</span>
                                </div>
                                <div class="market-stat-item">
                                    <span class="market-stat-label">@lang('Sim')</span>
                                    <span class="market-stat-value yes">{{ $market->yes_share }}%</span>
                                </div>
                                <div class="market-stat-item">
                                    <span class="market-stat-label">@lang('Não')</span>
                                    <span class="market-stat-value no">{{ $market->no_share }}%</span>
                                </div>
                            </div>
                            
                            <div class="market-card-footer">
                                <div class="market-footer-actions">
                                    <span class="market-footer-btn"><i class="fa-solid fa-link"></i></span>
                                    <span class="market-footer-btn"><i class="fa-regular fa-bookmark"></i></span>
                                </div>
                                <div class="market-end-date">
                                    <span class="label">@lang('Término Estimado')</span>
                                    <span class="date">{{ showDateTime($market->end_date, 'F j, Y') }}</span>
                                </div>
                            </div>
                        </a>
                    </div>
                @endforeach
            </div>
        </div>
    </div>
</section>

@push('style')
<style>
    /* Inline adjustment for smooth linear autoplay */
    .market-slick .slick-track {
        display: flex;
        align-items: center;
        transition-timing-function: linear !important;
    }
</style>
@endpush

@push('script')
<script>
    (function ($) {
        "use strict";

        $(document).ready(function () {
            $('.market-slick').slick({
                slidesToShow: 3,
                slidesToScroll: 1,
                autoplay: true,
                autoplaySpeed: 0,
                speed: 8000,
                pauseOnHover: false,
                pauseOnFocus: false,
                cssEase: 'linear',
                arrows: false,
                dots: false,
                infinite: true,
                variableWidth: false,
                responsive: [
                    {
                        breakpoint: 1200,
                        settings: {
                            slidesToShow: 2,
                        }
                    },
                    {
                        breakpoint: 768,
                        settings: {
                            slidesToShow: 1,
                            speed: 5000, // Faster relative speed for mobile to feel similar
                        }
                    }
                ]
            });
        });

    })(jQuery);
</script>
@endpush
