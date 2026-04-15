{{--
@php
    $awardContent = getContent('award.content', true);
    $awardElement = getContent('award.element', orderById: true);
@endphp
<section class="award-section my-100">
    <div class="auto-container">
        <div class="sec-title centred mb-40">
            <span class="sub-title mb_14">{{ __($awardContent?->data_values?->heading ?? '') }}</span>
            <h2>{{ __($awardContent?->data_values?->subheading ?? '') }}</h2>
        </div>
        <div class="table-outer">
            <table class="award-table">
                <tbody>
                    @foreach ($awardElement as $award)
                        <tr>
                            <td>{{ $loop->index + 1 }}</td>
                            <td>
                                <h3>{{ __($award?->data_values?->title ?? '') }}</h3>
                            </td>
                            <td><span>x{{ __($award?->data_values?->times ?? '') }}</span></td>
                            <td>
                                <figure class="image-box">
                                    <img src="{{ frontendImage('award', $award?->data_values?->image ?? '', '150x80') }}" alt="img">
                                </figure>
                            </td>
                            <td>{{ __($award?->data_values?->year ?? '') }}</td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
    </div>
</section>
--}}
