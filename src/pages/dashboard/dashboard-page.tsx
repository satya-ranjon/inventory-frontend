import { useEffect, useState } from "react";
import apiClient from "@/lib/api-client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import {
  Calendar as CalendarIcon,
  RefreshCw,
  AlertCircle,
  DatabaseIcon,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

// Define types locally to avoid backend imports
type TSalesOverTimeData = {
  date: string;
  total: number;
};

type TTopCustomersData = {
  customer: {
    _id: string;
    customerName: string;
  };
  totalOrders: number;
  totalSpent: number;
};

type TTopItemsData = {
  item: {
    _id: string;
    name: string;
  };
  totalSold: number;
  revenue: number;
};

type TSalesByStatusData = {
  status: string;
  count: number;
  total: number;
};

type TDashboardData = {
  totalCustomers: number;
  totalItems: number;
  totalOrders: number;
  totalRevenue: number;
  recentOrders: {
    _id: string;
    orderNumber: string;
    customer: {
      _id: string;
      customerName: string;
    };
    total: number;
    status: string;
    salesOrderDate: string;
  }[];
  salesOverTime: TSalesOverTimeData[];
  topCustomers: TTopCustomersData[];
  topItems: TTopItemsData[];
  salesByStatus: TSalesByStatusData[];
};

// Color palette for charts
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

// Add a loading skeleton component for the dashboard
const DashboardSkeleton = () => {
  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {/* Date Range Filter Skeleton */}
      <Card className="mb-6">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-72" />
        </CardHeader>
        <CardContent>
          <div className="flex flex-row sm:flex-row gap-4 items-end">
            <Skeleton className="h-10 w-[200px]" />
            <Skeleton className="h-10 w-[200px]" />
            <Skeleton className="h-10 w-24" />
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Sales Over Time Chart Skeleton */}
      <Card className="mb-6">
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="h-80">
          <Skeleton className="h-full w-full" />
        </CardContent>
      </Card>

      {/* Top Sections Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {[...Array(2)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="h-80">
              <Skeleton className="h-full w-full" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Sales by Status Pie Chart Skeleton */}
      <Card className="mb-6">
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="h-80">
          <Skeleton
            className="h-full w-full rounded-full mx-auto"
            style={{ width: "50%" }}
          />
        </CardContent>
      </Card>

      {/* Recent Orders Table Skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {[...Array(5)].map((_, i) => (
                    <th key={i} className="px-6 py-3">
                      <Skeleton className="h-4 w-20" />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {[...Array(5)].map((_, rowIndex) => (
                  <tr key={rowIndex}>
                    {[...Array(5)].map((_, colIndex) => (
                      <td key={colIndex} className="px-6 py-4">
                        <Skeleton className="h-4 w-full" />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export const DashboardPage = () => {
  const [dashboardData, setDashboardData] = useState<TDashboardData | null>(
    null
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<{
    startDate: string;
    endDate: string;
  }>({
    startDate: "",
    endDate: "",
  });

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/dashboard/data");

      // Ensure salesOverTime data is properly formatted for display
      const data = response.data.data;
      if (data.salesOverTime && data.salesOverTime.length > 0) {
        // Sort the data by date to ensure chronological display
        data.salesOverTime = data.salesOverTime.sort(
          (a: TSalesOverTimeData, b: TSalesOverTimeData) =>
            new Date(a.date).getTime() - new Date(b.date).getTime()
        );

        // If there's only one data point, create a second point for better visualization
        if (data.salesOverTime.length === 1) {
          const singlePoint = data.salesOverTime[0];
          const nextDay = new Date(singlePoint.date);
          nextDay.setDate(nextDay.getDate() + 1);

          data.salesOverTime.push({
            date: nextDay.toISOString().split("T")[0],
            total: singlePoint.total * 0.9, // Slightly different value for visualization
          });
        }
      }

      setDashboardData(data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch dashboard data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardDataByDateRange = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(
        `/dashboard/data/date-range?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`
      );

      // Ensure salesOverTime data is properly formatted for display
      const data = response.data.data;
      if (data.salesOverTime && data.salesOverTime.length > 0) {
        // Sort the data by date to ensure chronological display
        data.salesOverTime = data.salesOverTime.sort(
          (a: TSalesOverTimeData, b: TSalesOverTimeData) =>
            new Date(a.date).getTime() - new Date(b.date).getTime()
        );

        // If there's only one data point, create a second point for better visualization
        if (data.salesOverTime.length === 1) {
          const singlePoint = data.salesOverTime[0];
          const nextDay = new Date(singlePoint.date);
          nextDay.setDate(nextDay.getDate() + 1);

          data.salesOverTime.push({
            date: nextDay.toISOString().split("T")[0],
            total: singlePoint.total * 0.9, // Slightly different value for visualization
          });
        }
      }

      setDashboardData(data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch dashboard data for selected date range");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleDateRangeSubmit = (e?: React.FormEvent) => {
    // Prevent default if event exists (for backwards compatibility)
    if (e) {
      e.preventDefault();
    }

    if (dateRange.startDate && dateRange.endDate) {
      fetchDashboardDataByDateRange();
    }
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 flex items-center justify-center min-h-[400px]">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error}
            <Button
              variant="outline"
              className="mt-4 w-full"
              onClick={fetchDashboardData}>
              Try Again
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="container mx-auto p-4 flex flex-col items-center justify-center min-h-[400px]">
        <Card className="max-w-md w-full">
          <CardHeader className="flex flex-row items-center gap-2">
            <div className="bg-gray-100 p-2 rounded-full">
              <DatabaseIcon className="h-6 w-6 text-gray-500" />
            </div>
            <div>
              <CardTitle>No Data Available</CardTitle>
              <CardDescription>
                There is no dashboard data to display at the moment.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <Button className="w-full mt-2" onClick={fetchDashboardData}>
              Refresh Data
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "BDT",
    }).format(value);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {/* Date Range Filter */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Filter by Date Range</CardTitle>
          <CardDescription>
            Select a date range to filter the dashboard data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-row sm:flex-row gap-4 items-end">
            <div className="grid gap-2">
              <div className="flex flex-col space-y-1.5">
                <label
                  htmlFor="startDate"
                  className="text-sm font-medium text-gray-700">
                  Start Date
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="startDate"
                      variant="outline"
                      className={cn(
                        "w-full sm:w-[200px] justify-start text-left font-normal",
                        !dateRange.startDate && "text-muted-foreground"
                      )}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange.startDate ? (
                        format(new Date(dateRange.startDate), "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={
                        dateRange.startDate
                          ? new Date(dateRange.startDate)
                          : undefined
                      }
                      onSelect={(date) =>
                        setDateRange({
                          ...dateRange,
                          startDate: date ? format(date, "yyyy-MM-dd") : "",
                        })
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="grid gap-2">
              <div className="flex flex-col space-y-1.5">
                <label
                  htmlFor="endDate"
                  className="text-sm font-medium text-gray-700">
                  End Date
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="endDate"
                      variant="outline"
                      className={cn(
                        "w-full sm:w-[200px] justify-start text-left font-normal",
                        !dateRange.endDate && "text-muted-foreground"
                      )}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange.endDate ? (
                        format(new Date(dateRange.endDate), "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={
                        dateRange.endDate
                          ? new Date(dateRange.endDate)
                          : undefined
                      }
                      onSelect={(date) =>
                        setDateRange({
                          ...dateRange,
                          endDate: date ? format(date, "yyyy-MM-dd") : "",
                        })
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleDateRangeSubmit}
                disabled={!dateRange.startDate || !dateRange.endDate}>
                Apply Filter
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setDateRange({ startDate: "", endDate: "" });
                  fetchDashboardData();
                }}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 uppercase">
              Total Customers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{dashboardData.totalCustomers}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 uppercase">
              Total Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{dashboardData.totalItems}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 uppercase">
              Total Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{dashboardData.totalOrders}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 uppercase">
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">
              TK {dashboardData.totalRevenue}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Sales Over Time Chart */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Sales Over Time</CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={dashboardData.salesOverTime}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={(date) => {
                  return new Date(date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  });
                }}
                interval="preserveStartEnd"
                minTickGap={10}
              />
              <YAxis
                tickFormatter={(value) =>
                  new Intl.NumberFormat("en-US", {
                    notation: "compact",
                    compactDisplay: "short",
                  }).format(value)
                }
              />
              <Tooltip
                formatter={(value: number) => [
                  formatCurrency(value),
                  "Revenue",
                ]}
                labelFormatter={(label) =>
                  new Date(label).toLocaleDateString("en-US", {
                    weekday: "short",
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })
                }
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="total"
                stroke="#0088FE"
                activeDot={{ r: 8 }}
                name="Revenue"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top Sections - 2 column layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Top Customers */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top Customers</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={dashboardData.topCustomers}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 60, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  type="number"
                  tickFormatter={(value) =>
                    new Intl.NumberFormat("en-US", {
                      notation: "compact",
                      compactDisplay: "short",
                    }).format(value)
                  }
                />
                <YAxis
                  type="category"
                  dataKey="customer.customerName"
                  width={100}
                />
                <Tooltip
                  formatter={(value: number) => [
                    formatCurrency(value),
                    "Total Spent",
                  ]}
                />
                <Legend />
                <Bar dataKey="totalSpent" fill="#00C49F" name="Total Spent" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Items */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top Selling Items</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={dashboardData.topItems}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 60, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  type="number"
                  tickFormatter={(value) =>
                    new Intl.NumberFormat("en-US", {
                      notation: "compact",
                      compactDisplay: "short",
                    }).format(value)
                  }
                />
                <YAxis type="category" dataKey="item.name" width={100} />
                <Tooltip
                  formatter={(value: number, name) => [
                    name === "revenue" ? formatCurrency(value) : value,
                    name === "revenue" ? "Revenue" : "Quantity Sold",
                  ]}
                />
                <Legend />
                <Bar
                  dataKey="revenue"
                  fill="#FFBB28"
                  name="Revenue"
                  barSize={10}
                />
                <Bar
                  dataKey="totalSold"
                  fill="#FF8042"
                  name="Quantity Sold"
                  barSize={10}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Sales by Status - Pie Chart */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Sales by Status</CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm text-center font-medium mb-2">By Count</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={dashboardData.salesByStatus}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={80}
                    innerRadius={30}
                    fill="#8884d8"
                    dataKey="count"
                    nameKey="status"
                    label={({
                      name,
                      cx,
                      cy,
                      midAngle,
                      innerRadius,
                      outerRadius,
                      value,
                    }) => {
                      const RADIAN = Math.PI / 180;
                      const radius =
                        innerRadius + (outerRadius - innerRadius) * 1.1;
                      const x = cx + radius * Math.cos(-midAngle * RADIAN);
                      const y = cy + radius * Math.sin(-midAngle * RADIAN);

                      return (
                        <text
                          x={x}
                          y={y}
                          fill="#000"
                          textAnchor={x > cx ? "start" : "end"}
                          dominantBaseline="central">
                          {`${name}: ${value}`}
                        </text>
                      );
                    }}>
                    {dashboardData.salesByStatus.map(
                      (_entry: TSalesByStatusData, index: number) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      )
                    )}
                  </Pie>
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      `${value}`,
                      `${name} - Count`,
                    ]}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div>
              <h3 className="text-sm text-center font-medium mb-2">
                By Amount
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={dashboardData.salesByStatus}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={80}
                    innerRadius={30}
                    fill="#8884d8"
                    dataKey="total"
                    nameKey="status"
                    label={({
                      name,
                      cx,
                      cy,
                      midAngle,
                      innerRadius,
                      outerRadius,
                    }) => {
                      const RADIAN = Math.PI / 180;
                      const radius =
                        innerRadius + (outerRadius - innerRadius) * 1.1;
                      const x = cx + radius * Math.cos(-midAngle * RADIAN);
                      const y = cy + radius * Math.sin(-midAngle * RADIAN);

                      return (
                        <text
                          x={x}
                          y={y}
                          fill="#000"
                          textAnchor={x > cx ? "start" : "end"}
                          dominantBaseline="central">
                          {`${name}`}
                        </text>
                      );
                    }}>
                    {dashboardData.salesByStatus.map(
                      (_entry: TSalesByStatusData, index: number) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      )
                    )}
                  </Pie>
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      formatCurrency(value),
                      `${name} - Amount`,
                    ]}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order Number
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {dashboardData.recentOrders.map((order) => (
                  <tr key={order._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {order.orderNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.customer?.customerName || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.salesOrderDate
                        ? new Date(order.salesOrderDate).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatCurrency(order.total)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          order.status === "Delivered"
                            ? "bg-green-100 text-green-800"
                            : order.status === "Shipped"
                              ? "bg-blue-100 text-blue-800"
                              : order.status === "Confirmed"
                                ? "bg-yellow-100 text-yellow-800"
                                : order.status === "Cancelled"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-gray-100 text-gray-800"
                        }`}>
                        {order.status || "Unknown"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
