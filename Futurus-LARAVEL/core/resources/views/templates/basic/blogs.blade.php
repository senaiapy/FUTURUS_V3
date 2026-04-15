@extends('Template::layouts.frontend')
@section('content')


    <section class="blog my-100">
        <div class="auto-container">
            <div class="row gy-4">
                @include('Template::partials.blogs')
            </div>

            @if ($blogs->hasPages())
                <div class="pagination-wrapper">
                    {{ paginateLinks($blogs) }}
                </div>
            @endif
        </div>
    </section>

    @if (isset($sections->secs) && $sections->secs != null)
        @foreach (json_decode($sections->secs) as $sec)
            @include('Template::sections.' . $sec)
        @endforeach
    @endif
@endsection
