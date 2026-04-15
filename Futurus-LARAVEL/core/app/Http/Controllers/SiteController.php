<?php

namespace App\Http\Controllers;

use App\Constants\Status;
use App\Models\AdminNotification;
use App\Models\Frontend;
use App\Models\Language;
use App\Models\Page;
use App\Models\Subscriber;
use App\Models\SupportMessage;
use App\Models\SupportTicket;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cookie;
use Illuminate\Support\Facades\Validator;

class SiteController extends Controller {
    public function index() {

        if (isset($_GET['reference'])) {
            $reference = $_GET['reference'];
            session()->put('reference', $reference);
        }

        $pageTitle   = 'Home';
        $sections    = Page::where('tempname', activeTemplate())->where('slug', '/')->first();
        $seoContents = $sections?->seo_content;
        $seoImage    = $seoContents?->image ? getImage(getFilePath('seo') . '/' . $seoContents?->image, getFileSize('seo')) : null;
        return view('Template::home', compact('pageTitle', 'sections', 'seoContents', 'seoImage'));
    }

    public function pages($slug) {
        $user        = auth()->user();
        $sections    = Page::where('tempname', activeTemplate())->where('slug', $slug)->first();
        if (!$sections) {
            abort(404);
        }
        $seoContents = $sections?->seo_content;
        $pageTitle   = $sections->name;
        $seoImage    = $seoContents?->image ? getImage(getFilePath('seo') . '/' . $seoContents?->image, getFileSize('seo')) : null;
        return view('Template::pages', compact('pageTitle', 'sections', 'seoContents', 'seoImage'));
    }

    public function contact() {
        $pageTitle   = "Contact Us";
        $user        = auth()->user();
        $sections    = Page::where('tempname', activeTemplate())->where('slug', 'contact')->first();
        $seoContents = $sections?->seo_content;
        $seoImage    = $seoContents?->image ? getImage(getFilePath('seo') . '/' . $seoContents?->image, getFileSize('seo')) : null;
        return view('Template::contact', compact('pageTitle', 'user', 'sections', 'seoContents', 'seoImage'));
    }

    public function contactSubmit(Request $request) {
        $request->validate([
            'name'    => 'required',
            'email'   => 'required',
            'subject' => 'required|string|max:255',
            'message' => 'required',
        ]);

        $request->session()->regenerateToken();

        if (!verifyCaptcha()) {
            $notify[] = ['error', 'Invalid captcha provided'];
            return back()->withNotify($notify);
        }

        $random = getNumber();

        $ticket           = new SupportTicket();
        $ticket->user_id  = auth()->id() ?? 0;
        $ticket->name     = $request->name;
        $ticket->email    = $request->email;
        $ticket->priority = Status::PRIORITY_MEDIUM;

        $ticket->ticket     = $random;
        $ticket->subject    = $request->subject;
        $ticket->last_reply = Carbon::now();
        $ticket->status     = Status::TICKET_OPEN;
        $ticket->save();

        $adminNotification            = new AdminNotification();
        $adminNotification->user_id   = auth()->user() ? auth()->user()->id : 0;
        $adminNotification->title     = 'A new contact message has been submitted';
        $adminNotification->click_url = urlPath('admin.ticket.view', $ticket->id);
        $adminNotification->save();

        $message                    = new SupportMessage();
        $message->support_ticket_id = $ticket->id;
        $message->message           = $request->message;
        $message->save();

        $notify[] = ['success', 'Ticket created successfully!'];

        return to_route('ticket.view', [$ticket->ticket])->withNotify($notify);
    }

    public function accountRemoval() {
        $pageTitle = "Remover Conta";
        $user      = auth()->user();
        return view('Template::account_removal', compact('pageTitle', 'user'));
    }

    public function accountRemovalSubmit(Request $request) {
        $request->validate([
            'name'     => 'required',
            'email'    => 'required|email',
            'username' => 'required',
            'reason'   => 'nullable|string|max:1000',
        ]);

        $request->session()->regenerateToken();

        if (!verifyCaptcha()) {
            $notify[] = ['error', 'Invalid captcha provided'];
            return back()->withNotify($notify);
        }

        $random = getNumber();

        $ticket           = new SupportTicket();
        $ticket->user_id  = auth()->id() ?? 0;
        $ticket->name     = $request->name;
        $ticket->email    = $request->email;
        $ticket->priority = Status::PRIORITY_HIGH;

        $ticket->ticket     = $random;
        $ticket->subject    = 'Solicitação de Remoção de Conta';
        $ticket->last_reply = Carbon::now();
        $ticket->status     = Status::TICKET_OPEN;
        $ticket->save();

        $adminNotification            = new AdminNotification();
        $adminNotification->user_id   = auth()->user() ? auth()->user()->id : 0;
        $adminNotification->title     = 'Nova solicitação de remoção de conta recebida';
        $adminNotification->click_url = urlPath('admin.ticket.view', $ticket->id);
        $adminNotification->save();

        $messageContent = "**Solicitação de Remoção de Conta**\n\n";
        $messageContent .= "Nome: " . $request->name . "\n";
        $messageContent .= "Email: " . $request->email . "\n";
        $messageContent .= "Username: " . $request->username . "\n";
        $messageContent .= "Motivo: " . ($request->reason ?? 'Não informado');

        $message                    = new SupportMessage();
        $message->support_ticket_id = $ticket->id;
        $message->message           = $messageContent;
        $message->save();

        $notify[] = ['success', 'Solicitação enviada com sucesso! Processaremos em até 30 dias úteis.'];

        return back()->withNotify($notify)->with('sent', true);
    }

    public function policyPages($slug) {
        $policy      = Frontend::where('tempname', activeTemplateName())->where('slug', $slug)->where('data_keys', 'policy_pages.element')->firstOrFail();
        $pageTitle   = $policy->data_values->title;
        $seoContents = $policy->seo_content;
        $seoImage    = $seoContents?->image ? frontendImage('policy_pages', $seoContents?->image, getFileSize('seo'), true) : null;
        return view('Template::policy', compact('policy', 'pageTitle', 'seoContents', 'seoImage'));
    }

    public function changeLanguage($lang = null) {
        $language = Language::where('code', $lang)->first();
        if (!$language) {
            $lang = 'en';
        }

        session()->put('lang', $lang);
        return back();
    }

    public function blogs() {
        $blogs       = Frontend::where('data_keys', 'blog.element')->orderBy('id', 'desc')->paginate(getPaginate(12));
        $pageTitle   = 'Blogs';
        $sections    = Page::where('tempname', activeTemplate())->where('slug', 'blog')->first();
        $seoContents = $sections?->seo_content;
        $seoImage    = $seoContents?->image ? getImage(getFilePath('seo') . '/' . $seoContents?->image, getFileSize('seo')) : null;
        return view('Template::blogs', compact('blogs', 'pageTitle', 'seoContents', 'seoImage', 'sections'));
    }

    public function blogDetails($slug) {
        $blog            = Frontend::where('slug', $slug)->where('data_keys', 'blog.element')->firstOrFail();
        $latestBlogs     = Frontend::where('slug', '!=', $slug)->where('data_keys', 'blog.element')->latest()->limit(4)->get();
        $customPageTitle = 'Blog Details';
        $pageTitle       = $blog->data_values?->title;
        $seoContents     = $blog->seo_content;
        $seoImage        = $seoContents?->image ? frontendImage('blog', $seoContents?->image, getFileSize('seo'), true) : null;
        return view('Template::blog_details', compact('blog', 'pageTitle', 'seoContents', 'seoImage', 'latestBlogs', 'customPageTitle'));
    }

    public function cookieAccept() {
        Cookie::queue('gdpr_cookie', gs('site_name'), 43200);
    }

    public function cookiePolicy() {
        $cookieContent = Frontend::where('data_keys', 'cookie.data')->first();
        abort_if($cookieContent->data_values->status != Status::ENABLE, 404);
        $pageTitle = 'Cookie Policy';
        $cookie    = Frontend::where('data_keys', 'cookie.data')->first();
        return view('Template::cookie', compact('pageTitle', 'cookie'));
    }

    public function placeholderImage($size = null) {
        $imgWidth  = explode('x', $size)[0];
        $imgHeight = explode('x', $size)[1];
        $text      = $imgWidth . '×' . $imgHeight;
        $fontFile  = realpath('assets/font/solaimanLipi_bold.ttf');
        $fontSize  = round(($imgWidth - 50) / 8);
        if ($fontSize <= 9) {
            $fontSize = 9;
        }
        if ($imgHeight < 100 && $fontSize > 30) {
            $fontSize = 30;
        }

        $image     = imagecreatetruecolor($imgWidth, $imgHeight);
        $colorFill = imagecolorallocate($image, 100, 100, 100);
        $bgFill    = imagecolorallocate($image, 255, 255, 255);
        imagefill($image, 0, 0, $bgFill);
        $textBox    = imagettfbbox($fontSize, 0, $fontFile, $text);
        $textWidth  = abs($textBox[4] - $textBox[0]);
        $textHeight = abs($textBox[5] - $textBox[1]);
        $textX      = ($imgWidth - $textWidth) / 2;
        $textY      = ($imgHeight + $textHeight) / 2;
        header('Content-Type: image/jpeg');
        imagettftext($image, $fontSize, 0, $textX, $textY, $colorFill, $fontFile, $text);
        imagejpeg($image);
        imagedestroy($image);
    }

    public function maintenance() {
        $pageTitle = 'Maintenance Mode';
        if (gs('maintenance_mode') == Status::DISABLE) {
            return to_route('home');
        }
        $maintenance = Frontend::where('data_keys', 'maintenance.data')->first();
        return view('Template::maintenance', compact('pageTitle', 'maintenance'));
    }

    public function subscribe(Request $request) {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|unique:subscribers,email',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'code'    => 200,
                'status'  => 'error',
                'message' => $validator->errors()->all(),
            ]);
        }

        $subscribe        = new Subscriber();
        $subscribe->email = $request->email;
        $subscribe->save();

        $notify = 'Thank you, we will notice you our latest news';

        return response()->json([
            'code'    => 200,
            'status'  => 'success',
            'message' => $notify,
        ]);
    }

    public function leaderboard() {
        $pageTitle = "Leaderboard";

        $currentUser = User::find(auth()->id());

        if ($currentUser) {
            $userHasPurchases = $currentUser->purchases()
                ->where('status', Status::MARKET_SETTLED)
                ->exists();

            if ($userHasPurchases) {
                $higherRankCount = User::where('total_profit', '>', $currentUser->total_profit)
                    ->whereHas('purchases', function ($q) {
                        $q->where('status', Status::MARKET_SETTLED);
                    })
                    ->count();

                $currentUser->rank = $higherRankCount + 1;
                $ownLeaderboards   = collect([$currentUser]);
            } else {
                $ownLeaderboards = collect([]);
            }
        } else {
            $ownLeaderboards = collect([]);
        }

        $leaderboardContent = getContent('leaderboard.content', true);

        $sections    = Page::where('tempname', activeTemplate())->where('slug', 'leaderboard')->first();
        $seoContents = $sections?->seo_content;
        $seoImage    = $seoContents?->image ? getImage(getFilePath('seo') . '/' . $seoContents?->image, getFileSize('seo')) : null;

        return view('Template::leaderboard', compact('pageTitle', 'leaderboardContent', 'sections', 'seoContents', 'seoImage', 'ownLeaderboards'));
    }

    public function leaderboardFilter(Request $request) {
        $filter = $request->get('filter', 'all');
        $query  = User::active();
        if ($filter === 'all') {
            $query->where('total_profit', '>', 0)->whereHas('purchases')->orderByDesc('total_profit');
        } else {
            $query->withSum(['purchases as period_profit' => function (Builder $q) use ($filter) {
                $q->where('status', Status::MARKET_SETTLED);
                switch ($filter) {
                case 'weekly':
                    $q->whereBetween('created_at', [Carbon::now()->startOfWeek(), Carbon::now()->endOfWeek()]);
                    break;
                case 'monthly':
                    $q->whereMonth('created_at', Carbon::now()->month)
                        ->whereYear('created_at', Carbon::now()->year);
                    break;
                }
            }], 'profit');
            $query->having('period_profit', '>', 0);
            $query->orderByDesc('period_profit');
        }
        $leaderboards = $query->limit(8)->get();
        return response()->json([
            'html' => view('Template::partials.leaderboard', compact('leaderboards'))->render(),
        ]);
    }
}
