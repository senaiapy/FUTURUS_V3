@extends('Template::layouts.frontend')
@section('content')
    <section class="sidebar-page-container py-100">
        <div class="auto-container">
            <div class="row clearfix">
                <div class="col-lg-8 col-md-12 col-sm-12 content-side">
                    <div class="blog-details-content">
                        <div class="blog-card">
                            <div class="inner-box">
                                <div class="image-box">
                                    <figure class="image">
                                        <img src="{{ frontendImage('blog', $blog?->data_values?->image, '850x500') }}" alt="img">
                                    </figure>
                                </div>
                                <div class="lower-content">
                                    <div class="author-box mb_15">
                                        <span>{{ __(showDateTime($blog->created_at, 'd-m-Y')) }}</span>
                                    </div>
                                    <h2> {{ __($blog?->data_values?->title ?? '') }}</h2>
                                    <div class="content-one mt_30 mb_60">
                                        @php
                                            echo $blog?->data_values?->description ?? '';
                                        @endphp
                                    </div>
                                    <div class="post-share-option">
                                        <h4>@lang('Share This:')</h4>
                                        <ul class="social-links">
                                            <li>
                                                <a href="https://www.facebook.com/sharer/sharer.php?u={{ urlencode(url()->current()) }}" target="_blank"><i class="fab fa-facebook-f"></i></a>
                                            </li>
                                            <li>
                                                <a href="https://twitter.com/intent/tweet?text= {{ __(strLimit($blog?->data_values?->title ?? '', 150)) }}&amp;url={{ urlencode(url()->current()) }}" target="_blank"><i class="fa-brands fa-x-twitter"></i></a>
                                            </li>
                                            <li>
                                                <a href="https://www.linkedin.com/shareArticle?mini=true&amp;url={{ urlencode(url()->current()) }}&amp;title={{ __(strLimit($blog?->data_values?->title ?? '', 150)) }}&amp;summary={{ __(strLimit(strip_tags($blog?->data_values?->description ?? ''), 300)) }}" target="_blank"><i class="fab fa-linkedin-in"></i></a>
                                            </li>
                                            <li>
                                                <a href="https://www.pinterest.com/pin/create/button/?url={{ urlencode(url()->current()) }}&description={{ __($blog?->data_values?->title ?? '') }}&media={{ frontendImage('blog', $blog?->data_values?->image ?? '', '1000x500') }}" target="_blank"><i class="fab fa-pinterest"></i></a>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="fb-comments" data-href="{{ url()->current() }}" data-numposts="5"></div>
                </div>
                <div class="col-lg-4 col-md-12 col-sm-12 sidebar-side">
                    <div class="blog-sidebar ml_40">
                        <div class="sidebar-widget post-widget">
                            <div class="widget-title mb_20">
                                <h3>@lang('Latest Post')</h3>
                            </div>
                            <div class="post-inner">
                                @foreach ($latestBlogs as $latestBlog)
                                    <div class="post">
                                        <figure class="post-thumb">
                                            <a href="{{ route('blog.details', $latestBlog->slug) }}">
                                                <img src="{{ frontendImage('blog', 'thumb_' . $latestBlog?->data_values?->image ?? '', '425x250') }}" alt="img">
                                            </a>
                                        </figure>
                                        <h6><a href="{{ route('blog.details', $latestBlog->slug) }}">{{ __(strLimit($latestBlog?->data_values?->title, 50) ?? '') }}</a></h6>
                                        <span class="post-date">{{ showDateTime($latestBlog->created_at, 'd M, Y') }}</span>
                                    </div>
                                @endforeach
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
@endsection

@push('fbComment')
    @php echo loadExtension('fb-comment') @endphp
@endpush
