import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { UploadthingProvider } from "@uploadthing/react";
import App from "./App";
import "./index.css";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <UploadthingProvider>
          <App />
        </UploadthingProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>
);
