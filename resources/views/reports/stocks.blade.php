<!DOCTYPE html>
<html>
<head>
    <title>Stock Report</title>
    <style>
        body { font-family: Arial, sans-serif; }
        .summary { margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: center; }
        th { background: #4CAF50; color: #fff; }
    </style>
</head>
<body>
    <h1>Stock Report</h1>
    @if($startDate)
        <p><strong>From:</strong> {{ $startDate }} <strong>To:</strong> {{ $endDate }}</p>
    @endif
    <div class="summary">
        <p><strong>Total Stock Items:</strong> {{ $totalStockCount }}</p>
        <p><strong>Total Quantity:</strong> {{ $totalQuantity }}</p>
        <p><strong>Total Value:</strong> LKR {{ number_format($totalValue, 2) }}</p>
        <p><strong>Low Stock Count:</strong> {{ $lowStockCount }}</p>
    </div>
    <table>
        <thead>
            <tr>
                <th>Product</th>
                <th>Barcode</th>
                <th>Quantity</th>
                <th>Alert Quantity</th>
                <th>POS Price</th>
                <th>Total Value</th>
            </tr>
        </thead>
        <tbody>
            @forelse($stocks as $stock)
                <tr>
                    <td>{{ $stock->product->name ?? 'N/A' }}</td>
                    <td>{{ $stock->barcode }}</td>
                    <td>{{ $stock->quantity }}</td>
                    <td>{{ $stock->alert_quantity }}</td>
                    <td>LKR {{ number_format($stock->pos_price, 2) }}</td>
                    <td>LKR {{ number_format($stock->quantity * $stock->pos_price, 2) }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="6">No stock data available.</td>
                </tr>
            @endforelse
        </tbody>
                {{-- <div class="summary">
            <p><strong>Total Stock Value:</strong> LKR {{ number_format($totalValue, 2) }}</p>
            <p><strong>Total Stock Items:</strong> {{ $totalStockCount }}</p>
            <p><strong>Total Quantity in Stock:</strong> {{ $totalQuantity }}</p>
            <p><strong>Average Stock Value:</strong> LKR {{ $averageStockValue }}</p>
            <p><strong>Most Stocked Product:</strong> {{ $mostStockedProduct ?? 'N/A' }}</p>
            <p><strong>Product with Highest Value:</strong> {{ $highestValueProduct ?? 'N/A' }}</p>
            <p><strong>Low Stock Count:</strong> {{ $lowStockCount }}</p>
        </div> --}}
    </table>
    <p style="margin-top:30px;font-size:12px;color:#888;">Generated on {{ \Carbon\Carbon::now()->toFormattedDateString() }}</p>
</body>
</html>