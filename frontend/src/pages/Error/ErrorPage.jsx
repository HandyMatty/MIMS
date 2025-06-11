import { useRouteError } from "react-router-dom";
import { Button } from "antd";
import { ReloadOutlined, FrownOutlined } from "@ant-design/icons";

const ErrorPage = () => {
  const error = useRouteError();
  console.error(error);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#fef3c7] via-[#fce7f3] to-[#e0f2fe] p-6">
      <div className="bg-white shadow-2xl rounded-2xl p-8 max-w-md w-full text-center animate-fadeIn">
        <div className="text-red-500 text-6xl mb-4">
          <FrownOutlined />
        </div>
        <h1 className="text-3xl font-extrabold text-gray-800 mb-2">Oops! Something went wrong.</h1>
        <p className="text-sm text-gray-600 mb-4">
          {error?.statusText || error?.message || "An unexpected error has occurred."}
        </p>
        <Button
          type="primary"
          icon={<ReloadOutlined />}
          onClick={() => window.location.reload()}
          className="mt-4 text-xs"
          size="middle"
        >
          Refresh Page
        </Button>
      </div>
    </div>
  );
};

export default ErrorPage;
