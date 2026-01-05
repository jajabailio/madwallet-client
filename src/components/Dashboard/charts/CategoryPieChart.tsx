import { Box } from '@mui/material';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import type { CategoryTotal } from '../../../types';
import formatCurrency from '../../../utils/formatCurrency';

interface CategoryPieChartProps {
  data: CategoryTotal[];
}

interface ChartDataItem {
  categoryId: number;
  categoryName: string;
  color: string;
  totalCents: number;
  [key: string]: string | number;
}

const CategoryPieChart = ({ data }: CategoryPieChartProps) => {
  if (data.length === 0) {
    return null;
  }

  const chartData: ChartDataItem[] = data.map((item) => ({
    categoryId: item.categoryId,
    categoryName: item.categoryName,
    color: item.color,
    totalCents: item.totalCents,
  }));

  return (
    <Box sx={{ width: '100%', height: 200 }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            dataKey="totalCents"
            nameKey="categoryName"
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
            paddingAngle={2}
          >
            {chartData.map((entry) => (
              <Cell key={entry.categoryId} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => formatCurrency(Number(value))}
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid #ccc',
              borderRadius: '4px',
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default CategoryPieChart;
