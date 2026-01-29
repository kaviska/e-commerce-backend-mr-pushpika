<!DOCTYPE html>
<html>
<head>
    <title>Sales Report</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            margin: 0;
            padding: 0;
            color: #333;
            line-height: 1.6;
        }
        .container {
            width: 90%;
            margin: 0 auto;
            padding: 20px;
        }
        h1 {
            text-align: center;
            color: #4CAF50;
            margin-bottom: 10px;
        }
        p {
            text-align: center;
            margin: 5px 0;
            font-size: 14px;
        }
        .summary {
            margin-top: 20px;
            font-size: 14px;
        }
        .summary p {
            margin: 5px 0;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
            font-size: 14px;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 10px;
            text-align: center;
        }
        th {
            background-color: #4CAF50;
            color: white;
            font-weight: bold;
        }
        tr:nth-child(even) {
            background-color: #f9f9f9;
        }
        tr:hover {
            background-color: #f1f1f1;
        }
        .footer {
            text-align: center;
            margin-top: 20px;
            font-size: 12px;
            color: #777;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Sales Report ({{ $type }} - {{ $platformType }})</h1>
        <p><strong>From:</strong> {{ $startDate }}</p>
        <p><strong>To:</strong> {{ $endDate }}</p>

        <div class="summary">
            <p><strong>Total Sales:</strong> LKR {{ number_format($totalSales, 2) }}</p>
            <p><strong>Total Orders:</strong> {{ $totalOrders }}</p>
            <p><strong>Total Items Sold:</strong> {{ $totalItems }}</p>
            <p><strong>Average Order Value:</strong> LKR {{ $averageOrderValue }}</p>
            <p><strong>Most Sold Item:</strong> {{ $mostSoldItem ?? 'N/A' }}</p>
            <p><strong>Cost:</strong> LKR {{ number_format($totalCost, 2) }}</p>
            <p><strong>Profit:</strong> LKR {{ number_format($profit, 2) }}</p>
        </div>

        <table>
            <thead>
                <tr>
                    <th>Order Type</th>
                    <th>Total Sales</th>
                    <th>Total Orders</th>
                    <th>Total Items Sold</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>{{ ucfirst($platformType) }}</td>
                    <td>LKR {{ number_format($totalSales, 2) }}</td>
                    <td>{{ $totalOrders }}</td>
                    <td>{{ $totalItems }}</td>
                </tr>
            </tbody>
        </table>

         <div style="page-break-before: always;"></div>
    <div class="container">
        <h1>Sold Items Details</h1>
        <table>
            <thead>
                <tr>
                    <th>Product Name</th>
                    <th>Total Quantity Sold</th>
                    <th>Unit Price</th>
                    <th>Unit Cost</th>
                    <th>Total Sales</th>
                </tr>
            </thead>
            <tbody>
                @forelse($orderItems as $item)
                    <tr>
                        <td>{{ $item['product_name'] }}</td>
                        <td>{{ $item['total_quantity'] }}</td>
                        <td>LKR {{ number_format($item['unit_price'], 2) }}</td>
                        <td>LKR {{ number_format($item['unit_cost'], 2) }}</td>
                        <td>LKR {{ number_format($item['unit_price']*$item['total_quantity'], 2) }}</td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="5">No items sold in this period.</td>
                    </tr>
                @endforelse
            </tbody>
        </table>
    </div>

        <div class="footer">
            <p>Generated on {{ \Carbon\Carbon::now()->toFormattedDateString() }}</p>
        </div>
    </div>
</body>
</html>