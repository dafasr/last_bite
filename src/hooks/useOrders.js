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
      currentOrders.map((order) =>
        order.id === orderId ? { ...order, status: "Rejected" } : order
      )
    );
  };

  const handleUpdateOrderStatus = (orderId, newStatus) => {
    setOrders((currentOrders) =>
      currentOrders.map((order) => {
        if (order.id === orderId) {
          return { ...order, status: newStatus };
        }
        return order;
      })
    );
  };

  return {
    orders,
    handleAcceptOrder,
    handleRejectOrder,
    handleUpdateOrderStatus,
  };
};
