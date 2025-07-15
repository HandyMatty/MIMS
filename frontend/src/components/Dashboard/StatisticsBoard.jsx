import { useMemo } from 'react';
import { Row, Col, Statistic, Card } from 'antd';
import {
  LaptopOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  ToolOutlined,
  TruckOutlined,
  LikeOutlined,
  TagsOutlined,
} from '@ant-design/icons';
import './customStatisticBoard.css';
import CountUp from 'react-countup';
import { useTheme } from '../../utils/ThemeContext';

const StatisticsBoard = ({ searchText, inventoryData, loading }) => {
  const { theme, currentTheme } = useTheme();

  const inventoryCounts = useMemo(() => {
    if (!inventoryData || inventoryData.length === 0) {
      return {
        totalEquipment: 0,
        BrandNew: 0,
        goodCondition: 0,
        defective: 0,
        forrepair: 0,
        OnStock: 0,
        deployed: 0,
      };
    }

    return {
      totalEquipment: inventoryData.reduce((total, item) => total + Number(item.quantity || 0), 0),
      BrandNew: inventoryData.reduce(
        (total, item) => item.condition === 'Brand New' ? total + Number(item.quantity || 0) : total, 0
      ),
      goodCondition: inventoryData.reduce(
        (total, item) => item.condition === 'Good Condition' ? total + Number(item.quantity || 0) : total, 0
      ),
      defective: inventoryData.reduce(
        (total, item) => item.condition === 'Defective' ? total + Number(item.quantity || 0) : total, 0
      ),
      forrepair: inventoryData.reduce(
        (total, item) => item.status === 'For Repair' ? total + Number(item.quantity || 0) : total, 0
      ),
      OnStock: inventoryData.reduce(
        (total, item) => item.status === 'On Stock' ? total + Number(item.quantity || 0) : total, 0
      ),
      deployed: inventoryData.reduce(
        (total, item) => item.status === 'Deployed' ? total + Number(item.quantity || 0) : total, 0
      ),
    };
  }, [inventoryData]);

  const commonCardProps = useMemo(() => ({
    className: "rounded-xl shadow-md transition-transform bg-[#A8E1C5] transform hover:scale-105 border-none",
    style: currentTheme !== 'default' ? { textAlign: 'center', background: theme.componentBackground, color: theme.text } : { textAlign: 'center' },
    loading: loading
  }), [currentTheme, theme, loading]);

  const commonTitleStyle = useMemo(() => 
    currentTheme !== 'default' ? { color: theme.text } : {}, 
    [currentTheme, theme.text]
  );

  const commonStatStyle = useMemo(() => 
    currentTheme !== 'default' ? { color: theme.text } : {}, 
    [currentTheme, theme.text]
  );

  const StatisticCard = useMemo(() => ({ title, icon: Icon, value, duration = 2 }) => (
    <Card
      title={
        <span className="text-xs sm:text-sm md:text-base font-semibold lg:text-lgi" style={commonTitleStyle}>
          <Icon className="text-black text-xs sm:text-sm md:text-base lg:text-lgi" /> {title}
        </span>
      }
      {...commonCardProps}
    >
      <Statistic
        value={value}
        formatter={value => (
          <CountUp
            end={Number(value)}
            duration={duration}
            separator="," 
            className="text-lgi xs:text-base sm:text-xl md:text-2xl lg:text-3xl font-bold"
            style={commonStatStyle}
          />
        )}
      />
    </Card>
  ), [commonCardProps, commonTitleStyle, commonStatStyle]);

  return (
    <div className="status-dashboard">
      <Row gutter={[12, 24]} justify="space-around" className="mb-5">
        <Col xs={12} sm={8} md={6}>
          <StatisticCard title="Total Equipment" icon={LaptopOutlined} value={inventoryCounts.totalEquipment} />
        </Col>

        <Col xs={12} sm={8} md={6}>
          <StatisticCard title="Brand New" icon={TagsOutlined} value={inventoryCounts.BrandNew} />
        </Col>

        <Col xs={12} sm={8} md={6}>
          <StatisticCard title="Good Condition" icon={LikeOutlined} value={inventoryCounts.goodCondition} duration={1.2} />
        </Col>

        <Col xs={12} sm={8} md={6}>
          <StatisticCard title="Defective" icon={WarningOutlined} value={inventoryCounts.defective} duration={1.2} />
        </Col>
      </Row>

      <Row gutter={[12, 24]} justify="space-around">
        <Col xs={12} sm={8} md={8}>
          <StatisticCard title="On Stock" icon={CheckCircleOutlined} value={inventoryCounts.OnStock} />
        </Col>

        <Col xs={12} sm={8} md={8}>
          <StatisticCard title="Deployed" icon={TruckOutlined} value={inventoryCounts.deployed} />
        </Col>

        <Col xs={12} sm={8} md={8}>
          <StatisticCard title="For Repair" icon={ToolOutlined} value={inventoryCounts.forrepair} />
        </Col>
      </Row>
    </div>
  );
};

export default StatisticsBoard;