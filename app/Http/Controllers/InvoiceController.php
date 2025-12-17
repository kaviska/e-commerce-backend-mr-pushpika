<?php

namespace App\Http\Controllers;

use App\Enums\InvoiceStatus;
use App\Models\Invoice;
use App\Models\Order;
use Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class InvoiceController extends Controller
{
    public function sendInvoice(int $invoiceId)
    {
        //send invoice for user email
        $invoice = Invoice::find($invoiceId);
        if (!$invoice) {
            return [
                'success' => false,
                'message' => 'Invoice not found'
            ];
        }
        // Check if the invoice is already sent
        if ($invoice->invoice_sending_status == InvoiceStatus::SENT->value && $invoice->invoice_paid_amount != 0.00) {
            return [
                'success' => false,
                'message' => 'Invoice already sent'
            ];
        }

        //get order detail from order table
        $order = Order::find($invoice->order_id);
        if (!$order) {
            return [
                'success' => false,
                'message' => 'Order not found'
            ];
        }

        //get all order items from order_items table
        $orderItems = $invoice->orderItem()->get();
        if (!$orderItems) {
            return [
                'success' => false,
                'message' => 'Order items not found'
            ];
        }
        try {
            //send a email 
            Mail::to($order->user_email)->send(new \App\Mail\Invoice(
                $invoice,
                $order,
                $orderItems
            ));
            DB::beginTransaction();
            //update invoice sending status
            $invoice->update([
                'invoice_sending_status' => InvoiceStatus::SENT->value,
            ]);
            //update order sending status
            $order->update([
                'send_invoice_status' => InvoiceStatus::SENT->value,
            ]);
            DB::commit();
            return [
                'success' => true,
                'message' => 'Invoice sent successfully'
            ];
        } catch (Exception $exception) {
            // Rollback the transaction if there is an error
            DB::rollBack();
            // Log the error message
            Log::error('Error sending invoice: ' . $exception->getMessage());
            return [
                'success' => false,
                'message' => 'Error sending invoice: ' . $exception->getMessage()
            ];
        }
    }

    public function makeInvoice(int $orderId)
    {
        $order = Order::find($orderId);

        if (!$order) {
            return [
                'success' => false,
                'message' => 'Order not found'
            ];
        }

        try {
            //open database transaction
            DB::beginTransaction();
            // create invoice
            $invoice = Invoice::create(
                [
                    'order_id' => $order->id,
                    'invoice_number' => 'INV-' . str_pad($order->id, 6, '0', STR_PAD_LEFT),
                    'invoice_sending_status' => InvoiceStatus::PENDING->value,
                    'invoice_date' => now(),
                    'invoice_due_date' => $order->due_payment_date,
                    'invoice_paid_date' => $order->payment_status == 'completed' ? now() : "not still paid",
                    'invoice_paid_amount' => $order->paid_amount,
                    'invoice_paid_status' => $order->payment_status,
                    'invoice_paid_method' => $order->payment_method,
                    'total_amount' => $order->total_amount,
                    'currency' => $order->currency,
                    'order_number' => $order->order_number,
                ]
            );

            DB::commit();
            //update order sending status
            return [
                'success' => true,
                'message' => 'Invoice created successfully',
                'invoice' => $invoice
            ];
        } catch (\Throwable $th) {
            Log::error('Error creating invoice: ' . $th->getMessage());
            DB::rollBack();
            return [
                'success' => false,
                'message' => 'Error creating invoice: ' . $th->getMessage()
            ];
        }
    }
}
