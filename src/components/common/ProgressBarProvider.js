"use client";
import { ProgressProvider } from "@bprogress/next/app";

const Providers = ({ children }) => {
  return (
    <ProgressProvider
      height="6px"
      color="#CDDA04"
      options={{ showSpinner: false }}
      shallowRouting
    >
      {children}
    </ProgressProvider>
  );
};
export default Providers;
