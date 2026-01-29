{{-- filepath: c:\xampp\htdocs\My Project\IY-Mart-BE\resources\views\return-bill.blade.php --}}
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>Return Bill</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: Arial, Helvetica, sans-serif;
            font-size: 12px;
            line-height: 1.2;
            color: #222;
            background: #fff;
            font-weight: 700;
        }
        @page { size: 2.8in 11in; margin: 0; }

        header, footer { text-align: center; margin-bottom: 10px; }
        #logo { width: 50%; margin: 0 auto; }
        h1, h2, h3 { margin: 0; font-weight: bold; }
        h1 { font-size: 18px; }
        h2 { font-size: 16px; }
        h3 { font-size: 14px; }

        .bill-details, .items, .summary {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 10px;
        }
        .bill-details td, .items td, .items th, .summary td {
            padding: 6px 3px;
        }

        .items thead th {
            font-size: 13px;
            text-transform: uppercase;
            border-bottom: 1px solid #000;
            text-align: left;
            font-weight: bold;
        }

        .items tbody tr td {
            font-size: 13px;
            text-align: right;
            font-weight: 700;
        }

        .items tbody tr td:first-child {
            text-align: left;
        }

        .line { border-top: 1px solid #000; }
        .summary td { font-size: 14px; text-align: right; }
        .summary td:first-child { text-align: left; }

        .total {
            font-size: 19px;
            font-weight: bold;
            border-top: 2px solid #000;
            border-bottom: 2px solid #000;
        }

        .center { text-align: center; }
        .footer-text { font-size: 14px; color: #000; }
        .reason { color: #b23c17; font-size: 13px; margin-top: 4px; font-weight: bold; }
        .data-section{
            font-size: 15px;
            font-weight: 300;
        }
    </style>
</head>
<body>
    <header>
        <table width="auto" cellspacing="0" cellpadding="0" style="margin: 10px auto;">
            <tr>
                <td align="center" style="text-align: center; padding: 0;">
                    <table cellspacing="0" cellpadding="0" style="border-collapse: collapse; margin: 0 auto;">
                        <tr>
                            <!-- Two Black Rounded Boxes -->
                            <td style="padding-right: 10px;">
                                <table cellspacing="6" cellpadding="0" style="margin: 0 auto;">
                                    <tr>
                                        <td style="width: 40px; height: 8px; background: black; border-radius: 10px;"></td>
                                    </tr>
                                    <tr>
                                        <td style="width: 40px; height: 8px; background: black; border-radius: 10px;"></td>
                                    </tr>
                                </table>
                            </td>
                            <!-- Text -->
                            <td style="vertical-align: middle;">
                                <span style="font-size: 30px; font-weight: bold; color: #000">
                                    IYMart
                                </span>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </header>

    <table class="bill-details" style="margin-bottom: 5px">
        <tbody>
            <tr style="line-height: 1.1;">
                <td style="padding: 2px 3px;">Date: <span>{{ \Carbon\Carbon::parse($returned_at)->format('Y-m-d') }}</span></td>
                <td style="padding: 2px 3px;">Time: <span>{{ \Carbon\Carbon::parse($returned_at)->format('H:i:s') }}</span></td>
            </tr>
            <tr style="line-height: 1.1;">
                <td style="padding: 2px 3px;">Order #: <span>{{ $order->order_number ?? $order->id }}</span></td>
                <td style="padding: 2px 3px;">ID: <span>{{ $order->id }}</span></td>
            </tr>
            <tr style="line-height: 1.1;">
                <td colspan="2" class="center" style="padding: 8px 3px;"><h2>Return Receipt</h2></td>
            </tr>
        </tbody>
    </table>

    <table class="items">
        <thead>
            <tr>
                <th>Item</th>
                <th>Qty</th>
                <th>Rate</th>
                <th>Disc</th>
                <th>Amount</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($return_items as $item)
                <tr>
                    <td>{{ $item['product_name'] }}</td>
                    <td>{{ $item['quantity'] }}</td>
                    <td>{{ number_format($item['unit_price'], 2) }}</td>
                    <td>{{ number_format($item['unit_discount'] * $item['quantity'], 2) }}</td>
                    <td>{{ number_format($item['line_total'], 2) }}</td>
                </tr>
            @endforeach
            <tr class="data-section">
                <td colspan="4" class="line">Total Return</td>
                <td>LKR {{ number_format($total_return_amount, 2) }}</td>
            </tr>
        </tbody>
    </table>

    <section>
        @if(($order->user_name ?? '') !== 'Walk In Customer')
            <p class="center"><strong>Customer:</strong> {{ $order->user_name ?? '' }}</p>
            <p class="center"><strong>Phone:</strong> {{ $order->user_phone ?? '' }}</p>
            <p class="center"><strong>Email:</strong> {{ $order->user_email ?? '' }}</p>
            <p class="center"><strong>Address:</strong> {{ $order->user_address_line1 ?? '' }} {{ $order->user_address_line2 ?? '' }}, {{ $order->user_city ?? '' }}, {{ $order->user_prefecture ?? '' }}, {{ $order->user_postal_code ?? '' }}</p>
        @endif
        @if($reason)
            <p class="reason center"><strong>Return Reason:</strong> {{ $reason }}</p>
        @endif
        <p class="center" style="margin-top:10px;">THANK YOU FOR YOUR VISIT!</p>
        <p class="center" style="margin-top: -10px">Come Again!</p>
    </section>

    <footer>
        <span class="footer-text center">0477 027 519 </span> <br>
        <span class="footer-text center">+81 70 4223 9811 <br>  (Whatsapp, Line, Viber and Direct)</span>
        <br>
        <span class="footer-text center">Chiba ken Matsudo-shi <br> Oyaguchi 384-24, Oyaguchi Copo 103</span>
    </footer>
</body>
</html>