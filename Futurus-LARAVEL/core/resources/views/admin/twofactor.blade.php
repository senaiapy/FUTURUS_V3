@extends('admin.layouts.app')
@section('panel')
    <div class="row mb-none-30">
        @if(!$admin->ts)
            <div class="col-xl-6 col-lg-6 mb-30">
                <div class="card">
                    <div class="card-header">
                        <h5 class="card-title">@lang('Two Factor Authenticator')</h5>
                    </div>
                    <div class="card-body">
                        <div class="form-group">
                            <div class="input-group">
                                <input type="text" name="key" value="{{$secret}}" class="form-control" id="referralURL" readonly>
                                <button type="button" class="input-group-text copytext" id="copyBoard"> <i class="fa fa-copy"></i> </button>
                            </div>
                        </div>
                        <div class="form-group mx-auto text-center">
                            <img class="mx-auto" src="{{$qrCodeUrl}}">
                        </div>
                        <div class="form-group">
                            <label>@lang('Google Authenticatior App Link')</label>
                            <a class="btn btn-outline--primary btn-sm" href="https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2&hl=en" target="_blank">@lang('Google Play')</a>
                            <a class="btn btn-outline--primary btn-sm" href="https://itunes.apple.com/us/app/google-authenticator/id388497605?mt=8" target="_blank">@lang('App Store')</a>
                        </div>
                    </div>
                </div>
            </div>

            <div class="col-xl-6 col-lg-6 mb-30">
                <div class="card">
                    <div class="card-header">
                        <h5 class="card-title">@lang('Enable 2FA Security')</h5>
                    </div>
                    <form action="{{route('admin.twofactor.enable')}}" method="POST">
                        @csrf
                        <div class="card-body">
                            <input type="hidden" name="key" value="{{$secret}}">
                            <div class="form-group">
                                <label>@lang('Google Authenticatior Code')</label>
                                <input type="text" class="form-control" name="code" required>
                            </div>
                            <button type="submit" class="btn btn--primary w-100 h-45">@lang('Submit')</button>
                        </div>
                    </form>
                </div>
            </div>
        @else
            <div class="col-xl-12 col-lg-12 mb-30">
                <div class="card">
                    <div class="card-header">
                        <h5 class="card-title">@lang('Disable 2FA Security')</h5>
                    </div>
                    <form action="{{route('admin.twofactor.disable')}}" method="POST">
                        @csrf
                        <div class="card-body">
                            <div class="form-group">
                                <label>@lang('Google Authenticatior Code')</label>
                                <input type="text" class="form-control" name="code" required>
                            </div>
                            <button type="submit" class="btn btn--primary w-100 h-45">@lang('Submit')</button>
                        </div>
                    </form>
                </div>
            </div>
        @endif
    </div>
@endsection

@push('style')
    <style>
        .copytext{
            cursor: pointer;
        }
    </style>
@endpush

@push('script')
    <script>
        (function($){
            "use strict";
            $('#copyBoard').click(function(){
                var copyText = document.getElementById("referralURL");
                copyText.select();
                copyText.setSelectionRange(0, 99999);
                /* For mobile devices */
                document.execCommand("copy");
                notify('success', "Copied: " + copyText.value);
            });
        })(jQuery);
    </script>
@endpush
