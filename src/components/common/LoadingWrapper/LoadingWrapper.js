import LoadingLogo from "./components/LoadingLogo";

export default function LoadingWrapper({ isLoading, children }) {
  if (isLoading) {
    return <LoadingLogo />;
  }

  return children;
}
