import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient, { setLogoutHandler, getMenuItems, deleteMenuItem, updateMenuItem, uploadImage, uploadBase64Image, getSellerProfile, updateSellerProfile, getMenuItemReviews } from '../../src/api/apiClient';

describe('apiClient', () => {
  let mock;
  const baseURL = 'http://10.10.102.131:8080/api';

  beforeEach(() => {
    mock = new MockAdapter(apiClient);
    AsyncStorage.clear();
    jest.clearAllMocks();
  });

  afterEach(() => {
    mock.restore();
  });

  it('should add Authorization header if token exists', async () => {
    await AsyncStorage.setItem('userToken', 'test-token');
    mock.onGet('/test').reply(200);

    await apiClient.get('/test');

    expect(mock.history.get[0].headers.Authorization).toBe('Bearer test-token');
  });

  it('should call logoutHandler on 401 response', async () => {
    const mockLogout = jest.fn();
    setLogoutHandler(mockLogout);
    mock.onGet('/protected').reply(401);

    await apiClient.get('/protected').catch(() => {}); // Catch the error to prevent test failure

    expect(mockLogout).toHaveBeenCalledTimes(1);
  });

  it('getMenuItems should fetch menu items', async () => {
    const menuItems = [{ id: 1, name: 'Item 1' }];
    mock.onGet(`${baseURL}/menu-items/me`).reply(200, menuItems);

    const response = await getMenuItems();
    expect(response.data).toEqual(menuItems);
  });

  it('deleteMenuItem should delete a menu item', async () => {
    const itemId = 1;
    mock.onDelete(`${baseURL}/menu-items/${itemId}`).reply(200);

    const response = await deleteMenuItem(itemId);
    expect(response.status).toBe(200);
  });

  it('updateMenuItem should update a menu item', async () => {
    const itemId = 1;
    const updatedData = { name: 'Updated Item' };
    mock.onPut(`${baseURL}/menu-items/${itemId}`, updatedData).reply(200, updatedData);

    const response = await updateMenuItem(itemId, updatedData);
    expect(response.data).toEqual(updatedData);
  });

  it('uploadImage should upload an image with formData', async () => {
    const formData = new FormData();
    formData.append('file', 'test-file');
    mock.onPost(`${baseURL}/upload`).reply(200, { url: 'image-url' });

    const response = await uploadImage(formData);
    expect(response.data).toEqual({ url: 'image-url' });
    expect(mock.history.post[0].headers['Content-Type']).toContain('multipart/form-data');
  });

  it('uploadBase64Image should upload a base64 image', async () => {
    const base64String = 'data:image/png;base64,test';
    mock.onPost(`${baseURL}/upload`, { file: base64String }).reply(200, { url: 'base64-image-url' });

    const response = await uploadBase64Image(base64String);
    expect(response.data).toEqual({ url: 'base64-image-url' });
  });

  it('getSellerProfile should fetch seller profile', async () => {
    const sellerId = 1;
    const sellerProfile = { id: 1, name: 'Seller 1' };
    mock.onGet(`${baseURL}/sellers/${sellerId}`).reply(200, sellerProfile);

    const response = await getSellerProfile(sellerId);
    expect(response.data).toEqual(sellerProfile);
  });

  it('updateSellerProfile should update seller profile', async () => {
    const sellerId = 1;
    const updatedData = { name: 'Updated Seller' };
    mock.onPut(`${baseURL}/sellers/${sellerId}`, updatedData).reply(200, updatedData);

    const response = await updateSellerProfile(sellerId, updatedData);
    expect(response.data).toEqual(updatedData);
  });

  it('getMenuItemReviews should fetch menu item reviews', async () => {
    const menuItemId = 1;
    const reviews = [{ id: 1, rating: 5 }];
    mock.onGet(`${baseURL}/menu-item-reviews/menu/${menuItemId}`).reply(200, reviews);

    const response = await getMenuItemReviews(menuItemId);
    expect(response.data).toEqual(reviews);
  });
});