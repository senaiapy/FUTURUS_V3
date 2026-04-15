@foreach ($blogs as $blogElement)
    <div class="col-lg-4 col-md-6 col-sm-12">
        <div class="blog-card wow fadeInUp animated" data-wow-delay="00ms" data-wow-duration="1500ms">
            <div class="inner-box">
                <div class="image-box">
                    <figure class="image">
                        <a href="{{ route('blog.details', $blogElement->slug) }}">
                            <img src="{{ frontendImage('blog', 'thumb_' . $blogElement?->data_values?->image ?? '', '425x250') }}" alt="img">
                        </a>
                    </figure>
                </div>
                <div class="lower-content">
                    <span class="date"> {{ __(showDateTime($blogElement->created_at, 'd F, Y')) }}</span>
                    <h3><a href="{{ route('blog.details', $blogElement->slug) }}"> {{ __(strLimit($blogElement?->data_values?->title, 50) ?? '') }}</a></h3>
                    <p class="mb-0">
                        @php
                            echo strLimit(strip_tags($blogElement?->data_values?->description ?? ''), 90);
                        @endphp
                    </p>
                </div>
            </div>
        </div>
    </div>
@endforeach
