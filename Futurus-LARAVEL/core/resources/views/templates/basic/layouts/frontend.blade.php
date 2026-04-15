@extends('Template::layouts.app')

@section('app')
    @include('Template::partials.header')


    <div class="boxed_wrapper ltr">
        @if (!in_array(request()->route()->getName(), ['home', 'maintenance']))
            @include('Template::partials.breadcrumb')
        @endif

        @yield('content')
    </div>

    @include('Template::partials.footer')
@endsection
