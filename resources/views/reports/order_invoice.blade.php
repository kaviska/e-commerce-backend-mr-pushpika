<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <title>Invoice - IY Mart</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            color: #333;
            background: #f9f9f9;
        }

        .invoice-box {
            max-width: 800px;
            margin: auto;
            background: #fff;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }

        .shop-header {
            text-align: center;
            border-bottom: 2px solid #e6e6e6;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }

        .shop-header h1 {
            color: #27ae60;
            margin: 0;
            font-size: 36px;
            letter-spacing: 2px;
        }

        .shop-info {
            font-size: 14px;
            color: #555;
            margin-top: 5px;
        }

        .invoice-details,
        .customer-details {
            margin-bottom: 20px;
            font-size: 15px;
        }

        .details p {
            margin: 4px 0;
        }

        h3 {
            border-bottom: 1px solid #eee;
            padding-bottom: 5px;
            color: #27ae60;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }

        th,
        td {
            padding: 12px;
            border: 1px solid #ddd;
            text-align: left;
            font-size: 14px;
        }

        th {
            background-color: #f0f0f0;
        }

        .total-box {
            float: right;
            width: 300px;
            margin-top: 20px;
        }

        .total-box table {
            border: none;
        }

        .total-box td {
            border: none;
            padding: 6px 0;
            font-size: 15px;
        }

        .total-box td:first-child {
            color: #555;
        }

        .total-box td:last-child {
            text-align: right;
            font-weight: bold;
            color: #27ae60;
        }

        .note {
            margin-top: 60px;
            font-size: 12px;
            color: #888;
            text-align: center;
        }


    </style>
</head>

<body>

    <div class="invoice-box">

        <div class="shop-header">
            <h1>IY MART</h1>
            <div class="shop-info">
                <p>Phone: +81-704-223-9811 | Email: info.iymart@gmail.com</p>
                <p>Address: 383-24 Oyaguchi, Matsudo, Chiba 270-0005, Japan</p>
            </div>
        </div>

        <div class="details invoice-details">
            <h3>Invoice Details</h3>
            <p><strong>Invoice No:</strong> {{ $order->order_number }}</p>
            <p><strong>Date:</strong> {{ $order->created_at->toFormattedDateString() }}</p>
            <p><strong>Payment Method:</strong> {{ $order->payment_method }}</p>
        </div>

        <div class="details customer-details">
            <h3>Customer Details</h3>
            <p><strong>Name:</strong> {{ $order->user_name }}</p>
            <p><strong>Email:</strong> {{ $order->user_email }}</p>
            <p><strong>Phone:</strong> {{ $order->user_phone }}</p>
            <p><strong>Address:</strong>
                {{ $order->user_address_line1 }} , {{ $order->user_address_line2 }} , {{ $order->user_postal_code }} ,
                {{ $order->user_city }} , {{ $order->user_region }} , {{ $order->user_prefecture }} ,
                {{ $order->user_country }}
            </p>
        </div>

        <h3>Order Summary</h3>
        <table>
            <thead>
                <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Brand</th>
                    <th>Unit Price</th>
                    <th>Quantity</th>
                    <th>Total</th>
                </tr>
            </thead>
            <tbody>
                @foreach ($order->orderItems as $item)
                    <tr>
                        <td>{{ $item->product_name }}</td>
                        <td>{{ $item->category }}</td>
                        <td>{{ $item->brand }}</td>
                        <td>{{ $item->unit_price }}</td>
                        <td>{{ $item->unit_quantity }}</td>

                        <td>LKR  {{ number_format($item->unit_price * $item->unit_quantity, 2) }}</td>
                    </tr>
                @endforeach


            </tbody>
        </table>

        <div class="total-box">
            <table>
                <tr>
                    <td>Subtotal:</td>
                    <td>LKR {{ $order->subtotal }}</td>
                </tr>
                <tr>
                    <td>Tax:</td>
                    <td>LKR {{ $order->tax }}</td>
                </tr>
                <tr>
                    <td>Shipping:</td>
                    <td>LKR {{ $order->shipping_cost }}</td>
                </tr>
                <tr>
                    <td>Total Discount :</td>
                    <td>LKR {{ $order->total_discount }}</td>
                </tr>
                <tr>
                    <td >Total:</td>
                    <td >LKR {{ $order->total }}</td>
                </tr>
            </table>
        </div>

        <div style="clear: both;"></div>

        <div class="note">
            <p>Thank you for shopping with IY Mart. If you have any questions, please contact us.</p>
        </div>

    </div>

</body>

</html>
