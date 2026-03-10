import { ConfigProvider, theme } from "antd";
import { AppRouter } from "./routes/AppRouter";

const App = () => {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          colorPrimary: "#1890ff",
          borderRadius: 6
        }
      }}
    >
      <AppRouter />
    </ConfigProvider>
  );
};

export default App;

