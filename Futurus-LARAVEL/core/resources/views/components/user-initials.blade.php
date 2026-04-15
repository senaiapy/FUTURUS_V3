@props(['user'])
<span class="initials-circle">
    <span class="first-initial">{{ strtoupper(substr($user->firstname ?? '', 0, 1)) }}</span><span
          class="last-initial">{{ strtoupper(substr($user->lastname ?? '', 0, 1)) }}</span>
</span>
