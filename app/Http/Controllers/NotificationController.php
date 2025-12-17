<?php

namespace App\Http\Controllers;

use App\Helper\Response;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
    public function index(Request $request)
    {

        $request->validate([
            'unread' => 'required|boolean',
            'page' => 'integer|min:1',
            'per_page' => 'integer|min:1',
            'id' => 'uuid|exists:notifications,id',
        ]);


        if ($request->has('id')) {
            $notification = Auth::user()->notifications->where('id', $request->id)->first();
            return Response::success(
                $notification,
                'Notification fetched successfully',
                200
            );
        }


        $PER_PAGE = $request->per_page ?? 10;
        $PAGE = $request->page ?? 1;

        if ($request->unread) {
            $notifications = Auth::user()->unreadNotifications->skip(($PAGE - 1) * $PER_PAGE)->take($PER_PAGE);
        } else {
            $notifications = Auth::user()->notifications->skip(($PAGE - 1) * $PER_PAGE)->take($PER_PAGE);
        }

        return Response::success(
            $notifications,
            'Notifications fetched successfully',
            200
        );
    }

    public function markAsRead(Request $request)
    {
        $request->validate([
            'notification_id' => 'required|uuid|exists:notifications,id',
        ]);

        $notification = Auth::user()->notifications->where('id', $request->notification_id)->first();
        $notification->markAsRead();

        return Response::success(
            $notification,
            'Notification marked as read',
            200
        );
    }
}
