import { createBrowserRouter } from "react-router";
import { Splash } from "./screens/Splash";
import { RoleSelection } from "./screens/RoleSelection";
import { SignUpDonor } from "./screens/SignUpDonor";
import { SignUpReceiver } from "./screens/SignUpReceiver";
import { Login } from "./screens/Login";
import { DonorDashboard } from "./screens/donor/DonorDashboard";
import { PostListing } from "./screens/donor/PostListing";
import { MyListings } from "./screens/donor/MyListings";
import { PickupRequests } from "./screens/donor/PickupRequests";
import { DonorListingDetail } from "./screens/donor/DonorListingDetail";
import { ReceiverDashboard } from "./screens/receiver/ReceiverDashboard";
import { BrowseListings } from "./screens/receiver/BrowseListings";
import { ReceiverListingDetail } from "./screens/receiver/ReceiverListingDetail";
import { MyRequests } from "./screens/receiver/MyRequests";
import { QRScanner } from "./screens/receiver/QRScanner";
import { Notifications } from "./screens/shared/Notifications";
import { Profile } from "./screens/shared/Profile";
import { ImpactReport } from "./screens/shared/ImpactReport";
import { ReportIssue } from "./screens/shared/ReportIssue";
import { Chat } from "./screens/shared/Chat";
import { NotFound } from "./screens/NotFound";
import { AdminDashboard } from "./screens/admin/AdminDashboard";

/**
 * FoodBridge - Food Redistribution System Routes
 */

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Splash,
  },
  {
    path: "/role-selection",
    Component: RoleSelection,
  },
  {
    path: "/signup-donor",
    Component: SignUpDonor,
  },
  {
    path: "/signup-receiver",
    Component: SignUpReceiver,
  },
  {
    path: "/login",
    Component: Login,
  },
  // ── Donor ────────────────────────────────────
  {
    path: "/donor/dashboard",
    Component: DonorDashboard,
  },
  {
    path: "/donor/post-listing",
    Component: PostListing,
  },
  {
    path: "/donor/my-listings",
    Component: MyListings,
  },
  {
    path: "/donor/pickup-requests",
    Component: PickupRequests,
  },
  {
    path: "/donor/listing/:id",
    Component: DonorListingDetail,
  },
  // ── Receiver ─────────────────────────────────
  {
    path: "/receiver/dashboard",
    Component: ReceiverDashboard,
  },
  {
    path: "/receiver/browse",
    Component: BrowseListings,
  },
  {
    path: "/receiver/listing/:id",
    Component: ReceiverListingDetail,
  },
  {
    path: "/receiver/my-requests",
    Component: MyRequests,
  },
  {
    path: "/receiver/qr-scanner",
    Component: QRScanner,
  },
  // ── Shared ───────────────────────────────────
  {
    path: "/notifications",
    Component: Notifications,
  },
  {
    path: "/profile",
    Component: Profile,
  },
  {
    path: "/impact",
    Component: ImpactReport,
  },
  {
    path: "/report",
    Component: ReportIssue,
  },
  // Chat: roomId = listingId_requestId
  {
    path: "/chat/:listingId/:requestId",
    Component: Chat,
  },
  // ── Admin ────────────────────────────────────
  {
    path: "/admin/dashboard",
    Component: AdminDashboard,
  },
  {
    path: "*",
    Component: NotFound,
  },
]);