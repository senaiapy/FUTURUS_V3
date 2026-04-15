@props(['class' => false])
@for ($i = 0; $i < 12; $i++)
    <div class="{{ $class ? 'col-xxl-3 col-lg-4 col-sm-6 col-xsm-6' : 'col-xxl-4 col-sm-6 col-xsm-6' }}">
        <div class="market-card loading-skeleton" data-key="markets">
            <div class="market-card-body">
                <div class="market-card-wrapper">
                    <div class="market-card-thumb skeleton-box"></div>
                    <div class="market-card-content">
                        <div class="skeleton-line skeleton-title mb-2"></div>
                        <div class="skeleton-line skeleton-title-short"></div>
                    </div>
                </div>

                <div class="market-card-list p-0">
                    <div class="market-card-list-item">
                        <div class="skeleton-line skeleton-option-title"></div>
                        <div class="skeleton-buttons">
                            <div class="skeleton-line skeleton-btn"></div>
                        </div>
                    </div>
                    <div class="market-card-list-item">
                        <div class="skeleton-line skeleton-option-title"></div>
                        <div class="skeleton-buttons">
                            <div class="skeleton-line skeleton-btn"></div>
                        </div>
                    </div>
                    <div class="market-card-list-item">
                        <div class="skeleton-line skeleton-option-title"></div>
                        <div class="skeleton-buttons">
                            <div class="skeleton-line skeleton-btn"></div>
                        </div>
                    </div>
                </div>

                <div class="market-card-action mt-4">
                    <div class="skeleton-line skeleton-action-btn"></div>
                </div>
            </div>
        </div>
    </div>
@endfor
