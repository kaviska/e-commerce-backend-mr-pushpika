<?php

namespace App\Http\Controllers;

use App\Helper\Response;
use App\Models\Notice;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class DeletController extends Controller
{
    public function deleteAllExceptFirstTwo()
    {
        try {
            // Get the IDs of the first two users (ordered by id ascending)
            $firstTwoIds = \App\Models\User::orderBy('id')->limit(3)->pluck('id')->toArray();

            // Delete all users except those two
            $deleted = \App\Models\User::whereNotIn('id', $firstTwoIds)->delete();

            return Response::success(['deleted_count' => $deleted], 'All users except the first two have been deleted.', 200);
        } catch (\Throwable $th) {
            Log::error('Error deleting users except first two: ', [
                'error' => $th->getMessage(),
                'line' => $th->getLine(),
                'file' => $th->getFile(),
            ]);
            return Response::error('An error occurred while deleting users.', 500);
        }
    }

       
       
        public function deleteOrdersWhereTypeIsPos()
        {
            try {
                // Get all orders with type 'pos'
                $orders = \App\Models\Order::where('type', 'pos')->get();
    
                // Delete related order items
                foreach ($orders as $order) {
                    $order->orderItems()->delete();
                }
    
                // Delete the orders
                $deleted = \App\Models\Order::where('type', 'pos')->delete();
    
                return Response::success(['deleted_count' => $deleted], 'All POS orders and their items have been deleted.', 200);
            } catch (\Throwable $th) {
                Log::error('Error deleting POS orders: ', [
                    'error' => $th->getMessage(),
                    'line' => $th->getLine(),
                    'file' => $th->getFile(),
                ]);
                return Response::error('An error occurred while deleting POS orders.', 500);
            }
        }
    
        /**
         * Delete all orders where type is NOT 'pos' and their related order items.
         */
        public function deleteOrdersWhereTypeIsNotPos()
        {
            try {
                // Get all orders where type is not 'pos'
                $orders = \App\Models\Order::where('type', '!=', 'pos')->get();
    
                // Delete related order items
                foreach ($orders as $order) {
                    $order->orderItems()->delete();
                }
    
                // Delete the orders
                $deleted = \App\Models\Order::where('type', '!=', 'pos')->delete();
    
                return Response::success(['deleted_count' => $deleted], 'All non-POS orders and their items have been deleted.', 200);
            } catch (\Throwable $th) {
                Log::error('Error deleting non-POS orders: ', [
                    'error' => $th->getMessage(),
                    'line' => $th->getLine(),
                    'file' => $th->getFile(),
                ]);
                return Response::error('An error occurred while deleting non-POS orders.', 500);
            }
        }
    
    // ...existing code...
}
