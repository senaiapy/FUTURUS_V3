@php
    $faqContent = getContent('faq.content', true);
    $faqElement = getContent('faq.element', orderById: true);
@endphp
<section class="faq-section my-100">
    <div class="auto-container">

        <div class="row gx-lg-5 g-4 gy-5">
            <div class="col-lg-6">
                <div class="sec-title mb-40 ">
                    <span class="sub-title mb_14">{{ __($faqContent?->data_values?->heading ?? '') }}</span>
                    <h2>{{ __($faqContent?->data_values?->subheading ?? '') }}</h2>
                </div>
                <div class="faq-card">
                    <div class="faq-card__item">
                        <span class="icon">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"
                                 color="currentColor" fill="none">
                                <path d="M12.0045 11H12.0135M8.00903 11H8.018" stroke="currentColor" stroke-width="2"
                                      stroke-linecap="round" stroke-linejoin="round" />
                                <path
                                      d="M22 13.2497C21.9163 15.6232 21.8353 16.8099 20.8699 17.7826C19.9046 18.7552 18.6843 18.8074 16.2437 18.9118C15.5098 18.9432 14.7498 18.9667 13.9693 18.9815C13.2282 18.9955 12.8576 19.0026 12.532 19.1266C12.2064 19.2506 11.9325 19.4855 11.3845 19.9553L9.20503 21.8242C9.07273 21.9376 8.90419 22 8.72991 22C8.32679 22 8 21.6732 8 21.2701V18.9219C7.91842 18.9186 7.83715 18.9153 7.75619 18.9118C5.31569 18.8074 4.09545 18.7552 3.13007 17.7825C2.16469 16.8099 2.12282 15.6232 2.03909 13.2497C2.01346 12.5232 2 11.7708 2 11C2 10.2292 2.01346 9.47679 2.03909 8.7503C2.12282 6.37683 2.16469 5.19009 3.13007 4.21745C4.09545 3.24481 5.3157 3.1926 7.7562 3.08819C9.09517 3.0309 10.5209 3 12 3C12.6684 3 13.3258 3.00631 13.9693 3.01851"
                                      stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
                                      stroke-linejoin="round" />
                                <path d="M19.491 11H19.5" stroke="currentColor" stroke-width="1.8"
                                      stroke-linecap="round" stroke-linejoin="round" />
                                <path
                                      d="M17 4.5C17 3.11929 18.1193 2 19.5 2C20.8807 2 22 3.11929 22 4.5C22 5.53529 21.3707 6.4236 20.4737 6.80327C19.9651 7.01856 19.5 7.44772 19.5 8"
                                      stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
                                      stroke-linejoin="round" />
                            </svg>
                        </span>
                        <dib class="content">
                            <h4 class="title">{{ __($faqContent?->data_values?->widget_title_one ?? '') }}</h4>
                            <p class="desc">{{ __($faqContent?->data_values?->widget_description_one ?? '') }}</p>
                        </dib>
                    </div>
                    <div class="faq-card__item">
                        <span class="icon">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"
                                 color="currentColor" fill="none">
                                <path
                                      d="M12 20.5C13.8097 20.5 15.5451 20.3212 17.1534 19.9934C19.1623 19.5839 20.1668 19.3791 21.0834 18.2006C22 17.0221 22 15.6693 22 12.9635V11.0365C22 8.33073 22 6.97787 21.0834 5.79937C20.1668 4.62088 19.1623 4.41613 17.1534 4.00662C15.5451 3.67877 13.8097 3.5 12 3.5C10.1903 3.5 8.45489 3.67877 6.84656 4.00662C4.83766 4.41613 3.83321 4.62088 2.9166 5.79937C2 6.97787 2 8.33073 2 11.0365V12.9635C2 15.6693 2 17.0221 2.9166 18.2006C3.83321 19.3791 4.83766 19.5839 6.84656 19.9934C8.45489 20.3212 10.1903 20.5 12 20.5Z"
                                      stroke="currentColor" stroke-width="1.5" />
                                <path
                                      d="M15.9621 12.3129C15.8137 12.9187 15.0241 13.3538 13.4449 14.2241C11.7272 15.1705 10.8684 15.6438 10.1728 15.4615C9.9372 15.3997 9.7202 15.2911 9.53799 15.1438C9 14.7089 9 13.8059 9 12C9 10.1941 9 9.29112 9.53799 8.85618C9.7202 8.70886 9.9372 8.60029 10.1728 8.53854C10.8684 8.35621 11.7272 8.82945 13.4449 9.77593C15.0241 10.6462 15.8137 11.0813 15.9621 11.6871C16.0126 11.8933 16.0126 12.1067 15.9621 12.3129Z"
                                      stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
                            </svg>
                        </span>
                        <dib class="content">
                            <h4 class="title">{{ __($faqContent?->data_values?->widget_title_two ?? '') }}</h4>
                            <p class="desc">{{ __($faqContent?->data_values?->widget_description_two ?? '') }}</p>
                        </dib>
                    </div>
                    <div class="faq-card__item">
                        <span class="icon">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"
                                 color="currentColor" fill="none">
                                <path
                                      d="M4.31802 19.682C3 18.364 3 16.2426 3 12C3 7.75736 3 5.63604 4.31802 4.31802C5.63604 3 7.75736 3 12 3C16.2426 3 18.364 3 19.682 4.31802C21 5.63604 21 7.75736 21 12C21 16.2426 21 18.364 19.682 19.682C18.364 21 16.2426 21 12 21C7.75736 21 5.63604 21 4.31802 19.682Z"
                                      stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
                                      stroke-linejoin="round" />
                                <path d="M6 12H8.5L10.5 8L13.5 16L15.5 12H18" stroke="currentColor" stroke-width="1.5"
                                      stroke-linecap="round" stroke-linejoin="round" />
                            </svg>
                        </span>
                        <dib class="content">
                            <h4 class="title">{{ __($faqContent?->data_values?->widget_title_three ?? '') }}</h4>
                            <p class="desc">{{ __($faqContent?->data_values?->widget_description_three ?? '') }}</p>
                        </dib>
                    </div>
                </div>
            </div>
            <div class="col-lg-6">
                <ul class="accordion-box">
                    @foreach ($faqElement as $key => $faq)
                        <li class="accordion block {{ $loop->first ? 'active-block' : '' }}">
                            <div class="acc-btn {{ $loop->first ? 'active' : '' }}">
                                <div class="icon-box"></div>
                                <h5> {{ __($faq?->data_values?->question ?? '') }}</h5>
                            </div>
                            <div class="acc-content {{ $loop->first ? 'current' : '' }}">
                                <div class="content">
                                    <p>{{ __($faq?->data_values?->answer ?? '') }}</p>
                                </div>
                            </div>
                        </li>
                    @endforeach
                </ul>
            </div>
        </div>
    </div>
</section>
