import { useEffect, useState } from 'react';
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
import { getInventoryData } from '../../services/api/addItemToInventory';
import CountUp from 'react-countup';
import { useTheme } from '../../utils/ThemeContext';

const StatisticsBoard = ({ searchText }) => {
  const [inventoryData, setInventoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const { theme, currentTheme } = useTheme();

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const data = await getInventoryData();
        setInventoryData(data);
      } catch (error) {
        console.error('Error fetching inventory data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchInventory();
  }, []);

  // Filter inventory based on searchText
  const filteredData = inventoryData.filter((item) =>
    Object.values(item).join(' ').toLowerCase().includes(searchText.toLowerCase())
  );

const inventoryCounts = {
  totalEquipment: filteredData.reduce((total, item) => total + Number(item.quantity || 0), 0),
  BrandNew: filteredData.reduce(
    (total, item) => item.condition === 'Brand New' ? total + Number(item.quantity || 0) : total, 0
  ),
  goodCondition: filteredData.reduce(
    (total, item) => item.condition === 'Good Condition' ? total + Number(item.quantity || 0) : total, 0
  ),
  defective: filteredData.reduce(
    (total, item) => item.condition === 'Defective' ? total + Number(item.quantity || 0) : total, 0
  ),
  forrepair: filteredData.reduce(
    (total, item) => item.status === 'For Repair' ? total + Number(item.quantity || 0) : total, 0
  ),
  OnStock: filteredData.reduce(
    (total, item) => item.status === 'On Stock' ? total + Number(item.quantity || 0) : total, 0
  ),
  deployed: filteredData.reduce(
    (total, item) => item.status === 'Deployed' ? total + Number(item.quantity || 0) : total, 0
  ),
};

  return (
    <div className="status-dashboard">
      <Row gutter={[12, 24]} justify="space-around" className="mb-5">
        <Col xs={12} sm={8} md={6}>
          <Card
            title={
              <span className="text-xs sm:text-sm md:text-base font-semibold lg:text-lgi "
                style={currentTheme !== 'default' ? { color: theme.text } : {}}>
                <LaptopOutlined className="text-black text-xs sm:text-sm md:text-base lg:text-lgi " /> Total Equipment
              </span>
            }
            className="rounded-xl shadow-md transition-transform bg-[#A8E1C5] transform hover:scale-105 border-none"
            style={currentTheme !== 'default' ? { textAlign: 'center', background: theme.componentBackground, color: theme.text } : { textAlign: 'center' }}
            loading={loading}
          >
            <Statistic
              value={inventoryCounts.totalEquipment}
              formatter={value => (
                <CountUp
                  end={Number(value)}
                  duration={2}
                  separator="," 
                  className="text-lgi xs:text-base sm:text-xl md:text-2xl lg:text-3xl font-bold"
                  style={currentTheme !== 'default' ? { color: theme.text } : {}}
                />
              )}
            />
          </Card>
        </Col>

        <Col xs={12} sm={8} md={6}>
          <Card
            title={
              <span className="text-xs sm:text-sm md:text-base font-semibold lg:text-lgi "
                style={currentTheme !== 'default' ? { color: theme.text } : {}}>
                <TagsOutlined className="text-black text-xs sm:text-sm md:text-base lg:text-lgi " /> Brand New
              </span>
            }
            className="rounded-xl shadow-md transition-transform bg-[#A8E1C5] transform hover:scale-105 border-none"
            style={currentTheme !== 'default' ? { textAlign: 'center', background: theme.componentBackground, color: theme.text } : { textAlign: 'center' }}
            loading={loading}
          >
            <Statistic
              value={inventoryCounts.BrandNew}
              formatter={value => (
                <CountUp
                  end={Number(value)}
                  duration={2}
                  separator="," 
                  className="text-lgi xs:text-base sm:text-xl md:text-2xl lg:text-3xl font-bold"
                  style={currentTheme !== 'default' ? { color: theme.text } : {}}
                />
              )}
            />
          </Card>
        </Col>

        <Col xs={12} sm={8} md={6}>
          <Card
            title={
              <span className="text-xs sm:text-sm md:text-base font-semibold lg:text-lgi "
                style={currentTheme !== 'default' ? { color: theme.text } : {}}>
                <LikeOutlined className="text-black text-xs sm:text-sm md:text-base lg:text-lgi " /> Good Condition
              </span>
            }
            className="rounded-xl shadow-md transition-transform bg-[#A8E1C5] transform hover:scale-105 border-none"
            style={currentTheme !== 'default' ? { textAlign: 'center', background: theme.componentBackground, color: theme.text } : { textAlign: 'center' }}
            loading={loading}
          >
            <Statistic
                value={inventoryCounts.goodCondition}
                formatter={value => (
                  <CountUp
                    end={Number(value)}
                    duration={1.2}
                    separator="," 
                    className="text-lgi xs:text-base sm:text-xl md:text-2xl lg:text-3xl font-bold"
                    style={currentTheme !== 'default' ? { color: theme.text } : {}}
                  />
                )}
              />
          </Card>
        </Col>

        <Col xs={12} sm={8} md={6}>
          <Card
            title={
              <span className="text-xs sm:text-sm md:text-base font-semibold lg:text-lgi "
                style={currentTheme !== 'default' ? { color: theme.text } : {}}>
                <WarningOutlined className="text-black text-xs sm:text-sm md:text-base lg:text-lgi " /> Defective
              </span>
            }
            className="rounded-xl shadow-md transition-transform bg-[#A8E1C5] transform hover:scale-105 border-none"
            style={currentTheme !== 'default' ? { textAlign: 'center', background: theme.componentBackground, color: theme.text } : { textAlign: 'center' }}
            loading={loading}
          >
              <Statistic
                value={inventoryCounts.defective}
                formatter={value => (
                  <CountUp
                    end={Number(value)}
                    duration={1.2}
                    separator="," 
                    className="text-lgi xs:text-base sm:text-xl md:text-2xl lg:text-3xl font-bold"
                    style={currentTheme !== 'default' ? { color: theme.text } : {}}
                  />
                )}
              />
          </Card>
        </Col>
      </Row>

      <Row gutter={[12, 24]} justify="space-around">
        <Col xs={12} sm={8} md={8}>
          <Card
            title={
              <span className="text-xs sm:text-sm md:text-base font-semibold lg:text-lgi "
                style={currentTheme !== 'default' ? { color: theme.text } : {}}>
                <CheckCircleOutlined className="text-black text-xs sm:text-sm md:text-base lg:text-lgi " /> On Stock
              </span>
            }
            className="rounded-xl shadow-md transition-transform bg-[#A8E1C5] transform hover:scale-105 border-none"
            style={currentTheme !== 'default' ? { textAlign: 'center', background: theme.componentBackground, color: theme.text } : { textAlign: 'center' }}
            loading={loading}
          >
             <Statistic
                value={inventoryCounts.OnStock}
                formatter={value => (
                  <CountUp
                    end={Number(value)}
                    duration={2}
                    separator="," 
                    className="text-lgi xs:text-base sm:text-xl md:text-2xl lg:text-3xl font-bold"
                    style={currentTheme !== 'default' ? { color: theme.text } : {}}
                  />
                )}
              />
          </Card>
        </Col>

        <Col xs={12} sm={8} md={8}>
          <Card
            title={
              <span className="text-xs sm:text-sm md:text-base font-semibold lg:text-lgi "
                style={currentTheme !== 'default' ? { color: theme.text } : {}}>
                <TruckOutlined className="text-black text-xs sm:text-sm md:text-base lg:text-lgi " /> Deployed
              </span>
            }
            className="rounded-xl shadow-md transition-transform bg-[#A8E1C5] transform hover:scale-105 border-none"
            style={currentTheme !== 'default' ? { textAlign: 'center', background: theme.componentBackground, color: theme.text } : { textAlign: 'center' }}
            loading={loading}
          >
              <Statistic
                value={inventoryCounts.deployed}
                formatter={value => (
                  <CountUp
                    end={Number(value)}
                    duration={2}
                    separator="," 
                    className="text-lgi xs:text-base sm:text-xl md:text-2xl lg:text-3xl font-bold"
                    style={currentTheme !== 'default' ? { color: theme.text } : {}}
                  />
                )}
              />
          </Card>
        </Col>

        <Col xs={12} sm={8} md={8}>
          <Card
            title={
              <span className="text-xs sm:text-sm md:text-base font-semibold lg:text-lgi "
                style={currentTheme !== 'default' ? { color: theme.text } : {}}>
                <ToolOutlined className="text-black text-xs sm:text-sm md:text-base lg:text-lgi " /> For Repair
              </span>
            }
            className="rounded-xl shadow-md transition-transform bg-[#A8E1C5] transform hover:scale-105 border-none"
            style={currentTheme !== 'default' ? { textAlign: 'center', background: theme.componentBackground, color: theme.text } : { textAlign: 'center' }}
            loading={loading}
          >
               < Statistic
                value={inventoryCounts.forrepair}
                formatter={value => (
                  <CountUp
                    end={Number(value)}
                    duration={2}
                    separator="," 
                    className="text-lgi xs:text-base sm:text-xl md:text-2xl lg:text-3xl font-bold"
                    style={currentTheme !== 'default' ? { color: theme.text } : {}}
                  />
                )}
              />
          </Card>
        </Col>
      </Row>
    </div>
  );
    }
    
    export default StatisticsBoard;