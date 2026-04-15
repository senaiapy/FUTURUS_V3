@extends('Template::layouts.frontend')
@section('content')
    @include('Template::sections.leaderboard')
    @auth
        @include('Template::sections.own_rank')
    @endauth
    @if (isset($sections->secs) && $sections->secs != null)
        @foreach (json_decode($sections->secs) as $sec)
            @include('Template::sections.' . $sec)
        @endforeach
    @endif
@endsection
