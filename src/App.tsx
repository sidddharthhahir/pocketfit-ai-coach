import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import { AppRoutes } from "./routes/AppRoutes";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          {/* App routes with layout */}
          <Route path="/dashboard/*" element={<AppRoutes />} />
          <Route path="/workouts/*" element={<AppRoutes />} />
          <Route path="/nutrition/*" element={<AppRoutes />} />
          <Route path="/progress/*" element={<AppRoutes />} />
          <Route path="/photos/*" element={<AppRoutes />} />
          <Route path="/accountability/*" element={<AppRoutes />} />
          <Route path="/commitments/*" element={<AppRoutes />} />
          <Route path="/profile/*" element={<AppRoutes />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
