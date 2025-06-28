import { useState } from "react";
import { mockOrdersData } from "../api/mockData";

export const useOrders = () => {
  const [orders, setOrders] = useState(mockOrdersData);

  const handleAcceptOrder = (orderId) => {
    setOrders((currentOrders) =>
      currentOrders.map((order) =>
        order.id === orderId ? { ...order, status: "Preparing" } : order
      )
    );
  };

  const handleRejectOrder = (orderId) => {
    setOrders((currentOrders) =>
      currentOrders.filter((order) => order.id !== orderId)
    );
  };

  const handleUpdateOrderStatus = (orderId, newStatus) => {
    setOrders((currentOrders) =>
      currentOrders.map((order) =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
  };

  return {
    orders,
    handleAcceptOrder,
    handleRejectOrder,
    handleUpdateOrderStatus,
  };
};
