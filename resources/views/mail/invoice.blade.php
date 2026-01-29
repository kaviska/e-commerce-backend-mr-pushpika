<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice - IY Mart</title>
    <link href="https://fonts.googleapis.com/css2?family=Gilroy:wght@400;600&display=swap" rel="stylesheet">
    <style>
        @font-face {
            font-family: 'Gilroy-Regular';
            src: url('https://example.com/path-to-Gilroy-Regular.woff2') format('woff2');
        }

        @font-face {
            font-family: 'Gilroy-SemiBold';
            src: url('https://example.com/path-to-Gilroy-SemiBold.woff2') format('woff2');
        }

        body {
            font-family: 'Gilroy-Regular', Arial, sans-serif;
            margin: 20px;
            padding: 0;
            background: #f8f8f8;
        }

        .invoice-container {
            max-width: 800px;
            margin: auto;
            background: #fff;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
        }

        .header {
            text-align: center;
            padding-bottom: 20px;
            border-bottom: 3px solid #53B175;
        }

        .header img {
            max-width: 150px;
            margin-bottom: 10px;
        }

        .header h2 {
            margin: 0;
            color: #53B175;
            font-family: 'Gilroy-SemiBold', Arial, sans-serif;
        }

        .details {
            display: flex;
            width: 100%;
            margin: 40px 0;
            justify-content: space-between;
            align-items: center,
    
        }

        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }

        .items-table th,
        .items-table td {
            border: 1px solid #ddd;
            padding: 12px;
            text-align: left;
        }

        .items-table th {
            background: #53B175;
            color: #fff;
            font-family: 'Gilroy-SemiBold', Arial, sans-serif;
        }

        .summary {
            margin-top: 20px;
            text-align: right;
        }

        .summary table {
            width: 100%;
            border-collapse: collapse;
        }

        .summary td {
            padding: 10px;
        }

        .summary .total {
            font-size: 18px;
            font-family: 'Gilroy-SemiBold', Arial, sans-serif;
        }

        .footer {
            text-align: center;
            margin-top: 30px;
            font-size: 14px;
            color: #666;
        }
    </style>
</head>

<body>
    <div class="invoice-container">
        <div class="header">
            {{-- <img src="https://iymart.jp/storage/images/assets/web_img/branding/logo.png" alt="IY Mart Logo"> --}}
            <h2>INVOICE</h2>
            <p>Website: <a href="https://iymart.jp/">iymart.jp</a></p>
        </div>
        <div class="details">
            <div>
                <strong>Billing To:</strong><br>
                {{ $order->user_name }}<br>
                {{ $order->user_address_line1 }}<br>
                {{ $order->user_address_line2 }}<br>
                Phone: {{ $order->user_phone }}
            </div>
            <div>
                <strong>Invoice Details:</strong><br>
                Invoice #: {{ $invoice->invoice_number }}<br>
                Payment Method : {{ $order->payment_method }}<br>
                Date: {{ $invoice->created_at->format('Y-m-d') }}
            </div>
            <div>
                <strong>Shop Details:</strong><br>
                Address : 383-24 Oyaguchi, Matsudo, Chiba 270-0005, Japan<br>
                Phone: +81 7042239811<br>
                Email: info.iymart@gmail.com
            </div>
        </div>
        <table class="items-table">
            <tr>
                <th>Item</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Total</th>
            </tr>
            @foreach ($orderItems as $orderItem)
                <tr>
                    <td>{{ $orderItem->product_name }}</td>
                    <td>{{ $orderItem->unit_quantity }}</td>
                    <td>LKR {{ $orderItem->unit_price }}</td>
                    <td>LKR {{ $orderItem->line_total }}</td>
                </tr>
            @endforeach

        </table>
        <div class="summary">
            <table>
                <tr>
                    <td>Subtotal:</td>
                    <td>LKR {{ $order->subtotal }}</td>
                </tr>
                <tr>
                    <td>Tax (8%):</td>
                    <td>LKR {{ $order->tax }}</td>
                </tr>
                <tr>
                    <td>Shipping Fee:</td>
                    <td>LKR {{ $order->shipping_cost }}</td>
                </tr>
                {{-- <tr>
                    <td>Other Fee:</td>
                    <td>LKR {{ $order->cash_on_delivery_fee }}</td>
                </tr> --}}
                <tr>
                    <td>Discount:</td>
                    <td>-LKR {{ $order->total_discount }}</td>
                </tr>
                <tr class="total">
                    <td><strong>Grand Total:</strong></td>
                    <td><strong>LKR {{ $order->total }}</strong></td>
                </tr>
            </table>
        </div>
        <div class="footer">
            Thank you for shopping with IY Mart!<br>
            Contact us: info.iymart@gmail.com - +817042239811
            <p style="color: red; font-style: italic">Note: If you select the Cash on Delivery option, an additional LKR 300 will be added to your delivery fee.</p>
        </div>
    </div>
</body>

</html>
