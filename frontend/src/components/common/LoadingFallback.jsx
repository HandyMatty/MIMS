import { Spin } from 'antd';
import { useTheme } from '../../utils/ThemeContext';
import SINSSILogo from "../../../assets/SINSSI_LOGO-removebg-preview.png";
import { LazyImage } from '../../utils/imageHelpers';

const LoadingFallback = () => {
  const { theme, currentTheme } = useTheme();

  const fallbackStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    backgroundColor: currentTheme === 'default' ? '#EAF4E2' : theme.background,
  };

  const textStyle = {
    marginTop: '1rem',
    color: currentTheme === 'default' ? '#2f4f4f' : theme.text,
  };

  return (
    <div style={fallbackStyle}>
      <LazyImage
        className="h-[183px] w-[171px] object-cover mb-4 logo-bounce"
        src={SINSSILogo}
        alt="SINSSI Logo"
        width={171}
        height={183}
      />
      <Spin size="large" />
      <p style={textStyle}>Loading...</p>
    </div>
  );
};

export default LoadingFallback; 