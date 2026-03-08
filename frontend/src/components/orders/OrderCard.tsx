import React, { useState, useEffect } from "react";
import type { Order, User } from "../../types";
import {
  User as UserIcon,
  Phone,
  MapPin,
  ChevronDown,
  ChevronUp,
  Package,
} from "lucide-react";
import { getTimelineSteps } from "../../utils/orderTimeline";
import { getUserById } from "../../utils/api/users"; // Import getUserById

interface OrderCardProps {
  order: Order;
  onClick: (order: Order) => void;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, onClick }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [orderUser, setOrderUser] = useState<User | null>(null); // State to store fetched user
  const [preparerUser, setPreparerUser] = useState<User | null>(null); // State for officer_prepare_id user
  const [pickupUser, setPickupUser] = useState<User | null>(null); // New state for officer_pickup_id user

  useEffect(() => {
    const fetchUsers = async () => {
      // Fetch order.user
      if (order.user_id && !order.user) {
        try {
          const fetchedUser = await getUserById(order.user_id);
          setOrderUser(fetchedUser);
        } catch (error) {
          console.error("Error fetching user for order:", error);
        }
      } else if (order.user) {
        setOrderUser(order.user);
      }

      // Fetch officer_prepare_id user
      if (order.officer_prepare) {
        setPreparerUser(order.officer_prepare);
      } else if (typeof order.officer_prepare_id === 'string') {
        try {
          const fetchedPreparer = await getUserById(order.officer_prepare_id);
          setPreparerUser(fetchedPreparer);
        } catch (error) {
          console.error("Error fetching preparer user:", error);
        }
      } else if (order.officer_prepare_id && typeof order.officer_prepare_id === 'object') {
        setPreparerUser(order.officer_prepare_id as unknown as User);
      }

      // Fetch officer_pickup_id user
      if (order.officer_pickup) {
        setPickupUser(order.officer_pickup);
      } else if (typeof order.officer_pickup_id === 'string') {
        try {
          const fetchedPickup = await getUserById(order.officer_pickup_id);
          setPickupUser(fetchedPickup);
        } catch (error) {
          console.error("Error fetching pickup user:", error);
        }
      } else if (order.officer_pickup_id && typeof order.officer_pickup_id === 'object') {
        setPickupUser(order.officer_pickup_id as unknown as User);
      }
    };
    fetchUsers();
  }, [order.user_id, order.user, order.officer_prepare_id, order.officer_pickup_id, order.officer_prepare, order.officer_pickup]);

  const timelineSteps = getTimelineSteps(order);
  const currentStep = timelineSteps.find((step) => step.active);

  const handleExpandToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const displayUser = orderUser || order.user; // Prioritize fetched user, then provided user

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden hover:border-border/80 transition-all">
      {/* Collapsed View - Always Visible */}
      <div className="p-4 cursor-pointer" onClick={() => onClick(order)}>
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-muted border border-border rounded-full flex items-center justify-center">
              <Package className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-foreground">
                ออเดอร์เลขที่ {order.number}
              </h3>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <UserIcon className="w-3 h-3" />
                {order.customerName}
              </p>
              {/* Display Team Name and Type */}
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h-5m-5 0v-5a3 3 0 013-3h3a3 3 0 013 3v5m-11 0a2 2 0 11-4 0 2 2 0 014 0zM17 20a2 2 0 100-4 2 2 0 000 4z"
                  />
                </svg>
                <span className="font-medium text-foreground">
                  {order.teamName || "ไม่แข่งขัน"}
                </span>
                {order.teamType && (
                  <span className="text-muted-foreground text-xs">
                    ({order.teamType === "team" ? "ทีม" : "บุคคล"})
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Current Status Badge */}
          {currentStep && (
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-full ${currentStep.color}/10 ${currentStep.borderColor}`}
            >
              <span className="text-xs font-medium text-foreground">
                {currentStep.label}
              </span>
            </div>
          )}
        </div>

        {/* Compact Info */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-4 text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5" />
              <span>{order.phone}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              <span>
                รับวันที่{" "}
                {new Date(order.pickup_date).toLocaleDateString("th-TH", {
                  day: "numeric",
                  month: "short",
                  year: "2-digit",
                })}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 bg-muted rounded-full">
            <div
              className={`w-1.5 h-1.5 rounded-full ${
                order.time_type === "morning" ? "bg-amber-400" : "bg-blue-400"
              }`}
            />
            <span className="text-foreground">
              {order.time_type === "morning" ? "เช้า" : "บ่าย"}
            </span>
          </div>
        </div>
      </div>

      {/* Expand/Collapse Button */}
      <button
        onClick={handleExpandToggle}
        className="w-full px-4 py-2 bg-muted/50 hover:bg-muted transition-colors flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground text-xs font-medium border-t border-border"
      >
        {isExpanded ? (
          <>
            <ChevronUp className="w-4 h-4" />
            <span>ซ่อนรายละเอียด</span>
          </>
        ) : (
          <>
            <ChevronDown className="w-4 h-4" />
            <span>ดูสถานะการจัดส่ง</span>
          </>
        )}
      </button>

      {/* Expanded Timeline - Collapsible */}
      {isExpanded && (
        <div className="px-4 py-4 bg-muted/30 border-t border-border animate-in slide-in-from-top duration-200">
          <div className="space-y-0">
            {timelineSteps.map((step, index) => {
              const isLast = index === timelineSteps.length - 1;
              const showConnector = !isLast;

              return (
                <div key={step.key} className="flex gap-3">
                  {/* Icon Column */}
                  <div className="flex flex-col items-center">
                    {/* Icon Circle */}
                    <div
                      className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                        step.completed || step.active
                          ? `${step.color} ${step.borderColor} text-white`
                          : "bg-muted border-border text-muted-foreground"
                      }`}
                    >
                      {step.icon}
                    </div>

                    {/* Connector Line */}
                    {showConnector && (
                      <div
                        className={`w-0.5 h-8 transition-colors ${
                          step.completed ? "bg-border" : "bg-border/50"
                        }`}
                      />
                    )}
                  </div>

                  {/* Content Column */}
                  <div className={`flex-1 ${showConnector ? "pb-2" : ""}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p
                          className={`text-sm font-medium ${
                            step.completed || step.active
                              ? "text-foreground"
                              : "text-muted-foreground"
                          }`}
                        >
                          {step.label}
                          {step.active && (
                            <span className="ml-2 inline-flex items-center gap-1 text-xs text-amber-400">
                              <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400"></span>
                              </span>
                            </span>
                          )}
                        </p>
                        {step.key === "created" && displayUser && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            โดย {displayUser.firstname} {displayUser.lastname}
                          </p>
                        )}
                        {step.key === "approved" && preparerUser && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            โดย {preparerUser.firstname} {preparerUser.lastname}
                          </p>
                        )}
                        {step.key === "complete" && pickupUser && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            โดย {pickupUser.firstname} {pickupUser.lastname}
                          </p>
                        )}
                      </div>
                      {step.date && (
                        <span className="text-xs text-muted-foreground">
                          {step.date}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderCard;
