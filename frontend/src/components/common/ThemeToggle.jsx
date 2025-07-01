import { useState } from 'react';
import { Dropdown, Button } from 'antd';
import { BgColorsOutlined } from '@ant-design/icons';
import { useTheme } from '../../utils/ThemeContext';

const ThemeToggle = () => {
  const { theme, currentTheme, changeTheme, themes } = useTheme();
  const [open, setOpen] = useState(false);

  const handleMenuClick = ({ key }) => {
    changeTheme(key);
    setOpen(false);
  };

  const items = Object.entries(themes).map(([key, themeData]) => ({
    key,
    label: (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div
          style={{
            width: '16px',
            height: '16px',
            borderRadius: '50%',
            backgroundColor: themeData.sider,
            border: currentTheme === key ? '2px solid #fff' : '1px solid #d9d9d9',
          }}
        />
        <span>{themeData.name}</span>
        {currentTheme === key && <span style={{ marginLeft: 'auto', color: '#1890ff' }}>✓</span>}
      </div>
    ),
  }));

  return (
    <Dropdown
      menu={{
        items,
        onClick: handleMenuClick,
        style: { minWidth: '180px' },
      }}
      open={open}
      onOpenChange={setOpen}
      placement="bottomRight"
      trigger={['click']}
    >
      <Button
        type="text"
        icon={<BgColorsOutlined />}
        style={{
          color: theme.textLight,
          border: 'none',
          background: 'transparent',
          fontSize: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '40px',
          height: '40px',
        }}
        title="Change Theme"
      />
    </Dropdown>
  );
};

export default ThemeToggle;
