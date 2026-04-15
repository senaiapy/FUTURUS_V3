<?php

namespace App\Http\Controllers\Api;

use App\Constants\Status;
use App\Http\Controllers\Controller;
use App\Models\SupportAttachment;
use App\Models\SupportMessage;
use App\Models\SupportTicket;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class TicketController extends Controller
{
    public function supportTicket()
    {
        $user = Auth::user();
        $tickets = SupportTicket::where('user_id', $user->id)->orderBy('id', 'desc')->paginate(20);

        return response()->json([
            'success' => true,
            'data' => [
                'tickets' => $tickets->map(function ($ticket) {
                    return [
                        'id' => (string) $ticket->id,
                        'ticket' => $ticket->ticket,
                        'subject' => $ticket->subject,
                        'status' => $ticket->status,
                        'priority' => $ticket->priority,
                        'last_reply' => $ticket->last_reply,
                        'created_at' => $ticket->created_at->toIso8601String(),
                    ];
                }),
                'meta' => [
                    'total' => $tickets->total(),
                    'page' => $tickets->currentPage(),
                ]
            ]
        ]);
    }

    public function storeSupportTicket(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'subject' => 'required|max:255',
            'priority' => 'required|in:1,2,3',
            'message' => 'required',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first(),
            ], 400);
        }

        $user = Auth::user();
        $ticket = new SupportTicket();
        $ticket->user_id = $user->id;
        $ticket->ticket = rand(100000, 999999);
        $ticket->name = $user->fullname;
        $ticket->email = $user->email;
        $ticket->subject = $request->subject;
        $ticket->last_reply = now();
        $ticket->status = Status::TICKET_OPEN;
        $ticket->priority = $request->priority;
        $ticket->save();

        $message = new SupportMessage();
        $message->support_ticket_id = $ticket->id;
        $message->message = $request->message;
        $message->save();

        return response()->json([
            'success' => true,
            'message' => 'Ticket created successfully',
            'data' => [
                'id' => (string) $ticket->id,
                'ticket' => $ticket->ticket,
            ]
        ]);
    }

    public function viewTicket($ticket)
    {
        $user = Auth::user();
        $myTicket = SupportTicket::where('ticket', $ticket)->where('user_id', $user->id)->firstOrFail();
        $messages = SupportMessage::where('support_ticket_id', $myTicket->id)->with('attachments')->orderBy('id', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => [
                'ticket' => [
                    'id' => (string) $myTicket->id,
                    'ticket' => $myTicket->ticket,
                    'subject' => $myTicket->subject,
                    'status' => $myTicket->status,
                    'priority' => $myTicket->priority,
                ],
                'messages' => $messages->map(function ($msg) {
                    return [
                        'id' => (string) $msg->id,
                        'admin_id' => (string) $msg->admin_id,
                        'message' => $msg->message,
                        'created_at' => $msg->created_at->toIso8601String(),
                        'attachments' => $msg->attachments->map(function ($att) {
                            return [
                                'id' => (string) $att->id,
                                'url' => urlPath('download.attachment', encrypt($att->attachment)),
                            ];
                        })
                    ];
                })
            ]
        ]);
    }

    public function replyTicket(Request $request, $id)
    {
        $myTicket = SupportTicket::where('id', $id)->where('user_id', Auth::id())->firstOrFail();

        $validator = Validator::make($request->all(), [
            'message' => 'required',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first(),
            ], 400);
        }

        $myTicket->status = Status::TICKET_REPLY;
        $myTicket->last_reply = now();
        $myTicket->save();

        $message = new SupportMessage();
        $message->support_ticket_id = $myTicket->id;
        $message->message = $request->message;
        $message->save();

        return response()->json([
            'success' => true,
            'message' => 'Reply sent successfully',
        ]);
    }

    public function closeTicket($id)
    {
        $user = Auth::user();
        $myTicket = SupportTicket::where('id', $id)->where('user_id', $user->id)->firstOrFail();
        $myTicket->status = Status::TICKET_CLOSE;
        $myTicket->last_reply = now();
        $myTicket->save();

        return response()->json([
            'success' => true,
            'message' => 'Ticket closed successfully',
        ]);
    }
}
