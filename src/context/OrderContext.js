import React, { createContext, useState, useCallback, useContext } from "react";
import apiClient from "../api/apiClient";
import { ALERT_TYPE, Dialog } from "react-native-alert-notification";

const OrderContext = createContext();

export const OrderProvider = ({ children }) => {
  const [orders, setOrders] = useState(new Map()); // Using Map for efficient updates by orderId
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchOrders = useCallback(async (pageNum = 1, isRefresh = false) => {
    if (pageNum === 1) {
      if (!isRefresh) setLoading(true);
      else setRefreshing(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const response = await apiClient.get(
        `/orders/seller/me?page=${pageNum - 1}&size=10`
      );
      const newOrdersArray = response.data?.data ?? [];

      setOrders((prevOrders) => {
        const updatedOrders = new Map(prevOrders);
        newOrdersArray.forEach((order) => {
          updatedOrders.set(order.orderId, order);
        });
        return updatedOrders;
      });

      setHasMore(newOrdersArray.length === 10);
      setPage(pageNum + 1); // Prepare for the next page
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      Dialog.show({
        type: ALERT_TYPE.DANGER,
        title: "Error",
        textBody: "Gagal mengambil daftar pesanan.",
        button: "Tutup",
      });
      setHasMore(false);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, []);

  const updateOrderStatus = useCallback(
    async (orderId, newStatus) => {
      try {
        if (newStatus === "READY_FOR_PICKUP") {
          await apiClient.put(`/orders/${orderId}/ready`);
        } else if (newStatus === "CANCELLED") {
          // Assuming a cancel status for MerchantHomeScreen
          await apiClient.put(`/orders/${orderId}/cancel`);
        } else if (newStatus === "ACCEPTED") {
          // Assuming an accept status for MerchantHomeScreen
          await apiClient.put(`/orders/${orderId}/accept`);
        }
        // Update local state immediately for better UX
        setOrders((prevOrders) => {
          const updatedOrders = new Map(prevOrders);
          if (updatedOrders.has(orderId)) {
            updatedOrders.set(orderId, {
              ...updatedOrders.get(orderId),
              status: newStatus,
            });
          }
          return updatedOrders;
        });
        // Re-fetch all orders to ensure data consistency with backend
        await fetchOrders(1, true);
        Dialog.show({
          type: ALERT_TYPE.SUCCESS,
          title: "Berhasil",
          textBody: "Status pesanan berhasil diperbarui.",
          button: "Tutup",
        });
      } catch (error) {
        console.error("Failed to update order status:", error);
        Dialog.show({
          type: ALERT_TYPE.DANGER,
          title: "Error",
          textBody: "Gagal memperbarui status pesanan.",
          button: "Tutup",
        });
      }
    },
    [fetchOrders]
  );

  const completeOrder = useCallback(
    async (orderId, verificationCode) => {
      try {
        await apiClient.put(`/orders/${orderId}/complete`, {
          verificationCode,
        });
        // Update local state immediately for better UX
        setOrders((prevOrders) => {
          const updatedOrders = new Map(prevOrders);
          if (updatedOrders.has(orderId)) {
            updatedOrders.set(orderId, {
              ...updatedOrders.get(orderId),
              status: "COMPLETED",
            });
          }
          return updatedOrders;
        });
        // Re-fetch all orders to ensure data consistency with backend
        await fetchOrders(1, true);
        Dialog.show({
          type: ALERT_TYPE.SUCCESS,
          title: "Berhasil",
          textBody: "Pesanan berhasil diselesaikan.",
          button: "Tutup",
        });
      } catch (error) {
        console.error("Failed to complete order:", error);
        Dialog.show({
          type: ALERT_TYPE.DANGER,
          title: "Error",
          textBody:
            "Gagal menyelesaikan pesanan. Pastikan kode verifikasi benar.",
          button: "Tutup",
        });
      }
    },
    [fetchOrders]
  );

  const orderArray = Array.from(orders.values());

  return (
    <OrderContext.Provider
      value={{
        orders: orderArray,
        loading,
        refreshing,
        loadingMore,
        page,
        hasMore,
        fetchOrders,
        updateOrderStatus,
        completeOrder,
        resetPagination: () => {
          setPage(1);
          setHasMore(true);
          setOrders(new Map());
        },
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => useContext(OrderContext);
