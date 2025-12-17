<?php

namespace App\Http\Controllers;

use Barryvdh\DomPDF\Facade\Pdf as PDF;
use App\Models\Order;
use Illuminate\Support\Carbon;
use Illuminate\Http\Request;
use App\Models\Product;
use App\Models\Stock;
use App\Models\OrderItem;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    /**
     * Generate sales report (daily, weekly, monthly) as PDF.
     */




    public function generateSalesReport(Request $request)
    {
        $request->validate([
            'report_type' => 'required|string|in:daily,weekly,monthly',
            'platform_type' => 'required|string|in:pos,web',
            'date_range' => 'nullable|array',
            'date_range.0' => 'nullable|date',
            'date_range.1' => 'nullable|date|after_or_equal:date_range.0',
        ]);

        $type = $request->report_type;
        $platformType = $request->platform_type;
        $startDate = null;
        $endDate = Carbon::now();

        // If date_range is provided, use it and ignore report_type
        if ($request->filled('date_range') && is_array($request->date_range) && count($request->date_range) === 2) {
            $startDate = Carbon::parse($request->date_range[0])->startOfDay();
            $endDate = Carbon::parse($request->date_range[1])->endOfDay();
        } else {
            // Use report_type if date_range is not provided
            if ($type === 'daily') {
                $startDate = Carbon::now()->startOfDay();
            } elseif ($type === 'weekly') {
                $startDate = Carbon::now()->startOfWeek();
            } elseif ($type === 'monthly') {
                $startDate = Carbon::now()->startOfMonth();
            }
        }

        // Fetch orders within the date range
        $orders = Order::whereBetween('created_at', [$startDate, $endDate])
            ->where('type', $platformType)

            ->with(['orderItems.product', 'orderItems.stock'])
            ->get();

        // Calculate totals
        $totalSales = $orders->sum('total');
        $totalOrders = $orders->count();
        $totalItems = $orders->sum(function ($order) {
            return $order->orderItems->sum('unit_quantity');
        });



        $totalCost = $orders->flatMap(function ($order) {
            return $order->orderItems;
        })->sum(function ($item) {
            // Get cost from related stock (preferred), fallback to 0 if not found
            if ($item->stock && isset($item->stock->cost)) {
                return $item->unit_quantity * $item->stock->cost;
            }
            return 0;
        });
        // ...existing code...

        $profit = $totalSales - $totalCost;

        // Additional details
        $averageOrderValue = $totalOrders > 0 ? $totalSales / $totalOrders : 0;
        $mostSoldItem = $orders->flatMap(function ($order) {
            return $order->orderItems;
        })->groupBy('product_name')->sortByDesc(function ($items) {
            return $items->sum('unit_quantity');
        })->keys()->first();

        // Gather all order items for the second page
        $orderItems = $orders->flatMap(function ($order) {
            return $order->orderItems;
        })->groupBy('product_name')->map(function ($items, $productName) {
            $totalQuantity = $items->sum('unit_quantity');
            $totalSales = $items->sum('line_total');
            
            // Calculate average unit price from actual unit_price field (not from line_total)
            $totalUnitPriceValue = $items->sum(function ($item) {
                return $item->unit_price * $item->unit_quantity;
            });
            $avgUnitPrice = $totalQuantity > 0 ? $totalUnitPriceValue / $totalQuantity : 0;
            
            // Calculate average unit cost from related stock
            $totalCost = $items->sum(function ($item) {
                if ($item->stock && isset($item->stock->cost)) {
                    return $item->stock->cost * $item->unit_quantity;
                }
                return 0;
            });
            $avgUnitCost = $totalQuantity > 0 ? $totalCost / $totalQuantity : 0;
            
            return [
                'product_name' => $productName,
                'total_quantity' => $totalQuantity,
                'total_sales' => $totalSales,
                'unit_price' => $avgUnitPrice,
                'unit_cost' => $avgUnitCost,
            ];
        })->values();

        // Generate PDF
        $pdf = PDF::loadView('reports.sales', [
            'type' => ucfirst($type),
            'platformType' => ucfirst($platformType),
            'startDate' => $startDate->toFormattedDateString(),
            'endDate' => $endDate->toFormattedDateString(),
            'totalSales' => $totalSales,
            'totalOrders' => $totalOrders,
            'totalItems' => $totalItems,
            'averageOrderValue' => number_format($averageOrderValue, 2),
            'mostSoldItem' => $mostSoldItem,
            'orderItems' => $orderItems, // pass to blade
            'totalCost' => $totalCost,
            'profit' => $profit,
        ]);

        return $pdf->stream("sales_report_{$type}_{$platformType}.pdf");
    }
    // ...existing code...

    public function generateProductReport(Request $request)
    {
        try {
            // Fetch products with optional filters
            $products = Product::with(['category', 'brand'])

                ->get();

            // Generate PDF
            $pdf = PDF::loadView('reports.products', [
                'products' => $products,
            ]);

            return $pdf->stream('product_report.pdf');
        } catch (\Throwable $th) {
            //throw $th;
            return response()->json([
                'message' => 'Error generating product report',
                'error' => $th->getMessage(),
            ], 500);
        }
    }




    public function generateStockReport(Request $request)
    {
        try {
            $request->validate([
                'product_id' => 'nullable|integer',
                'category_id' => 'nullable|integer',
                'alert' => 'nullable|boolean',
                'report_type' => 'nullable|string|in:all,daily,weekly,monthly',
            ]);

            $productId = $request->input('product_id', 0);
            $categoryId = $request->input('category_id', 0);
            $alert = $request->boolean('alert', false);
            $reportType = $request->input('report_type', 'all');

            // Date range logic
            $startDate = null;
            $endDate = Carbon::now();
            if ($reportType === 'daily') {
                $startDate = Carbon::now()->startOfDay();
            } elseif ($reportType === 'weekly') {
                $startDate = Carbon::now()->startOfWeek();
            } elseif ($reportType === 'monthly') {
                $startDate = Carbon::now()->startOfMonth();
            }

            // Build query
            $stocksQuery = Stock::with('product');

            if ($productId && $productId !== 0) {
                $stocksQuery->where('product_id', $productId);
            }

            if ($categoryId && $categoryId !== 0) {
                $stocksQuery->whereHas('product', function ($query) use ($categoryId) {
                    $query->where('category_id', $categoryId);
                });
            }

            if ($alert) {
                $stocksQuery->whereColumn('quantity', '<=', 'alert_quantity');
            }
            if ($startDate) {
                $stocksQuery->whereBetween('created_at', [$startDate, $endDate]);
            }
            $stocks = $stocksQuery->get();

            // Useful summary data
            $totalStockCount = $stocks->count();
            $totalQuantity = $stocks->sum('quantity');
            $totalValue = $stocks->sum(function ($stock) {
                return $stock->quantity * $stock->pos_price;
            });
            $averageStockValue = $totalStockCount > 0 ? $totalValue / $totalStockCount : 0;

            // Most stocked product (by quantity)
            $mostStockedProduct = $stocks->groupBy(function ($stock) {
                return $stock->product->name ?? 'N/A';
            })->sortByDesc(function ($group) {
                return $group->sum('quantity');
            })->keys()->first();

            // Product with highest value in stock
            $highestValueProduct = $stocks->groupBy(function ($stock) {
                return $stock->product->name ?? 'N/A';
            })->sortByDesc(function ($group) {
                return $group->sum(function ($stock) {
                    return $stock->quantity * $stock->pos_price;
                });
            })->keys()->first();

            $lowStockCount = $stocks->where(function ($stock) {
                return $stock->quantity <= $stock->alert_quantity;
            })->count();

            // Generate PDF
            $pdf = PDF::loadView('reports.stocks', [
                'stocks' => $stocks,
                'reportType' => ucfirst($reportType),
                'startDate' => $startDate ? $startDate->toFormattedDateString() : null,
                'endDate' => $endDate->toFormattedDateString(),
                'totalStockCount' => $totalStockCount,
                'totalQuantity' => $totalQuantity,
                'totalValue' => $totalValue,
                'averageStockValue' => number_format($averageStockValue, 2),
                'mostStockedProduct' => $mostStockedProduct,
                'highestValueProduct' => $highestValueProduct,
                'lowStockCount' => $lowStockCount,
            ]);

            return $pdf->stream('stock_report.pdf');
        } catch (\Throwable $th) {
            return response()->json([
                'message' => 'Error generating stock report',
                'error' => $th->getMessage(),
            ], 500);
        }
    }
    public function generateOrderInvoice(Request $request)
    {
        $request->validate([
            'order_number' => 'required|string'
        ]);

        try {
            $order = Order::with('orderItems.product')
                ->where('order_number', $request->order_number)
                ->first();

            if (!$order) {
                return response()->json(['message' => 'Order not found'], 404);
            }

            // Generate PDF
            $pdf = PDF::loadView('reports.order_invoice', [
                'order' => $order,
                'customer' => $order->customer ?? null, // optional: if your order has customer relation
            ]);

            return $pdf->stream("order_invoice_{$order->order_number}.pdf");
        } catch (\Throwable $th) {
            return response()->json([
                'message' => 'Error generating order invoice',
                'error' => $th->getMessage(),
            ], 500);
        }
    }

    public function pieChart()
    {
        try {
            // Fetch the most sold items
            $mostSoldItems = OrderItem::select('product_name', DB::raw('SUM(unit_quantity) as total_quantity'))
                ->groupBy('product_name')
                ->orderByDesc('total_quantity')
                ->take(5) // Limit to top 5 items
                ->get();

            // Format the data for the frontend
            $formattedData = $mostSoldItems->map(function ($item, $index) {
                return [
                    'id' => $index,
                    'value' => $item->total_quantity,
                    'label' => $item->product_name,
                ];
            });

            return response()->json($formattedData, 200);
        } catch (\Throwable $th) {
            return response()->json([
                'message' => 'Error fetching most sold items',
                'error' => $th->getMessage(),
            ], 500);
        }
    }


    public function barChart()
    {
        try {
            // Get the last 7 days
            $dates = collect();
            for ($i = 6; $i >= 0; $i--) {
                $dates->push(Carbon::now()->subDays($i)->format('Y-m-d'));
            }

            // Initialize sales data
            $webSales = [];
            $posSales = [];

            foreach ($dates as $date) {
                // Fetch web and mobile sales for the date
                $webAndAppTotal = Order::whereDate('created_at', $date)
                    ->where('type', 'web')
                    ->sum('total');

                // Fetch POS sales for the date
                $posTotal = Order::whereDate('created_at', $date)
                    ->where('type', 'pos')
                    ->sum('total');

                // Append to sales data
                $webSales[] = $webAndAppTotal;
                $posSales[] = $posTotal;
            }

            // Format the data for the frontend
            $formattedData = [
                'webSales' => $webSales,
                'posSales' => $posSales,
                'xLabels' => $dates->map(function ($date) {
                    return Carbon::parse($date)->format('D'); // Format as weekday (e.g., Mon, Tue)
                }),
            ];

            return response()->json($formattedData, 200);
        } catch (\Throwable $th) {
            return response()->json([
                'message' => 'Error fetching sales data',
                'error' => $th->getMessage(),
            ], 500);
        }
    }


    public function lineChart()
    {
        try {
            // Get the last 7 days
            $dates = collect();
            for ($i = 6; $i >= 0; $i--) {
                $dates->push(Carbon::now()->subDays($i)->format('Y-m-d'));
            }

            // Initialize cash flow data
            $cashIn = [];
            $cashOut = [];

            foreach ($dates as $date) {
                // Calculate cash in (total from orders)
                $dailyCashIn = Order::whereDate('created_at', $date)
                    ->sum('total');

                // Calculate cash out (cost from stocks)
                $dailyCashOut = Stock::whereDate('purchase_date', $date)
                    ->sum('cost');

                // Append to cash flow data
                $cashIn[] = $dailyCashIn;
                $cashOut[] = $dailyCashOut;
            }

            // Format the data for the frontend
            $formattedData = [
                'cashIn' => $cashIn,
                'cashOut' => $cashOut,
                'xLabels' => $dates->map(function ($date) {
                    return Carbon::parse($date)->format('D'); // Format as weekday (e.g., Mon, Tue)
                }),
            ];

            return response()->json($formattedData, 200);
        } catch (\Throwable $th) {
            return response()->json([
                'message' => 'Error fetching cash flow data',
                'error' => $th->getMessage(),
            ], 500);
        }
    }

    public function getStocksExceedingAlertQuantity()
    {
        try {
            // Fetch stocks where quantity exceeds alert quantity
            $stocks = Stock::with('product')
                ->whereColumn('quantity', '<', 'alert_quantity')
                ->get();

            // Format the data for the frontend
            $formattedData = $stocks->map(function ($stock) {
                return [
                    'barcode' => $stock->barcode,
                    'product' => $stock->product->name ?? 'N/A',
                    'name' => $stock->product->name ?? 'N/A',
                    'quantity' => $stock->quantity,
                    'alertQuantity' => $stock->alert_quantity,
                ];
            });

            return response()->json($formattedData, 200);
        } catch (\Throwable $th) {
            return response()->json([
                'message' => 'Error fetching stocks exceeding alert quantity',
                'error' => $th->getMessage(),
            ], 500);
        }
    }


    public function calcuator(Request $request)
    {
        try {
            $startDate = Carbon::now()->subMonth()->startOfMonth(); // 2025-08-01 00:00:00
            $endDate   = Carbon::now()->subMonth()->endOfMonth();   // 2025-08-31 23:59:59

            $webSales = 0;
            $posSales = 0;
            $totalTax = 0;
            $totalCustomers = 0;

            // Calculate web sales if requested
            if ($request->has('web')) {
                $webSales = Order::whereBetween('created_at', [$startDate, $endDate])
                    ->where('type', 'web')
                    ->sum('total');
            }

            // Calculate POS sales if requested
            if ($request->has('pos')) {
                $posSales = Order::whereBetween('created_at', [$startDate, $endDate])
                    ->where('type', 'pos')
                    ->sum('total');
            }

            // Calculate total tax if requested
            if ($request->has('tax')) {
                $totalTax = Order::whereBetween('created_at', [$startDate, $endDate])
                    ->sum('tax');
            }

            // Calculate total customers if requested
            if ($request->has('customers')) {
                $totalCustomers = DB::table('users')
                    ->whereBetween('created_at', [$startDate, $endDate])
                    ->count();
            }

            // Format the response
            $response = [
                'webSales' => $webSales,
                'posSales' => $posSales,
                'totalTax' => $totalTax,
                'totalCustomers' => $totalCustomers,
            ];

            return response()->json($response, 200);
        } catch (\Throwable $th) {
            return response()->json([
                'message' => 'Error calculating data',
                'error' => $th->getMessage(),
            ], 500);
        }
    }
}
