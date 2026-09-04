import { Navigate, Route, Routes } from "react-router-dom";
import PlainLayout from "./components/PlainLayout";
import TabLayout from "./components/TabLayout";
import PhoneShell from "./components/PhoneShell";

import StartScreen from "./screens/StartScreen";
import WorkerDetail from "./screens/WorkerDetail";
import ChatScreen from "./screens/ChatScreen";
import ChatList from "./screens/ChatList";

import ClientHome from "./screens/client/ClientHome";
import RequestForm from "./screens/client/RequestForm";
import RequestAnalysis from "./screens/client/RequestAnalysis";
import ClientSearching from "./screens/client/ClientSearching";
import RecommendationList from "./screens/client/RecommendationList";
import RequestManagement from "./screens/client/RequestManagement";
import AIMatching from "./screens/client/AIMatching";
import ClientMe from "./screens/client/ClientMe";

import WorkerHome from "./screens/worker/WorkerHome";
import WorkerProfileForm from "./screens/worker/WorkerProfileForm";
import WorkerAnalysis from "./screens/worker/WorkerAnalysis";
import WorkerNotifications from "./screens/worker/WorkerNotifications";
import RequestDetailForWorker from "./screens/worker/RequestDetailForWorker";
import WorkerSchedule from "./screens/worker/WorkerSchedule";
import WorkerMe from "./screens/worker/WorkerMe";

export default function App() {
  return (
    <PhoneShell>
      <Routes>
        <Route element={<PlainLayout />}>
          <Route path="/" element={<StartScreen />} />

          <Route path="/client/requests/new" element={<RequestForm />} />
          <Route path="/client/requests/:id/analysis" element={<RequestAnalysis />} />
          <Route path="/client/requests/:id/searching" element={<ClientSearching />} />
          <Route
            path="/client/requests/:id/recommendations"
            element={<RecommendationList />}
          />
          <Route path="/worker/:id" element={<WorkerDetail />} />

          <Route path="/worker/profile/new" element={<WorkerProfileForm />} />
          <Route path="/worker/profile/:id/analysis" element={<WorkerAnalysis />} />
          <Route path="/jobs/:id" element={<RequestDetailForWorker />} />

          <Route path="/chat/:matchId" element={<ChatScreen />} />
        </Route>

        <Route element={<TabLayout />}>
          <Route path="/client/home" element={<ClientHome />} />
          <Route path="/client/requests" element={<RequestManagement />} />
          <Route path="/client/matching" element={<AIMatching />} />
          <Route path="/client/chat" element={<ChatList />} />
          <Route path="/client/me" element={<ClientMe />} />

          <Route path="/worker/home" element={<WorkerHome />} />
          <Route path="/worker/notifications" element={<WorkerNotifications />} />
          <Route path="/worker/schedule" element={<WorkerSchedule />} />
          <Route path="/worker/chat" element={<ChatList />} />
          <Route path="/worker/me" element={<WorkerMe />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </PhoneShell>
  );
}
