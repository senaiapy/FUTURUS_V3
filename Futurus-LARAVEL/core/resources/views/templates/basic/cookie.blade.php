@extends('Template::layouts.frontend')
@section('content')
    <section class="py-120">
        <div class="container">
            <div class="row">
                <div class="col-md-12">
                    <div class="cookie-data">
                        @php
                            echo $cookie->data_values->description;
                        @endphp
                    </div>
                </div>
            </div>
        </div>
    </section>
@endsection


@push('style')
    <style>
        .cookie-data {
            border: 1px solid hsl(var(--border-color)/0.2);
            padding: 36px;
            border-radius: 8px;
        }

        .cookie-data h5 {
            margin-bottom: 16px
        }

        .cookie-data p {
            font-size: 18px;
        }

        .cookie-data ul {
            padding-left: 20px;
            margin-top: 12px;
            margin-left: 12px;
        }

        .cookie-data ul li {
            list-style: disc;
            font-size: 18px;
        }

        .cookie-data ul li:not(:last-child) {
            margin-bottom: 12px;
        }
    </style>
@endpush
